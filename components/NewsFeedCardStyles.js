import { StyleSheet, Platform } from 'react-native';
import { EDITORIAL_FONT_FAMILY } from '../constants/homeData';

const CARD_H_PAD = 14;
const CARD_MARGIN_H = 10; // ── left/right card margin

const styles = StyleSheet.create({

  // ── FIX 1: Card ke left-right margin (jaise image 3 reference) ──
  storyCardShell: {
    backgroundColor: '#ffffff',
    paddingTop: 14,
    marginHorizontal: CARD_MARGIN_H,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'visible', // zaruri hai absolute menu ke liye
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(15,23,42,0.08)' },
      default: {
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
      },
    }),
  },

  cardSeparator: {
    height: 8,
    backgroundColor: '#f1f5f9',
  },

  // ── Author row ──
  storyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: CARD_H_PAD,
    marginBottom: 10,
  },
  storyAuthorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    marginTop: 2,
    backgroundColor: '#e2e8f0',
  },
  storyAuthorAvatarFallback: {
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAuthorAvatarInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  storyAuthorTextWrap: {
    flex: 1,
    gap: 4,
  },
  storyAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyAuthorName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },

  // ── FIX 2: Three dot — author row ke saath top-right ──
  storyMoreBtnTop: {
    padding: 6,
    marginLeft: 4,
    marginTop: -4,
    borderRadius: 16,
  },
  storyMoreBtnTopActive: {
    backgroundColor: '#f1f5f9',
  },
  storyFollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 30,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 6,
    marginTop: -2,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  storyFollowBtnActive: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  storyFollowBtnDisabled: {
    opacity: 0.65,
  },
  storyFollowBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  storyFollowBtnTextActive: {
    color: '#f97316',
  },
  storyReporterPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0f172a',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  storyReporterPillText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },

  storyAuthorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  storyMetaSmall: {
    color: '#94a3b8',
    fontSize: 12,
  },
  storyMetaDot: {
    color: '#cbd5e1',
    fontSize: 12,
  },

  // ── Text content ──
  storyContentWrap: {
    paddingHorizontal: CARD_H_PAD,
    marginBottom: 10,
  },
  storyHeadlineText: {
    color: '#111827',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    fontFamily: EDITORIAL_FONT_FAMILY,
    marginBottom: 4,
  },
  storySubtitleText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: EDITORIAL_FONT_FAMILY,
  },
  storyExcerptText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  storyDescriptionText: {
    color: '#374151',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },

  inlineReadMoreWrap: {
    width: '100%',
  },
  inlineReadMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 2,
  },
  inlineReadMoreLink: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Hero image ──
  storyHeroImageWrap: {
    width: '100%',
    height: 220,
    backgroundColor: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },
  storyHeroImage: {
    width: '100%',
    height: '100%',
  },

  storyCategoryChip: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  storyCategoryChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Video overlays
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLoadingBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLoadingText: {
    fontSize: 22,
  },
  storyVideoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    gap: 8,
  },
  storyVideoPlayBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(225, 29, 72, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyVideoLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  videoPlayingIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Action bar ──
  storyActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_H_PAD,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 4,
  },
  storyActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  storyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storyActionCount: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  storyActionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyShareCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyMoreBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  storyMoreBtnActive: {
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },

  // ── FIX 3: More menu — position absolute overlay, card niche nahi dhakele ──
  storyMoreMenuWrapper: {
    position: 'absolute',
    top: 48,
    right: CARD_H_PAD,
    zIndex: 999,
  },
  storyMoreMenu: {
    width: 190,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.14)' },
      default: {
        elevation: 12,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
    }),
  },
  storyMoreMenuItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  storyMoreMenuText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Comments ──
  commentSection: {
    paddingHorizontal: CARD_H_PAD,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  commentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentUserAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentUserAvatarText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    maxHeight: 80,
    minHeight: 40,
  },
  commentSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSendBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },
  commentsList: {
    gap: 10,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentReplyItem: {
    marginLeft: 40,
    marginBottom: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 10,
  },
  commentAuthor: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  commentText: {
    color: '#1e293b',
    fontSize: 13,
    lineHeight: 18,
  },
  commentTime: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 4,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  commentActionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  commentActionText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  commentActionTextLiked: {
    color: '#e11d48',
  },
  commentDeleteText: {
    color: '#ef4444',
  },
  commentEditContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 8,
  },
  commentEditInput: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    maxHeight: 80,
    minHeight: 40,
  },
  commentEditActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  commentEditBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
  },
  commentEditBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  commentCancelBtn: {
    backgroundColor: '#e2e8f0',
  },
  commentCancelBtnText: {
    color: '#64748b',
  },
  commentReplyForm: {
    marginTop: 8,
    marginLeft: 8,
  },
  commentReplyInput: {
    borderWidth: 1,
    borderColor: '#dbe3ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    maxHeight: 80,
    minHeight: 40,
  },
  commentReplyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  commentReplyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
  },
  commentReplyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  commentRepliesWrap: {
    marginTop: 8,
  },
  commentRepliesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    marginBottom: 4,
  },
  commentRepliesLine: {
    width: 24,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  commentRepliesToggleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  commentReplies: {
    marginTop: 8,
  },
});

export default styles;
