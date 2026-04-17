import { StyleSheet } from 'react-native';

const MyNetworkStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Hero ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    elevation: 4,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Metrics ──
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  metricPrimary: { backgroundColor: '#dbeafe' },
  metricAccent:  { backgroundColor: '#dcfce7' },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  // ── Search bar ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 0,
  },

  // ── Results info ──
  resultsInfo: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 10,
    fontWeight: '600',
  },

  // ── Table ──
  tableWrap: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  currentUserRow: {
    backgroundColor: '#eff6ff',
  },

  // ── Column widths ──
  colUser: {
    flex: 1.4,
    paddingRight: 6,
  },
  colReferred: {
    flex: 1.2,
    paddingRight: 6,
  },
  colLevel: {
    width: 48,
    alignItems: 'center',
  },
  colCommission: {
    width: 66,
    alignItems: 'center',
  },
  colAction: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Cell text ──
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowBadge: {
    marginTop: 1,
  },
  rowSubText: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748b',
  },
  rowText: {
    fontSize: 12,
    color: '#334155',
  },

  // ── Level badge ──
  levelBadge: {
    minWidth: 36,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
  },
  currentLevelBadge: {
    backgroundColor: '#dbeafe',
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  currentLevelBadgeText: {
    color: '#1e40af',
  },

  // ── Commission ──
  commissionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },

  // ── View button only ──
  viewBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Pagination ──
  paginationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pageBtn: {
    minWidth: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
  },
  pageBtnActive: {
    backgroundColor: '#2563eb',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },
  pageInfo: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    paddingVertical: 8,
    textAlign: 'center',
  },
});

export default MyNetworkStyles;
