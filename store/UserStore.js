import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  DEMO_PLAYBACK_URL,
  DEMO_STREAM_TITLE,
  YOUTUBE_RTMPS_URL,
  YOUTUBE_STREAM_KEY_PLACEHOLDER,
} from '../constants/liveStreamingConfig';

const USERS_KEY        = 'users';
const OTP_KEY          = 'mock_reset_otps';
const CURRENT_USER_KEY = 'current_user_email';
const STATE_SEATS_KEY  = 'state_seat_allocations_v1';
const PENDING_REG_KEY  = 'pending_registration_v1';
const NEWS_ACTION_LOG_KEY = 'news_feed_action_log_v1';

const ENGAGEMENT_DB_NAME = 'rti_news_engagement_v1.db';
const ENGAGEMENT_FALLBACK_KEY = 'news_engagement_fallback_v1';

let engagementDbPromise = null;
let engagementDbInitialized = false;

const safeJsonParse = (value, fallback) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

const readEngagementFallback = async () => {
  const raw = await AsyncStorage.getItem(ENGAGEMENT_FALLBACK_KEY);
  const state = safeJsonParse(raw, {
    likesByPost: {},            // postId -> { [email]: true }
    sharesByPost: {},           // postId -> number
    viewsByPost: {},            // postId -> number
    commentsByPost: {},         // postId -> comment[]
    commentLikesById: {},       // commentId -> { [email]: true }
    bookmarksByPost: {},        // postId -> { [email]: true }
  });

  if (!state || typeof state !== 'object') {
    return {
      likesByPost: {},
      sharesByPost: {},
      viewsByPost: {},
      commentsByPost: {},
      commentLikesById: {},
      bookmarksByPost: {},
    };
  }

  state.likesByPost = state.likesByPost && typeof state.likesByPost === 'object' ? state.likesByPost : {};
  state.sharesByPost = state.sharesByPost && typeof state.sharesByPost === 'object' ? state.sharesByPost : {};
  state.viewsByPost = state.viewsByPost && typeof state.viewsByPost === 'object' ? state.viewsByPost : {};
  state.commentsByPost = state.commentsByPost && typeof state.commentsByPost === 'object' ? state.commentsByPost : {};
  state.commentLikesById = state.commentLikesById && typeof state.commentLikesById === 'object' ? state.commentLikesById : {};
  state.bookmarksByPost = state.bookmarksByPost && typeof state.bookmarksByPost === 'object' ? state.bookmarksByPost : {};
  return state;
};

const writeEngagementFallback = async (state) => {
  await AsyncStorage.setItem(ENGAGEMENT_FALLBACK_KEY, JSON.stringify(state || {}));
};

