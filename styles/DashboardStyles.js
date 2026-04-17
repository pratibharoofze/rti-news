import { StyleSheet } from 'react-native';

const DashboardStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
  contentPadding: { padding: 16, paddingBottom: 32 },

  // ── Welcome Banner ───────────────────────────────
  welcomeBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  welcomeLeft: { flex: 1 },
  welcomeGreeting: { fontSize: 12, color: '#64748b', marginBottom: 2 },
  welcomeText: { fontSize: 22, color: '#0f172a', fontWeight: '800', marginBottom: 2 },
  welcomeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  welcomeBadgeIcon: {
    marginTop: 2,
  },
  welcomeSub: { fontSize: 12, color: '#475569', marginBottom: 4 },
  welcomeBadge: {
    backgroundColor: '#22c55e22',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#22c55e44',
  },
  welcomeBadgeText: { color: '#16a34a', fontSize: 11, fontWeight: '600' },

  // ── Stats Row — 3 cards ──────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#64748b', fontWeight: '500', textAlign: 'center' },

  // ── Filter ───────────────────────────────────────
  filterScroll: { marginBottom: 6 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: { color: '#475569', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  // ── Section / Card ───────────────────────────────
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },

  // ── Featured Card ────────────────────────────────
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuredBadge: {
    backgroundColor: '#f59e0b22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#f59e0b44',
  },
  featuredBadgeText: { color: '#d97706', fontSize: 10, fontWeight: '700' },
  featuredTitle: {
    fontSize: 17,
    color: '#0f172a',
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMeta: { color: '#64748b', fontSize: 11 },

  // ── News Cards ───────────────────────────────────
  cardLeft: { flexDirection: 'row', gap: 12 },
  catDot: { width: 3, borderRadius: 2, minHeight: 60 },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catLabel: { fontSize: 11, fontWeight: '700' },
  cardTime: { fontSize: 10, color: '#64748b' },
  newsTitle: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: { color: '#64748b', fontSize: 11 },
  cardActions: { flexDirection: 'row', gap: 8 },
  bookmarkBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center',
  },
  shareBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center', alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catText: { fontSize: 11, fontWeight: '700' },
  readBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  readBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default DashboardStyles;
