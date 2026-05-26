import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FARMING_MENU = [
  {
    id: 'sell',
    label: 'Sell',
    icon: 'storefront-outline',
    iconStyle: 'green',
    desc: 'List your farm produce or equipment for sale',
    screen: 'Sell',
  },
  {
    id: 'give-rent',
    label: 'Give on rent',
    icon: 'arrow-up-circle-outline',
    iconStyle: 'blue',
    desc: 'Rent out your farming equipment or land',
    screen: 'FarmingGiveOnRent',
  },
  {
    id: 'buy',
    label: 'Buy',
    icon: 'cart-outline',
    iconStyle: 'amber',
    desc: 'Browse and buy farm produce or equipment',
    screen: 'FarmingBuy',
  },
  {
    id: 'take-rent',
    label: 'Take on rent',
    icon: 'arrow-down-circle-outline',
    iconStyle: 'purple',
    desc: 'Rent farming equipment or land from others',
    screen: 'FarmingTakeOnRent',
  },
];

const ICON_STYLES = {
  green:  { bg: '#f0fdf4', border: '#dcfce7', color: '#16a34a' },
  blue:   { bg: '#eff6ff', border: '#dbeafe', color: '#2563eb' },
  amber:  { bg: '#fffbeb', border: '#fef3c7', color: '#d97706' },
  purple: { bg: '#f5f3ff', border: '#ede9fe', color: '#7c3aed' },
};

function openFarmingMenuItem(navigation, item) {
  if (item.id === 'sell') {
    navigation.navigate('Sell');
    return;
  }

  navigation.navigate(item.screen);
}

// ─── Mobile Layout ────────────────────────────────────────────────────────────

function FarmingMobile({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={{ height: insets.top, backgroundColor: '#fff' }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#334155" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Farming (buy / sell)</Text>
          <Text style={styles.headerSubtitle}>Buy, sell or rent farming resources</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Ionicons name="leaf" size={28} color="#16a34a" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Farming Marketplace</Text>
            <Text style={styles.bannerSub}>Connect with farmers & buyers across your region</Text>
          </View>
        </View>

        {/* Menu Items */}
        <Text style={styles.sectionLabel}>What would you like to do?</Text>

        {FARMING_MENU.map((item, idx) => {
          const ic = ICON_STYLES[item.iconStyle];
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => openFarmingMenuItem(navigation, item)}
              activeOpacity={0.6}
            >
              <View style={[styles.iconWrap, { backgroundColor: ic.bg, borderColor: ic.border }]}>
                <Ionicons name={item.icon} size={22} color={ic.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Web Layout ───────────────────────────────────────────────────────────────

function FarmingWeb({ navigation }) {
  React.useEffect(() => {
    const id = 'farming-web-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif&display=swap');
      @keyframes farmFadeUp {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .farm-root { display: flex; flex-direction: column; height: 100vh; font-family: 'DM Sans', sans-serif; background: #f5f4f0; }
      .farm-topbar { height: 60px; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.07); display: flex; align-items: center; padding: 0 24px; gap: 14px; }
      .farm-logo { font-family: 'Instrument Serif', serif; font-size: 20px; color: #1e293b; flex: 1; }
      .farm-logo span { color: #94a3b8; }
      .farm-main { flex: 1; display: flex; align-items: flex-start; justify-content: center; padding: 48px 24px; overflow-y: auto; }
      .farm-card-wrap { width: 100%; max-width: 600px; }
      .farm-page-title { font-family: 'Instrument Serif', serif; font-size: 30px; color: #1e293b; margin-bottom: 6px; }
      .farm-page-sub { font-size: 14px; color: #94a3b8; margin-bottom: 32px; }
      .farm-banner { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
      .farm-banner-icon { width: 52px; height: 52px; border-radius: 14px; background: #dcfce7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 26px; }
      .farm-banner-title { font-size: 16px; font-weight: 700; color: #1e293b; }
      .farm-banner-sub { font-size: 13px; color: #64748b; margin-top: 3px; }
      .farm-sec-label { font-size: 10px; font-weight: 600; letter-spacing: 1.3px; text-transform: uppercase; color: #cbd5e1; margin-bottom: 12px; }
      .farm-menu-item { background: #fff; border: 1px solid rgba(0,0,0,0.07); border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; margin-bottom: 10px; animation: farmFadeUp 0.3s ease both; transition: border-color 0.18s, transform 0.14s, box-shadow 0.18s; }
      .farm-menu-item:hover { border-color: rgba(0,0,0,0.15); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.05); }
      .farm-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .farm-label { font-size: 15px; font-weight: 700; color: #1e293b; }
      .farm-desc { font-size: 13px; color: #94a3b8; margin-top: 3px; }
      .farm-arrow { margin-left: auto; font-size: 18px; color: #e2e8f0; }
    `;
    document.head.appendChild(el);
  }, []);

  const webItems = FARMING_MENU.map((item) => {
    const ic = ICON_STYLES[item.iconStyle];
    return (
      <div
        key={item.id}
        className="farm-menu-item"
        onClick={() => openFarmingMenuItem(navigation, item)}
      >
        <div className="farm-icon" style={{ background: ic.bg }}>
          <Ionicons name={item.icon} size={24} color={ic.color} />
        </div>
        <div>
          <div className="farm-label">{item.label}</div>
          <div className="farm-desc">{item.desc}</div>
        </div>
        <span className="farm-arrow">↗</span>
      </div>
    );
  });

  return (
    <div className="farm-root">
      <div className="farm-topbar">
        <div className="farm-logo">News<span>Hub</span></div>
        <button
          onClick={() => navigation.goBack()}
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 9, padding: '6px 14px', fontSize: 13, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← Back
        </button>
      </div>
      <div className="farm-main">
        <div className="farm-card-wrap">
          <div className="farm-page-title">Farming (buy / sell)</div>
          <div className="farm-page-sub">Buy, sell or rent farming resources in your region</div>
          <div className="farm-banner">
            <div className="farm-banner-icon">🌾</div>
            <div>
              <div className="farm-banner-title">Farming Marketplace</div>
              <div className="farm-banner-sub">Connect with farmers & buyers across your region</div>
            </div>
          </div>
          <div className="farm-sec-label">What would you like to do?</div>
          {webItems}
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function FarmingScreen({ navigation }) {
  if (Platform.OS === 'web') return <FarmingWeb navigation={navigation} />;
  return <FarmingMobile navigation={navigation} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  headerSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

  listContainer: { paddingHorizontal: 16, paddingTop: 16 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bannerIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  bannerSub: { fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 18 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  menuDesc: { fontSize: 12, color: '#94a3b8', marginTop: 3, lineHeight: 18 },
});
