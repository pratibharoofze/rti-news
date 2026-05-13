import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View, useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';
import { UserStore } from '../store/UserStore';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/ui/ToastProvider';
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

// ── Subscription Plans ────────────────────────────────────────────────────────
const SUBSCRIPTION_PLANS = [
  {
    plan_id: 'plan-basic',
    plan_name: 'Basic Access',
    price: 199,
    duration: '30 Days',
    features: ['News Feed', 'e-Paper', 'Notifications'],
    color: '#16a34a',
    popular: false,
  },
  {
    plan_id: 'plan-pro',
    plan_name: 'Pro Access',
    price: 499,
    duration: '90 Days',
    features: ['News Feed', 'e-Paper', 'Live Streaming', 'Wallet', 'Certification'],
    color: '#2563eb',
    popular: true,
  },
  {
    plan_id: 'plan-premium',
    plan_name: 'Premium Access',
    price: 899,
    duration: '180 Days',
    features: ['All Features', 'Priority Support', 'Certificate Download', 'Referral Bonus'],
    color: '#7c3aed',
    popular: false,
  },
];

// ── Seat Select Modal ─────────────────────────────────────────────────────────
function SeatSelectModal({ visible, stateName, seats, selectedSeatId, onSelectSeatId, onCancel, onConfirm }) {
  const seatsToShow = Array.isArray(seats) ? seats.slice(0, 5) : [];
  const isLoadingSeats = seatsToShow.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={onCancel} />
      <View style={seatStyles.sheet}>
        <View style={seatStyles.handle} />
        <Text style={seatStyles.title}>Select Seat</Text>
        <Text style={seatStyles.subtitle}>State: {stateName || '-'}</Text>

        <View style={{ marginTop: 12, gap: 8 }}>
          {isLoadingSeats ? (
            <Text style={seatStyles.loadingText}>Loading seats…</Text>
          ) : null}
          {seatsToShow.map((seat) => {
            const isTaken = seat.status === 'taken';
            const isDisabled = seat.status === 'disabled';
            const isSelected = selectedSeatId === seat.id;
            const disabled = isTaken || isDisabled;
            return (
              <TouchableOpacity
                key={seat.id}
                activeOpacity={0.85}
                disabled={disabled}
                onPress={() => onSelectSeatId(seat.id)}
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? '#1d4ed8' : disabled ? '#e2e8f0' : '#cbd5e1',
                  backgroundColor: isSelected ? '#eff6ff' : disabled ? '#f8fafc' : '#ffffff',
                  borderRadius: 14, padding: 12,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: disabled ? '#64748b' : '#0f172a' }}>
                    {seat.name}
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '800', color: isTaken || isDisabled ? '#64748b' : '#1d4ed8' }}>
                    {isTaken ? 'Taken' : isDisabled ? 'Select state first' : 'Available'}
                  </Text>
                </View>
                {isSelected ? (
                  <View style={{ backgroundColor: '#1d4ed8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>Selected</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 14, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={seatStyles.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
            <Text style={{ color: '#0f172a', fontWeight: '900' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[seatStyles.confirmBtn, { borderColor: selectedSeatId ? '#0f172a' : '#cbd5e1', backgroundColor: selectedSeatId ? '#0f172a' : '#e2e8f0' }]}
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={!selectedSeatId || isLoadingSeats}
          >
            <Text style={{ color: selectedSeatId ? '#fff' : '#64748b', fontWeight: '900' }}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const seatStyles = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 16, paddingBottom: 18,
  },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 99, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  subtitle: { marginTop: 4, fontSize: 12, color: '#64748b', fontWeight: '700' },
  loadingText: { fontSize: 12, color: '#64748b', fontWeight: '700', paddingVertical: 10 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  confirmBtn: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
});

// ── Subscription Modal ────────────────────────────────────────────────────────
function SubscriptionModal({ visible, pendingPlan, onPlanPress, onClose }) {
  return visible ? (
    <View style={subStyles.overlay}>
      <View style={subStyles.modalContent}>
        <View style={subStyles.modalHeader}>
          <Text style={subStyles.modalTitle}>Choose Your Plan</Text>
          <Text style={subStyles.modalSubtitle}>Upgrade to unlock premium features</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.plan_id}
              style={[
                subStyles.planCard,
                {
                  borderWidth: (pendingPlan?.plan_id === plan.plan_id || plan.popular) ? 2 : 1,
                  borderColor: pendingPlan?.plan_id === plan.plan_id ? plan.color : plan.color + '44',
                  backgroundColor: pendingPlan?.plan_id === plan.plan_id ? plan.color + '0F' : '#f8fafc',
                },
              ]}
              onPress={() => onPlanPress(plan)}
              activeOpacity={0.8}
            >
              {plan.popular ? (
                <View style={[subStyles.popularBadge, { backgroundColor: plan.color }]}>
                  <Text style={subStyles.popularText}>MOST POPULAR</Text>
                </View>
              ) : null}
              <View style={subStyles.planHeader}>
                <View>
                  <Text style={[subStyles.planName, { color: plan.color }]}>{plan.plan_name}</Text>
                  <Text style={subStyles.planDuration}>{plan.duration}</Text>
                </View>
                <Text style={subStyles.planPrice}>₹{plan.price}</Text>
              </View>
              <View style={subStyles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={subStyles.featureItem}>
                    <Ionicons name="checkmark-circle" size={14} color={plan.color} />
                    <Text style={subStyles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={subStyles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={subStyles.closeBtnText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;
}

const subStyles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20,
  },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '100%', maxWidth: 400, maxHeight: '80%' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  planCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  popularBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 8 },
  popularText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planName: { fontSize: 16, fontWeight: '800' },
  planDuration: { fontSize: 12, color: '#64748b', marginTop: 2 },
  planPrice: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  featuresList: { marginTop: 4 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  featureText: { fontSize: 12, color: '#475569' },
  closeBtn: { backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
});

// ── Main HomeScreen ───────────────────────────────────────────────────────────
export default function HomeScreen({ navigation, route }) {
  const { language } = useLanguage();
  const { showToast, showPopup } = useToast();
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

  // ── Registration flow params ──
  const fromRegistration = Boolean(route?.params?.fromRegistration);
  const registrationJustCompleted = Boolean(route?.params?.registrationJustCompleted);

  // ── Subscription modal state ──
  const handledRegistrationToastRef = useRef(false);
  const handledSubscriptionModalRef = useRef(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [seatSummary, setSeatSummary] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [pendingPlan, setPendingPlan] = useState(null);

  const initialHomeState = buildHomeStateFromParams(route?.params);
  const [viewMode, setViewMode] = useState(initialHomeState.nextViewMode);
  const [selectedMenuKey, setSelectedMenuKey] = useState(initialHomeState.nextMenuKey);
  const [selectedStateName, setSelectedStateName] = useState(initialHomeState.nextStateName);
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStories, setLiveStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const nextHomeState = buildHomeStateFromParams({
      initialView: routeInitialView,
      initialMenuKey: routeInitialMenuKey,
      initialStateName: routeInitialStateName,
    });
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
    } catch { setCurrentUser(null); }
  }, []);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    (async () => {
      await loadNewsStories();
      await loadCurrentUser();

      if (!mounted) return;

      // Load seat summary for subscription flow
      try {
        const seats = await UserStore.getStateSeatSummary();
        if (mounted) {
          setSeatSummary(seats || null);
          const seatId = seats?.current_seat?.seat_id || '';
          setSelectedSeatId((prev) => prev || seatId);
        }
      } catch { /* noop */ }

      // Registration toast
      if (registrationJustCompleted && !handledRegistrationToastRef.current) {
        handledRegistrationToastRef.current = true;
        showToast('Registration successful! Welcome 🎉', 'success');
      }

      // Subscription modal — sirf pehli baar registration ke baad
      if (fromRegistration && !handledSubscriptionModalRef.current) {
        handledSubscriptionModalRef.current = true;
        setTimeout(() => setShowSubscriptionModal(true), 1000);
      }
    })();
    return () => { mounted = false; };
  }, [fromRegistration, loadCurrentUser, loadNewsStories, registrationJustCompleted, showToast]));

  // ── Subscription: Plan press ──────────────────────────────────────────────
  const handlePlanPress = (plan) => {
    setPendingPlan(plan);
    const stateName = seatSummary?.state || currentUser?.state || '';

    if (!stateName) {
      showPopup('Please select your state first.', 'error', {
        primaryLabel: 'Open',
        secondaryLabel: 'Cancel',
        onPrimaryPress: () => navigation.navigate('StateSelect', { fromPremium: true, autoOpen: true }),
      });
      return;
    }

    const existingSeatId = seatSummary?.current_seat?.seat_id || '';
    if (existingSeatId) {
      setSelectedSeatId(existingSeatId);
      handleDirectSubscribe(plan, existingSeatId);
      return;
    }

    setSeatModalOpen(true);
  };

  // ── Subscription: Direct subscribe (existing seat) ────────────────────────
  const handleDirectSubscribe = async (plan, seatId) => {
    try {
      await UserStore.saveSubscription({
        plan_id: plan.plan_id, plan_name: plan.plan_name,
        seat_id: seatId, price: plan.price, duration: plan.duration,
      });
      setCurrentUser((prev) => ({
        ...prev,
        subscription_type: plan.plan_id.replace('plan-', ''),
        subscription_active: true,
      }));
      setShowSubscriptionModal(false);
      setPendingPlan(null);
      showToast(`${plan.plan_name} Subscription Successful! 🎉`, 'success');
    } catch (err) {
      console.error('Subscription save failed:', err);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  // ── Subscription: Seat confirm ────────────────────────────────────────────
  const handleSeatConfirm = async () => {
    if (!pendingPlan || !selectedSeatId) return;
    try {
      await UserStore.saveSelectedSeat(selectedSeatId);
      await UserStore.saveSubscription({
        plan_id: pendingPlan.plan_id, plan_name: pendingPlan.plan_name,
        seat_id: selectedSeatId, price: pendingPlan.price, duration: pendingPlan.duration,
      });
      setCurrentUser((prev) => ({
        ...prev,
        subscription_type: pendingPlan.plan_id.replace('plan-', ''),
        subscription_active: true,
      }));
      setSeatModalOpen(false);
      setShowSubscriptionModal(false);
      setPendingPlan(null);
      showToast(`${pendingPlan.plan_name} Subscription Successful! 🎉`, 'success');
    } catch (err) {
      console.error('Subscription save failed:', err);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  // ── News feed logic (unchanged) ───────────────────────────────────────────
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

  const panelContent = useMemo(() => buildPanelContent({
    viewMode, selectedMenuKey, selectedStateName,
    districtCount: stateDistrictOptions.length, commonCopy, homeCopy,
  }), [commonCopy, homeCopy, selectedMenuKey, selectedStateName, stateDistrictOptions.length, viewMode]);

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
    try { if (story.id) await UserStore.updateNewsFeedItem(story.id, 'view'); } catch { }
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
    const fallbackAuthor = {
      name: story.author_name || '', author_profile_image: story.author_profile_image || '',
      author_seat_name: story.author_seat_name || '', author_role_label: story.author_role_label || '',
      author_is_premium: Boolean(story.author_is_premium),
    };
    if (!story.createdBy && !fallbackAuthor.name) return;
    navigation?.navigate?.('UserProfile', { email: story.createdBy || '', author: fallbackAuthor });
  }, [navigation]);

  const renderSearchField = viewMode === 'states' ? null : (
    <View style={[styles.sectionSearchRow, isCompactLayout && styles.sectionSearchRowCompact]}>
      <View style={styles.sectionSearchField}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          value={searchQuery} onChangeText={setSearchQuery}
          placeholder={homeCopy.searchFeedPlaceholder} placeholderTextColor="#94a3b8"
          style={styles.sectionSearchInput}
        />
      </View>
      {(selectedStateName || selectedMenuKey !== 'latest') ? (
        <TouchableOpacity
          style={styles.sectionResetButton}
          onPress={() => { setViewMode('feed'); setSelectedMenuKey('latest'); setSelectedStateName(''); setSelectedDistrictName(''); setSearchQuery(''); }}
          activeOpacity={0.84}
        >
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
                  <StateDirectorySection
                    stateSearchQuery={searchQuery} onSearchChange={setSearchQuery}
                    onSelectState={handleStateSelection} isCompactLayout={isCompactLayout} homeCopy={homeCopy}
                  />
                ) : (
                  <>
                    {renderSearchField}
                    <View style={styles.storyCardsStack}>
                      {visibleStories.map((story) => (
                        <NewsFeedCard
                          key={story.id} story={story} isCompactLayout={isMobileLayout}
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
      {IS_WEB ? <AppFooter navigation={navigation} /> : null}
    </>
  );

  const page = (
    <View style={styles.screenShell}>
      {IS_WEB ? <AppNavbar navigation={navigation} activeScreen="Home" /> : null}
      {!IS_WEB && <AppNavbar navigation={navigation} activeScreen="Home" hideTopHeader={false} />}
      <ScrollView
        style={styles.pageScrollView}
        contentContainerStyle={[styles.pageScrollContent, !IS_WEB && styles.pageScrollContentWithMobileNav]}
        showsVerticalScrollIndicator={false}
      >
        {pageContent}
      </ScrollView>
      {!IS_WEB && <AppNavbar navigation={navigation} activeScreen="Home" hideTopHeader={true} />}

      {/* ── Seat Select Modal ── */}
      <SeatSelectModal
        visible={seatModalOpen}
        stateName={seatSummary?.state || currentUser?.state || ''}
        seats={seatSummary?.seats || []}
        selectedSeatId={selectedSeatId}
        onSelectSeatId={setSelectedSeatId}
        onCancel={() => { setSeatModalOpen(false); setPendingPlan(null); }}
        onConfirm={handleSeatConfirm}
      />

      {/* ── Subscription Modal ── */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        pendingPlan={pendingPlan}
        onPlanPress={handlePlanPress}
        onClose={() => { setShowSubscriptionModal(false); setPendingPlan(null); }}
      />
    </View>
  );

  return IS_WEB ? <WebLayout>{page}</WebLayout> : page;
}

const styles = StyleSheet.create({
  screenShell: { flex: 1, backgroundColor: '#edf1f4' },
  pageScrollView: { flex: 1 },
  pageScrollContent: { paddingTop: 0, paddingBottom: 24 },
  pageScrollContentWithMobileNav: { paddingBottom: 160 },
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