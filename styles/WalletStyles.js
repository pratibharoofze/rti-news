import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
    marginBottom: 12,
  },

  // ── Metrics Grid ──
  metricsGrid: {
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCardHalf: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  balanceCard: {
    backgroundColor: '#eff6ff',
  },
  creditCard: {
    backgroundColor: '#f0fdf4',
  },
  debitCard: {
    backgroundColor: '#fef2f2',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricHint: {
    fontSize: 11,
    color: '#94a3b8',
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

  // ── Table Top Row (title + count) ──
  tableTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  recordCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // ── Latest Transaction Card ──
  latestCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  latestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'capitalize',
  },
  latestDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  latestAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  latestLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  // ── Transaction Table ──
  tableWrap: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },

  // ── Table Columns ──
  colAmount: {
    flex: 1,
  },
  colType: {
    flex: 1,
    alignItems: 'flex-start',
  },
  colSource: {
    flex: 1.2,
  },
  colDate: {
    flex: 1.2,
    alignItems: 'flex-end',
  },

  // ── Type Pill ──
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  typePillCredit: {
    backgroundColor: '#dcfce7',
  },
  typePillDebit: {
    backgroundColor: '#fee2e2',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  typePillTextCredit: {
    color: '#16a34a',
  },
  typePillTextDebit: {
    color: '#dc2626',
  },

  rowSecondary: {
    fontSize: 12,
    color: '#64748b',
  },

  // ── Amount Colors ──
  creditValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16a34a',
  },
  debitValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
  },

  // ── Pagination ──
  paginationWrap: {
    marginTop: 14,
    gap: 10,
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
    gap: 6,
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 34,
    height: 34,
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
    fontSize: 13,
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
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
  },
});