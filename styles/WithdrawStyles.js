import { StyleSheet } from 'react-native';

const WithdrawStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#fdf6f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Back Button ──
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  backBtnText: {
    color: '#e8603c',
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: '#e8603c',
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    shadowColor: '#e8603c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },

  // ── Balance Card ──
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f0e6e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e8603c',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a1a2e',
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0e6e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 16,
  },

  // ── Table Top Row ──
  tableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordCount: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
  },

  // ── Form Inputs ──
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 7,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ece4df',
    borderRadius: 12,
    backgroundColor: '#fdf6f0',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#e8603c',
    backgroundColor: '#fff5f2',
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: '#e8603c',
    fontWeight: '600',
  },
  hintText: {
    marginTop: 5,
    fontSize: 11,
    color: '#bbb',
  },

  // ── Payment Mode Toggle ──
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ece4df',
    backgroundColor: '#fdf6f0',
  },
  modeBtnActive: {
    backgroundColor: '#e8603c',
    borderColor: '#e8603c',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  modeBtnTextActive: {
    color: '#ffffff',
  },

  // ── Submit Button ──
  submitButton: {
    marginTop: 8,
    backgroundColor: '#e8603c',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#e8603c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Withdraw Meta Row (image style) ──
  withdrawMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  withdrawMetaItem: {
    gap: 2,
  },
  withdrawMetaLabel: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '600',
  },
  withdrawMetaValue: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '700',
  },

  // ── Transfer Full Amount Checkbox Row ──
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#ece4df',
    backgroundColor: '#fdf6f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: '#e8603c',
    borderColor: '#e8603c',
  },
  checkLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf6f0',
    borderWidth: 1.5,
    borderColor: '#ece4df',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '500',
    padding: 0,
  },

  // ── Request Card ──
  requestCard: {
    borderWidth: 1,
    borderColor: '#f0e6e0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  requestCardEven: {
    backgroundColor: '#fdf6f0',
  },
  requestCardLast: {
    marginBottom: 0,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },

  // ── Status Badge ──
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPending:  { backgroundColor: '#fff4e0' },
  statusApproved: { backgroundColor: '#e0f7f0' },
  statusRejected: { backgroundColor: '#ffe0dc' },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextPending:  { color: '#c47a00' },
  statusTextApproved: { color: '#1a8f6a' },
  statusTextRejected: { color: '#c0392b' },

  // ── Request Meta ──
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  requestMeta: {
    fontSize: 13,
    color: '#888',
  },
  requestMetaBold: {
    fontWeight: '700',
    color: '#444',
  },
  requestDate: {
    marginTop: 6,
    fontSize: 11,
    color: '#bbb',
  },

  // ── Pagination ──
  paginationWrap: {
    marginTop: 14,
    gap: 8,
  },
  paginationInfo: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ece4df',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  pageBtnActive: {
    backgroundColor: '#e8603c',
    borderColor: '#e8603c',
  },
  pageBtnDisabled: {
    backgroundColor: '#fdf6f0',
    borderColor: '#f0e6e0',
    elevation: 0,
    shadowOpacity: 0,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#aaa',
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a8f6a',
    textAlign: 'center',
    marginBottom: 14,
    backgroundColor: '#e0f7f0',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b2ead8',
  },
  emptyText: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default WithdrawStyles;