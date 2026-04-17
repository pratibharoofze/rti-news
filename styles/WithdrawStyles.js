import { StyleSheet } from 'react-native';

const WithdrawStyles = StyleSheet.create({
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

  // ── Hero Card ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  // ── Balance Card ──
  balanceCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },

  // ── Table Top Row ──
  tableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // ── Form Inputs ──
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  hintText: {
    marginTop: 5,
    fontSize: 11,
    color: '#94a3b8',
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
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modeBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  modeBtnTextActive: {
    color: '#ffffff',
  },

  // ── Submit Button ──
  submitButton: {
    marginTop: 6,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
    padding: 0,
  },

  // ── Request Card ──
  requestCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  requestCardEven: {
    backgroundColor: '#f8fafc',
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
    color: '#0f172a',
  },

  // ── Status Badge ──
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPending:  { backgroundColor: '#fef3c7' },
  statusApproved: { backgroundColor: '#dcfce7' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextPending:  { color: '#92400e' },
  statusTextApproved: { color: '#166534' },
  statusTextRejected: { color: '#991b1b' },

  // ── Request Meta ──
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  requestMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  requestMetaBold: {
    fontWeight: '700',
    color: '#334155',
  },
  requestDate: {
    marginTop: 6,
    fontSize: 11,
    color: '#94a3b8',
  },

  // ── Pagination ──
  paginationWrap: {
    marginTop: 14,
    gap: 8,
  },
  paginationInfo: {
    fontSize: 12,
    color: '#64748b',
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
    borderColor: '#e2e8f0',
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
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pageBtnDisabled: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
    elevation: 0,
    shadowOpacity: 0,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 14,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default WithdrawStyles;