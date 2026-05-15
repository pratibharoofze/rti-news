import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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

  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },

  // ── Balance Hero Card ──
  balanceHeroCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 8,
  },
  balanceHint: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '500',
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  creditStatCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  debitStatCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  creditStatCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  debitStatCard: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },

  // ── Card Common ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fef3c7',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#000000',
  },

  // ── Stats Badge ──
  statsBadge: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  statsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },

  // ── Latest Transaction ──
  latestCard: {
    backgroundColor: '#fffaf5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sourceBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'capitalize',
  },
  latestDate: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  latestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  latestLabel: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  latestCreditAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  latestDebitAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  latestCreditBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  latestDebitBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  latestCreditText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  latestDebitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },

  // ── Transaction Table ──
  tableWrap: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
    backgroundColor: '#ffffff',
  },
  tableRowEven: {
    backgroundColor: '#fffaf5',
  },

  // ── Table Columns ──
  colAmount: {
    flex: 1,
  },
  colType: {
    flex: 0.9,
    alignItems: 'flex-start',
  },
  colSource: {
    flex: 1.3,
  },
  colDate: {
    flex: 1.1,
    alignItems: 'flex-end',
  },

  // ── Amount Text ──
  amountCredit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  amountDebit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },

  // ── Type Pill ──
  typePill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  typePillCredit: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  typePillDebit: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typePillTextCredit: {
    color: '#000000',
  },
  typePillTextDebit: {
    color: '#000000',
  },

  // ── Row Text ──
  rowText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },

  // ── Pagination ──
  paginationWrap: {
    marginTop: 20,
    gap: 12,
  },
  paginationInfo: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pageBtnActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  pageBtnDisabled: {
    backgroundColor: '#fff7ed',
    borderColor: '#fef3c7',
    opacity: 0.6,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  pageBtnTextActive: {
    color: '#ffffff',
  },

  // ── States ──
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
  },
});