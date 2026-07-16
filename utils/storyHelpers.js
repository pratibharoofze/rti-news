import { SIDEBAR_MENU_ITEMS, FALLBACK_DISTRICT_MAP } from '../constants/homeData';
import { Platform } from 'react-native';

export function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const value = url.trim();
  if (!value || value === 'null' || value === 'undefined') return false;
  if (value.startsWith('http://localhost')) return false;

  // Web-picked images often come through as blob URLs and should render in-session.
  if (value.startsWith('blob:')) return true;

  // Allow local URIs on native; they don't survive web reloads and typically won't render on web.
  if (value.startsWith('file://')) return Platform.OS !== 'web';
  if (value.startsWith('content://')) return Platform.OS !== 'web';
  if (value.startsWith('ph://')) return Platform.OS !== 'web';
  if (value.startsWith('asset://')) return Platform.OS !== 'web';

  // `data:` URIs are fine (useful for web persistence).
  return true;
}

export function buildPlaceholderImage() {
  return '';
}

export function getMenuPresentation(menuKey) {
  return SIDEBAR_MENU_ITEMS.find((item) => item.key === menuKey) || SIDEBAR_MENU_ITEMS[0];
}

export function getMenuLabel(menuItem, commonCopy) {
  if (!menuItem) return '';
  return commonCopy?.[menuItem.labelKey] || menuItem.fallbackLabel || menuItem.labelKey;
}

export function getLocalizedCategoryLabel(categoryLabel, commonCopy) {
  const matchedMenuItem = SIDEBAR_MENU_ITEMS.find((item) => item.fallbackLabel === categoryLabel);
  if (!matchedMenuItem) return categoryLabel;
  return getMenuLabel(matchedMenuItem, commonCopy);
}

export function getLocalizedSeatLabel(seatLabel, commonCopy) {
  if (!seatLabel || seatLabel === 'Reporter') return commonCopy?.reporter || 'Reporter';
  return getLocalizedCategoryLabel(seatLabel, commonCopy) || seatLabel;
}

export function inferMenuTagsFromText(item) {
  const haystack = [item?.title, item?.category, item?.report_type, item?.description, item?.excerpt]
    .join(' ').toLowerCase();
  const tags = ['latest'];
  if (/politic|govern|minister|assembly|parliament|policy/.test(haystack)) tags.push('politics', 'latest_political');
  if (/election|poll|vote|ballot|campaign/.test(haystack)) tags.push('elections', 'politics', 'latest_political');
  if (/viral|trending|share|clip|popular/.test(haystack)) tags.push('viral');
  if (/astrology|planet|zodiac/.test(haystack)) tags.push('astrology');
  if (/horoscope|rashifal|hindi horoscope/.test(haystack)) tags.push('horoscope_hindi', 'astrology');
  if (/english horoscope/.test(haystack)) tags.push('horoscope_english', 'astrology');
  return Array.from(new Set(tags));
}

export function normalizeStoryItem(item, index = 0) {
  if (!item) return null;
  const title = String(item.title || '').trim();
  if (!title) return null;
  const rawImage =
    (Array.isArray(item.images) ? item.images.find((u) => isValidImageUrl(u)) : '') ||
    (isValidImageUrl(item.image) ? item.image : '') ||
    (isValidImageUrl(item.author_profile_image) ? item.author_profile_image : '');
  const storyImage = rawImage || '';
  return {
    id: item.id || `story-${index}`,
    createdBy: String(item.createdBy || item.created_by || '').trim().toLowerCase(),
    title,
    excerpt: stripHtml(item.excerpt || item.subtitle || item.description || ''),
    description: stripHtml(item.description || item.subtitle || item.excerpt || ''),
    category: item.category || 'Latest News',
    language: String(item.language || item.lang || item.news_language || '').trim().toLowerCase(),
    menuTags: Array.isArray(item.menuTags) && item.menuTags.length
      ? Array.from(new Set(['latest', ...item.menuTags]))
      : inferMenuTagsFromText(item),
    state: item.state || 'National',
    district: item.district || '',
    taluka: item.taluka || '',
    author_name: item.author_name || item.author || 'RTI Desk',
    author_profile_image: item.author_profile_image || '',
    author_seat_name: item.author_seat_name || item.authorSeatName || 'Reporter',
    author_role_label: item.author_role_label || item.authorRoleLabel || '',
    author_has_blue_tick: Boolean(item.author_has_blue_tick || item.authorHasBlueTick || item.createdByBlueTick || item.has_blue_tick || false),
    author_is_premium: Boolean(item.author_is_premium || item.isPremium || false),
    author_is_subscriber: Boolean(item.author_is_subscriber || item.createdBySubscriber || false),
    image: storyImage,
    images: Array.isArray(item.images) && item.images.length
      ? item.images.filter((u) => isValidImageUrl(u))
      : [storyImage],
    video: item.video || null,
    file: item.file || null,
    mediaType: item.mediaType || (item.video ? 'Video' : 'Image'),
    date: item.date || '',
    publishedAgo: item.publishedAgo || '',
    views: Number(item.views || 0),
    likes: Number(item.likes || 0),
    comments: Number(item.comments || 0),
    shares: Number(item.shares || 0),
    liked_by: Array.isArray(item.liked_by) ? item.liked_by : [],
    bookmarked: Boolean(item.bookmarked),
    comments_list: Array.isArray(item.comments_list) ? item.comments_list : [],
  };
}

