import { StyleSheet } from 'react-native';

const MyNetworkStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },

  // ── Metrics Cards ──
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  metricPrimary: { 
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  metricAccent: {  
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.3,
  },

  // ── Main Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
  },

  // ── Search Bar ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 0,
    fontWeight: '500',
  },

  // ── Results Info ──
  resultsInfo: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 12,
    fontWeight: '600',
    backgroundColor: '#fff7ed',
    padding: 8,
    borderRadius: 12,
    textAlign: 'center',
  },

  // ── Table Styles ──
  tableWrap: {
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#bbf7d0',
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    backgroundColor: '#fffaf5',
  },
  currentUserRow: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },

  // ── Column Widths ──
  colUser: {
    flex: 1.4,
    paddingRight: 8,
  },
  colReferred: {
    flex: 1.2,
    paddingRight: 8,
  },
  colLevel: {
    width: 55,
    alignItems: 'center',
  },
  colCommission: {
    width: 75,
    alignItems: 'center',
  },
  colAction: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Cell Content ──
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
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
    marginTop: 4,
    fontSize: 10,
    color: '#000000',
    fontWeight: '500',
  },
  rowText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },

  // ── Level Badge ──
  levelBadge: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  currentLevelBadge: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  currentLevelBadgeText: {
    color: '#000000',
  },

  // ── Commission Text ──
  commissionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // ── Action Button ──
  viewBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  // ── Pagination ──
  paginationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pageBtn: {
    minWidth: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  pageBtnActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },
  pageInfo: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },

  // ── Status States ──
  loadingText: {
    fontSize: 14,
    color: '#000000',
    paddingVertical: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#000000',
    paddingVertical: 30,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    marginTop: 10,
  },
});

export default MyNetworkStyles;