const getEngagementDb = async () => {
  if (Platform.OS === 'web') return null;
  if (!engagementDbPromise) {
    engagementDbPromise = SQLite.openDatabaseAsync(ENGAGEMENT_DB_NAME);
  }
  const db = await engagementDbPromise;
  if (!engagementDbInitialized) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS post_likes (
        post_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (post_id, user_email)
      );

      CREATE TABLE IF NOT EXISTS post_shares (
        post_id TEXT PRIMARY KEY NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_views (
        post_id TEXT PRIMARY KEY NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id TEXT NOT NULL,
        user_email TEXT,
        author TEXT,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        edited_at TEXT,
        parent_comment_id INTEGER,
        deleted INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS comment_likes (
        comment_id INTEGER NOT NULL,
        user_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (comment_id, user_email),
        FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS post_bookmarks (
        post_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (post_id, user_email)
      );

      CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
      CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user ON post_bookmarks(user_email);
    `);

    // Lightweight migration for older db files.
    try { await db.execAsync('ALTER TABLE post_comments ADD COLUMN parent_comment_id INTEGER'); } catch {}
    try { await db.execAsync('CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id)'); } catch {}
    engagementDbInitialized = true;
  }
  return db;
};

const upsertCounter = async (db, table, postId) => {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO ${table} (post_id, count, updated_at)
     VALUES (?, 1, ?)
     ON CONFLICT(post_id) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`,
    postId,
    now
  );
};

const getEngagementForPostsSqlite = async (postIds = [], currentEmail = '', focusPostId = null) => {
  const db = await getEngagementDb();
  if (!db || !Array.isArray(postIds) || postIds.length === 0) {
    return { statsByPost: {}, commentsByPost: {} };
  }

  const ids = postIds.filter(Boolean).map((v) => String(v));
  if (ids.length === 0) return { statsByPost: {}, commentsByPost: {} };
  const placeholders = ids.map(() => '?').join(',');

  const likesRows = await db.getAllAsync(
    `SELECT post_id, COUNT(*) AS count
     FROM post_likes
     WHERE post_id IN (${placeholders})
     GROUP BY post_id`,
    ids
  );

  const commentsRows = await db.getAllAsync(
    `SELECT post_id, COUNT(*) AS count
     FROM post_comments
     WHERE deleted = 0 AND post_id IN (${placeholders})
     GROUP BY post_id`,
    ids
  );

  const sharesRows = await db.getAllAsync(
    `SELECT post_id, count
     FROM post_shares
     WHERE post_id IN (${placeholders})`,
    ids
  );

  const viewsRows = await db.getAllAsync(
    `SELECT post_id, count
     FROM post_views
     WHERE post_id IN (${placeholders})`,
    ids
  );

  const bookmarkedRows = currentEmail
    ? await db.getAllAsync(
      `SELECT post_id FROM post_bookmarks WHERE user_email = ? AND post_id IN (${placeholders})`,
      [currentEmail, ...ids]
    )
    : [];

  const likedRows = currentEmail
    ? await db.getAllAsync(
      `SELECT post_id FROM post_likes WHERE user_email = ? AND post_id IN (${placeholders})`,
      [currentEmail, ...ids]
    )
    : [];

  const likedSet = new Set((likedRows || []).map((r) => String(r.post_id)));
  const bookmarkedSet = new Set((bookmarkedRows || []).map((r) => String(r.post_id)));
  const likeMap = new Map((likesRows || []).map((r) => [String(r.post_id), Number(r.count || 0)]));
  const commentCountMap = new Map((commentsRows || []).map((r) => [String(r.post_id), Number(r.count || 0)]));
  const shareMap = new Map((sharesRows || []).map((r) => [String(r.post_id), Number(r.count || 0)]));
  const viewMap = new Map((viewsRows || []).map((r) => [String(r.post_id), Number(r.count || 0)]));

  const statsByPost = {};
  ids.forEach((id) => {
    statsByPost[id] = {
      likes: likeMap.get(id) || 0,
      comments: commentCountMap.get(id) || 0,
      shares: shareMap.get(id) || 0,
      views: viewMap.get(id) || 0,
      likedByCurrentUser: likedSet.has(id),
      bookmarkedByCurrentUser: bookmarkedSet.has(id),
    };
  });

  const commentsByPost = {};
  if (focusPostId) {
    const pid = String(focusPostId);
    const comments = await db.getAllAsync(
      `SELECT id, post_id, user_email, author, text, created_at, edited_at, parent_comment_id
       FROM post_comments
       WHERE post_id = ? AND deleted = 0
       ORDER BY created_at DESC
       LIMIT 300`,
      pid
    );

    const commentIds = (comments || []).map((c) => Number(c.id)).filter((n) => Number.isFinite(n));
    const likedCommentSet = new Set();
    const likesCountMap = new Map();

    if (commentIds.length) {
      const cph = commentIds.map(() => '?').join(',');
      const likeCounts = await db.getAllAsync(
        `SELECT comment_id, COUNT(*) AS count
         FROM comment_likes
         WHERE comment_id IN (${cph})
         GROUP BY comment_id`,
        commentIds
      );
      (likeCounts || []).forEach((r) => likesCountMap.set(Number(r.comment_id), Number(r.count || 0)));

      if (currentEmail) {
        const likedComments = await db.getAllAsync(
          `SELECT comment_id FROM comment_likes WHERE user_email = ? AND comment_id IN (${cph})`,
          [currentEmail, ...commentIds]
        );
        (likedComments || []).forEach((r) => likedCommentSet.add(Number(r.comment_id)));
      }
    }

    const normalized = (comments || []).map((c) => {
      const commentId = Number(c.id);
      const created = c.created_at ? new Date(c.created_at) : null;
      return {
        id: `cmt-${commentId}`,
        text: String(c.text || '').trim(),
        author: String(c.author || 'User'),
        author_email: String(c.user_email || ''),
        date: created ? created.toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        edited_at: c.edited_at || null,
        likes: likesCountMap.get(commentId) || 0,
        liked_by: likedCommentSet.has(commentId) && currentEmail ? [currentEmail] : [],
        parent_comment_id: Number.isFinite(Number(c.parent_comment_id)) ? Number(c.parent_comment_id) : null,
      };
    });

    const byId = new Map(normalized.map((c) => [c.id, c]));
    const topLevel = [];
    normalized.forEach((c) => {
      const parentId = c.parent_comment_id;
      if (!parentId) { topLevel.push({ ...c, replies: [] }); return; }
      const parentKey = `cmt-${parentId}`;
      const parent = byId.get(parentKey);
      if (!parent) { topLevel.push({ ...c, replies: [] }); return; }
    });

    // Attach replies (second pass) using a map of top-level items.
    const topMap = new Map(topLevel.map((c) => [c.id, c]));
    normalized.forEach((c) => {
      const parentId = c.parent_comment_id;
      if (!parentId) return;
      const parentKey = `cmt-${parentId}`;
      const parent = topMap.get(parentKey);
      if (!parent) return;
      parent.replies = Array.isArray(parent.replies) ? parent.replies : [];
      parent.replies.push({ ...c });
    });

    // Keep newest-first for top-level and replies.
    topLevel.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    topLevel.forEach((c) => {
      if (Array.isArray(c.replies)) c.replies.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    });

    commentsByPost[pid] = topLevel;
  }

  return { statsByPost, commentsByPost };
};

const getEngagementForPostsFallback = async (postIds = [], currentEmail = '', focusPostId = null) => {
  const state = await readEngagementFallback();
  const ids = (postIds || []).filter(Boolean).map((v) => String(v));

  const statsByPost = {};
  ids.forEach((id) => {
    const likesMap = state.likesByPost?.[id] || {};
    const likedByCurrentUser = Boolean(currentEmail && likesMap[currentEmail]);
    const bookmarksMap = state.bookmarksByPost?.[id] || {};
    const bookmarkedByCurrentUser = Boolean(currentEmail && bookmarksMap[currentEmail]);
    statsByPost[id] = {
      likes: Object.keys(likesMap).length,
      comments: Array.isArray(state.commentsByPost?.[id]) ? state.commentsByPost[id].length : 0,
      shares: Number(state.sharesByPost?.[id] || 0),
      views: Number(state.viewsByPost?.[id] || 0),
      likedByCurrentUser,
      bookmarkedByCurrentUser,
    };
  });

  const commentsByPost = {};
  if (focusPostId) {
    const pid = String(focusPostId);
    const list = Array.isArray(state.commentsByPost?.[pid]) ? state.commentsByPost[pid] : [];
    const normalized = list.map((c) => ({
      ...c,
      liked_by: Array.isArray(c.liked_by) ? c.liked_by : [],
      parent_comment_id: c.parent_comment_id || null,
    }));

    const byId = new Map(normalized.map((c) => [String(c.id), c]));
    const topLevel = [];
    normalized.forEach((c) => {
      const parent = c.parent_comment_id ? String(c.parent_comment_id) : '';
      if (!parent) { topLevel.push({ ...c, replies: [] }); return; }
      const parentComment = byId.get(parent);
      if (!parentComment) topLevel.push({ ...c, replies: [] });
    });

    const topMap = new Map(topLevel.map((c) => [String(c.id), c]));
    normalized.forEach((c) => {
      const parent = c.parent_comment_id ? String(c.parent_comment_id) : '';
      if (!parent) return;
      const parentComment = topMap.get(parent);
      if (!parentComment) return;
      parentComment.replies = Array.isArray(parentComment.replies) ? parentComment.replies : [];
      parentComment.replies.push({ ...c });
    });

    commentsByPost[pid] = topLevel;
  }

  return { statsByPost, commentsByPost };
};
const STATE_SEAT_ROLES = [
  { id: 'chief_editor_published',     name: 'Chief Editor / Published' },
  { id: 'executive_editor',           name: 'Executive Editor' },
  { id: 'deputy_editor_national',     name: 'Deputy Editor (National)' },
  { id: 'public_relations_officer',   name: 'Public Relations Officer (PRO)' },
  { id: 'national_bureau_chief',      name: 'National Bureau Chief' },
];

// eslint-disable-next-line import/namespace
const certificateDirectory = FileSystem['documentDirectory'];
const CERTIFICATE_DIR = certificateDirectory
  ? `${certificateDirectory}certificates/`
  : null;

const getRoleFromPlanId = (planId = '') => {
  const id = String(planId).toLowerCase();
  if (id === 'plan-premium') return 'premium';
  if (id === 'plan-pro')     return 'pro';
  if (id === 'plan-basic')   return 'basic';
  return 'free';
};

const ROLE_LABELS = {
  free:    'Free Member',
  basic:   'Basic Member',
  pro:     'Pro Member',
  premium: 'Premium Member',
};

const getRoleLabel = (role = 'free') => ROLE_LABELS[role] || 'Free Member';

const RANK_TIERS = [
  { rank: 'Director',  min: 500 },
  { rank: 'Manager',   min: 100 },
  { rank: 'Leader',    min: 25  },
  { rank: 'Promoter',  min: 5   },
  { rank: 'Starter',   min: 1   },
  { rank: 'Member',    min: 0   },
];

const calculateRank = (referralCount = 0) => {
  const tier = RANK_TIERS.find((t) => referralCount >= t.min);
  return tier ? tier.rank : 'Member';
};

const normalizeIndianMobileNumber = (value = '') => {
  const digits = String(value || '').replace(/\D+/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
};

const isValidIndianMobileNumber = (value = '') => /^[6-9]\d{9}$/.test(normalizeIndianMobileNumber(value));

const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RTI-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const generateUniqueReferralCode = async (existingUsers = []) => {
  const usedCodes = new Set(existingUsers.map((u) => u.my_referral_code).filter(Boolean));
  let code;
  let attempts = 0;
  do {
    code = generateReferralCode();
    attempts++;
  } while (usedCodes.has(code) && attempts < 100);
  return code;
};

const defaultWalletTransactions = [
  {
    id:     'txn-welcome-credit',
    amount: 500,
    type:   'credit',
    source: 'bonus',
    date:   '2026-03-24',
  },
];

const defaultSubscriptionPlans = [
  {
    plan_id:   'plan-basic',
    plan_name: 'Basic Access',
    price:     199,
    duration:  '30 Days',
    features:  ['News Feed', 'e-Paper', 'Notifications'],
    role:      'basic',
  },
  {
    plan_id:   'plan-pro',
    plan_name: 'Pro Access',
    price:     499,
    duration:  '90 Days',
    features:  ['News Feed', 'e-Paper', 'Live Streaming', 'Wallet', 'Certification'],
    role:      'pro',
  },
  {
    plan_id:   'plan-premium',
    plan_name: 'Premium Access',
    price:     899,
    duration:  '180 Days',
    features:  ['All Features', 'Priority Support', 'Certificate Download', 'Referral Bonus'],
    role:      'premium',
  },
];

const defaultActiveSubscription = {
  plan_id:   'plan-basic',
  plan_name: 'Basic Access',
  price:     199,
  duration:  '30 Days',
};

const defaultNewsFeed = [
  {
    id: 'news-1', title: 'RTI Awareness Drive Expanded Across Districts',
    description: 'Local teams launched a wider awareness campaign to help citizens file RTI queries more efficiently.',
    media: 'awareness-drive.jpg', category: 'Awareness', date: '2026-03-24', views: 128, shares: 14,
  },
  {
    id: 'news-2', title: 'Digital Filing Support Desk Now Live',
    description: 'Support desks are helping first-time applicants submit RTI requests and track updates online.',
    media: 'support-desk.mp4', category: 'Updates', date: '2026-03-22', views: 96, shares: 9,
  },
  {
    id: 'news-3', title: 'State-Level Transparency Workshop Announced',
    description: 'A new workshop series will train reporters and volunteers on documentation and public records access.',
    media: 'transparency-workshop.jpg', category: 'Events', date: '2026-03-19', views: 72, shares: 6,
  },
];

const defaultEPapers = [
  { id: 'epaper-1', title: 'RTI News - 24 March 2026', pdf_file: 'https://rti-news.local/papers/rti-news-2026-03-24.pdf', publish_date: '2026-03-24', views: 54, downloads: 18 },
  { id: 'epaper-2', title: 'RTI News - 23 March 2026', pdf_file: 'https://rti-news.local/papers/rti-news-2026-03-23.pdf', publish_date: '2026-03-23', views: 47, downloads: 13 },
  { id: 'epaper-3', title: 'RTI News - 22 March 2026', pdf_file: 'https://rti-news.local/papers/rti-news-2026-03-22.pdf', publish_date: '2026-03-22', views: 39, downloads: 10 },
];

const defaultStreams = [
  {
    id: 'stream-1',
    stream_title: DEMO_STREAM_TITLE,
    stream_url: DEMO_PLAYBACK_URL,
    ingest_url: YOUTUBE_RTMPS_URL,
    stream_key: YOUTUBE_STREAM_KEY_PLACEHOLDER,
    status: 'live',
  },
  {
    id: 'stream-2',
    stream_title: 'Transparency Weekly Talk',
    stream_url: '',
    ingest_url: YOUTUBE_RTMPS_URL,
    stream_key: 'weekly-talk',
    status: 'upcoming',
  },
  {
    id: 'stream-3',
    stream_title: 'Citizen Query Session',
    stream_url: '',
    ingest_url: YOUTUBE_RTMPS_URL,
    stream_key: 'citizen-session',
    status: 'ended',
  },
];

const defaultCertifications = [
  {
    id: 'cert-1', quiz_title: 'RTI Basics',
    questions: [
      { question: 'What does RTI stand for?', options: { A: 'Right to Information', B: 'Right to Income', C: 'Right to Integrity', D: 'None of the above' } },
      { question: 'Within how many days must RTI response be given?', options: { A: '15 days', B: '30 days', C: '45 days', D: '60 days' } },
      { question: 'Who can file an RTI?', options: { A: 'Only lawyers', B: 'Any Indian citizen', C: 'Only government employees', D: 'Journalists only' } },
    ],
    score: 78, result_type: 'Pass', certificate_file: null, attempts: 1, downloads: 2,
  },
  {
    id: 'cert-2', quiz_title: 'RTI Advanced',
    questions: [
      { question: 'Which authority handles RTI appeals?', options: { A: 'District Court', B: 'Central Information Commission', C: 'Supreme Court', D: 'High Court' } },
      { question: 'What is the RTI fee for BPL cardholders?', options: { A: 'Rs. 10', B: 'Rs. 50', C: 'Free', D: 'Rs. 100' } },
    ],
    score: 42, result_type: 'Fail', certificate_file: null, attempts: 1, downloads: 0,
  },
];

const defaultNotifications = [
  { id: 'notif-1', title: 'Welcome to RTI News',     message: 'Your account setup is complete and modules are ready to use.', date: '2026-03-24', status: 'Unread' },
  { id: 'notif-2', title: 'Wallet Bonus Added',       message: 'Welcome bonus has been credited to your wallet successfully.',  date: '2026-03-24', status: 'Read'   },
  { id: 'notif-3', title: 'Profile Update Reminder',  message: 'Complete your profile details to unlock better visibility.',    date: '2026-03-23', status: 'Unread' },
];

const defaultSettings = { language: 'English', password: '' };

// ─── Normalizers ──────────────────────────────────────────────────────────────

const getWalletTransactionSortValue = (transaction = {}) => {
  const idValue   = Number(String(transaction.id || '').replace(/\D/g, '')) || 0;
  const dateValue = new Date(transaction.date || 0).getTime();
  return Number.isFinite(dateValue) && dateValue > 0 ? dateValue + idValue : idValue;
};

const normalizeWalletTransactions = (transactions = []) => {
  if (!Array.isArray(transactions) || !transactions.length) return defaultWalletTransactions;
  return transactions
    .map((t, i) => ({
      id:     t.id     || `txn-${i + 1}`,
      amount: Number(t.amount || t.credit || 0),
      type:   t.type   || (Number(t.credit || 0) > 0 ? 'credit' : 'debit'),
      source: t.source || t.transaction_type || 'commission',
      date:   t.date   || '2026-03-24',
    }))
    .sort((a, b) => getWalletTransactionSortValue(b) - getWalletTransactionSortValue(a));
};

const normalizeWithdrawRequests = (requests = []) => {
  if (!Array.isArray(requests)) return [];
  return requests.map((r, i) => ({
    id:             r.id             || `withdraw-${i + 1}`,
    amount:         Number(r.amount  || 0),
    payment_mode:   r.payment_mode   || 'bank',
    bank_name:      r.bank_name      || '',
    account_number: r.account_number || '',
    ifsc:           r.ifsc           || '',
    upi_id:         r.upi_id         || '',
    status:         r.status         || 'pending',
    date:           r.date           || '2026-03-24',
  }));
};

const normalizeSubscription = (s = {}) => ({
  plan_id:   s.plan_id   || defaultActiveSubscription.plan_id,
  plan_name: s.plan_name || defaultActiveSubscription.plan_name,
  price:     Number(s.price ?? defaultActiveSubscription.price),
  duration:  s.duration  || defaultActiveSubscription.duration,
  features:  Array.isArray(s.features) ? s.features : [],
  role:      s.role      || getRoleFromPlanId(s.plan_id),
});

const normalizeSubscriptionPlan = (plan) => {
  if (!plan || (!plan.plan_id && !plan.plan_name)) return null;
  return normalizeSubscription(plan);
};

const normalizeComments = (comments = []) => {
  if (!Array.isArray(comments)) return [];
  return comments.map((c, i) => {
    const likedBy = Array.isArray(c.liked_by) ? c.liked_by : [];
    const likes = Number(c.likes ?? likedBy.length) || 0;
    return {
      id: c.id || `cmt-${i + 1}`,
      text: String(c.text || '').trim(),
      author: c.author || c.author_name || 'User',
      author_email: c.author_email || c.email || c.authorEmail || '',
      date: c.date || '2026-03-24',
      edited_at: c.edited_at || null,
      parent_comment_id: c.parent_comment_id || c.parentCommentId || null,
      liked_by: likedBy,
      likes,
      replies: normalizeComments(c.replies),
    };
  });
};

const decodeHtmlEntities = (value = '') =>
  String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const cleanRichTextToPlain = (value = '') =>
  decodeHtmlEntities(
    String(value || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>\s*<div>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

const normalizeNewsFeed = (items = []) => {
  const src = Array.isArray(items) && items.length ? items : [];
  return src.map((item, i) => ({
    id:          item.id          || `news-${i + 1}`,
    createdBy:   String(item.createdBy || item.created_by || '').trim().toLowerCase(),
    title:       cleanRichTextToPlain(item.title || '') || 'News Update',
    description: cleanRichTextToPlain(item.description || item.subtitle || ''),
    subtitle:    cleanRichTextToPlain(item.subtitle || ''),
    media:       item.media || (item.mediaType === 'Image'
      ? `${item.images?.length || 0} image(s)`
      : item.mediaType === 'Video' ? 'video attached'
      : item.mediaType === 'File' ? (item.file?.name ? `file: ${item.file.name}` : 'file attached')
      : 'no media'),
    category:    item.category || item.state || 'General',
    mediaType:   item.mediaType || 'None',
    state:       item.state || item.category || 'General',
    district:    item.district || '',
    taluka:      item.taluka || '',
    author_name: item.author_name || item.createdByName || item.createdBy || 'RTI News',
    author_profile_image: item.author_profile_image || item.authorProfileImage || item.createdByProfileImage || item.profile_image || '',
    author_has_blue_tick: Boolean(item.author_has_blue_tick || item.authorHasBlueTick || item.createdByBlueTick || false),
    author_is_premium: Boolean(item.author_is_premium || item.createdByPremium || false),
    author_is_subscriber: Boolean(item.author_is_subscriber || item.author_is_premium || item.createdBySubscriber || false),
    author_role: item.author_role || item.authorRole || item.createdByRole || '',
    author_role_label: item.author_role_label || item.authorRoleLabel || item.createdByRoleLabel || '',
    author_seat_id: String(item.author_seat_id || item.authorSeatId || item.createdBySeatId || '').trim(),
    author_seat_name: String(item.author_seat_name || item.authorSeatName || item.createdBySeatName || '').trim(),
    liked_by:    Array.isArray(item.liked_by) ? item.liked_by : [],
    comments_list: normalizeComments(item.comments_list),
    images:      Array.isArray(item.images) ? item.images : [],
    video:       item.video || null,
    file:        item.file || null,
    date:        item.date        || '2026-03-24',
    views:       Number(item.views  || 0),
    shares:      Number(item.shares || 0),
    likes:       Number(item.likes  || 0),
    comments:    Number(item.comments ?? (Array.isArray(item.comments_list) ? item.comments_list.length : 0)),
  }));
};

const stripHtmlToText = (value = '') => cleanRichTextToPlain(value);

const getRelativeTimeLabel = (dateLike) => {
  const d = new Date(dateLike || 0);
  const t = d.getTime();
  if (!Number.isFinite(t) || t <= 0) return '';
  const diffMs = Date.now() - t;
  if (!Number.isFinite(diffMs) || diffMs < 0) return '';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 10) return 'Just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? '' : 's'} ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString('en-IN');
};

const REEL_TAG_COLORS = {
  Crime:    '#ef4444',
  Murder:   '#ef4444',
  Accident: '#f97316',
  Politics: '#3b82f6',
  Other:    '#14b8a6',
  General:  '#16a34a',
};

const getReelVideoUri = (item = {}) => {
  if (typeof item.video === 'string' && item.video.trim()) return item.video.trim();
  if (item.video && typeof item.video.uri === 'string' && item.video.uri.trim()) return item.video.uri.trim();
  if (typeof item.media === 'string' && item.media.trim() && String(item.mediaType || '').toLowerCase() === 'video') {
    return item.media.trim();
  }
  return null;
};

const getReelThumbnailUri = (item = {}) => {
  if (typeof item.thumbnail === 'string' && item.thumbnail.trim()) return item.thumbnail.trim();
  if (typeof item.image === 'string' && item.image.trim()) return item.image.trim();
  if (Array.isArray(item.images) && item.images.length) {
    const first = item.images.find((u) => typeof u === 'string' && u.trim());
    if (first) return first.trim();
  }
  return null;
};

const toReelPostFromNewsItem = (item = {}, currentEmail = '') => {
  const videoUri = getReelVideoUri(item);
  const hasVideo = Boolean(videoUri);
  const createdByEmail = String(item.createdBy || item.created_by || '').trim().toLowerCase();

  const tagBase = String(item.report_type || item.category || item.state || 'General');
  const tag = tagBase;
  const tagColor = REEL_TAG_COLORS[tagBase] || '#16a34a';

  const headline = stripHtmlToText(item.title || item.headline || 'News Update');
  const caption = stripHtmlToText(item.subtitle || item.caption || item.excerpt || item.description || '');
  const fullDescription = stripHtmlToText(item.description || item.fullDescription || caption);

  const locationParts = [item.taluka, item.district, item.state].filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  const location = String(item.author_seat_name || item.authorSeatName || locationParts.join(', ') || 'India');

  const likes = Number(item.likes || 0);
  const shares = Number(item.shares || 0);

  const likedBy = Array.isArray(item.liked_by) ? item.liked_by : [];
  const liked = Boolean(currentEmail && likedBy.includes(currentEmail));

  const commentsList = Array.isArray(item.comments_list) ? item.comments_list : [];
  const comments = commentsList
    .map((c, idx) => ({
      id: String(c.id || `cmt-${idx + 1}`),
      user: String(c.author || c.author_name || 'User'),
      text: String(c.text || '').trim(),
    }))
    .filter((c) => c.text);

  return {
    id: String(item.id || `reel-${Date.now()}`),
    user: String(item.author_name || item.createdByName || item.createdBy || 'User'),
    avatar: String(item.author_profile_image || item.authorProfileImage || item.createdByProfileImage || item.profile_image || ''),
    verified: Boolean(item.author_has_blue_tick || item.authorHasBlueTick || false),
    author_has_blue_tick: Boolean(item.author_has_blue_tick || item.authorHasBlueTick || false),
    role: String(item.author_role_label || item.authorRoleLabel || item.author_role || item.authorRole || ''),
    location,
    time: String(item.time || getRelativeTimeLabel(item.createdAt || item.date || '')),
    type: hasVideo ? 'video' : (Array.isArray(item.images) && item.images.length ? 'image' : 'image'),
    media: hasVideo ? videoUri : (getReelThumbnailUri(item) || ''),
    thumbnail: getReelThumbnailUri(item),
    image: Array.isArray(item.images) && item.images.length ? item.images[0] : (item.image || ''),
    headline,
    caption,
    fullDescription,
    likes: Number.isFinite(likes) ? likes : 0,
    shares: Number.isFinite(shares) ? shares : 0,
    comments,
    liked,
    bookmarked: Boolean(item.bookmarked),
    tag,
    tagColor,
    status: item.status || 'approved',
    createdAt: item.createdAt || item.date || null,
    createdBy: createdByEmail,
  };
};

const getNewsSortValue = (item = {}) => {
  const createdAtValue = new Date(item.createdAt || item.date || 0).getTime();
  const idValue = Number(String(item.id || '').replace(/\D/g, '')) || 0;
  return Number.isFinite(createdAtValue) && createdAtValue > 0 ? createdAtValue + idValue : idValue;
};

const normalizeUserNewsItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      id: item.id,
      createdBy: String(item.createdBy || item.created_by || '').trim().toLowerCase(),
      title: cleanRichTextToPlain(item.title || ''),
      description: cleanRichTextToPlain(item.description || item.subtitle || ''),
      subtitle: cleanRichTextToPlain(item.subtitle || ''),
      media: item.media || (item.mediaType === 'Image'
        ? `${item.images?.length || 0} image(s)`
        : item.mediaType === 'Video' ? 'video attached'
        : item.mediaType === 'File' ? (item.file?.name ? `file: ${item.file.name}` : 'file attached')
        : 'no media'),
      category: item.category || item.state || 'General',
      mediaType: item.mediaType || 'None',
      state: item.state || item.category || 'General',
      district: item.district || '',
      taluka: item.taluka || '',
      author_name: item.author_name || item.createdByName || item.createdBy || 'RTI News',
      author_profile_image: item.author_profile_image || item.authorProfileImage || item.createdByProfileImage || item.profile_image || '',
      author_has_blue_tick: Boolean(item.author_has_blue_tick || item.authorHasBlueTick || item.createdByBlueTick || false),
      author_is_premium: Boolean(item.author_is_premium || item.createdByPremium || false),
      author_is_subscriber: Boolean(item.author_is_subscriber || item.author_is_premium || item.createdBySubscriber || false),
      author_role: item.author_role || item.authorRole || item.createdByRole || '',
      author_role_label: item.author_role_label || item.authorRoleLabel || item.createdByRoleLabel || '',
      author_seat_id: String(item.author_seat_id || item.authorSeatId || item.createdBySeatId || '').trim(),
      author_seat_name: String(item.author_seat_name || item.authorSeatName || item.createdBySeatName || '').trim(),
      liked_by: Array.isArray(item.liked_by) ? item.liked_by : [],
      comments_list: normalizeComments(item.comments_list),
      images: Array.isArray(item.images) ? item.images : [],
image: Array.isArray(item.images) && item.images.length > 0
  ? item.images[0]
  : (item.image || ''),
thumbnail: Array.isArray(item.images) && item.images.length > 0
  ? item.images[0]
  : (item.thumbnail || item.image || ''),
video: item.video || null,
file: item.file || null,
date: item.date, createdAt: item.createdAt || item.date,
      status: item.status || 'approved',
      views: Number(item.views || 0), shares: Number(item.shares || 0),
      likes: Number(item.likes || 0),
      comments: Number(item.comments ?? (Array.isArray(item.comments_list) ? item.comments_list.length : 0)),
    }))
    .sort(() => Math.random() - 0.5);
};

