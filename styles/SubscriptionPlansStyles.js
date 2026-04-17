import { StyleSheet } from 'react-native';

const SubscriptionPlansStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
    boxShadow: '0px 8px 18px rgba(15, 23, 42, 0.06)',
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  ownerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  ownerEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },

  // ── Active Banner ──
  activeBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  activeBannerLeft: {
    flex: 1,
  },
  activeBannerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  activeBannerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  activeBannerMeta: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
  },
  activeBannerIcon: {
    marginLeft: 12,
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    boxShadow: '0px 6px 16px rgba(15, 23, 42, 0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },

  // ── Plan Card ──
  planCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  planCardActive: {
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  planTitleWrap: {
    flex: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  planDuration: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563eb',
    marginBottom: 10,
  },

  // ── Active Pill ──
  activePill: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  activePillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Features ──
  featuresList: {
    marginBottom: 12,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    marginTop: 1,
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },

  // ── Plan Actions ──
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default SubscriptionPlansStyles;