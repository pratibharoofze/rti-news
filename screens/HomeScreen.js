import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';
import { useLanguage } from '../contexts/LanguageContext';
import { getSiteCopy } from '../constants/siteCopy';
import { IS_WEB, DEMO_STORIES, FEATURED_STATE_OPTIONS } from '../constants/homeData';
import {
  normalizeStoryItem, dedupeStories, storyMatchesMenu,
  buildHomeStateFromParams, buildPanelContent, buildStateDistrictList, ensureStoryCount,
} from '../utils/storyHelpers';
import NewsFeedCard from '../components/NewsFeedCard';
import NewsMenuSidebar from '../components/NewsMenuSidebar';
import StateDirectorySection from '../components/StateDirectorySection';
import RightUtilityPanel from '../components/RightUtilityPanel';

const DESKTOP_STICKY_TOP_OFFSET = 0;

export default function HomeScreen({ navigation, route }) {
  const { language } = useLanguage();
  const copy = useMemo(() => getSiteCopy(language), [language]);
  const commonCopy = copy.common;
  const homeCopy = copy.home;
  const { width } = useWindowDimensions();
  const isDesktopRailLayout = IS_WEB && width >= 1180;
  const isCompactLayout = !isDesktopRailLayout;
  const isMobileLayout = !IS_WEB || width < 768;

  const routeInitialView = route?.params?.initialView;
  const routeInitialMenuKey = route?.params?.initialMenuKey;
  const routeInitialStateName = route?.params?.initialStateName;

  const initialHomeState = buildHomeStateFromParams(route?.params);
  const [viewMode, setViewMode] = useState(initialHomeState.nextViewMode);
  const [selectedMenuKey, setSelectedMenuKey] = useState(initialHomeState.nextMenuKey);
  const [selectedStateName, setSelectedStateName] = useState(initialHomeState.nextStateName);
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStories, setLiveStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const nextHomeState = buildHomeStateFromParams({ initialView: routeInitialView, initialMenuKey: routeInitialMenuKey, initialStateName: routeInitialStateName });
    setViewMode(nextHomeState.nextViewMode);
    setSelectedMenuKey(nextHomeState.nextMenuKey);
    setSelectedStateName(nextHomeState.nextStateName);
    setSelectedDistrictName('');
    setSearchQuery('');
  }, [routeInitialView, routeInitialMenuKey, routeInitialStateName]);

  const loadNewsStories = useCallback(async () => {
    try {
      const summary = await UserStore.getNewsFeedSummary();
      const fetchedStories = Array.isArray(summary?.items)
        ? summary.items.map((item, index) => normalizeStoryItem(item, index)).filter(Boolean)
        : [];
      setLiveStories(fetchedStories);
    } catch { setLiveStories([]); }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      const user = await UserStore.getCurrentUser();
      setCurrentUser(user || null);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadNewsStories();
    loadCurrentUser();
  }, [loadCurrentUser, loadNewsStories]));

  const allStories = useMemo(() => {
    const manualStories = DEMO_STORIES.map((item, index) => normalizeStoryItem(item, index)).filter(Boolean);
    return dedupeStories([...liveStories, ...manualStories]);
  }, [liveStories]);

  const visibleStories = useMemo(() => {
    if (viewMode === 'states') return [];
    let scopedStories = allStories.filter((story) => storyMatchesMenu(story, selectedMenuKey));
    if (selectedStateName) {
      scopedStories = scopedStories.filter((story) => String(story.state || '').toLowerCase() === selectedStateName.toLowerCase());
    }
    const q = String(searchQuery || '').trim().toLowerCase();
    if (q) {
      scopedStories = scopedStories.filter((story) =>
        [story.title, story.excerpt, story.description, story.category, story.state, story.district, story.author_name].join(' ').toLowerCase().includes(q)
      );
    }
    return ensureStoryCount(scopedStories, { selectedMenuKey, selectedStateName });
  }, [allStories, searchQuery, selectedMenuKey, selectedStateName, viewMode]);

  const stateDistrictOptions = useMemo(() => buildStateDistrictList(allStories, selectedStateName), [allStories, selectedStateName]);

  const panelContent = useMemo(() => buildPanelContent({ viewMode, selectedMenuKey, selectedStateName, districtCount: stateDistrictOptions.length, commonCopy, homeCopy }),
    [commonCopy, homeCopy, selectedMenuKey, selectedStateName, stateDistrictOptions.length, viewMode]);

  const utilityLocationOptions = useMemo(() => {
    if (selectedStateName) return stateDistrictOptions;
    if (viewMode === 'states' || selectedMenuKey === 'states') return FEATURED_STATE_OPTIONS;
    return [];
  }, [selectedMenuKey, selectedStateName, stateDistrictOptions, viewMode]);

  const handleMenuSelection = useCallback((menuKey) => {
    setSearchQuery(''); setSelectedDistrictName('');
    if (menuKey === 'states') { setViewMode('states'); setSelectedMenuKey('states'); setSelectedStateName(''); return; }
    setViewMode('feed'); setSelectedMenuKey(menuKey); setSelectedStateName('');
  }, []);

  const handleStateSelection = useCallback((stateName) => {
    setSearchQuery(''); setViewMode('feed');
    setSelectedMenuKey((k) => (k === 'states' ? 'latest' : k));
    setSelectedStateName(stateName); setSelectedDistrictName('');
  }, []);

  const handleDistrictSelection = useCallback((districtName) => { setSelectedDistrictName(districtName); }, []);

  const handleOpenDetails = useCallback(async (story) => {
    if (!story) return;
    try { if (story.id) await UserStore.updateNewsFeedItem(story.id, 'view'); } catch { /* noop */ }
    navigation?.navigate?.('NewsDetails', { article: story });
  }, [navigation]);

  const handleOpenLocation = useCallback((stateName) => {
    if (!stateName) return;
    setSearchQuery(''); setViewMode('feed'); setSelectedMenuKey('latest'); setSelectedStateName(stateName); setSelectedDistrictName('');
  }, []);

  const handleOpenCategory = useCallback((story) => {
    const menuTag = (story?.menuTags || []).find((tag) => tag !== 'latest');
    if (!menuTag) return;
    setSearchQuery(''); setViewMode('feed'); setSelectedStateName(''); setSelectedDistrictName(''); setSelectedMenuKey(menuTag);
  }, []);

  const handleOpenAuthorProfile = useCallback((story) => {
    if (!story) return;
    const fallbackAuthor = { name: story.author_name || '', author_profile_image: story.author_profile_image || '', author_seat_name: story.author_seat_name || '', author_role_label: story.author_role_label || '', author_is_premium: Boolean(story.author_is_premium) };
    if (!story.createdBy && !fallbackAuthor.name) return;
    navigation?.navigate?.('UserProfile', { email: story.createdBy || '', author: fallbackAuthor });
  }, [navigation]);

  const renderSearchField = viewMode === 'states' ? null : (
    <View style={[styles.sectionSearchRow, isCompactLayout && styles.sectionSearchRowCompact]}>
      <View style={styles.sectionSearchField}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder={homeCopy.searchFeedPlaceholder} placeholderTextColor="#94a3b8" style={styles.sectionSearchInput} />
      </View>
      {(selectedStateName || selectedMenuKey !== 'latest') ? (
        <TouchableOpacity style={styles.sectionResetButton} onPress={() => { setViewMode('feed'); setSelectedMenuKey('latest'); setSelectedStateName(''); setSelectedDistrictName(''); setSearchQuery(''); }} activeOpacity={0.84}>
          <Ionicons name="refresh-outline" size={16} color="#f97316" />
          <Text style={styles.sectionResetButtonText}>{homeCopy.resetFeed}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const utilityPanel = (
    <RightUtilityPanel
      navigation={navigation} panelContent={panelContent}
      selectedStateName={selectedStateName} selectedDistrictName={selectedDistrictName}
      locationOptions={utilityLocationOptions}
      onSelectState={handleStateSelection} onSelectDistrict={handleDistrictSelection}
      isCompactLayout={isCompactLayout} commonCopy={commonCopy} homeCopy={homeCopy}
    />
  );

  const shouldShowRightRail = viewMode !== 'states';

  const pageContent = (
    <>
      <View style={styles.pageBodyShell}>
        <View style={[styles.pageBodyInner, isCompactLayout && styles.pageBodyInnerCompact]}>
          <View style={[styles.sidebarStickyWrapper, isCompactLayout && styles.sidebarStickyWrapperCompact]}>
            <NewsMenuSidebar activeMenuKey={selectedMenuKey} onSelectMenu={handleMenuSelection} isCompactLayout={isCompactLayout} commonCopy={commonCopy} />
          </View>
          <View style={[styles.workspaceShell, isCompactLayout && styles.workspaceShellCompact]}>
            {isCompactLayout && shouldShowRightRail ? (
              <View style={[styles.utilityStickyWrapper, styles.utilityStickyWrapperCompact]}>{utilityPanel}</View>
            ) : null}
            <View style={[styles.feedColumnShell, isCompactLayout && styles.feedColumnShellCompact]}>
              <View style={[styles.feedColumn, viewMode === 'states' && styles.feedColumnStatesView]}>
                {viewMode === 'states' ? (
                  <StateDirectorySection stateSearchQuery={searchQuery} onSearchChange={setSearchQuery} onSelectState={handleStateSelection} isCompactLayout={isCompactLayout} homeCopy={homeCopy} />
                ) : (
                  <>
                    {renderSearchField}
                    <View style={styles.storyCardsStack}>
                      {visibleStories.map((story) => (
                        <NewsFeedCard key={story.id} story={story} isCompactLayout={isMobileLayout}
                          onOpenDetails={handleOpenDetails} onOpenLocation={handleOpenLocation}
                          onOpenCategory={handleOpenCategory} onOpenAuthorProfile={handleOpenAuthorProfile}
                          commonCopy={commonCopy}
                          currentUser={currentUser ? { name: currentUser.name, avatar: currentUser.profile_image } : null}
                        />
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
            {!isCompactLayout && shouldShowRightRail ? (
              <View style={styles.utilityStickyWrapper}>{utilityPanel}</View>
            ) : null}
          </View>
        </View>
      </View>
      <AppFooter navigation={navigation} />
    </>
  );

  const page = (
    <View style={styles.screenShell}>
      {IS_WEB ? <AppNavbar navigation={navigation} activeScreen="Home" /> : null}
      <ScrollView style={styles.pageScrollView} contentContainerStyle={[styles.pageScrollContent, !IS_WEB && styles.pageScrollContentWithMobileNav]} showsVerticalScrollIndicator={false}>
        {pageContent}
      </ScrollView>
      {!IS_WEB ? <AppNavbar navigation={navigation} activeScreen="Home" /> : null}
    </View>
  );

  return IS_WEB ? <WebLayout>{page}</WebLayout> : page;
}

const styles = StyleSheet.create({
  screenShell: { flex: 1, backgroundColor: '#edf1f4' },
  pageScrollView: { flex: 1 },
  pageScrollContent: { paddingTop: 0, paddingBottom: 24 },
  pageScrollContentWithMobileNav: { paddingBottom: 110 },
  pageBodyShell: { paddingHorizontal: 0, paddingTop: 0, marginTop: -1, backgroundColor: '#edf1f4' },
  pageBodyInner: { maxWidth: 1360, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
  pageBodyInnerCompact: { flexDirection: 'column' },
  sidebarStickyWrapper: { width: 252, ...Platform.select({ web: { position: 'sticky', top: DESKTOP_STICKY_TOP_OFFSET, alignSelf: 'flex-start' } }) },
  sidebarStickyWrapperCompact: { width: '100%', position: 'relative' },
  workspaceShell: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0, paddingHorizontal: 0 },
  workspaceShellCompact: { width: '100%', flexDirection: 'column', paddingHorizontal: 12, gap: 12 },
  feedColumnShell: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 12 },
  feedColumnShellCompact: { width: '100%' },
  feedColumn: { width: '100%', minWidth: 0, maxWidth: 560, paddingBottom: 24 },
  feedColumnStatesView: { maxWidth: 840 },
  utilityStickyWrapper: { width: 320, ...Platform.select({ web: { position: 'sticky', top: DESKTOP_STICKY_TOP_OFFSET, alignSelf: 'flex-start' } }) },
  utilityStickyWrapperCompact: { width: '100%', position: 'relative' },
  sectionSearchRow: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionSearchRowCompact: { flexDirection: 'column', alignItems: 'stretch' },
  sectionSearchField: { flex: 1, minHeight: 42, borderRadius: 18, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ee', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionSearchInput: { flex: 1, fontSize: 13, color: '#0f172a', ...Platform.select({ web: { outlineStyle: 'none' } }) },
  sectionResetButton: { minHeight: 42, borderRadius: 18, paddingHorizontal: 14, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fdba74', flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionResetButtonText: { color: '#f97316', fontSize: 12, fontWeight: '800' },
  storyCardsStack: { gap: 12 },
});
