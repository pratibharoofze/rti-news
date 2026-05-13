import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getSiteCopy } from '../constants/siteCopy';
import { UserStore } from '../store/UserStore';
import { isValidImageUrl } from '../utils/storyHelpers';

const IS_WEB = Platform.OS === 'web';

const DESKTOP_NAV_ITEMS = [
  { labelKey: 'home', screen: 'Home', icon: 'home-outline' },
  { labelKey: 'feed', screen: 'Feed', icon: 'newspaper-outline' },
  { labelKey: 'contact', screen: 'Contact', icon: 'call-outline' },
  { labelKey: 'Profile', screen: 'Profile', icon: 'person-outline' },
];

const MOBILE_NAV_ITEMS = [
  { labelKey: 'home', screen: 'Home', icon: 'home-outline' },
  { labelKey: 'feed', screen: 'Feed', icon: 'newspaper-outline' },
  { labelKey: 'create', screen: '__create_menu__', icon: 'grid-outline' },
  { labelKey: 'contact', screen: 'Contact', icon: 'call-outline' },
  { labelKey: 'Profile', screen: 'Profile', icon: 'person-outline' },
];

// ── Create Menu Items ───────────────────────────────────────────────────────
const CREATE_MENU_ITEMS = [
  ...(IS_WEB ? [{ label: 'Home', icon: 'home-outline', screen: 'Home' }] : []),
  { label: 'Dashboard',          icon: 'grid-outline',          screen: 'Dashboard' },
  { label: 'Profile',            icon: 'person-outline',        screen: 'Profile' },
  { label: 'My Network',         icon: 'people-outline',        screen: 'MyNetwork' },
  { label: 'Wallet',             icon: 'wallet-outline',        screen: 'Wallet' },
  { label: 'Withdraw',           icon: 'cash-outline',          screen: 'Withdraw' },
  { label: 'Subscription Plans', icon: 'star-outline',          screen: 'SubscriptionPlans' },
  { label: 'News Feed',          icon: 'newspaper-outline',     screen: 'Feed' },
  { label: 'e-Paper',            icon: 'document-text-outline', screen: 'EPaper' },
  { label: 'Live Streaming',     icon: 'radio-outline',         screen: 'LiveStreaming' },
  { label: 'Certification',      icon: 'ribbon-outline',        screen: 'Certification' },
  { label: 'Notifications',      icon: 'notifications-outline', screen: 'Notifications' },
  { label: 'Settings',           icon: 'settings-outline',      screen: 'Settings' },
  { label: 'Logout',             icon: 'log-out-outline',       screen: '__logout__', isDestructive: true },
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

function blurActiveElement() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const el = document.activeElement;
  if (el && typeof el.blur === 'function') el.blur();
}

function useIsDesktop() {
  const { width } = useWindowDimensions();
  if (!IS_WEB) return false;
  return width >= 768;
}