const normalizeEmailValue = (value = '') => String(value || '').trim().toLowerCase();

const sanitizeNewsField = (value = '') => cleanRichTextToPlain(value);

const sanitizeNewsItemUpdates = (updates = {}) => ({
  title: sanitizeNewsField(updates.title),
  subtitle: sanitizeNewsField(updates.subtitle),
  description: sanitizeNewsField(updates.description),
  category: sanitizeNewsField(updates.category),
  state: sanitizeNewsField(updates.state),
  district: sanitizeNewsField(updates.district),
  taluka: sanitizeNewsField(updates.taluka),
});

const canManageNewsItem = (user, item = {}) => {
  const currentEmail = normalizeEmailValue(user?.email);
  if (!currentEmail) return false;
  if (String(user?.role || '').trim().toLowerCase() === 'admin') return true;
  const ownerEmail = normalizeEmailValue(item.createdBy || item.created_by);
  return Boolean(ownerEmail) && ownerEmail === currentEmail;
};

const updateNewsItemInCollection = (items, postId, buildNextItem) => {
  if (!Array.isArray(items) || !items.length) {
    return { items, found: false, changed: false, updatedItem: null };
  }

  let found = false;
  let changed = false;
  let updatedItem = null;

  const nextItems = items.map((item) => {
    if (String(item?.id || '').trim() !== postId) return item;
    found = true;
    const nextItem = buildNextItem(item);
    if (nextItem !== item) changed = true;
    updatedItem = nextItem;
    return nextItem;
  });

  return {
    items: found ? nextItems : items,
    found,
    changed,
    updatedItem,
  };
};

const removeNewsItemFromCollection = (items, postId) => {
  if (!Array.isArray(items) || !items.length) {
    return { items, found: false, changed: false };
  }

  const nextItems = items.filter((item) => String(item?.id || '').trim() !== postId);
  const found = nextItems.length !== items.length;

  return {
    items: found ? nextItems : items,
    found,
    changed: found,
  };
};

