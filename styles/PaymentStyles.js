import { StyleSheet } from 'react-native';

const PaymentStyles = StyleSheet.create({
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
    boxShadow: '0px 8px 18px rgba(15, 23, 42, 0.06)',
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: { flex: 1 },
  ownerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  ownerEmail: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },

  // ── Order Card ──
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 4,
    boxShadow: '0px 10px 24px rgba(37, 99, 235, 0.10)',
    borderWidth: 1.5,
    borderColor: '#dbeafe',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  orderIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderHeaderInfo: {
    flex: 1,
  },
  orderPlanName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderIdText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2563eb',
  },

  // ── Pay Button ──
  payBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  paymentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  paymentBadgeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  testHelperCard: {
    marginTop: 14,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  testHelperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  testHelperTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  testHelperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
  },
  testHelperValue: {
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── No Order Card ──
  noOrderCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  noOrderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16a34a',
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

  // ── History Card ──
  historyCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  historyMetaBold: {
    fontWeight: '700',
    color: '#334155',
  },

  // ── Status Badge ──
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPending: { backgroundColor: '#fef3c7' },
  statusSuccess: { backgroundColor: '#dcfce7' },
  statusFailed:  { backgroundColor: '#fee2e2' },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextPending: { color: '#92400e' },
  statusTextSuccess: { color: '#166534' },
  statusTextFailed:  { color: '#991b1b' },

  // ── View Status Button ──
  viewStatusBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  viewStatusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalStatusWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  modalStatusText: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  modalInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
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
});

export default PaymentStyles;