// ─── Create Menu Drawer ────────────────────────────────────────────────────
function CreateMenuDrawer({ visible, onClose, navigation, onLogout }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (item) => {
    onClose();
    if (item.screen === '__logout__') {
      onLogout?.();
      return;
    }
    navigation?.navigate?.(item.screen);
  };

  if (!visible && !IS_WEB) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[drawerStyles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          drawerStyles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={drawerStyles.handle} />

        {/* Header */}
        <View style={drawerStyles.sheetHeader}>
          <Text style={drawerStyles.sheetTitle}>Quick Menu</Text>
          <TouchableOpacity onPress={onClose} style={drawerStyles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Grid of items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={drawerStyles.gridContainer}
        >
          {CREATE_MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                drawerStyles.gridItem,
                item.isDestructive && drawerStyles.gridItemDestructive,
              ]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  drawerStyles.gridIconWrap,
                  item.isDestructive && drawerStyles.gridIconWrapDestructive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.isDestructive ? '#ef4444' : '#f97316'}
                />
              </View>
              <Text
                style={[
                  drawerStyles.gridLabel,
                  item.isDestructive && drawerStyles.gridLabelDestructive,
                ]}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const drawerStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: '85%',
    ...Platform.select({
      default: {
        elevation: 24,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  gridItem: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#fffbf7',
    borderWidth: 1,
    borderColor: '#fde8d0',
    gap: 8,
    minWidth: 90,
  },
  gridItemDestructive: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconWrapDestructive: {
    backgroundColor: '#fee2e2',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
  },
  gridLabelDestructive: {
    color: '#ef4444',
  },
});

// ─── Language Selector ─────────────────────────────────────────────────────
function NavbarLanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((item) => item.code === language) || LANGUAGE_OPTIONS[0],
    [language]
  );

  const handleSelect = async (code) => {
    await changeLanguage(code);
    blurActiveElement();
    setIsOpen(false);
  };

  return (
    <View style={styles.languageSelectorWrap}>
      <TouchableOpacity
        style={styles.utilityPillButton}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        <Ionicons name="globe-outline" size={16} color="#0f172a" />
        <Text style={styles.utilityPillText}>{selectedLanguage.label}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={14}
          color="#475569"
        />
      </TouchableOpacity>

      {isOpen ? (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => { blurActiveElement(); setIsOpen(false); }}
          />
          <View style={styles.languageDropdownCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {LANGUAGE_OPTIONS.map((item) => {
                const isActive = item.code === selectedLanguage.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.languageDropdownItem, isActive && styles.languageDropdownItemActive]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.languageDropdownLabel, isActive && styles.languageDropdownLabelActive]}>
                      {item.label}
                    </Text>
                    {isActive ? <Ionicons name="checkmark-circle" size={16} color="#f97316" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </>
      ) : null}
    </View>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────
function ProfileDropdown({ navigation }) {
  const { language } = useLanguage();
  const { isLoggedIn, logout, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUri, setAvatarUri] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const copy = useMemo(() => getSiteCopy(language), [language]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      refresh?.();
      (async () => {
        try {
          const user = await UserStore.getCurrentUser();
          if (!alive) return;
          const uri = String(user?.profile_image || '').trim();
          const validUri = isValidImageUrl(uri) ? uri : '';
          setAvatarUri(prev => {
            if (prev !== validUri) setAvatarError(false);
            return validUri;
          });
        } catch {
          if (!alive) return;
        } finally {
          if (alive) setIsReady(true);
        }
      })();
      return () => { alive = false; };
    }, [refresh])
  );

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setAvatarError(false);
    setAvatarUri('');
    navigation?.navigate?.('Home');
  };

  if (!isReady) return null;

  if (!isLoggedIn) {
    return (
      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => navigation?.navigate?.('Login')}
        activeOpacity={0.88}
      >
        <Ionicons name="person-add-outline" size={16} color="#ffffff" />
        <Text style={styles.primaryActionButtonText}>{copy.common.signIn}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.profileDropdownWrap}>
      <TouchableOpacity
        style={styles.profileIconButton}
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.85}
      >
        {avatarUri && !avatarError ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.profileAvatarImg}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={32} color="#f97316" />
        )}
      </TouchableOpacity>

      {isOpen ? (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => { blurActiveElement(); setIsOpen(false); }}
          />
          <View style={styles.profileDropdownCard}>
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => { setIsOpen(false); navigation?.navigate?.('Profile'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color="#475569" />
              <Text style={styles.profileDropdownText}>{copy.common.profile}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => { setIsOpen(false); navigation?.navigate?.('Dashboard'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={18} color="#475569" />
              <Text style={styles.profileDropdownText}>{copy.common.dashboard}</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={[styles.profileDropdownItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={[styles.profileDropdownText, styles.logoutText]}>{copy.common.logout}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}

// ─── Brand ────────────────────────────────────────────────────────────────
function NavbarBrand({ onPressHome, compact }) {
  return (
    <TouchableOpacity style={styles.brandLink} onPress={onPressHome} activeOpacity={0.88}>
      <Image
        source={require('../assets/images/certificate_logo.jpg')}
        style={[styles.brandLogo, compact && styles.brandLogoCompact]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

// ─── Mobile Top Header ────────────────────────────────────────────────────
function MobileTopHeader({ navigation, handleNavigate }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mobileTopHeader, { paddingTop: insets.top + 8 }]}>
      <NavbarBrand onPressHome={() => handleNavigate('Home')} compact />
      <View style={styles.mobileTopHeaderActions}>
        <NavbarLanguageSelector />
        <ProfileDropdown navigation={navigation} />
      </View>
    </View>
  );
}

// ─── Mobile Bottom Bar ────────────────────────────────────────────────────
function MobileBottomBar({ activeScreen, handleNavigate, onCreatePress }) {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = useMemo(() => getSiteCopy(language), [language]);
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.mobileBottomBar, { paddingBottom: bottomPad }]}>
      {MOBILE_NAV_ITEMS.map((item) => {
        const isCreateBtn = item.screen === '__create_menu__';
        const isActive = !isCreateBtn && activeScreen === item.screen;

        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.mobileTabButton}
            onPress={() => isCreateBtn ? onCreatePress() : handleNavigate(item.screen)}
            activeOpacity={0.8}
          >
            {isCreateBtn ? (
              // Special pill-style create button
              <View style={styles.createBtnWrap}>
                <Ionicons name={item.icon} size={22} color="#ffffff" />
              </View>
            ) : (
              <View style={[styles.mobileTabIconWrap, isActive && styles.mobileTabIconWrapActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive ? '#f97316' : '#64748b'}
                />
              </View>
            )}
            <Text
              style={[
                styles.mobileTabLabel,
                isActive && styles.mobileTabLabelActive,
                isCreateBtn && styles.mobileTabLabelCreate,
              ]}
              numberOfLines={1}
            >
              {copy.common[item.labelKey] || item.labelKey}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────
export default function AppNavbar({ activeScreen, navigation, hideTopHeader = false }) {
  const { language } = useLanguage();
  const { logout } = useAuth();
  const copy = useMemo(() => getSiteCopy(language), [language]);
  const isDesktop = useIsDesktop();
  const [createMenuVisible, setCreateMenuVisible] = useState(false);

  const handleNavigate = (screenName) => {
    blurActiveElement();
    navigation?.navigate?.(screenName);
  };

  const handleLogout = async () => {
    await logout?.();
    navigation?.navigate?.('Home');
  };

  if (!isDesktop) {
    return (
      <>
        {!hideTopHeader && (
          <MobileTopHeader navigation={navigation} handleNavigate={handleNavigate} />
        )}
        <MobileBottomBar
          activeScreen={activeScreen}
          handleNavigate={handleNavigate}
          onCreatePress={() => setCreateMenuVisible(true)}
        />
        <CreateMenuDrawer
          visible={createMenuVisible}
          onClose={() => setCreateMenuVisible(false)}
          navigation={navigation}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // ─── Desktop ───────────────────────────────────────────────────────────
  return (
    <>
      <View style={styles.desktopNavbarShell}>
        <View style={styles.desktopNavbarInner}>
          <NavbarBrand onPressHome={() => handleNavigate('Home')} />

          <View style={styles.desktopNavLinksRow}>
            {DESKTOP_NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.desktopNavLink, isActive && styles.desktopNavLinkActive]}
                  onPress={() => handleNavigate(item.screen)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={isActive ? '#f97316' : '#475569'}
                  />
                  <Text style={[styles.desktopNavLabel, isActive && styles.desktopNavLabelActive]}>
                    {copy.common[item.labelKey] || item.labelKey}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Desktop Create/Menu button */}
            <TouchableOpacity
              style={styles.desktopCreateBtn}
              onPress={() => setCreateMenuVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="grid-outline" size={16} color="#ffffff" />
              <Text style={styles.desktopCreateBtnText}>Menu</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.desktopActionsRow}>
            <NavbarLanguageSelector />
            <ProfileDropdown navigation={navigation} />
          </View>
        </View>
      </View>

      <CreateMenuDrawer
        visible={createMenuVisible}
        onClose={() => setCreateMenuVisible(false)}
        navigation={navigation}
        onLogout={handleLogout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // ── Desktop Navbar ──────────────────────────────────────────────────────
  desktopNavbarShell: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
      },
      default: {
        elevation: 6,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  desktopNavbarInner: {
    maxWidth: 1360,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'nowrap',
  },
  brandLink: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginRight: 4,
  },
  brandLogo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.28 }],
  },
  brandLogoCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    transform: [{ scale: 1 }],
  },
  desktopNavLinksRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    minWidth: 0,
  },
  desktopNavLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  desktopNavLinkActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  desktopNavLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopNavLabelActive: {
    color: '#f97316',
  },
  desktopCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f97316',
  },
  desktopCreateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopActionsRow: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },

  // ── Mobile Top Header ───────────────────────────────────────────────────
  mobileTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingBottom: 8,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
      },
      default: {
        elevation: 6,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
    }),
  },
  mobileTopHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ── Shared overlay ──────────────────────────────────────────────────────
  overlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      default: {
        position: 'absolute',
        width: 9999,
        height: 9999,
        top: -9999,
        left: -9999,
      },
    }),
    zIndex: 1198,
  },

  // ── Language Selector ───────────────────────────────────────────────────
  languageSelectorWrap: {
    position: 'relative',
    zIndex: 1200,
  },
  utilityPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  utilityPillText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  languageDropdownCard: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 190,
    maxHeight: 260,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 1199,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 18px 38px rgba(15, 23, 42, 0.16)' },
      default: {
        elevation: 16,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
    }),
  },
  languageDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageDropdownItemActive: { backgroundColor: '#fff7ed' },
  languageDropdownLabel: { color: '#1e293b', fontSize: 13, fontWeight: '700' },
  languageDropdownLabelActive: { color: '#f97316' },

  // ── Profile Dropdown ────────────────────────────────────────────────────
  profileDropdownWrap: {
    position: 'relative',
    zIndex: 1200,
  },
  profileIconButton: {
    width: 40,
    height: 40,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  profileDropdownCard: {
    position: 'absolute',
    top: 46,
    right: 0,
    width: 200,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 1199,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 18px 38px rgba(15, 23, 42, 0.16)' },
      default: {
        elevation: 16,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
    }),
  },
  profileDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileDropdownText: { color: '#1e293b', fontSize: 13, fontWeight: '600' },
  logoutItem: { marginBottom: 4 },
  logoutText: { color: '#ef4444' },
  dropdownDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },

  // ── Primary Action Button ───────────────────────────────────────────────
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  primaryActionButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },

  // ── Mobile Bottom Bar ────────────────────────────────────────────────────
  mobileBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffdf8',
    borderTopWidth: 1,
    borderTopColor: '#f1e5d3',
    paddingHorizontal: 6,
    paddingTop: 6,
    ...Platform.select({
      web: {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.12)',
      },
      default: {
        elevation: 16,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  mobileTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  createBtnWrap: {
    width: 44,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      default: {
        elevation: 4,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
    }),
  },
  mobileTabIconWrap: {
    width: 40,
    height: 36,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mobileTabIconWrapActive: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  mobileTabLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  mobileTabLabelActive: { color: '#f97316' },
  mobileTabLabelCreate: { color: '#f97316' },
});