const clearNewsItemEngagement = async (postId) => {
  const normalizedPostId = String(postId || '').trim();
  if (!normalizedPostId) return;

  if (Platform.OS === 'web') {
    const state = await readEngagementFallback();
    const existingComments = Array.isArray(state.commentsByPost?.[normalizedPostId])
      ? state.commentsByPost[normalizedPostId]
      : [];

    existingComments.forEach((comment) => {
      const commentId = String(comment?.id || '').trim();
      if (commentId && state.commentLikesById?.[commentId]) {
        delete state.commentLikesById[commentId];
      }
    });

    delete state.likesByPost[normalizedPostId];
    delete state.sharesByPost[normalizedPostId];
    delete state.viewsByPost[normalizedPostId];
    delete state.commentsByPost[normalizedPostId];
    delete state.bookmarksByPost[normalizedPostId];

    await writeEngagementFallback(state);
    return;
  }

  const db = await getEngagementDb();
  if (!db) return;

  const commentRows = await db.getAllAsync(
    'SELECT id FROM post_comments WHERE post_id = ?',
    normalizedPostId
  );
  const commentIds = (commentRows || [])
    .map((row) => Number(row?.id))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (commentIds.length) {
    const placeholders = commentIds.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM comment_likes WHERE comment_id IN (${placeholders})`,
      commentIds
    );
  }

  await db.runAsync('DELETE FROM post_likes WHERE post_id = ?', normalizedPostId);
  await db.runAsync('DELETE FROM post_bookmarks WHERE post_id = ?', normalizedPostId);
  await db.runAsync('DELETE FROM post_shares WHERE post_id = ?', normalizedPostId);
  await db.runAsync('DELETE FROM post_views WHERE post_id = ?', normalizedPostId);
  await db.runAsync('DELETE FROM post_comments WHERE post_id = ?', normalizedPostId);
};

const normalizeEPapers = (items = []) => {
  const src = Array.isArray(items) && items.length ? items : defaultEPapers;
  return src
    .map((item, i) => ({
      id:           item.id           || `epaper-${i + 1}`,
      title:        item.title        || `e-Paper ${i + 1}`,
      description:  item.description  || '',
      pdf_file:     item.pdf_file     || '',
      publish_date: item.publish_date || item.date || item.createdAt?.slice(0, 10) || '2026-03-24',
      createdAt:    item.createdAt    || item.publish_date || item.date || '2026-03-24',
      createdBy:    item.createdBy    || '',
      state:        item.state        || '',
      status:       item.status       || 'approved',
      mediaType:    item.mediaType    || 'None',
      images:       Array.isArray(item.images) ? item.images : [],
      video:        item.video || null,
      views:        Number(item.views     || 0),
      downloads:    Number(item.downloads || 0),
    }))
    .sort((a, b) => new Date(b.createdAt || b.publish_date || 0) - new Date(a.createdAt || a.publish_date || 0));
};

const normalizeStreams = (items = []) => {
  const src = Array.isArray(items) && items.length ? items : defaultStreams;
  const normalized = src.map((item, i) => {
    const status = (item.status || 'upcoming').toLowerCase();
    const streamUrl = item.stream_url || item.youtube_link || '';
    return {
      id:           item.id           || `stream-${i + 1}`,
      stream_title: item.stream_title || 'Live Stream',
      stream_url:   streamUrl || (status === 'live' ? DEMO_PLAYBACK_URL : ''),
      ingest_url:   item.ingest_url || YOUTUBE_RTMPS_URL,
      stream_key:   item.stream_key || `stream-${i + 1}`,
      status,
    };
  });

  const hasLiveStream = normalized.some((item) => item.status === 'live' && item.stream_url);
  if (hasLiveStream) return normalized;

  return [
    {
      id: 'stream-demo-live',
      stream_title: DEMO_STREAM_TITLE,
      stream_url: DEMO_PLAYBACK_URL,
      ingest_url: YOUTUBE_RTMPS_URL,
      stream_key: YOUTUBE_STREAM_KEY_PLACEHOLDER,
      status: 'live',
    },
    ...normalized,
  ];
};

const normalizeCertifications = (items = []) => {
  const src = Array.isArray(items) && items.length ? items : defaultCertifications;
  return src.map((item, i) => ({
    id:               item.id               || `cert-${i + 1}`,
    quiz_title:       item.quiz_title       || item.quiz_id || `Quiz ${i + 1}`,
    questions:        Array.isArray(item.questions) ? item.questions : [],
    score:            item.score            ?? null,
    result_type:      item.result_type      || (item.result === 'Passed' ? 'Pass' : item.result === 'Retry' ? 'Fail' : null),
    certificate_file: item.certificate_file || null,
    local_certificate_path: item.local_certificate_path || null,
    certificate_number: item.certificate_number || null,
    user_name:  item.user_name  || '',
    issued_at:  item.issued_at  || item.date || null,
    attempts:   Number(item.attempts  || 0),
    downloads:  Number(item.downloads || 0),
  }));
};

const normalizeNotifications = (items = []) => {
  const src = Array.isArray(items) && items.length ? items : defaultNotifications;
  return src.map((item, i) => ({
    id:      item.id      || `notif-${i + 1}`,
    title:   item.title   || 'Notification',
    message: item.message || '',
    date:    item.date    || '2026-03-24',
    status:  item.status  || 'Unread',
  }));
};

const normalizeSettings = (s = {}) => ({
  language: s.language || defaultSettings.language,
  password: s.password || defaultSettings.password,
});

const normalizeStateKey = (state = '') => String(state || '').trim().toLowerCase();

const getStateSeatRole = (seatRoleId = '') =>
  STATE_SEAT_ROLES.find((r) => r.id === seatRoleId) || null;

const normalizeStateSeat = (seat = null) => {
  if (!seat || typeof seat !== 'object') return null;
  const state = String(seat.state || '').trim();
  const seat_id = String(seat.seat_id || '').trim();
  if (!state || !seat_id) return null;
  const role = getStateSeatRole(seat_id);
  return {
    state,
    seat_id,
    seat_name: String(seat.seat_name || role?.name || '').trim(),
    assigned_at: seat.assigned_at || null,
    plan_id: String(seat.plan_id || '').trim(),
  };
};

const getStateSeatAllocationsFromStorage = async () => {
  const raw = await AsyncStorage.getItem(STATE_SEATS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const normalizePaymentHistory = (items = []) => {
  const src = Array.isArray(items) ? items : [];
  return src.map((item, i) => ({
    order_id:   item.order_id   || `ORD_${i + 1}`,
    payment_id: item.payment_id || '',
    amount:     Number(item.amount || 0),
    status:     item.status     || 'pending',
    date:       item.date       || '2026-03-24',
    plan_id:    item.plan_id    || '',
    plan_name:  item.plan_name  || '',
    signature:  item.signature  || '',
    gateway_order_id: item.gateway_order_id || item.razorpay_order_id || '',
  }));
};

const isPremiumPlan = (plan) => {
  const planId   = String(plan?.plan_id   || '').toLowerCase();
  const planName = String(plan?.plan_name || '').toLowerCase();
  return planId === 'plan-premium' || planName.includes('premium');
};

const hasBlueTick = (user = {}) => {
  if (!user) return false;
  return Boolean(user.has_blue_tick || user.blue_tick_active || user.is_verified);
};

const hasPremiumAccess = (user = {}) => {
  if (!user) return false;
  return isPremiumPlan(user.subscription_plan) || String(user.subscription_type || '').toLowerCase() === 'premium';
};

const hasActiveSubscription = (user = {}) => {
  if (!user) return false;
  if (user.is_subscribed !== undefined) return Boolean(user.is_subscribed);
  const history = Array.isArray(user.payment_history) ? user.payment_history : [];
  if (history.some((h) => String(h.status || '').toLowerCase() === 'success')) return true;
  return false;
};

const normalizeEmailList = (items = []) => (
  Array.from(new Set(
    (Array.isArray(items) ? items : [])
      .map((value) => String(value || '').trim().toLowerCase())
      .filter(Boolean)
  ))
);

const normalizeUser = (user = {}) => {
  const referralCount = Number(user.referral_count || 0);
  const savedPlan = normalizeSubscriptionPlan(user.subscription_plan);
  const role = user.role || getRoleFromPlanId(savedPlan?.plan_id) || 'free';
  const normalizedMobile = normalizeIndianMobileNumber(user.mobile || user.mobile_number || user.contact_number || '');
  const normalizedMobileNumber = normalizeIndianMobileNumber(user.mobile_number || user.mobile || user.contact_number || '');

  return {
    ...user,
    // ✅ FIX: email hamesha lowercase save hogi
    email:               user.email ? user.email.trim().toLowerCase() : '',
    name:                user.name                || '',
    mobile:              normalizedMobile,
    contact_number:      user.contact_number      || user.mobile_number || user.mobile || '',
    phone_number:        user.phone_number        || '',
    mobile_number:       normalizedMobileNumber,
    state:               user.state               || '',
    district:            user.district            || '',
    taluka:              user.taluka              || '',
    location_complete:   user.location_complete   !== undefined ? user.location_complete : false,
    state_seat:          normalizeStateSeat(user.state_seat),
    subscription_type:   user.subscription_type   || role || 'free',
    role,
    role_label:          getRoleLabel(role),
    has_blue_tick:       hasBlueTick(user),
    is_subscribed:       user.is_subscribed !== undefined
                           ? Boolean(user.is_subscribed)
                           : role !== 'free',
    village:             user.village             || '',
    bio:                 user.bio                 || '',
    profile_image:       user.profile_image       || '',
    id_card:             user.id_card             || '',
    appointment_letter:  user.appointment_letter  || '',
    my_referral_code:    user.my_referral_code    || '',
    referred_by:         user.referred_by         || '',
    referral_code_used:  user.referral_code_used  || '',
    referral_count:      referralCount,
    followers:           normalizeEmailList(user.followers),
    following:           normalizeEmailList(user.following),
    rank:                calculateRank(referralCount),
    join_date:           user.join_date           || new Date().toISOString().slice(0, 10),
    wallet_transactions: normalizeWalletTransactions(user.wallet_transactions),
    withdraw_requests:   normalizeWithdrawRequests(user.withdraw_requests),
    subscription_plan:   savedPlan,
    payment_history:     normalizePaymentHistory(user.payment_history),
    settings:            normalizeSettings(user.settings),
  };
};

// ─── Storage Helpers ──────────────────────────────────────────────────────────

// ✅ FIX: getUsersFromStorage mein email normalize karo
const getUsersFromStorage = async () => {
  const data  = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  return users.map((u) => normalizeUser({
    ...u,
    // ✅ Purane users jinka email uppercase tha, unhe bhi fix karo
    email: u.email ? u.email.trim().toLowerCase() : u.email,
  }));
};

// ─── Network Helper ───────────────────────────────────────────────────────────

const getLevelFromCurrentUser = (user, currentUser, usersByEmail) => {
  if (!currentUser || !user?.email) return '-';
  if (user.email === currentUser.email) return '0';
  let level  = 1;
  let cursor = user.referred_by;
  const visited = new Set();
  while (cursor && !visited.has(cursor)) {
    if (cursor === currentUser.email) return String(level);
    visited.add(cursor);
    const parent = usersByEmail.get(cursor);
    cursor = parent?.referred_by || '';
    level += 1;
  }
  return user.referred_by ? 'Linked' : 'Direct';
};

// ─── Certificate SVG Builder ──────────────────────────────────────────────────

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const buildCertificateSvg = ({
  userName, quizTitle, score, resultType, issueDate,
  certificateNumber, photoUri, email, village, contactNumber,
}) => {
  const safePhoto = photoUri && !String(photoUri).startsWith('blob:') ? escapeXml(photoUri) : '';
  const photoMarkup = safePhoto
    ? `<image href="${safePhoto}" x="1088" y="650" width="170" height="210" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />`
    : `<rect x="1088" y="650" width="170" height="210" rx="10" fill="#E5E7EB" /><text x="1173" y="760" text-anchor="middle" fill="#6B7280" font-size="24" font-weight="700">PHOTO</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1400" height="990" viewBox="0 0 1400 990" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c8a94a"/><stop offset="50%" stop-color="#f0d080"/><stop offset="100%" stop-color="#c8a94a"/>
    </linearGradient>
    <clipPath id="photoClip"><rect x="1088" y="650" width="170" height="210" rx="10" /></clipPath>
  </defs>
  <rect width="1400" height="990" fill="#e8d5a3"/>
  <rect x="20" y="20" width="1360" height="950" fill="#f5efe0" stroke="#c8a94a" stroke-width="8"/>
  <rect x="34" y="34" width="1332" height="922" fill="#fdfaf3" stroke="#c8a94a" stroke-width="3"/>
  <text x="120" y="105" fill="#003399" font-size="34" font-weight="900">BhaRTIya VOICE</text>
  <text x="120" y="130" fill="#555555" font-size="13">RNI/MAH/MUL/66399</text>
  <circle cx="700" cy="96" r="48" fill="#fff8e1" stroke="#c8a94a" stroke-width="4"/>
  <text x="700" y="105" text-anchor="middle" fill="#003399" font-size="14" font-weight="900">BHARTIYA VOICE</text>
  <text x="700" y="120" text-anchor="middle" fill="#cc0000" font-size="7" font-weight="700">ALL INDIA RTI NEWS NETWORK</text>
  <rect x="1115" y="68" width="170" height="48" rx="5" fill="#003399"/>
  <text x="1200" y="97" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700">All India RTI News Network</text>
  <text x="1110" y="132" fill="#555555" font-size="13">UDYAM-MH-29-0022246</text>
  <rect x="34" y="155" width="1332" height="58" fill="#cc0000"/>
  <text x="700" y="193" text-anchor="middle" fill="#FFFFFF" font-size="34" font-weight="900">Bhartiya Mahiti Adhikar</text>
  <text x="700" y="238" text-anchor="middle" fill="#333333" font-size="16">News Paper Published in Marathi, Hindi &amp; English language</text>
  <text x="700" y="260" text-anchor="middle" fill="#333333" font-size="16"><tspan font-weight="700">Hon. Mr. Shoukat Abdulkalam Naikwadi </tspan>Chief Editor</text>
  <rect x="450" y="290" width="500" height="62" rx="6" fill="url(#gold)" stroke="#8b6914" stroke-width="2"/>
  <text x="700" y="331" text-anchor="middle" fill="#4a2800" font-size="28">Certificate <tspan font-style="italic">of</tspan> <tspan font-weight="900">Excellence</tspan></text>
  <text x="700" y="397" text-anchor="middle" fill="#333333" font-size="22">This is to certify that</text>
  <text x="700" y="452" text-anchor="middle" fill="#cc0000" font-size="44" font-weight="900">${escapeXml(userName)}</text>
  <text x="700" y="500" text-anchor="middle" fill="#333333" font-size="20">has successfully passed the examination conducted by</text>
  <text x="700" y="537" text-anchor="middle" fill="#1a1a1a" font-size="24" font-weight="700">${escapeXml(quizTitle)}</text>
  <text x="700" y="575" text-anchor="middle" fill="#333333" font-size="20">with</text>
  <line x1="320" y1="612" x2="1080" y2="612" stroke="#c8a94a" stroke-width="3"/>
  <text x="700" y="652" text-anchor="middle" fill="#1a5c1a" font-size="42" font-weight="900">${escapeXml(resultType)}</text>
  <line x1="320" y1="668" x2="1080" y2="668" stroke="#c8a94a" stroke-width="3"/>
  <text x="700" y="706" text-anchor="middle" fill="#333333" font-size="18">Subjected to the movement of Right to Information in the organisational social work field since "15th" Years</text>
  <text x="700" y="746" text-anchor="middle" fill="#8b0000" font-size="26" font-style="italic" font-weight="700">Congratulations on your outstanding achievement!</text>
  <text x="160" y="790" fill="#333333" font-size="70">&#128220;</text>
  <rect x="300" y="770" width="520" height="150" rx="12" fill="#fff9eb" stroke="#ead9ab"/>
  <text x="324" y="800" fill="#8b6914" font-size="15" font-weight="800">MEMBER DETAILS</text>
  <text x="324" y="825" fill="#333333" font-size="15">Name: <tspan font-weight="800">${escapeXml(userName)}</tspan></text>
  <text x="324" y="848" fill="#333333" font-size="15">Email: <tspan font-weight="800">${escapeXml(email || '-')}</tspan></text>
  <text x="324" y="871" fill="#333333" font-size="15">Village: <tspan font-weight="800">${escapeXml(village || '-')}</tspan></text>
  <text x="324" y="894" fill="#333333" font-size="15">Contact: <tspan font-weight="800">${escapeXml(contactNumber || '-')}</tspan></text>
  <text x="324" y="917" fill="#333333" font-size="15">Certificate No: <tspan font-weight="800">${escapeXml(certificateNumber)}</tspan></text>
  <rect x="1082" y="644" width="182" height="222" rx="12" fill="#f0e6c8" stroke="#c8a94a" stroke-width="4"/>
  ${photoMarkup}
  <text x="700" y="948" text-anchor="middle" fill="#8b0000" font-size="18" font-weight="800">Hon. Mr. Shoukat Abdulkalam Naikwadi</text>
  <text x="700" y="965" text-anchor="middle" fill="#333333" font-size="13">Chief Editor / Owner / Publisher / All India President Bhartiya Mahiti Adhikar</text>
  <rect x="515" y="872" width="370" height="36" rx="18" fill="#fdfaf3" stroke="#8b6914"/>
  <text x="700" y="895" text-anchor="middle" fill="#333333" font-size="15">Date of Issue: ${escapeXml(issueDate)}</text>
  <rect x="34" y="970" width="1332" height="32" fill="#b22222"/>
  <text x="700" y="991" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="600">Certificate No. ${escapeXml(certificateNumber)} | ritechek@gmail.com | www.bhartiyamahitiadhikar.com</text>
</svg>`;
};

const ensureCertificateDirectoryAsync = async () => {
  if (!CERTIFICATE_DIR) return null;
  const dirInfo = await FileSystem.getInfoAsync(CERTIFICATE_DIR);
  if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(CERTIFICATE_DIR, { intermediates: true });
  return CERTIFICATE_DIR;
};

// ─── User Store ───────────────────────────────────────────────────────────────
export const UserStore = {

  getUser: async (email) => {
    try {
      // ✅ FIX: search bhi lowercase se karo
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const users = await getUsersFromStorage();
      return users.find((u) => u.email === normalizedEmail) || null;
    } catch { return null; }
  },

  getUserByReferralCode: async (code) => {
    try {
      if (!code) return null;
      const users = await getUsersFromStorage();
      return users.find((u) => u.my_referral_code === code.toUpperCase()) || null;
    } catch { return null; }
  },

  getAllUsers: async () => {
    try { return await getUsersFromStorage(); }
    catch { return []; }
  },

  hasPremiumAccess: (user) => hasPremiumAccess(user),
  hasActiveSubscription: (user) => hasActiveSubscription(user),
  hasBlueTick: (user) => hasBlueTick(user),
  isPremiumPlan: (plan) => isPremiumPlan(plan),
  getRoleFromPlanId,
  getRoleLabel,

  saveUser: async ({
    name,
    mobile,
    email,
    password,
    state             = '',
    district          = '',
    taluka            = '',
    subscription_type = 'free',
    referral_code_used = null,
  }) => {
    try {
      // ✅ FIX: Register karte waqt email lowercase karo
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const normalizedMobile = normalizeIndianMobileNumber(mobile);

      const users = await getUsersFromStorage();

      // ✅ FIX: Duplicate check normalized email se
      const existing = users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return { ok: false, message: 'This email is already registered!' };
      }

      if (!isValidIndianMobileNumber(normalizedMobile)) {
        return { ok: false, message: 'Please enter a valid Indian mobile number.' };
      }

      const existingByMobile = users.find(
        (u) => normalizeIndianMobileNumber(u.mobile || u.mobile_number || u.contact_number) === normalizedMobile
      );
      if (existingByMobile) {
        return { ok: false, message: 'This mobile number is already registered!' };
      }

      const my_referral_code = await generateUniqueReferralCode(users);

      let referred_by = '';
      if (referral_code_used) {
        const parentUser = users.find(
          (u) => u.my_referral_code === referral_code_used.toUpperCase().trim()
        );
        if (!parentUser) {
          return { ok: false, message: 'Invalid referral code. Please check and try again.' };
        }
        referred_by = parentUser.email;
      }

      const newUser = normalizeUser({
        name,
        mobile: normalizedMobile,
        email: normalizedEmail, // ✅ lowercase email save karo
        password,
        state,
        district,
        taluka,
        location_complete: false,
        subscription_type,
        role: 'free',
        is_subscribed: false,
        my_referral_code,
        referred_by,
        referral_code_used: referral_code_used || '',
        referral_count: 0,
        join_date: new Date().toISOString().slice(0, 10),
        wallet_transactions: defaultWalletTransactions,
        withdraw_requests:   [],
        subscription_plan:   null,
        payment_history:     [],
        settings:            defaultSettings,
      });

      let updatedUsers = [...users];
      if (referred_by) {
        updatedUsers = users.map((u) => {
          if (u.email !== referred_by) return u;
          const newCount = (u.referral_count || 0) + 1;
          return normalizeUser({
            ...u,
            referral_count: newCount,
            rank: calculateRank(newCount),
          });
        });
      }

      updatedUsers.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return { ok: true, user: newUser };
    } catch (_err) {
      return { ok: false, message: 'Registration failed. Please try again.' };
    }
  },

  updateUser: async (email, updates) => {
    try {
      const data  = await AsyncStorage.getItem(USERS_KEY);
      const users = data ? JSON.parse(data) : [];
      // ✅ FIX: update bhi lowercase email se match karo
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      let updatedUser = null;

      const updatedUsers = users.map((user) => {
        const userEmail = user.email ? user.email.trim().toLowerCase() : '';
        if (userEmail !== normalizedEmail) return user;
        const mergedReferralCount = updates.referral_count !== undefined
          ? Number(updates.referral_count)
          : Number(user.referral_count || 0);

        updatedUser = normalizeUser({
          ...user,
          ...updates,
          email: normalizedEmail, // ✅ email lowercase rakho
          referral_count: mergedReferralCount,
          rank: calculateRank(mergedReferralCount),
          wallet_transactions: normalizeWalletTransactions(updates.wallet_transactions !== undefined ? updates.wallet_transactions : user.wallet_transactions),
          withdraw_requests:   normalizeWithdrawRequests(updates.withdraw_requests !== undefined ? updates.withdraw_requests : user.withdraw_requests),
          subscription_plan:   normalizeSubscriptionPlan(updates.subscription_plan !== undefined ? updates.subscription_plan : user.subscription_plan),
          payment_history:     normalizePaymentHistory(updates.payment_history !== undefined ? updates.payment_history : user.payment_history),
          settings:            normalizeSettings(updates.settings !== undefined ? updates.settings : user.settings),
        });
        return updatedUser;
      });

      if (!updatedUser) return null;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return updatedUser;
    } catch { return null; }
  },

  activateBlueTickForCurrentUser: async () => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser?.email) {
        return { ok: false, message: 'Please login again.' };
      }

      const purchasedAt = new Date().toISOString();
      const patchAuthorBlueTick = (items) => (
        Array.isArray(items)
          ? items.map((item) => ({
              ...item,
              author_has_blue_tick: true,
              authorHasBlueTick: true,
              createdByBlueTick: true,
            }))
          : items
      );

      const updatedUser = await UserStore.updateUser(currentUser.email, {
        has_blue_tick: true,
        blue_tick_active: true,
        is_verified: true,
        blue_tick_purchased_at: purchasedAt,
        news: patchAuthorBlueTick(currentUser.news),
        news_feed: patchAuthorBlueTick(currentUser.news_feed),
      });

      if (!updatedUser) {
        return { ok: false, message: 'Blue tick activate nahi ho paya.' };
      }

      return { ok: true, user: updatedUser };
    } catch {
      return { ok: false, message: 'Blue tick activate nahi ho paya.' };
    }
  },

  completeLocationSetup: async (email, state, district = '', taluka = '') => {
    return await UserStore.updateUser(email, { state, district, taluka, location_complete: true });
  },

  // ✅ FIX: setCurrentUser mein lowercase save karo
  setCurrentUser: async (email) => {
    try {
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      await AsyncStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
      return true;
    } catch { return false; }
  },

  getCurrentUser: async () => {
    try {
      const email = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (!email) return null;
      // ✅ FIX: stored email bhi lowercase se match karo
      const normalizedEmail = email.trim().toLowerCase();
      const users = await getUsersFromStorage();
      return users.find((u) => u.email === normalizedEmail) || null;
    } catch { return null; }
  },

  clearCurrentUser: async () => {
    try { await AsyncStorage.removeItem(CURRENT_USER_KEY); return true; }
    catch { return false; }
  },

  deleteCurrentUser: async () => {
    try {
      const email = await AsyncStorage.getItem(CURRENT_USER_KEY);
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      if (!normalizedEmail) return { ok: false, message: 'No account is logged in.' };

      const data = await AsyncStorage.getItem(USERS_KEY);
      const users = data ? JSON.parse(data) : [];
      const updatedUsers = users.filter((u) => String(u.email || '').trim().toLowerCase() !== normalizedEmail);

      if (updatedUsers.length === users.length) {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        return { ok: false, message: 'Account not found.' };
      }

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Unable to delete account.' };
    }
  },

  setPendingRegistration: async (data = {}) => {
    try {
      const payload = {
        name: String(data.name || '').trim(),
        mobile: normalizeIndianMobileNumber(data.mobile || ''),
        email: String(data.email || '').trim().toLowerCase(),
        password: String(data.password || ''),
        referral_code_used: data.referral_code_used ? String(data.referral_code_used).trim() : '',
        created_at: new Date().toISOString(),
      };
      if (!payload.email) return false;
      await AsyncStorage.setItem(PENDING_REG_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  },

  getPendingRegistration: async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_REG_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.email) return null;
      return {
        ...parsed,
        email: String(parsed.email).trim().toLowerCase(),
      };
    } catch {
      return null;
    }
  },

  clearPendingRegistration: async () => {
    try {
      await AsyncStorage.removeItem(PENDING_REG_KEY);
      return true;
    } catch {
      return false;
    }
  },

  getReferralSummary: async () => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) return null;

      const users = await getUsersFromStorage();
      const directReferrals = users.filter((u) => u.referred_by === currentUser.email);

      return {
        my_referral_code: currentUser.my_referral_code || '',
        referral_count:   currentUser.referral_count   || 0,
        rank:             currentUser.rank              || 'Member',
        next_rank:        (() => {
          const idx = RANK_TIERS.findIndex((t) => t.rank === currentUser.rank);
          return idx > 0 ? RANK_TIERS[idx - 1] : null;
        })(),
        direct_referrals: directReferrals.map((u) => ({
          name:      u.name,
          email:     u.email,
          join_date: u.join_date,
          rank:      u.rank,
          state:     u.state,
        })),
      };
    } catch { return null; }
  },

  getMyNetwork: async () => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) return null;

      const users        = await getUsersFromStorage();
      const usersByEmail = new Map(users.map((u) => [u.email, u]));

      const rows = users
        .map((user) => ({
          user_id:       user.email,
          name:          user.name || 'Unnamed User',
          mobile:        user.mobile || '-',
          state:         user.state || '-',
          rank:          user.rank || 'Member',
          role:          user.role || 'free',
          role_label:    getRoleLabel(user.role || 'free'),
          subscription_type: user.subscription_type || user.role || 'free',
          subscription_plan: user.subscription_plan || null,
          is_subscribed: hasActiveSubscription(user),
          referred_by:   user.referred_by || 'Direct Signup',
          level:         getLevelFromCurrentUser(user, currentUser, usersByEmail),
          join_date:     user.join_date || '2026-03-24',
          commission:    user.commission || 0,
          isCurrentUser: user.email === currentUser.email,
        }))
        .sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return a.name.localeCompare(b.name);
        });

      return {
        currentUser,
        totalMembers:  rows.length,
        linkedMembers: rows.filter((r) => r.level !== '-' && !r.isCurrentUser).length,
        rows,
      };
    } catch { return null; }
  },

  getWalletSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const transactions = normalizeWalletTransactions(user.wallet_transactions);
      const total_credit = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const total_debit  = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
      return { total_balance: total_credit - total_debit, total_credit, total_debit, transactions };
    } catch { return null; }
  },

  getWithdrawSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const walletSummary = await UserStore.getWalletSummary();
      const requests = normalizeWithdrawRequests(user.withdraw_requests).sort((a, b) => new Date(b.date) - new Date(a.date));
      return { currentUser: user, available_balance: walletSummary?.total_balance || 0, requests };
    } catch { return null; }
  },

  createWithdrawRequest: async ({ amount, payment_mode, bank_name, account_number, ifsc, upi_id }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const walletSummary = await UserStore.getWalletSummary();
      const numericAmount = Number(amount || 0);
      if (!numericAmount || numericAmount <= 0) return { ok: false, message: 'Enter a valid withdrawal amount.' };
      if (numericAmount > (walletSummary?.total_balance || 0)) return { ok: false, message: 'Insufficient wallet balance.' };
      const today = new Date().toISOString().slice(0, 10);
      const newRequest = { id: `withdraw-${Date.now()}`, amount: numericAmount, payment_mode: payment_mode || 'bank', bank_name: bank_name || '', account_number: account_number || '', ifsc: ifsc || '', upi_id: upi_id || '', status: 'pending', date: today };
      const newTxn = { id: `txn-${Date.now()}`, amount: numericAmount, type: 'debit', source: 'withdrawal', date: today };
      const updatedUser = await UserStore.updateUser(user.email, {
        withdraw_requests:   [...normalizeWithdrawRequests(user.withdraw_requests), newRequest],
        wallet_transactions: [newTxn, ...normalizeWalletTransactions(user.wallet_transactions)],
      });
      if (!updatedUser) return { ok: false, message: 'Unable to save withdrawal request.' };
      return { ok: true, request: newRequest };
    } catch { return { ok: false, message: 'Unable to create withdrawal request.' }; }
  },

  getSubscriptionSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      return {
        currentUser: user,
        activePlan:  hasActiveSubscription(user) ? normalizeSubscriptionPlan(user.subscription_plan) : null,
        plans:       defaultSubscriptionPlans,
        currentRole:      user.role || 'free',
        currentRoleLabel: getRoleLabel(user.role || 'free'),
      };
    } catch { return null; }
  },

  getStateSeatSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;

      const state = String(user.state || '').trim();
      const current_seat = normalizeStateSeat(user.state_seat);

      if (!state) {
        return {
          currentUser: user,
          state: '',
          current_seat,
          seats: STATE_SEAT_ROLES.map((role) => ({ ...role, status: 'disabled' })),
        };
      }

      const allocations = await getStateSeatAllocationsFromStorage();
      const stateKey = normalizeStateKey(state);
      const stateAlloc = allocations[stateKey] && typeof allocations[stateKey] === 'object'
        ? allocations[stateKey]
        : {};

      const seats = STATE_SEAT_ROLES.map((role) => {
        const takenBy = String(stateAlloc?.[role.id]?.email || '').trim().toLowerCase();
        const status = takenBy
          ? (takenBy === user.email ? 'mine' : 'taken')
          : 'available';
        return { ...role, status };
      });

      return { currentUser: user, state, current_seat, seats };
    } catch { return null; }
  },

  getPaymentSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      return { currentUser: user, pending_order: null, payment_history: normalizePaymentHistory(user.payment_history) };
    } catch { return null; }
  },

  createPaymentOrder: async ({ order_id, amount, plan_id, seat_state, seat_role_id }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const activePlan = defaultSubscriptionPlans.find((p) => p.plan_id === plan_id);
      if (!activePlan) return null;
      const nextOrderId = order_id || `ORD_${Date.now()}`;

      const seatState = String(seat_state || '').trim();
      const seatRoleId = String(seat_role_id || '').trim();
      const seatRole = seatRoleId ? getStateSeatRole(seatRoleId) : null;

      return {
        order_id: nextOrderId,
        amount: Number(amount ?? activePlan.price),
        plan_id: activePlan.plan_id,
        plan_name: activePlan.plan_name,
        duration: activePlan.duration,
        role: activePlan.role || getRoleFromPlanId(activePlan.plan_id),
        created_by: user.email || '',
        seat_state: seatState,
        seat_role_id: seatRoleId,
        seat_role_name: seatRole?.name || '',
      };
    } catch { return null; }
  },

  verifyPayment: async ({ payment_id, order_id, signature, plan_id, seat_state, seat_role_id }) => {
    let allocationsBefore = null;
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };

      const today      = new Date().toISOString().slice(0, 10);
      const activePlan = defaultSubscriptionPlans.find((p) => p.plan_id === plan_id) || defaultActiveSubscription;
      const newRole    = getRoleFromPlanId(plan_id);
      const newSubscriptionType = newRole;

      const profileState = String(user.state || '').trim();
      const requestedSeatState = String(seat_state || '').trim();
      const requestedSeatRoleId = String(seat_role_id || '').trim();
      const wantsSeatSelection = Boolean(requestedSeatState || requestedSeatRoleId);

      const existingSeat = normalizeStateSeat(user.state_seat);
      const hasSeatInProfileState = Boolean(existingSeat?.state && normalizeStateKey(existingSeat.state) === normalizeStateKey(profileState));

      if (hasSeatInProfileState && wantsSeatSelection && requestedSeatRoleId && existingSeat?.seat_id && requestedSeatRoleId !== existingSeat.seat_id) {
        return { ok: false, message: `Aapne pehle se "${existingSeat.seat_name || existingSeat.seat_id}" seat select ki hai. Seat change nahi ho sakti.` };
      }

      let seatToAssign = null;

      if (profileState) {
        if (hasSeatInProfileState && requestedSeatState && normalizeStateKey(requestedSeatState) !== normalizeStateKey(profileState)) {
          return { ok: false, message: 'Selected seat state aapki profile state se match nahi karti.' };
        }

        if (!hasSeatInProfileState && !wantsSeatSelection) {
          return { ok: false, message: 'Payment se pehle apni state ki seat select karein.' };
        }

        if (!hasSeatInProfileState && wantsSeatSelection) {
          if (!requestedSeatState || !requestedSeatRoleId) {
            return { ok: false, message: 'Seat selection incomplete. Please select a seat again.' };
          }
          if (normalizeStateKey(requestedSeatState) !== normalizeStateKey(profileState)) {
            return { ok: false, message: 'Selected seat state aapki profile state se match nahi karti.' };
          }

          const roleMeta = getStateSeatRole(requestedSeatRoleId);
          if (!roleMeta) return { ok: false, message: 'Invalid seat selection. Please try again.' };

          allocationsBefore = await getStateSeatAllocationsFromStorage();
          const stateKey = normalizeStateKey(profileState);
          const stateAllocBefore = allocationsBefore[stateKey] && typeof allocationsBefore[stateKey] === 'object'
            ? allocationsBefore[stateKey]
            : {};

          const takenBy = String(stateAllocBefore?.[requestedSeatRoleId]?.email || '').trim().toLowerCase();
          if (takenBy && takenBy !== user.email) {
            return {
              ok: false,
              message: `"${roleMeta.name}" seat (${profileState}) already taken. Please select another seat.`,
            };
          }

          const allocationsAfter = {
            ...allocationsBefore,
            [stateKey]: {
              ...stateAllocBefore,
              [requestedSeatRoleId]: {
                email: user.email,
                name: user.name || '',
                assigned_at: today,
              },
            },
          };

          await AsyncStorage.setItem(STATE_SEATS_KEY, JSON.stringify(allocationsAfter));

          seatToAssign = {
            state: profileState,
            seat_id: requestedSeatRoleId,
            seat_name: roleMeta.name,
            assigned_at: today,
            plan_id: String(plan_id || '').trim(),
          };
        }
      }

      const newPayment = {
        order_id, payment_id,
        amount: activePlan.price || 0,
        status: 'success',
        date: today, plan_id,
        plan_name: activePlan.plan_name,
        signature,
      };

      const roleNotification = {
        id:      `notif-role-${Date.now()}`,
        title:   `🎉 ${activePlan.plan_name} Activated!`,
        message: `Your role has been upgraded to ${getRoleLabel(newRole)}. Enjoy your new features!`,
        date:    today,
        status:  'Unread',
      };

      const currentNotifications = normalizeNotifications(user.notifications);

      const updatedUser = await UserStore.updateUser(user.email, {
        subscription_plan: activePlan,
        subscription_type: newSubscriptionType,
        role:              newRole,
        role_label:        getRoleLabel(newRole),
        is_subscribed:     true,
        payment_history:   [...normalizePaymentHistory(user.payment_history).filter((item) => item.order_id !== order_id), newPayment],
        notifications:     [...currentNotifications, roleNotification],
        ...(seatToAssign ? { state_seat: seatToAssign } : {}),
      });

      if (!updatedUser) {
        if (allocationsBefore) await AsyncStorage.setItem(STATE_SEATS_KEY, JSON.stringify(allocationsBefore));
        return { ok: false, message: 'Payment verification failed.' };
      }
      return { ok: true, role: newRole, role_label: getRoleLabel(newRole), plan: activePlan };
    } catch {
      if (allocationsBefore) {
        try { await AsyncStorage.setItem(STATE_SEATS_KEY, JSON.stringify(allocationsBefore)); } catch { /* noop */ }
      }
      return { ok: false, message: 'Payment verification failed.' };
    }
  },

  getNewsFeedSummary: async (options = {}) => {
    try {
      const focusItemId = options && typeof options === 'object'
        ? (options.focusItemId ? String(options.focusItemId) : null)
        : null;
      const currentUser = await UserStore.getCurrentUser();
      const allUsers = await UserStore.getAllUsers();
      const defaultItems = normalizeNewsFeed(defaultNewsFeed).map((item) => ({
        ...item,
        author_name: item.author_name || 'RTI News',
        author_profile_image: item.author_profile_image || '',
        author_seat_name: item.author_seat_name || 'Editorial Desk',
        author_has_blue_tick: Boolean(item.author_has_blue_tick || false),
        author_is_premium: Boolean(item.author_is_premium || false),
        author_is_subscriber: Boolean(item.author_is_subscriber || false),
      }));

      const aggregateItems = allUsers.flatMap((user) => {
        const injectAuthor = (item) => ({
          ...item,
          author_name:
            item.author_name || item.createdByName || user.name || '',
          author_profile_image:
            item.author_profile_image ||
            item.authorProfileImage ||
            item.createdByProfileImage ||
            item.profile_image ||
            user.profile_image || // ✅ FIX: user ka profile image inject karo
            '',
          author_has_blue_tick:
            Boolean(item.author_has_blue_tick || item.authorHasBlueTick || item.createdByBlueTick || hasBlueTick(user)),
          author_seat_name:
            item.author_seat_name ||
            item.authorSeatName ||
            user.state_seat?.seat_name ||
            '',
          author_is_premium:
            Boolean(item.author_is_premium || item.createdByPremium || hasPremiumAccess(user)),
          author_is_subscriber:
            Boolean(item.author_is_subscriber || item.createdBySubscriber || hasActiveSubscription(user)),
        });

        return [
          ...normalizeUserNewsItems(user.news).map(injectAuthor),
          ...normalizeNewsFeed(user.news_feed).map(injectAuthor),
        ];
      });

      const mergedItems = [...defaultItems, ...aggregateItems]
        .filter((item, index, arr) => arr.findIndex((e) => e.id === item.id) === index)
        .sort((a, b) => getNewsSortValue(b) - getNewsSortValue(a));

      const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
      const postIds = mergedItems.map((i) => i.id).filter(Boolean);

      const engagement = Platform.OS === 'web'
        ? await getEngagementForPostsFallback(postIds, currentEmail, focusItemId)
        : await getEngagementForPostsSqlite(postIds, currentEmail, focusItemId);

      const itemsWithEngagement = mergedItems.map((item) => {
        const id = String(item.id || '');
        const stat = engagement?.statsByPost?.[id];
        const next = { ...item };

        if (stat) {
          const baseLikes = Number(item.likes || 0);
          const baseComments = Number(item.comments || 0);
          const baseShares = Number(item.shares || 0);
          const baseViews = Number(item.views || 0);

          next.likes = baseLikes + Number(stat.likes || 0);
          next.comments = baseComments + Number(stat.comments || 0);
          next.shares = baseShares + Number(stat.shares || 0);
          next.views = baseViews + Number(stat.views || 0);

          const legacyLiked = Boolean(
            currentEmail
              && Array.isArray(item.liked_by)
              && item.liked_by.includes(currentEmail)
          );
          const likedNow = Boolean(stat.likedByCurrentUser || legacyLiked);
          next.liked_by = likedNow && currentEmail ? [currentEmail] : [];

          const legacyBookmarked = Boolean(item.bookmarked);
          next.bookmarked = Boolean(stat.bookmarkedByCurrentUser || legacyBookmarked);
        }

        if (focusItemId && id === focusItemId) {
          next.comments_list = Array.isArray(engagement?.commentsByPost?.[focusItemId])
            ? engagement.commentsByPost[focusItemId]
            : [];
        } else {
          // Ensure we don't accidentally show stale in-item comments.
          if (next.comments_list) delete next.comments_list;
        }

        return next;
      });

      return {
        currentUser,
        items: itemsWithEngagement,
        totalViews: itemsWithEngagement.reduce((s, i) => s + (Number(i.views) || 0), 0),
        totalShares: itemsWithEngagement.reduce((s, i) => s + (Number(i.shares) || 0), 0),
      };
    } catch {
      return null;
    }
  },

  getReelsFeedSummary: async (options = {}) => {
    try {
      const focusItemId = options && typeof options === 'object'
        ? (options.focusItemId ? String(options.focusItemId) : null)
        : null;
      const currentUser = await UserStore.getCurrentUser();
      const allUsers = await UserStore.getAllUsers();
      const currentEmail = String(currentUser?.email || '').trim().toLowerCase();

      const injected = allUsers.flatMap((user) => {
        const userEmail = String(user?.email || '').trim().toLowerCase();
        const injectAuthor = (item) => ({
          ...item,
          createdBy: item.createdBy || item.created_by || userEmail,
          author_name: item.author_name || item.createdByName || user.name || '',
          author_profile_image:
            item.author_profile_image ||
            item.authorProfileImage ||
            item.createdByProfileImage ||
            item.profile_image ||
            user.profile_image ||
            '',
          author_has_blue_tick: Boolean(
            item.author_has_blue_tick || item.authorHasBlueTick || item.createdByBlueTick || hasBlueTick(user)
          ),
          author_is_premium: Boolean(item.author_is_premium || hasPremiumAccess(user)),
          author_is_subscriber: Boolean(item.author_is_subscriber || hasActiveSubscription(user)),
          author_role: item.author_role || item.authorRole || user.role || '',
          author_role_label: item.author_role_label || item.authorRoleLabel || user.role_label || '',
          author_seat_id: String(item.author_seat_id || item.authorSeatId || user.state_seat?.seat_id || '').trim(),
          author_seat_name: String(item.author_seat_name || item.authorSeatName || user.state_seat?.seat_name || '').trim(),
        });

        const rawItems = [
          ...(Array.isArray(user.news) ? user.news : []),
          ...(Array.isArray(user.news_feed) ? user.news_feed : []),
        ].map(injectAuthor);

        return rawItems;
      });

      // FeedScreen expects to show all users' posts (video OR image) without login-gated visibility.
      // We still skip items that have no playable media/thumbnail at all.
      const reels = injected
        .filter((item) => Boolean(getReelVideoUri(item) || getReelThumbnailUri(item)))
        .map((item) => toReelPostFromNewsItem(item, currentEmail))
        .sort((a, b) => getNewsSortValue(b) - getNewsSortValue(a));

      const postIds = reels.map((r) => r.id).filter(Boolean);
      const engagement = Platform.OS === 'web'
        ? await getEngagementForPostsFallback(postIds, currentEmail, focusItemId)
        : await getEngagementForPostsSqlite(postIds, currentEmail, focusItemId);

      const itemsWithEngagement = reels.map((item) => {
        const id = String(item.id || '');
        const stat = engagement?.statsByPost?.[id];
        const next = { ...item };
        if (stat) {
  next.likes = Number(item.likes || 0) + Number(stat.likes || 0);
  next.shares = Number(item.shares || 0) + Number(stat.shares || 0);
  next.commentsCount = Number(stat.comments || 0);
  next.liked = Boolean(item.liked || stat.likedByCurrentUser);
  next.bookmarked = Boolean(item.bookmarked || stat.bookmarkedByCurrentUser);
}

        if (focusItemId && id === focusItemId) {
          const list = Array.isArray(engagement?.commentsByPost?.[focusItemId])
            ? engagement.commentsByPost[focusItemId]
            : [];
          next.comments = list.map((c) => ({
            id: String(c.id || ''),
            user: String(c.author || 'User'),
            text: String(c.text || ''),
            replies: Array.isArray(c.replies)
              ? c.replies.map((r) => ({
                id: String(r.id || ''),
                user: String(r.author || 'User'),
                text: String(r.text || ''),
              }))
              : [],
          }));
        }

        return next;
      });

      return { currentUser, items: itemsWithEngagement };
    } catch {
      return null;
    }
  },

  
  updateNewsFeedItem: async (itemId, action) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };

      const postId = String(itemId || '').trim();
      if (!postId) return { ok: false, message: 'Invalid post id.' };

      if (action && typeof action === 'object' && !Array.isArray(action)) {
        const updates = sanitizeNewsItemUpdates(action);
        if (!updates.title) return { ok: false, message: 'Title is required.' };

        const users = await UserStore.getAllUsers();
        let foundPost = false;
        let allowed = false;
        let updatedItem = null;

        const updatedUsers = users.map((entry) => {
          const nextFromNews = updateNewsItemInCollection(entry.news, postId, (item) => {
            foundPost = true;
            if (!canManageNewsItem(user, item)) return item;
            allowed = true;
            const nextItem = {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            updatedItem = nextItem;
            return nextItem;
          });

          const nextFromFeed = updateNewsItemInCollection(entry.news_feed, postId, (item) => {
            foundPost = true;
            if (!canManageNewsItem(user, item)) return item;
            allowed = true;
            const nextItem = {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            updatedItem = nextItem;
            return nextItem;
          });

          if (!nextFromNews.changed && !nextFromFeed.changed) {
            return entry;
          }

          return normalizeUser({
            ...entry,
            news: nextFromNews.items,
            news_feed: nextFromFeed.items,
          });
        });

        if (!foundPost) return { ok: false, message: 'News item not found.' };
        if (!allowed) return { ok: false, message: 'You cannot edit this news item.' };

        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        return { ok: true, item: updatedItem };
      }

      const email = String(user.email || '').trim().toLowerCase();
      const now = new Date().toISOString();

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();

        if (action === 'like') {
          if (!email) return { ok: false, message: 'Email missing.' };
          state.likesByPost[postId] = state.likesByPost[postId] || {};
          const alreadyLiked = Boolean(state.likesByPost[postId][email]);
          if (alreadyLiked) delete state.likesByPost[postId][email];
          else state.likesByPost[postId][email] = true;
          await writeEngagementFallback(state);
          return { ok: true, liked: !alreadyLiked };
        }

        if (action === 'bookmark') {
          if (!email) return { ok: false, message: 'Email missing.' };
          state.bookmarksByPost[postId] = state.bookmarksByPost[postId] || {};
          const alreadySaved = Boolean(state.bookmarksByPost[postId][email]);
          if (alreadySaved) delete state.bookmarksByPost[postId][email];
          else state.bookmarksByPost[postId][email] = true;
          await writeEngagementFallback(state);
          return { ok: true, bookmarked: !alreadySaved };
        }

        if (action === 'share') {
          state.sharesByPost[postId] = Number(state.sharesByPost[postId] || 0) + 1;
          await writeEngagementFallback(state);
          return { ok: true };
        }

        if (action === 'view') {
          state.viewsByPost[postId] = Number(state.viewsByPost[postId] || 0) + 1;
          await writeEngagementFallback(state);
          return { ok: true };
        }

        return { ok: true };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      if (action === 'like') {
        if (!email) return { ok: false, message: 'Email missing.' };
        const exists = await db.getFirstAsync(
          'SELECT 1 AS ok FROM post_likes WHERE post_id = ? AND user_email = ? LIMIT 1',
          postId,
          email
        );
        if (exists) {
          await db.runAsync('DELETE FROM post_likes WHERE post_id = ? AND user_email = ?', postId, email);
          return { ok: true, liked: false };
        }
        await db.runAsync(
          'INSERT INTO post_likes (post_id, user_email, created_at) VALUES (?, ?, ?)',
          postId,
          email,
          now
        );
        return { ok: true, liked: true };
      }

      if (action === 'bookmark') {
        if (!email) return { ok: false, message: 'Email missing.' };
        const exists = await db.getFirstAsync(
          'SELECT 1 AS ok FROM post_bookmarks WHERE post_id = ? AND user_email = ? LIMIT 1',
          postId,
          email
        );
        if (exists) {
          await db.runAsync('DELETE FROM post_bookmarks WHERE post_id = ? AND user_email = ?', postId, email);
          return { ok: true, bookmarked: false };
        }
        await db.runAsync(
          'INSERT INTO post_bookmarks (post_id, user_email, created_at) VALUES (?, ?, ?)',
          postId,
          email,
          now
        );
        return { ok: true, bookmarked: true };
      }

      if (action === 'share') {
        await upsertCounter(db, 'post_shares', postId);
        return { ok: true };
      }

      if (action === 'view') {
        await upsertCounter(db, 'post_views', postId);
        return { ok: true };
      }

      return { ok: true };
    } catch { return { ok: false, message: 'Unable to update news item.' }; }
  },

  deleteNewsFeedItem: async (itemId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };

      const postId = String(itemId || '').trim();
      if (!postId) return { ok: false, message: 'Invalid post id.' };

      const users = await UserStore.getAllUsers();
      let foundPost = false;
      let allowed = false;

      const updatedUsers = users.map((entry) => {
        const nextFromNews = removeNewsItemFromCollection(entry.news, postId);
        const nextFromFeed = removeNewsItemFromCollection(entry.news_feed, postId);

        if (nextFromNews.found || nextFromFeed.found) {
          foundPost = true;
          const matchedItem = (Array.isArray(entry.news) ? entry.news : []).find((item) => String(item?.id || '').trim() === postId)
            || (Array.isArray(entry.news_feed) ? entry.news_feed : []).find((item) => String(item?.id || '').trim() === postId)
            || null;

          if (!canManageNewsItem(user, matchedItem)) {
            return entry;
          }

          allowed = true;
        }

        if (!nextFromNews.changed && !nextFromFeed.changed) {
          return entry;
        }

        return normalizeUser({
          ...entry,
          news: nextFromNews.items,
          news_feed: nextFromFeed.items,
        });
      });

      if (!foundPost) return { ok: false, message: 'News item not found.' };
      if (!allowed) return { ok: false, message: 'You cannot delete this news item.' };

      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      await clearNewsItemEngagement(postId);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Unable to delete news item.' };
    }
  },

  recordNewsFeedMenuAction: async (itemId, action, extra = {}) => {
    try {
      const postId = String(itemId || '').trim();
      const actionName = String(action || '').trim().toLowerCase();
      if (!postId || !actionName) return { ok: false, message: 'Invalid action.' };

      const user = await UserStore.getCurrentUser();
      const email = String(user?.email || '').trim().toLowerCase();
      const raw = await AsyncStorage.getItem(NEWS_ACTION_LOG_KEY);
      const state = safeJsonParse(raw, { actions: [] });
      const actions = Array.isArray(state.actions) ? state.actions : [];

      actions.unshift({
        id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        post_id: postId,
        action: actionName,
        user_email: email,
        created_at: new Date().toISOString(),
        ...extra,
      });

      await AsyncStorage.setItem(
        NEWS_ACTION_LOG_KEY,
        JSON.stringify({ actions: actions.slice(0, 500) })
      );
      return { ok: true };
    } catch {
      return { ok: false, message: 'Unable to save action.' };
    }
  },

  addNewsComment: async (itemId, commentText) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const text = String(commentText || '').trim();
      if (!text) return { ok: false, message: 'Please enter a comment.' };

      const postId = String(itemId || '').trim();
      if (!postId) return { ok: false, message: 'Invalid post id.' };

      const email = String(user.email || '').trim().toLowerCase();
      const author = String(user.name || user.email || 'User');
      const nowIso = new Date().toISOString();

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();
        const id = `cmt-${Date.now()}`;
        const newComment = {
          id,
          text,
          author,
          author_email: email,
          date: new Date().toLocaleDateString('en-IN'),
          edited_at: null,
          likes: 0,
          liked_by: [],
        };
        state.commentsByPost[postId] = Array.isArray(state.commentsByPost[postId]) ? state.commentsByPost[postId] : [];
        state.commentsByPost[postId] = [newComment, ...state.commentsByPost[postId]];
        await writeEngagementFallback(state);
        return { ok: true, comment: newComment };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      const result = await db.runAsync(
        'INSERT INTO post_comments (post_id, user_email, author, text, created_at, edited_at, parent_comment_id, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        postId,
        email || null,
        author || null,
        text,
        nowIso,
        null,
        null
      );

      const rowId = Number(result?.lastInsertRowId || 0);
      const newComment = {
        id: `cmt-${rowId || Date.now()}`,
        text,
        author,
        author_email: email,
        date: new Date(nowIso).toLocaleDateString('en-IN'),
        edited_at: null,
        likes: 0,
        liked_by: [],
      };

      return { ok: true, comment: newComment };
    } catch { return { ok: false, message: 'Unable to add comment.' }; }
  },

  replyNewsComment: async (itemId, parentCommentId, replyText) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const text = String(replyText || '').trim();
      if (!text) return { ok: false, message: 'Please enter a comment.' };

      const postId = String(itemId || '').trim();
      if (!postId) return { ok: false, message: 'Invalid post id.' };

      const parentRaw = String(parentCommentId || '').trim();
      const parentId = parentRaw.startsWith('cmt-') ? Number(parentRaw.slice(4)) : Number(parentRaw);
      if (!Number.isFinite(parentId) || parentId <= 0) return { ok: false, message: 'Invalid comment id.' };

      const email = String(user.email || '').trim().toLowerCase();
      const author = String(user.name || user.email || 'User');
      const nowIso = new Date().toISOString();

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();
        const id = `cmt-${Date.now()}`;
        const newComment = {
          id,
          text,
          author,
          author_email: email,
          date: new Date().toLocaleDateString('en-IN'),
          edited_at: null,
          likes: 0,
          liked_by: [],
          parent_comment_id: parentRaw,
        };
        state.commentsByPost[postId] = Array.isArray(state.commentsByPost[postId]) ? state.commentsByPost[postId] : [];
        state.commentsByPost[postId] = [newComment, ...state.commentsByPost[postId]];
        await writeEngagementFallback(state);
        return { ok: true, comment: newComment };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      const result = await db.runAsync(
        'INSERT INTO post_comments (post_id, user_email, author, text, created_at, edited_at, parent_comment_id, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
        postId,
        email || null,
        author || null,
        text,
        nowIso,
        null,
        parentId
      );

      const rowId = Number(result?.lastInsertRowId || 0);
      const newComment = {
        id: `cmt-${rowId || Date.now()}`,
        text,
        author,
        author_email: email,
        date: new Date(nowIso).toLocaleDateString('en-IN'),
        edited_at: null,
        likes: 0,
        liked_by: [],
        parent_comment_id: parentId,
      };

      return { ok: true, comment: newComment };
    } catch { return { ok: false, message: 'Unable to add comment.' }; }
  },

  likeNewsComment: async (itemId, commentId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const email = String(user.email || '').trim().toLowerCase();
      if (!email) return { ok: false, message: 'Email missing.' };

      const cidRaw = String(commentId || '').trim();
      const parsedId = cidRaw.startsWith('cmt-') ? Number(cidRaw.slice(4)) : Number(cidRaw);
      if (!Number.isFinite(parsedId) || parsedId <= 0) return { ok: false, message: 'Invalid comment id.' };

      const now = new Date().toISOString();

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();
        state.commentLikesById[cidRaw] = state.commentLikesById[cidRaw] || {};
        const alreadyLiked = Boolean(state.commentLikesById[cidRaw][email]);
        if (alreadyLiked) delete state.commentLikesById[cidRaw][email];
        else state.commentLikesById[cidRaw][email] = true;

        const postId = String(itemId || '').trim();
        const list = Array.isArray(state.commentsByPost?.[postId]) ? state.commentsByPost[postId] : [];
        state.commentsByPost[postId] = list.map((c) => {
          if (String(c.id) !== cidRaw) return c;
          const likedByMap = state.commentLikesById[cidRaw] || {};
          const likes = Object.keys(likedByMap).length;
          const liked_by = likedByMap[email] ? [email] : [];
          return { ...c, likes, liked_by };
        });

        await writeEngagementFallback(state);
        return { ok: true, liked: !alreadyLiked };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      const exists = await db.getFirstAsync(
        'SELECT 1 AS ok FROM comment_likes WHERE comment_id = ? AND user_email = ? LIMIT 1',
        parsedId,
        email
      );

      if (exists) {
        await db.runAsync('DELETE FROM comment_likes WHERE comment_id = ? AND user_email = ?', parsedId, email);
        return { ok: true, liked: false };
      }

      await db.runAsync(
        'INSERT INTO comment_likes (comment_id, user_email, created_at) VALUES (?, ?, ?)',
        parsedId,
        email,
        now
      );

      return { ok: true, liked: true };
    } catch { return { ok: false, message: 'Unable to update comment.' }; }
  },

  editNewsComment: async (itemId, commentId, nextText) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const text = String(nextText || '').trim();
      if (!text) return { ok: false, message: 'Please enter a comment.' };

      const email = String(user.email || '').trim().toLowerCase();
      const cidRaw = String(commentId || '').trim();
      const parsedId = cidRaw.startsWith('cmt-') ? Number(cidRaw.slice(4)) : Number(cidRaw);
      if (!Number.isFinite(parsedId) || parsedId <= 0) return { ok: false, message: 'Invalid comment id.' };

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();
        const postId = String(itemId || '').trim();
        const list = Array.isArray(state.commentsByPost?.[postId]) ? state.commentsByPost[postId] : [];
        let changed = false;
        state.commentsByPost[postId] = list.map((c) => {
          if (String(c.id) !== cidRaw) return c;
          const ownerOk = email && String(c.author_email || '').trim().toLowerCase() === email;
          if (!ownerOk) return c;
          changed = true;
          return { ...c, text, edited_at: new Date().toISOString() };
        });
        if (!changed) return { ok: false, message: 'Unable to edit comment.' };
        await writeEngagementFallback(state);
        return { ok: true };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      const row = await db.getFirstAsync(
        'SELECT user_email FROM post_comments WHERE id = ? AND deleted = 0 LIMIT 1',
        parsedId
      );
      const ownerEmail = String(row?.user_email || '').trim().toLowerCase();
      if (!email || !ownerEmail || ownerEmail !== email) return { ok: false, message: 'Unable to edit comment.' };

      await db.runAsync(
        'UPDATE post_comments SET text = ?, edited_at = ? WHERE id = ?',
        text,
        new Date().toISOString(),
        parsedId
      );

      return { ok: true };
    } catch { return { ok: false, message: 'Unable to edit comment.' }; }
  },

  deleteNewsComment: async (itemId, commentId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };

      const email = String(user.email || '').trim().toLowerCase();
      const cidRaw = String(commentId || '').trim();
      const parsedId = cidRaw.startsWith('cmt-') ? Number(cidRaw.slice(4)) : Number(cidRaw);
      if (!Number.isFinite(parsedId) || parsedId <= 0) return { ok: false, message: 'Invalid comment id.' };

      if (Platform.OS === 'web') {
        const state = await readEngagementFallback();
        const postId = String(itemId || '').trim();
        const list = Array.isArray(state.commentsByPost?.[postId]) ? state.commentsByPost[postId] : [];
        const targetComment = list.find((c) => String(c.id) === cidRaw);
        const ownerOk = email && String(targetComment?.author_email || '').trim().toLowerCase() === email;
        if (!targetComment || !ownerOk) return { ok: false, message: 'Unable to delete comment.' };

        const idsToDelete = new Set([cidRaw]);
        let changed = true;
        while (changed) {
          changed = false;
          list.forEach((comment) => {
            const parentId = String(comment?.parent_comment_id || '').trim();
            const commentIdKey = String(comment?.id || '').trim();
            if (parentId && idsToDelete.has(parentId) && !idsToDelete.has(commentIdKey)) {
              idsToDelete.add(commentIdKey);
              changed = true;
            }
          });
        }

        state.commentsByPost[postId] = list.filter((c) => !idsToDelete.has(String(c.id)));
        idsToDelete.forEach((id) => {
          if (state.commentLikesById?.[id]) delete state.commentLikesById[id];
        });
        await writeEngagementFallback(state);
        return { ok: true };
      }

      const db = await getEngagementDb();
      if (!db) return { ok: false, message: 'SQLite not available.' };

      const row = await db.getFirstAsync(
        'SELECT user_email FROM post_comments WHERE id = ? AND deleted = 0 LIMIT 1',
        parsedId
      );
      const ownerEmail = String(row?.user_email || '').trim().toLowerCase();
      if (!email || !ownerEmail || ownerEmail !== email) return { ok: false, message: 'Unable to delete comment.' };

      const rows = await db.getAllAsync(
        'SELECT id, parent_comment_id FROM post_comments WHERE post_id = ? AND deleted = 0',
        String(itemId || '').trim()
      );
      const idsToDelete = new Set([parsedId]);
      let changed = true;
      while (changed) {
        changed = false;
        (rows || []).forEach((commentRow) => {
          const commentIdValue = Number(commentRow?.id);
          const parentIdValue = Number(commentRow?.parent_comment_id);
          if (
            Number.isFinite(commentIdValue)
            && Number.isFinite(parentIdValue)
            && idsToDelete.has(parentIdValue)
            && !idsToDelete.has(commentIdValue)
          ) {
            idsToDelete.add(commentIdValue);
            changed = true;
          }
        });
      }

      const deleteIds = Array.from(idsToDelete);
      const placeholders = deleteIds.map(() => '?').join(',');
      await db.runAsync(
        `UPDATE post_comments SET deleted = 1 WHERE id IN (${placeholders})`,
        deleteIds
      );
      return { ok: true };
    } catch { return { ok: false, message: 'Unable to delete comment.' }; }
  },

  getEPaperSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const papers = normalizeEPapers(user.epapers);
      return { currentUser: user, items: papers, totalViews: papers.reduce((s, i) => s + i.views, 0), totalDownloads: papers.reduce((s, i) => s + i.downloads, 0) };
    } catch { return null; }
  },

  updateEPaperItem: async (itemId, action) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const items = normalizeEPapers(user.epapers).map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, views: action === 'view' ? item.views + 1 : item.views, downloads: action === 'download' ? item.downloads + 1 : item.downloads };
      });
      const updatedUser = await UserStore.updateUser(user.email, { epapers: items });
      if (!updatedUser) return { ok: false, message: 'Unable to update e-paper record.' };
      return { ok: true, items };
    } catch { return { ok: false, message: 'Unable to update e-paper record.' }; }
  },

  getLiveStreamingSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const streams = normalizeStreams(user.live_streams);
      return { currentUser: user, items: streams, liveCount: streams.filter((s) => s.status === 'live').length, upcomingCount: streams.filter((s) => s.status === 'upcoming').length, endedCount: streams.filter((s) => s.status === 'ended').length };
    } catch { return null; }
  },

  updateStreamStatus: async (streamId, newStatus) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const streams = normalizeStreams(user.live_streams).map((s) => s.id === streamId ? { ...s, status: newStatus } : s);
      const updatedUser = await UserStore.updateUser(user.email, { live_streams: streams });
      if (!updatedUser) return { ok: false, message: 'Unable to update stream status.' };
      return { ok: true };
    } catch { return { ok: false, message: 'Unable to update stream status.' }; }
  },

  startLiveStream: async ({ stream_title, stream_url, ingest_url, stream_key }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const existingStreams = normalizeStreams(user.live_streams).map((stream) => ({
        ...stream, status: stream.status === 'live' ? 'ended' : stream.status,
      }));
      const nextStream = {
        id: `stream-${Date.now()}`,
        stream_title: stream_title || 'Live Stream',
        stream_url: stream_url || '',
        ingest_url: ingest_url || YOUTUBE_RTMPS_URL,
        stream_key: stream_key || 'stream',
        status: 'live',
      };
      const updatedUser = await UserStore.updateUser(user.email, { live_streams: [nextStream, ...existingStreams] });
      if (!updatedUser) return { ok: false, message: 'Unable to create live stream.' };
      return { ok: true, stream: nextStream };
    } catch { return { ok: false, message: 'Unable to create live stream.' }; }
  },

  stopActiveLiveStream: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const streams = normalizeStreams(user.live_streams);
      const hasActive = streams.some((stream) => stream.status === 'live');
      if (!hasActive) return { ok: false, message: 'No active live stream found.' };
      const updatedUser = await UserStore.updateUser(user.email, {
        live_streams: streams.map((stream) => stream.status === 'live' ? { ...stream, status: 'ended' } : stream),
      });
      if (!updatedUser) return { ok: false, message: 'Unable to stop live stream.' };
      return { ok: true };
    } catch { return { ok: false, message: 'Unable to stop live stream.' }; }
  },

  getCertificationSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const items = normalizeCertifications(user.certifications);
      return { currentUser: user, items, totalAttempts: items.reduce((s, i) => s + i.attempts, 0), passedCount: items.filter((i) => i.result_type === 'Pass').length, totalDownloads: items.reduce((s, i) => s + i.downloads, 0) };
    } catch { return null; }
  },

  submitQuizAnswers: async (certId, answers) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      let submittedItem = null;
      const items = normalizeCertifications(user.certifications).map((item) => {
        if (item.id !== certId) return item;
        const totalQ   = item.questions.length || 1;
        const answered = Object.keys(answers).length;
        const score    = Math.min(Math.round((answered / totalQ) * 100), 100);
        const pass     = score >= 50;
        const issuedAt = new Date().toISOString();
        const certificateNumber = `RTI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        submittedItem = {
          ...item, score,
          result_type: pass ? 'Pass' : 'Fail',
          certificate_file: pass ? 'pending_local_generation' : null,
          local_certificate_path: null,
          certificate_number: pass ? certificateNumber : null,
          user_name: user.name || user.email || 'Participant',
          issued_at: issuedAt,
          attempts: item.attempts + 1,
        };
        return submittedItem;
      });
      const updatedUser = await UserStore.updateUser(user.email, { certifications: items });
      if (!updatedUser) return { ok: false, message: 'Unable to submit quiz.' };
      return {
        ok: true,
        score: submittedItem?.score ?? 0,
        result_type: submittedItem?.result_type ?? 'Fail',
        certificate_file: submittedItem?.certificate_file ?? null,
        local_certificate_path: submittedItem?.local_certificate_path ?? null,
        certificate_number: submittedItem?.certificate_number ?? null,
        user_name: submittedItem?.user_name ?? user.name ?? 'Participant',
        date: submittedItem?.issued_at
          ? new Date(submittedItem.issued_at).toLocaleDateString('en-IN')
          : new Date().toLocaleDateString('en-IN'),
      };
    } catch { return { ok: false, message: 'Unable to submit quiz answers.' }; }
  },

  downloadCertificate: async (certId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const dir = await ensureCertificateDirectoryAsync();
      if (!dir) return { ok: false, message: 'Certificate download is not supported on this platform.' };
      const certifications = normalizeCertifications(user.certifications);
      const targetItem = certifications.find((item) => item.id === certId);
      if (!targetItem || (targetItem.result_type || '').toLowerCase() !== 'pass') {
        return { ok: false, message: 'Certificate not available. Pass the quiz first.' };
      }
      const issueDate = targetItem.issued_at
        ? new Date(targetItem.issued_at).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN');
      const certificateNumber = targetItem.certificate_number || `RTI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const svgMarkup = buildCertificateSvg({
        userName:      targetItem.user_name || user.name || 'Participant',
        quizTitle:     targetItem.quiz_title || 'Quiz Examination',
        score:         targetItem.score ?? 0,
        resultType:    targetItem.result_type || 'Pass',
        issueDate, certificateNumber,
        photoUri:      user.profile_image || '',
        email:         user.email || '',
        village:       user.village || '',
        contactNumber: user.contact_number || user.mobile || '',
      });
      const svgPath = `${dir}certificate-${targetItem.id}.svg`;
      await FileSystem.writeAsStringAsync(svgPath, svgMarkup, { encoding: FileSystem.EncodingType.UTF8 });
      const items = certifications.map((item) =>
        item.id !== certId ? item : {
          ...item,
          certificate_file:       svgPath,
          local_certificate_path: svgPath,
          certificate_number:     certificateNumber,
          issued_at:              item.issued_at || new Date().toISOString(),
          downloads:              item.downloads + 1,
        }
      );
      const updatedUser = await UserStore.updateUser(user.email, { certifications: items });
      if (!updatedUser) return { ok: false, message: 'Unable to record download.' };
      return { ok: true, savedPath: svgPath, isLocalSvg: true };
    } catch (err) {
      console.error('downloadCertificate error:', err);
      return { ok: false, message: 'Unable to download certificate.' };
    }
  },

  updateCertificationItem: async (itemId, action) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const items = normalizeCertifications(user.certifications).map((item) => {
        if (item.id !== itemId) return item;
        if (action === 'download') return { ...item, downloads: item.downloads + 1 };
        return item;
      });
      const updatedUser = await UserStore.updateUser(user.email, { certifications: items });
      if (!updatedUser) return { ok: false, message: 'Unable to update certification.' };
      return { ok: true, items };
    } catch { return { ok: false, message: 'Unable to update certification record.' }; }
  },

  getNotificationsSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      const items = normalizeNotifications(user.notifications);
      return { currentUser: user, items, unreadCount: items.filter((i) => i.status === 'Unread').length, readCount: items.filter((i) => i.status === 'Read').length };
    } catch { return null; }
  },

  updateNotificationItem: async (itemId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const items = normalizeNotifications(user.notifications).map((item) => item.id === itemId ? { ...item, status: 'Read' } : item);
      const updatedUser = await UserStore.updateUser(user.email, { notifications: items });
      if (!updatedUser) return { ok: false, message: 'Unable to update notification.' };
      return { ok: true, items };
    } catch { return { ok: false, message: 'Unable to update notification.' }; }
  },

  getSettingsSummary: async () => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return null;
      return { currentUser: user, settings: normalizeSettings(user.settings) };
    } catch { return null; }
  },

  updateSettings: async ({ language, password }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const nextPassword = password || user.password;
      const updatedUser  = await UserStore.updateUser(user.email, { password: nextPassword, settings: { language, password: password || '' } });
      if (!updatedUser) return { ok: false, message: 'Unable to update settings.' };
      return { ok: true, user: updatedUser };
    } catch { return { ok: false, message: 'Unable to update settings.' }; }
  },

  changeCurrentUserPassword: async ({ currentPassword, newPassword }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      if (!currentPassword || currentPassword !== user.password) return { ok: false, message: 'Current password is incorrect.' };
      if (!newPassword || newPassword.length < 4) return { ok: false, message: 'New password must be at least 4 characters.' };
      if (newPassword === user.password) return { ok: false, message: 'New password must be different from the current password.' };
      const updatedUser = await UserStore.updateUser(user.email, { password: newPassword, settings: { ...normalizeSettings(user.settings), password: newPassword } });
      if (!updatedUser) return { ok: false, message: 'Unable to change password.' };
      return { ok: true, user: updatedUser };
    } catch { return { ok: false, message: 'Unable to change password.' }; }
  },

  updatePassword: async (email, password) => {
    try {
      // ✅ FIX: updatePassword bhi lowercase email se
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const data    = await AsyncStorage.getItem(USERS_KEY);
      const users   = data ? JSON.parse(data) : [];
      const updated = users.map((u) => {
        const userEmail = u.email ? u.email.trim().toLowerCase() : '';
        return userEmail === normalizedEmail ? { ...u, password } : u;
      });
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
      return updated.some((u) => (u.email || '').trim().toLowerCase() === normalizedEmail);
    } catch { return false; }
  },

  saveResetOtp: async ({ email, otp, expiresAt }) => {
    try {
      // ✅ FIX: OTP bhi lowercase email se save karo
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const data   = await AsyncStorage.getItem(OTP_KEY);
      const otpMap = data ? JSON.parse(data) : {};
      otpMap[normalizedEmail] = { otp, expiresAt };
      await AsyncStorage.setItem(OTP_KEY, JSON.stringify(otpMap));
      return true;
    } catch { return false; }
  },

  getResetOtp: async (email) => {
    try {
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const data   = await AsyncStorage.getItem(OTP_KEY);
      const otpMap = data ? JSON.parse(data) : {};
      return otpMap[normalizedEmail] || null;
    } catch { return null; }
  },

  clearResetOtp: async (email) => {
    try {
      const normalizedEmail = email ? email.trim().toLowerCase() : '';
      const data   = await AsyncStorage.getItem(OTP_KEY);
      const otpMap = data ? JSON.parse(data) : {};
      delete otpMap[normalizedEmail];
      await AsyncStorage.setItem(OTP_KEY, JSON.stringify(otpMap));
      return true;
    } catch { return false; }
  },

  followUser: async (targetUserEmail) => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) return { ok: false, message: 'Please login again.' };
      const targetEmail = String(targetUserEmail || '').trim().toLowerCase();
      const currentEmail = String(currentUser.email || '').trim().toLowerCase();
      if (!targetEmail) return { ok: false, message: 'User not found.' };
      if (currentEmail === targetEmail) return { ok: false, message: 'Cannot follow yourself.' };

      


      const targetUser = await UserStore.getUser(targetEmail);
      if (!targetUser) return { ok: false, message: 'User not found.' };

      const currentFollowing = normalizeEmailList(currentUser.following);
      const targetFollowers = normalizeEmailList(targetUser.followers);
      if (currentFollowing.includes(targetEmail) && targetFollowers.includes(currentEmail)) {
        return { ok: true, message: 'Already following this user.' };
      }

      const updatedCurrentUser = await UserStore.updateUser(currentEmail, {
        following: normalizeEmailList([...currentFollowing, targetEmail])
      });

      const updatedTargetUser = await UserStore.updateUser(targetEmail, {
        followers: normalizeEmailList([...targetFollowers, currentEmail])
      });

      return {
        ok: true,
        message: 'Successfully followed user.',
        isFollowing: true,
        followersCount: normalizeEmailList(updatedTargetUser?.followers).length,
        followingCount: normalizeEmailList(updatedTargetUser?.following).length,
        currentFollowingCount: normalizeEmailList(updatedCurrentUser?.following).length,
      };
    } catch (error) {
      console.error('followUser error:', error);
      return { ok: false, message: 'Unable to follow user.' };
    }
  },

  unfollowUser: async (targetUserEmail) => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) return { ok: false, message: 'Please login again.' };
      const targetEmail = String(targetUserEmail || '').trim().toLowerCase();
      const currentEmail = String(currentUser.email || '').trim().toLowerCase();
      if (!targetEmail) return { ok: false, message: 'User not found.' };

      const targetUser = await UserStore.getUser(targetEmail);
      if (!targetUser) return { ok: false, message: 'User not found.' };

      const currentFollowing = normalizeEmailList(currentUser.following);
      const updatedFollowing = currentFollowing.filter(email => email !== targetEmail);

      const updatedCurrentUser = await UserStore.updateUser(currentEmail, {
        following: updatedFollowing
      });

      const targetFollowers = normalizeEmailList(targetUser.followers);
      const updatedFollowers = targetFollowers.filter(email => email !== currentEmail);

      const updatedTargetUser = await UserStore.updateUser(targetEmail, {
        followers: updatedFollowers
      });

      return {
        ok: true,
        message: 'Successfully unfollowed user.',
        isFollowing: false,
        followersCount: normalizeEmailList(updatedTargetUser?.followers).length,
        followingCount: normalizeEmailList(updatedTargetUser?.following).length,
        currentFollowingCount: normalizeEmailList(updatedCurrentUser?.following).length,
      };
    } catch (error) {
      console.error('unfollowUser error:', error);
      return { ok: false, message: 'Unable to unfollow user.' };
    }
  },

  getFollowStatus: async (targetUserEmail) => {
    try {
      const currentUser = await UserStore.getCurrentUser();
      if (!currentUser) return { isFollowing: false, followersCount: 0, followingCount: 0 };
      const targetEmail = String(targetUserEmail || '').trim().toLowerCase();

      const targetUser = await UserStore.getUser(targetEmail);
      if (!targetUser) return { isFollowing: false, followersCount: 0, followingCount: 0 };

      const isFollowing = normalizeEmailList(currentUser.following).includes(targetEmail);
      const followersCount = normalizeEmailList(targetUser.followers).length;
      const followingCount = normalizeEmailList(targetUser.following).length;

      return { isFollowing, followersCount, followingCount };
    } catch (error) {
      console.error('getFollowStatus error:', error);
      return { isFollowing: false, followersCount: 0, followingCount: 0 };
    }
  },

  getFollowSummary: async (email) => {
  try {
    const targetEmail = String(email || '').trim().toLowerCase();
    const targetUser = targetEmail ? await UserStore.getUser(targetEmail) : await UserStore.getCurrentUser();
    if (!targetUser) return null;

    const currentUser = await UserStore.getCurrentUser();
    const currentEmail = String(currentUser?.email || '').trim().toLowerCase();
    const users = await getUsersFromStorage();
    const usersByEmail = new Map(users.map((u) => [u.email, u]));

    const followerEmails = normalizeEmailList(targetUser.followers);
    const followingEmails = normalizeEmailList(targetUser.following);

    const followers = followerEmails
      .map((e) => usersByEmail.get(e))
      .filter(Boolean);
    const following = followingEmails
      .map((e) => usersByEmail.get(e))
      .filter(Boolean);

    return {
      isFollowing: Boolean(currentEmail && followerEmails.includes(currentEmail)),
      followersCount: followerEmails.length,   // ✅ raw email count
      followingCount: followingEmails.length,  // ✅ raw email count
      followers,
      following,
    };
  } catch (error) {
    console.error('getFollowSummary error:', error);
    return null;
  }
},
  saveSelectedSeat: async (seatId) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const seatRoleId = String(seatId || '').trim();
      if (!seatRoleId) return { ok: false, message: 'Invalid seat id.' };
      const profileState = String(user.state || '').trim();
      if (!profileState) return { ok: false, message: 'Please select your state first.' };
      const roleMeta = getStateSeatRole(seatRoleId);
      if (!roleMeta) return { ok: false, message: 'Invalid seat selection.' };
      const today = new Date().toISOString().slice(0, 10);
      const allocations = await getStateSeatAllocationsFromStorage();
      const stateKey = normalizeStateKey(profileState);
      const stateAlloc = allocations[stateKey] && typeof allocations[stateKey] === 'object' ? allocations[stateKey] : {};
      const takenBy = String(stateAlloc?.[seatRoleId]?.email || '').trim().toLowerCase();
      if (takenBy && takenBy !== user.email) {
        return { ok: false, message: `"${roleMeta.name}" seat already taken. Please select another.` };
      }
      const updatedAllocations = {
        ...allocations,
        [stateKey]: { ...stateAlloc, [seatRoleId]: { email: user.email, name: user.name || '', assigned_at: today } },
      };
      await AsyncStorage.setItem(STATE_SEATS_KEY, JSON.stringify(updatedAllocations));
      const seatToAssign = { state: profileState, seat_id: seatRoleId, seat_name: roleMeta.name, assigned_at: today, plan_id: String(user.subscription_plan?.plan_id || '').trim() };
      const updatedUser = await UserStore.updateUser(user.email, { state_seat: seatToAssign });
      if (!updatedUser) return { ok: false, message: 'Unable to save seat.' };
      return { ok: true, seat: seatToAssign };
    } catch (err) {
      console.error('saveSelectedSeat error:', err);
      return { ok: false, message: 'Unable to save seat.' };
    }
  },

  saveSubscription: async ({ plan_id, plan_name, seat_id, price, duration }) => {
    try {
      const user = await UserStore.getCurrentUser();
      if (!user) return { ok: false, message: 'Please login again.' };
      const activePlan = defaultSubscriptionPlans.find((p) => p.plan_id === plan_id)
        || { plan_id, plan_name, price: Number(price || 0), duration: duration || '', features: [] };
      const newRole = getRoleFromPlanId(plan_id);
      const today = new Date().toISOString().slice(0, 10);
      const newPayment = { order_id: `ORD_${Date.now()}`, payment_id: `PAY_${Date.now()}`, amount: Number(activePlan.price || price || 0), status: 'success', date: today, plan_id: activePlan.plan_id, plan_name: activePlan.plan_name, signature: '' };
      const roleNotification = { id: `notif-sub-${Date.now()}`, title: `🎉 ${activePlan.plan_name} Activated!`, message: `Your subscription has been activated. Enjoy your new features!`, date: today, status: 'Unread' };
      const currentNotifications = normalizeNotifications(user.notifications);
      const updatedUser = await UserStore.updateUser(user.email, {
        subscription_plan: activePlan,
        subscription_type: newRole,
        role: newRole,
        role_label: getRoleLabel(newRole),
        is_subscribed: true,
        payment_history: [...normalizePaymentHistory(user.payment_history), newPayment],
        notifications: [...currentNotifications, roleNotification],
      });
      if (!updatedUser) return { ok: false, message: 'Unable to save subscription.' };
      return { ok: true, plan: activePlan, role: newRole };
    } catch (err) {
      console.error('saveSubscription error:', err);
      return { ok: false, message: 'Unable to save subscription.' };
    }
  },
};

export { buildCertificateSvg as buildCertificateSvgForPreview };
