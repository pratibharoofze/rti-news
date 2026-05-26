import { Platform, StatusBar, StyleSheet } from 'react-native';

const SAFE_TOP = Platform.OS === 'android'
  ? (StatusBar.currentHeight || 24) + 4
  : 50;

const PINK       = '#FF2D78';
const PINK_LIGHT = '#fff0f5';
const PINK_BORDER= '#ffd6e7';

// ── Web / Orange theme tokens ──
const ORANGE       = '#e8603c';
const ORANGE_LIGHT = '#fff4f0';
const ORANGE_BORDER= '#ffd0c0';

const WithdrawStyles = StyleSheet.create({

  // ══════════════════════════════════════════════════════
  //  MOBILE — original styles (untouched)
  // ══════════════════════════════════════════════════════

  root: { flex: 1, backgroundColor: '#f8f9fb' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 8 },

  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: SAFE_TOP, paddingBottom: 12, gap: 6,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f2f7',
  },
  backBtnText: { color: PINK, fontSize: 14, fontWeight: '600' },

  heroCard: {
    backgroundColor: PINK, borderRadius: 20, padding: 22,
    marginBottom: 14, marginTop: 14,
    shadowColor: PINK, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 14, elevation: 6,
  },
  heroEyebrow: {
    fontSize: 11, color: 'rgba(255,255,255,0.78)', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },

  balanceCard: {
    backgroundColor: '#ffffff', borderRadius: 18, padding: 18, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: PINK_BORDER,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontSize: 11, fontWeight: '700', color: PINK,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
  },
  balanceValue: { fontSize: 30, fontWeight: '800', color: '#0f172a' },

  card: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#eef0f5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 16 },

  tableTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  recordCount: { fontSize: 12, color: '#b0b8cc', fontWeight: '600' },

  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7,
  },
  input: {
    borderWidth: 1.5, borderColor: '#e8ecf4', borderRadius: 14,
    backgroundColor: '#f8f9fb', paddingHorizontal: 14, paddingVertical: 13,
    color: '#0f172a', fontSize: 15, fontWeight: '600',
  },
  inputError: { borderColor: PINK, backgroundColor: '#fff5f9' },
  errorText: { marginTop: 5, fontSize: 12, color: PINK, fontWeight: '600' },
  hintText: { marginTop: 5, fontSize: 11, color: '#b0b8cc' },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e8ecf4', backgroundColor: '#f8f9fb',
  },
  modeBtnActive: { backgroundColor: PINK, borderColor: PINK },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  modeBtnTextActive: { color: '#ffffff' },

  submitButton: {
    marginTop: 8, backgroundColor: PINK, borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
    shadowColor: PINK, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  withdrawMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  withdrawMetaItem: { gap: 2 },
  withdrawMetaLabel: { fontSize: 11, color: '#b0b8cc', fontWeight: '600' },
  withdrawMetaValue: { fontSize: 13, color: '#0f172a', fontWeight: '700' },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 4 },
  checkBox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#e8ecf4', backgroundColor: '#f8f9fb',
    alignItems: 'center', justifyContent: 'center',
  },
  checkBoxActive: { backgroundColor: PINK, borderColor: PINK },
  checkLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fb',
    borderWidth: 1.5, borderColor: '#e8ecf4', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0f172a', fontWeight: '500', padding: 0 },

  requestCard: {
    borderWidth: 1, borderColor: '#eef0f5', borderRadius: 16,
    padding: 14, marginBottom: 10, backgroundColor: '#ffffff',
  },
  requestCardEven: { backgroundColor: '#fafbfd' },
  requestCardLast: { marginBottom: 0 },
  requestTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  requestAmount: { fontSize: 20, fontWeight: '800', color: '#0f172a' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusPending:  { backgroundColor: '#fff4e0' },
  statusApproved: { backgroundColor: '#e6faf3' },
  statusRejected: { backgroundColor: PINK_LIGHT },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  statusTextPending:  { color: '#c47a00' },
  statusTextApproved: { color: '#14b87a' },
  statusTextRejected: { color: PINK },

  requestMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  requestMeta: { fontSize: 13, color: '#94a3b8' },
  requestMetaBold: { fontWeight: '700', color: '#475569' },
  requestDate: { marginTop: 6, fontSize: 11, color: '#b0b8cc' },

  paginationWrap: { marginTop: 14, gap: 8 },
  paginationInfo: { fontSize: 12, color: '#94a3b8', textAlign: 'center', fontWeight: '500' },
  paginationControls: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 32, height: 32, borderRadius: 8,
    borderWidth: 1, borderColor: '#e8ecf4', backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
  },
  pageBtnActive: { backgroundColor: PINK, borderColor: PINK },
  pageBtnDisabled: { backgroundColor: '#f8f9fb', borderColor: '#eef0f5', elevation: 0, shadowOpacity: 0 },
  pageBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  pageBtnTextActive: { color: '#ffffff' },

  loadingText: { fontSize: 13, color: '#b0b8cc' },
  successText: {
    fontSize: 14, fontWeight: '700', color: '#14b87a',
    textAlign: 'center', marginBottom: 14, backgroundColor: '#e6faf3',
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#b2ead8',
  },
  emptyText: { fontSize: 13, color: '#b0b8cc', textAlign: 'center', paddingVertical: 8 },

  // ══════════════════════════════════════════════════════
  //  WEB — Orange centered layout (Image 1 style)
  // ══════════════════════════════════════════════════════

  // Full page grey bg, scrollable
  webPage: {
    flexGrow: 1,
    backgroundColor: '#f5f5f8',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },

  // Back button row at top
  webBackBtn: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',  // ← center → flex-start
},
  webBackBtnText: { fontSize: 14, color: ORANGE, fontWeight: '600' },

  // Single centered card (like image 1 bottom-left card)
  webCard: {
    width: '100%',
    maxWidth: 950,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },

  // Card body padding
  webCardBody: {
    padding: 24,
  },

  // Section title like "WITHDRAW EARNING"
  webSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
    marginBottom: 14,
  },

  // Meta row: Transfer mode + Acc number
  webMetaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  webMetaItem: { gap: 3 },
  webMetaLabel: { fontSize: 11, color: '#b0b8cc', fontWeight: '600' },
  webMetaValue: { fontSize: 13, color: '#0f172a', fontWeight: '700' },

  // Input group
  webInputGroup: { marginBottom: 16 },
  webInputLabel: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7,
  },
  webInput: {
    borderWidth: 1.5,
    borderColor: '#e8ecf4',
    borderRadius: 12,
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
    outlineStyle: 'none',
  },
  webInputError: { borderColor: ORANGE, backgroundColor: '#fff8f5' },
  webErrorText: { marginTop: 5, fontSize: 12, color: ORANGE, fontWeight: '600' },
  webHintText: { marginTop: 5, fontSize: 11, color: '#b0b8cc' },

  // Checkbox row
  webCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  webCheckBox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#e8ecf4', backgroundColor: '#f8f9fb',
    alignItems: 'center', justifyContent: 'center',
  },
  webCheckBoxActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  webCheckLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },

  // Payment mode toggle
  webModeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  webModeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e8ecf4', backgroundColor: '#f8f9fb',
  },
  webModeBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  webModeBtnText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  webModeBtnTextActive: { color: '#ffffff' },

  // Submit button — orange, full width
  webSubmitBtn: {
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  webSubmitBtnDisabled: { opacity: 0.55 },
  webSubmitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

  // Balance card inside web
  webBalanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: ORANGE_BORDER,
    marginBottom: 0,
  },
  webBalanceInfo: { flex: 1 },
  webBalanceLabel: {
    fontSize: 11, fontWeight: '700', color: ORANGE,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
  },
  webBalanceValue: { fontSize: 28, fontWeight: '800', color: '#0f172a' },

  // Success message
  webSuccessText: {
    fontSize: 13, fontWeight: '700', color: '#14b87a',
    textAlign: 'center', marginBottom: 14, backgroundColor: '#e6faf3',
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#b2ead8',
  },

  // ── Withdrawal History table (web) ──
  webTableCard: {
    width: '100%',
    maxWidth: 950,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    overflow: 'hidden',
  },
  webTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f7',
  },
  webTableTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  webRecordCount: { fontSize: 12, color: '#b0b8cc', fontWeight: '600' },
  webTableBody: { padding: 16 },

  webSearchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8f9fb', borderWidth: 1.5, borderColor: '#e8ecf4',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 8,
  },
  webSearchInput: { flex: 1, fontSize: 13, color: '#0f172a', fontWeight: '500', padding: 0, outlineStyle: 'none' },

  webRequestCard: {
    borderWidth: 1, borderColor: '#eef0f5', borderRadius: 14,
    padding: 14, marginBottom: 10, backgroundColor: '#ffffff',
  },
  webRequestCardEven: { backgroundColor: '#fafbfd' },
  webRequestTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  webRequestAmount: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  webRequestMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  webRequestMeta: { fontSize: 12, color: '#94a3b8' },
  webRequestMetaBold: { fontWeight: '700', color: '#475569' },
  webRequestDate: { marginTop: 6, fontSize: 11, color: '#b0b8cc' },

  webPaginationWrap: { marginTop: 12, gap: 8 },
  webPaginationInfo: { fontSize: 12, color: '#94a3b8', textAlign: 'center', fontWeight: '500' },
  webPaginationControls: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5, flexWrap: 'wrap',
  },
  webPageBtn: {
    minWidth: 32, height: 32, borderRadius: 8,
    borderWidth: 1, borderColor: '#e8ecf4', backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  webPageBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  webPageBtnDisabled: { backgroundColor: '#f8f9fb', borderColor: '#eef0f5' },
  webPageBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  webPageBtnTextActive: { color: '#ffffff' },

  webEmptyText: { fontSize: 13, color: '#b0b8cc', textAlign: 'center', paddingVertical: 12 },
  webLoadingText: { fontSize: 13, color: '#b0b8cc', textAlign: 'center', paddingVertical: 12 },
});

export default WithdrawStyles; 