import { StyleSheet } from 'react-native';

// ─── Design Tokens ─────────────────────────────────────────────────────────
// Pink        : #e8732a
// Pink Light  : #FFF4EC
// Pink Border : #F8C29B
// White       : #ffffff
// Page BG     : #F8F8F8
// Text Dark   : #111111
// Text Muted  : #888888
// Border      : #EEEEEE

const MyNetworkStyles = StyleSheet.create({

  // ─── Root ────────────────────────────────────────────────────────────────
  root:        { flex: 1, backgroundColor: '#F8F8F8' },
  scrollView:  { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 110 },

  // ─── Top Bar ─────────────────────────────────────────────────────────────
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topBarBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF4EC',
    borderWidth: 1, borderColor: '#F8C29B',
  },
  topBarTitle: {
    fontSize: 16, fontWeight: '700', color: '#111111',
  },

  // Back button row (full touchable row at top) — replaces inline style
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    gap: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtnIcon: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8C29B',
    borderWidth: 1, borderColor: '#F8C29B',
  },
  backBtnText: {
    fontSize: 15, fontWeight: '700', color: '#111111',
  },

  // ─── Metrics Row ─────────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  metricCard: {
    flex: 1, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 14,
    elevation: 1,
  },
  metricPrimary:   { backgroundColor: '#FFF4EC', borderWidth: 1, borderColor: '#F8C29B' },
  metricAccent:    { backgroundColor: '#ffffff',  borderWidth: 1, borderColor: '#EEEEEE' },
  metricValue:     { fontSize: 26, fontWeight: '800', color: '#111111', marginBottom: 4 },
  metricLabel:     { fontSize: 12, fontWeight: '600', color: '#888888' },

  // ─── Main Card ───────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18, padding: 16, marginBottom: 12,
    elevation: 1, borderWidth: 1, borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 17, fontWeight: '800', color: '#111111', marginBottom: 14,
  },

  // ─── Search Bar ──────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#EEEEEE',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#111111',
    paddingVertical: 0, fontWeight: '500',
  },

  // ─── Results Info ────────────────────────────────────────────────────────
  resultsInfo: {
    fontSize: 12, color: '#888888', marginBottom: 10,
    fontWeight: '600', backgroundColor: '#FFF4EC',
    padding: 8, borderRadius: 10, textAlign: 'center',
  },

  // ─── Table ───────────────────────────────────────────────────────────────
  tableWrap: {
    borderWidth: 1, borderColor: '#EEEEEE',
    borderRadius: 16, overflow: 'hidden',
    marginBottom: 14, backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF4EC',
    paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: '#F8C29B',
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 10, fontWeight: '800', color: '#e8732a',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 13, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    alignItems: 'center', backgroundColor: '#ffffff',
  },
  tableRowEven:    { backgroundColor: '#FAFAFA' },
  currentUserRow:  {
    backgroundColor: '#FFF4EC',
    borderLeftWidth: 3, borderLeftColor: '#e8732a',
  },

  // ─── Column Widths ───────────────────────────────────────────────────────
  colUser:       { flex: 1.4, paddingRight: 8 },
  colReferred:   { flex: 1.2, paddingRight: 8 },
  colLevel:      { width: 55,  alignItems: 'center' },
  colCommission: { width: 75,  alignItems: 'center' },
  colAction:     { width: 40,  alignItems: 'center', justifyContent: 'center' },

  // ─── Cell Content ────────────────────────────────────────────────────────
  rowTitle:     { fontSize: 14, fontWeight: '700', color: '#111111' },
  rowTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rowBadge:     { marginTop: 1 },
  rowSubText:   { marginTop: 3, fontSize: 10, color: '#888888', fontWeight: '500' },
  rowText:      { fontSize: 12, color: '#555555', fontWeight: '500' },

  // ─── Level Badge ─────────────────────────────────────────────────────────
  levelBadge: {
    minWidth: 40, paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#F8F8F8',
    alignItems: 'center', borderWidth: 1, borderColor: '#EEEEEE',
  },
  currentLevelBadge:     { backgroundColor: '#F8C29B', borderColor: '#F8C29B' },
  levelBadgeText:        { fontSize: 11, fontWeight: '800', color: '#555555' },
  currentLevelBadgeText: { color: '#e8732a' },

  // ─── Commission ──────────────────────────────────────────────────────────
  commissionText: { fontSize: 13, fontWeight: '800', color: '#111111' },

  // ─── Action Button ───────────────────────────────────────────────────────
  viewBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#FFF4EC', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F8C29B',
  },

  // ─── Pagination ──────────────────────────────────────────────────────────
  paginationWrap: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginBottom: 10,
  },
  pageBtn: {
    minWidth: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8F8F8', paddingHorizontal: 10,
    borderWidth: 1, borderColor: '#EEEEEE',
  },
  pageBtnActive: {
    backgroundColor: '#e8732a', borderColor: '#e8732a',
    shadowColor: '#e8732a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  pageBtnDisabled:    { opacity: 0.35 },
  pageBtnText:        { fontSize: 14, fontWeight: '700', color: '#555555' },
  pageBtnTextActive:  { color: '#ffffff' },
  pageInfo: {
    fontSize: 12, color: '#888888', textAlign: 'center',
    fontWeight: '600', backgroundColor: '#F8C29B',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'center',
  },

  // ─── States ──────────────────────────────────────────────────────────────
  loadingText: {
    fontSize: 14, color: '#888888',
    paddingVertical: 20, textAlign: 'center', fontWeight: '500',
  },
  emptyText: {
    fontSize: 14, color: '#888888',
    paddingVertical: 28, textAlign: 'center',
    fontWeight: '500', backgroundColor: '#F8C29B',
    borderRadius: 14, marginTop: 10,
  },
});

export default MyNetworkStyles;
