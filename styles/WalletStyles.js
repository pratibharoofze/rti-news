import { StyleSheet, Platform, StatusBar } from 'react-native';

// Pink tokens (mobile)
const PINK       = '#FF2D78';
const PINK_LIGHT = '#FFF0F5';
const PINK_BORDER= '#FFE4EF';

export default StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root: { flex: 1, backgroundColor: '#F7F7F9' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 110 },

  // ── Top Bar ───────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 54,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: PINK_LIGHT, borderRadius: 10,
  },
  backButtonText: { color: PINK, fontSize: 14, fontWeight: '700' },
  headerTitle:    { fontSize: 18, fontWeight: '800', color: '#111111' },
  headerSpacer:   { width: 70 },

  // ── HERO BALANCE CARD ─────────────────────────────────────────────────────
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: PINK,
    padding: 24,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  heroIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBalanceLbl: {
    fontSize: 12, fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 44, fontWeight: '800',
    color: '#ffffff', letterSpacing: -1,
    marginBottom: 4,
  },
  heroHint: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },

  // Mini stats inside hero
  heroStatsRow: {
    flexDirection: 'row', gap: 10, marginTop: 20,
  },
  heroStat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 12,
  },
  heroStatIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  heroStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 2 },
  heroStatVal: { fontSize: 16, fontWeight: '800', color: '#ffffff' },

  // ── SECTION HEADER ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 10, marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111111' },
  sectionBadge: {
    backgroundColor: PINK_LIGHT, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: PINK_BORDER,
  },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: PINK },

  // ── LATEST TRANSACTION CARD ───────────────────────────────────────────────
  latestCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: '#ffffff', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
  },
  latestCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  latestCardTitle: { fontSize: 14, fontWeight: '700', color: '#111111' },
  sourceBadge: {
    backgroundColor: PINK_LIGHT, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: PINK_BORDER,
  },
  sourceBadgeText: { fontSize: 11, fontWeight: '700', color: PINK },
  latestRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  latestLbl:  { fontSize: 10, color: '#AAAAAA', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  latestAmt:  { fontSize: 26, fontWeight: '800', color: '#111111' },
  latestDate: { fontSize: 12, color: '#AAAAAA' },

  typePillCredit: {
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: PINK_LIGHT, borderWidth: 1, borderColor: PINK_BORDER, borderRadius: 20,
  },
  typePillDebit: {
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20,
  },
  typeTxtCredit: { fontSize: 12, fontWeight: '700', color: PINK },
  typeTxtDebit:  { fontSize: 12, fontWeight: '700', color: '#DC2626' },

  // ── TRANSACTION TABLE ─────────────────────────────────────────────────────
  tableWrap: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row', backgroundColor: PINK_LIGHT,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: PINK_BORDER,
  },
  tableHeaderText: {
    fontSize: 10, fontWeight: '800', color: PINK,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F7F7F9',
    backgroundColor: '#ffffff',
  },
  tableRowEven: { backgroundColor: '#FFFAFC' },

  colAmount: { flex: 1 },
  colType:   { flex: 0.9, alignItems: 'flex-start' },
  colSource: { flex: 1.3 },
  colDate:   { flex: 1.1, alignItems: 'flex-end' },

  amountCredit: { fontSize: 13, fontWeight: '800', color: PINK },
  amountDebit:  { fontSize: 13, fontWeight: '800', color: '#EF4444' },

  typePill: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  typePillTextCredit: { fontSize: 11, fontWeight: '700', color: PINK },
  typePillTextDebit:  { fontSize: 11, fontWeight: '700', color: '#EF4444' },
  rowText:   { fontSize: 12, color: '#555555', fontWeight: '500' },

  // ── PAGINATION ────────────────────────────────────────────────────────────
  paginationWrap: { marginTop: 12, gap: 8 },
  paginationInfo: {
    fontSize: 12, color: PINK, textAlign: 'center', fontWeight: '600',
    backgroundColor: PINK_LIGHT, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'center', borderWidth: 1, borderColor: PINK_BORDER,
  },
  paginationControls: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 34, height: 34, borderRadius: 9,
    borderWidth: 1, borderColor: PINK_BORDER,
    backgroundColor: '#ffffff', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 8,
  },
  pageBtnActive:   { backgroundColor: PINK, borderColor: PINK },
  pageBtnDisabled: { backgroundColor: PINK_LIGHT, borderColor: PINK_BORDER, opacity: 0.5 },
  pageBtnText:     { fontSize: 13, fontWeight: '700', color: PINK },
  pageBtnTextActive: { color: '#ffffff' },

  // ── STATES ────────────────────────────────────────────────────────────────
  loadingText: { fontSize: 13, color: '#AAAAAA', paddingVertical: 20, textAlign: 'center' },
  emptyText:   {
    fontSize: 13, color: '#AAAAAA', paddingVertical: 24, textAlign: 'center',
    backgroundColor: PINK_LIGHT, borderRadius: 14, borderWidth: 1, borderColor: PINK_BORDER,
    marginHorizontal: 16,
  },
});