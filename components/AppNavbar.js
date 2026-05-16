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
  { labelKey: 'create', screen: 'QuickMenu', icon: 'grid-outline', isCreateBtn: true },
  { labelKey: 'advertise', screen: 'Advertise', icon: 'megaphone-outline', isAdvertiseBtn: true },
  { labelKey: 'Profile', screen: 'Profile', icon: 'person-outline' },
];

const MOBILE_NAV_ITEMS = [
  { labelKey: 'home', screen: 'Home', icon: 'home-outline' },
  { labelKey: 'feed', screen: 'Feed', icon: 'newspaper-outline' },
  { labelKey: 'create', screen: 'QuickMenu', icon: 'grid-outline', isCreateBtn: true },
  { labelKey: 'advertise', screen: 'Advertise', icon: 'megaphone-outline', isAdvertiseBtn: true },
  { labelKey: 'Profile', screen: 'Profile', icon: 'person-outline' },
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

// ─── Language Selector ─────────────────────────────────────────────────────
function NavbarLanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((item) => item.code === language) || LANGUAGE_OPTIONS[0],
    [language]
  );

  const openDropdown = () => {
    if (IS_WEB) {
      setIsOpen(true);
      return;
    }
    // Android/iOS: measure trigger button position to place Modal correctly
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setDropdownPos({
        top: py + height + 4,
        right: screenWidth - px - width,
      });
      setIsOpen(true);
    });
  };

  const handleSelect = async (code) => {
    await changeLanguage(code);
    blurActiveElement();
    setIsOpen(false);
  };

  const dropdownContent = (
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
            {isActive ? <Ionicons name="checkmark-circle" size={16} color="#e8284a" /> : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.languageSelectorWrap}>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.utilityPillButton}
        onPress={openDropdown}
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

      {IS_WEB ? (
        // Web: use absolute positioning as before
        isOpen ? (
          <>
            <TouchableOpacity
              style={styles.webOverlay}
              activeOpacity={1}
              onPress={() => { blurActiveElement(); setIsOpen(false); }}
            />
            <View style={styles.languageDropdownCard}>
              {dropdownContent}
            </View>
          </>
        ) : null
      ) : (
        // Android/iOS: use Modal to escape parent clipping
        <Modal
          visible={isOpen}
          transparent
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
          statusBarTranslucent
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View
              style={[
                styles.languageDropdownCard,
                styles.modalDropdownCard,
                { top: dropdownPos.top, right: dropdownPos.right },
              ]}
            >
              {dropdownContent}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

// ─── Profile Dropdown ──────────────────────────────────────────────────────
function ProfileDropdown({ navigation }) {
  const { language } = useLanguage();
  const { isLoggedIn, logout, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [avatarUri, setAvatarUri] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const triggerRef = useRef(null);
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

  const openDropdown = () => {
    if (IS_WEB) {
      setIsOpen(true);
      return;
    }
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setDropdownPos({
        top: py + height + 4,
        right: screenWidth - px - width,
      });
      setIsOpen(true);
    });
  };

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

  const dropdownContent = (
    <>
      <TouchableOpacity
        style={styles.profileDropdownItem}
        onPress={() => { setIsOpen(false); navigation?.navigate?.('Profile'); }}
        activeOpacity={0.7}
      >
        <Ionicons name="person-outline" size={18} color="#475569" />
        <Text style={styles.profileDropdownText}>{copy.common.profile}</Text>
      </TouchableOpacity>

      <View style={styles.dropdownDivider} />

      <TouchableOpacity
        style={[styles.profileDropdownItem, styles.logoutItem]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color="#e8284a" />
        <Text style={[styles.profileDropdownText, styles.logoutText]}>{copy.common.logout}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.profileDropdownWrap}>
      <TouchableOpacity
        ref={triggerRef}
        style={styles.profileIconButton}
        onPress={openDropdown}
        activeOpacity={0.85}
      >
        {avatarUri && !avatarError ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.profileAvatarImg}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={32} color="#e8284a" />
        )}
      </TouchableOpacity>

      {IS_WEB ? (
        isOpen ? (
          <>
            <TouchableOpacity
              style={styles.webOverlay}
              activeOpacity={1}
              onPress={() => { blurActiveElement(); setIsOpen(false); }}
            />
            <View style={styles.profileDropdownCard}>
              {dropdownContent}
            </View>
          </>
        ) : null
      ) : (
        <Modal
          visible={isOpen}
          transparent
          animationType="none"
          onRequestClose={() => setIsOpen(false)}
          statusBarTranslucent
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          >
            <View
              style={[
                styles.profileDropdownCard,
                styles.modalDropdownCard,
                { top: dropdownPos.top, right: dropdownPos.right },
              ]}
            >
              {dropdownContent}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
function MobileBottomBar({ activeScreen, handleNavigate }) {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const copy = useMemo(() => getSiteCopy(language), [language]);
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.mobileBottomBar, { paddingBottom: bottomPad }]}>
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.mobileTabButton}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.mobileTabIconWrap, isActive && styles.mobileTabIconWrapActive]}>
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#e8284a' : '#64748b'}
              />
            </View>
            <Text
              style={[styles.mobileTabLabel, isActive && styles.mobileTabLabelActive]}
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
export default function AppNavbar({ activeScreen, navigation, hideTopHeader = false, hideBottomBar = false }) {
  const { language } = useLanguage();
  const copy = useMemo(() => getSiteCopy(language), [language]);
  const isDesktop = useIsDesktop();

  const handleNavigate = (screenName) => {
    blurActiveElement();
    navigation?.navigate?.(screenName);
  };

  if (!isDesktop) {
    return (
      <>
        {!hideTopHeader && (
          <MobileTopHeader navigation={navigation} handleNavigate={handleNavigate} />
        )}
        {!hideBottomBar && (
          <MobileBottomBar activeScreen={activeScreen} handleNavigate={handleNavigate} />
        )}
      </>
    );
  }

  // ─── Desktop ───────────────────────────────────────────────────────────
  return (
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
                  color={isActive ? '#e8284a' : '#475569'}
                />
                <Text style={[styles.desktopNavLabel, isActive && styles.desktopNavLabelActive]}>
                  {copy.common[item.labelKey] || item.labelKey}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.desktopActionsRow}>
          <NavbarLanguageSelector />
          <ProfileDropdown navigation={navigation} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: '#e8284a',
  },
  desktopNavLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopNavLabelActive: {
    color: '#e8284a',
  },
  desktopActionsRow: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
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

  // ─── Web overlay (for web absolute dropdowns) ──────────────────────────
  webOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1198,
  },

  // ─── Modal backdrop (for Android/iOS Modal dropdowns) ─────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ─── Shared dropdown card ──────────────────────────────────────────────
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
    // Web: absolute positioning
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
        elevation: 20,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
    }),
  },
  // Override for Modal-based (Android/iOS): position absolute inside modal
  modalDropdownCard: {
    position: 'absolute',
    // top & right set dynamically via measure()
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
  languageDropdownLabelActive: { color: '#e8284a' },

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
        elevation: 20,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
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
  logoutText: { color: '#e8284a' },
  dropdownDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 3,
    backgroundColor: '#e8284a',
  },
  primaryActionButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
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
    borderColor: '#e8284a',
  },
  mobileTabLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  mobileTabLabelActive: { color: '#e8284a' },
});