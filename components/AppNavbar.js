import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { getSiteCopy } from '../constants/siteCopy';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';
const IS_WEB_MOBILE = IS_WEB && (
  typeof window !== 'undefined' ? window.innerWidth < 768 : WINDOW_WIDTH < 768
);

const DESKTOP_NAV_ITEMS = [
  { labelKey: 'home', screen: 'Home', icon: 'home-outline' },
  { labelKey: 'about', screen: 'About', icon: 'information-circle-outline' },
  { labelKey: 'feed', screen: 'Feed', icon: 'newspaper-outline' },
  { labelKey: 'rti', screen: 'WhatIsRTI', icon: 'document-text-outline' },
  { labelKey: 'laws', screen: 'ImportantLaws', icon: 'library-outline' },
  { labelKey: 'contact', screen: 'Contact', icon: 'call-outline' },
];

const MOBILE_NAV_ITEMS = [
  { labelKey: 'home', screen: 'Home', icon: 'home-outline' },
  { labelKey: 'about', screen: 'About', icon: 'information-circle-outline' },
  { labelKey: 'rtiShort', screen: 'WhatIsRTI', icon: 'document-text-outline' },
  { labelKey: 'laws', screen: 'ImportantLaws', icon: 'library-outline' },
  { labelKey: 'feed', screen: 'Feed', icon: 'newspaper-outline' },
  { labelKey: 'contact', screen: 'Contact', icon: 'call-outline' },
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
  const activeElement = document.activeElement;
  if (activeElement && typeof activeElement.blur === 'function') {
    activeElement.blur();
  }
}

function NavbarLanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((item) => item.code === language) || LANGUAGE_OPTIONS[0],
    [language]
  );

  const handleSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    blurActiveElement();
    setIsOpen(false);
  };

  return (
    <View style={styles.languageSelectorWrap}>
      <TouchableOpacity
        style={styles.utilityPillButton}
        onPress={() => setIsOpen((currentValue) => !currentValue)}
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
            style={styles.languageOverlay}
            activeOpacity={1}
            onPress={() => {
              blurActiveElement();
              setIsOpen(false);
            }}
          />
          <View style={styles.languageDropdownCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {LANGUAGE_OPTIONS.map((item) => {
                const isActive = item.code === selectedLanguage.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageDropdownItem,
                      isActive && styles.languageDropdownItemActive,
                    ]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.languageDropdownLabel,
                        isActive && styles.languageDropdownLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={16} color="#f97316" />
                    ) : null}
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

function ProfileDropdown({ navigation }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // This should come from your auth context
  const copy = useMemo(() => getSiteCopy(language), [language]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsOpen(false);
    // Add your logout logic here
    navigation?.navigate?.('Home');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigation?.navigate?.('Profile');
  };

  const handleDashboard = () => {
    setIsOpen(false);
    navigation?.navigate?.('Dashboard');
  };

  if (!isLoggedIn) {
    return (
      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => navigation?.navigate?.('Login')}
        activeOpacity={0.88}
      >
        <Ionicons name="person-add-outline" size={16} color="#ffffff" />
        <Text style={styles.primaryActionButtonText}>{copy.common.signUp}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.profileDropdownWrap}>
      <TouchableOpacity
        style={styles.profileIconButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.85}
      >
        <Ionicons name="person-circle-outline" size={32} color="#f97316" />
      </TouchableOpacity>

      {isOpen ? (
        <>
          <TouchableOpacity
            style={styles.profileOverlay}
            activeOpacity={1}
            onPress={() => {
              blurActiveElement();
              setIsOpen(false);
            }}
          />
          <View style={styles.profileDropdownCard}>
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={handleProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color="#475569" />
              <Text style={styles.profileDropdownText}>{copy.common.profile}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={handleDashboard}
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

function NavbarBrand({ onPressHome }) {
  return (
    <TouchableOpacity
      style={styles.brandLink}
      onPress={onPressHome}
      activeOpacity={0.88}
    >
      <Image
        source={require('../assets/images/certificate_logo.jpg')}
        style={styles.brandLogo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

export default function AppNavbar({ activeScreen, navigation }) {
  const { language } = useLanguage();
  const copy = useMemo(() => getSiteCopy(language), [language]);

  const handleNavigate = (screenName) => {
    blurActiveElement();
    navigation?.navigate?.(screenName);
  };

  if (!IS_WEB || IS_WEB_MOBILE) {
    return (
      <View style={styles.mobileBottomBar}>
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
                  color={isActive ? '#f97316' : '#64748b'}
                />
              </View>
              <Text style={[styles.mobileTabLabel, isActive && styles.mobileTabLabelActive]}>
                {copy.common[item.labelKey] || item.labelKey}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

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
                  color={isActive ? '#f97316' : '#475569'}
                />
                <Text
                  style={[
                    styles.desktopNavLabel,
                    isActive && styles.desktopNavLabelActive,
                  ]}
                >
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
    paddingHorizontal: 28,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  brandLink: {
    minWidth: 108,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  brandLogo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.28 }],
  },
  desktopNavLinksRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  desktopNavLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  desktopNavLinkActive: {
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
  },
  desktopNavLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopNavLabelActive: {
    color: '#f97316',
  },
  desktopActionsRow: {
    minWidth: 248,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  languageSelectorWrap: {
    position: 'relative',
    zIndex: 1200,
  },
  utilityPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  utilityPillText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  languageOverlay: {
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
      },
    }),
    zIndex: 1198,
  },
  languageDropdownCard: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 190,
    maxHeight: 250,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 1199,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 18px 38px rgba(15, 23, 42, 0.16)',
      },
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
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageDropdownItemActive: {
    backgroundColor: '#fff7ed',
  },
  languageDropdownLabel: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '700',
  },
  languageDropdownLabelActive: {
    color: '#f97316',
  },
  // Profile Dropdown Styles
  profileDropdownWrap: {
    position: 'relative',
    zIndex: 1200,
  },
  profileIconButton: {
    width: 42,
    height: 42,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileOverlay: {
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
      },
    }),
    zIndex: 1198,
  },
  profileDropdownCard: {
    position: 'absolute',
    top: 56,
    right: 0,
    width: 200,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 1199,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 18px 38px rgba(15, 23, 42, 0.16)',
      },
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
  profileDropdownText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutItem: {
    marginBottom: 4,
  },
  logoutText: {
    color: '#ef4444',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  primaryActionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  mobileBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffdf8',
    borderTopWidth: 1,
    borderTopColor: '#f1e5d3',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
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
    gap: 4,
  },
  mobileTabIconWrap: {
    width: 42,
    height: 42,
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
    fontSize: 11,
    fontWeight: '700',
  },
  mobileTabLabelActive: {
    color: '#f97316',
  },
});