export function dedupeStories(stories) {
  return stories.filter((s, i, arr) => arr.findIndex((c) => c.id === s.id) === i);
}

export function storyMatchesMenu(story, menuKey) {
  if (!story) return false;
  if (!menuKey || menuKey === 'latest') return true;
  if (menuKey === 'states') return true;
  return Array.isArray(story.menuTags) && story.menuTags.includes(menuKey);
}

export function buildHomeStateFromParams(routeParams = {}) {
  const initialView = routeParams.initialView === 'states' ? 'states' : 'feed';
  const requestedMenuKey = routeParams.initialMenuKey || (initialView === 'states' ? 'states' : 'latest');
  const selectedMenuKey = SIDEBAR_MENU_ITEMS.some((item) => item.key === requestedMenuKey)
    ? requestedMenuKey
    : initialView === 'states' ? 'states' : 'latest';
  return {
    nextViewMode: initialView,
    nextMenuKey: selectedMenuKey,
    nextStateName: String(routeParams.initialStateName || '').trim(),
  };
}

export function buildPanelContent({ viewMode, selectedMenuKey, selectedStateName, districtCount, commonCopy, homeCopy }) {
  if (selectedStateName) {
    return {
      eyebrow: homeCopy.selectedPlaceEyebrow,
      title: `${selectedStateName} ${homeCopy.selectedPlaceTitleSuffix}`,
      subtitle: districtCount
        ? `${selectedStateName}: ${homeCopy.selectedPlaceSubtitleWithData}`
        : `${selectedStateName}: ${homeCopy.selectedPlaceSubtitleEmpty}`,
    };
  }
  if (viewMode === 'states' || selectedMenuKey === 'states') {
    return { eyebrow: homeCopy.choosePlaceEyebrow, title: homeCopy.choosePlaceTitle, subtitle: homeCopy.choosePlaceSubtitle };
  }
  if (selectedMenuKey !== 'latest') {
    const activeMenu = getMenuPresentation(selectedMenuKey);
    return { eyebrow: getMenuLabel(activeMenu, commonCopy), title: getMenuLabel(activeMenu, commonCopy), subtitle: homeCopy.focusedMenuSubtitle };
  }
  return { eyebrow: homeCopy.latestEyebrow, title: homeCopy.latestTitle, subtitle: homeCopy.latestSubtitle };
}

export function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function buildStateDistrictList(stories, stateName) {
  if (!stateName) return [];
  const normalizedState = String(stateName).trim().toLowerCase();
  const storyDistricts = stories
    .filter((s) => String(s.state || '').trim().toLowerCase() === normalizedState)
    .flatMap((s) => [s.district, s.taluka])
    .map((v) => String(v || '').trim())
    .filter(Boolean);
  const fallbackDistricts = FALLBACK_DISTRICT_MAP[stateName] || [
    `${stateName} City`, `${stateName} Central`, `${stateName} North`, `${stateName} South`, `${stateName} Rural`,
  ];
  return uniqueValues([...storyDistricts, ...fallbackDistricts]);
}

export function ensureStoryCount(stories) {
  return dedupeStories(Array.isArray(stories) ? stories : []);
}
