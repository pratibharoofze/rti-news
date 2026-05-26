import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import WalletStyles from '../styles/WalletStyles';
import { UserStore } from '../store/UserStore';

const PAGE_SIZE = 10;
const PINK = '#ef810c';

// ─── Amber/Orange tokens (web only) ──────────────────────────────────────────
const O = {
  50:  '#FEF6EC',
  100: '#FDECD8',
  200: '#FBCFA0',
  400: '#ef810c',
  600: '#C8700F',
  800: '#7A420A',
};

// ─── Web styles ───────────────────────────────────────────────────────────────
const w = {
  root: { flex: 1, backgroundColor: '#F7F4F0', flexDirection: 'column', minHeight: '100vh' },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 32, paddingVertical: 14,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#EDE8E1',
  },
  topLeft:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bcStep:     { fontSize: 13, color: '#888888' },
  bcSep:      { fontSize: 15, color: '#CCCCCC', marginHorizontal: 4 },
  bcCur:      { fontSize: 13, fontWeight: '600', color: '#111111' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200], borderRadius: 8,
  },
  backBtnText: { fontSize: 13, fontWeight: '600', color: O[800] },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 60, alignItems: 'center' },
  innerWrap:     { width: '100%', maxWidth: 1100, alignSelf: 'center' },

  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111111', marginBottom: 4 },
  pageSub:   { fontSize: 14, color: '#888888', marginBottom: 26 },

  // ── Top row: hero + stats ──
  topRow:   { flexDirection: 'row', gap: 14, marginBottom: 16 },

  // Hero balance
  heroCard: {
    flex: 1.4, backgroundColor: O[400], borderRadius: 16,
    overflow: 'hidden', padding: 28,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  heroIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBadge: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeTxt: { fontSize: 12, fontWeight: '600', color: '#ffffff' },
  heroLbl:   { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  heroAmt:   { fontSize: 52, fontWeight: '800', color: '#ffffff', letterSpacing: -2, marginBottom: 6 },
  heroHint:  { fontSize: 13, color: 'rgba(255,255,255,0.65)' },

  // Stats column
  statsCol:  { flex: 1, gap: 14 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff',
    borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#EDE8E1', overflow: 'hidden',
  },
  statBar:        { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  statBarCredit:  { backgroundColor: O[400] },
  statBarDebit:   { backgroundColor: '#E24B4A' },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  statIconCredit: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200],
    alignItems: 'center', justifyContent: 'center',
  },
  statIconDebit: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    alignItems: 'center', justifyContent: 'center',
  },
  statBadgeCredit: {
    fontSize: 11, fontWeight: '600', color: O[800],
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200],
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  statBadgeDebit: {
    fontSize: 11, fontWeight: '600', color: '#991B1B',
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  statVal: { fontSize: 24, fontWeight: '800', color: '#111111', marginBottom: 3 },
  statLbl: { fontSize: 12, color: '#888888', fontWeight: '500' },

  // ── Cards ──
  card: {
    backgroundColor: '#ffffff', borderRadius: 14,
    borderWidth: 1, borderColor: '#EDE8E1',
    overflow: 'hidden', marginBottom: 16,
  },
  cardHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F2EE',
  },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle:    { fontSize: 15, fontWeight: '800', color: '#111111' },
  cardSub:      { fontSize: 12, color: '#888888', marginTop: 2 },
  cardBody:     { padding: 20 },

  // Latest tx
  latestWrap: {
    borderWidth: 1, borderColor: '#EDE8E1',
    borderRadius: 12, padding: 18, backgroundColor: '#FDFCFB',
  },
  latestTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 18,
  },
  sourceBadge: {
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200], borderRadius: 20,
  },
  sourceBadgeTxt: { fontSize: 12, fontWeight: '700', color: O[800] },
  latestDate:     { fontSize: 12, color: '#AAAAAA', fontWeight: '500' },
  latestRow:      { flexDirection: 'row', gap: 40 },
  latestLbl:      { fontSize: 10, color: '#AAAAAA', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  latestAmt:      { fontSize: 28, fontWeight: '800', color: '#111111' },
  typePillCredit: { paddingHorizontal: 14, paddingVertical: 5, backgroundColor: O[50], borderWidth: 1, borderColor: O[200], borderRadius: 20 },
  typePillDebit:  { paddingHorizontal: 14, paddingVertical: 5, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20 },
  typeTxtCredit:  { fontSize: 13, fontWeight: '700', color: O[800] },
  typeTxtDebit:   { fontSize: 13, fontWeight: '700', color: '#991B1B' },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[100],
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  pillTxt: { fontSize: 12, fontWeight: '700', color: O[800] },

  // Table
  tblWrap: { borderWidth: 1, borderColor: '#EDE8E1', borderRadius: 12, overflow: 'hidden', marginHorizontal: 20, marginBottom: 4 },
  tblHdr: {
    flexDirection: 'row', backgroundColor: '#FAFAF8',
    paddingVertical: 10, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: '#EDE8E1', alignItems: 'center',
  },
  hc: { fontSize: 10, fontWeight: '800', color: '#999999', textTransform: 'uppercase', letterSpacing: 0.7 },
  trow: {
    flexDirection: 'row', paddingVertical: 13, paddingHorizontal: 18,
    borderBottomWidth: 1, borderBottomColor: '#F5F2EE',
    alignItems: 'center', backgroundColor: '#ffffff',
  },
  trowAlt: { backgroundColor: '#FDFCFB' },

  colAmount: { flex: 1 },
  colType:   { flex: 1 },
  colSource: { flex: 1.4 },
  colDate:   { flex: 1.2, alignItems: 'flex-end' },

  amtCredit: { fontSize: 13, fontWeight: '800', color: O[600] },
  amtDebit:  { fontSize: 13, fontWeight: '800', color: '#E24B4A' },
  rowTxt:    { fontSize: 13, color: '#666666', fontWeight: '500' },
  rowPillCredit: { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: O[50], borderWidth: 1, borderColor: O[200], borderRadius: 20 },
  rowPillDebit:  { paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 20 },
  rowPillTxtCredit: { fontSize: 11, fontWeight: '700', color: O[800] },
  rowPillTxtDebit:  { fontSize: 11, fontWeight: '700', color: '#991B1B' },

  // Pagination
  pagRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
    borderTopWidth: 1, borderTopColor: '#EDE8E1',
  },
  pagInfo: { fontSize: 12, color: '#888888', fontWeight: '500' },
  pagBtns: { flexDirection: 'row', gap: 4 },
  pb: {
    minWidth: 32, height: 32, borderRadius: 7,
    backgroundColor: '#F7F4F0', borderWidth: 1, borderColor: '#E5E2DE',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  pbOn:    { backgroundColor: O[400], borderColor: O[400] },
  pbOff:   { opacity: 0.3 },
  pbTxt:   { fontSize: 13, fontWeight: '700', color: '#555555' },
  pbTxtOn: { color: '#ffffff' },

  loadingTxt: { fontSize: 14, color: '#888888', paddingVertical: 40, textAlign: 'center' },
  emptyWrap:  { alignItems: 'center', paddingVertical: 40 },
  emptyTxt:   { fontSize: 14, color: '#888888' },
};

export default function WalletScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [currentUser, setCurrentUser]       = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);

  const [summary, setSummary] = useState({
    total_balance: 0, total_credit: 0, total_debit: 0, transactions: [],
  });

  const moduleName = 'Wallet';
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileWeb = isWeb && windowWidth <= 760;

  const loadWallet = useCallback(async () => {
    setLoading(true);
    const [walletSummary, user] = await Promise.all([
      UserStore.getWalletSummary(),
      UserStore.getCurrentUser(),
    ]);
    setLoading(false);
    if (!walletSummary || !user) { navigation.replace('Login'); return; }
    setSummary(walletSummary);
    setCurrentUser(user);
    setCurrentPage(1);
  }, [navigation]);

  useFocusEffect(useCallback(() => { loadWallet(); }, [loadWallet]));

  const latestTransaction = useMemo(
    () => summary.transactions.length ? summary.transactions[0] : null,
    [summary.transactions]
  );

  const totalRecords = summary.transactions.length;
  const totalPages   = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const pagedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return summary.transactions.slice(start, start + PAGE_SIZE);
  }, [summary.transactions, currentPage]);

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // ══════════════════════════════════════════════════════════════════════════
  // WEB LAYOUT — premium amber dashboard
  // ══════════════════════════════════════════════════════════════════════════
  if (isWeb && !isMobileWeb) {
    return (
      <View style={w.root}>
        {/* Top Bar */}
        <View style={w.topBar}>
          <View style={w.topLeft}>
            <Feather name="home" size={14} color="#888888" />
            <Text style={w.bcSep}>›</Text>
            <Text style={w.bcStep}>Dashboard</Text>
            <Text style={w.bcSep}>›</Text>
            <Text style={w.bcCur}>Wallet</Text>
          </View>
          <TouchableOpacity style={w.backBtn} onPress={() => navigation.navigate('QuickMenu')} activeOpacity={0.8}>
            <Feather name="arrow-left" size={13} color={O[800]} />
            <Text style={w.backBtnText}>Back to menu</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={w.scroll} contentContainerStyle={w.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={w.innerWrap}>
            <Text style={w.pageTitle}>Wallet</Text>
            <Text style={w.pageSub}>Your balance, credits, debits and full transaction history.</Text>

            {/* ── Top row: hero left, stats right ── */}
            <View style={w.topRow}>
              {/* Hero balance */}
              <View style={w.heroCard}>
                <View style={w.heroTopRow}>
                  <View style={w.heroIconWrap}>
                    <Feather name="credit-card" size={20} color="#ffffff" />
                  </View>
                  <View style={w.heroBadge}>
                    <Text style={w.heroBadgeTxt}>Available</Text>
                  </View>
                </View>
                <Text style={w.heroLbl}>Total Balance</Text>
                <Text style={w.heroAmt}>₹{summary.total_balance.toLocaleString()}</Text>
                <Text style={w.heroHint}>Available balance in your wallet</Text>
              </View>

              {/* Stats column */}
              <View style={w.statsCol}>
                {/* Credit */}
                <View style={w.statCard}>
                  <View style={[w.statBar, w.statBarCredit]} />
                  <View style={w.statTop}>
                    <View style={w.statIconCredit}>
                      <Feather name="arrow-down-circle" size={16} color={O[600]} />
                    </View>
                    <Text style={w.statBadgeCredit}>Received</Text>
                  </View>
                  <Text style={w.statVal}>₹{summary.total_credit.toLocaleString()}</Text>
                  <Text style={w.statLbl}>Total credit</Text>
                </View>
                {/* Debit */}
                <View style={w.statCard}>
                  <View style={[w.statBar, w.statBarDebit]} />
                  <View style={w.statTop}>
                    <View style={w.statIconDebit}>
                      <Feather name="arrow-up-circle" size={16} color="#E24B4A" />
                    </View>
                    <Text style={w.statBadgeDebit}>Spent</Text>
                  </View>
                  <Text style={w.statVal}>₹{summary.total_debit.toLocaleString()}</Text>
                  <Text style={w.statLbl}>Total debit</Text>
                </View>
              </View>
            </View>

            {/* ── Latest Transaction ── */}
            <View style={[w.card, { marginBottom: 16 }]}>
              <View style={w.cardHead}>
                <View style={w.cardHeadLeft}>
                  <Feather name="clock" size={15} color={O[600]} />
                  <Text style={w.cardTitle}>Latest transaction</Text>
                </View>
              </View>
              <View style={w.cardBody}>
                {latestTransaction ? (
                  <View style={w.latestWrap}>
                    <View style={w.latestTop}>
                      <View style={w.sourceBadge}>
                        <Text style={w.sourceBadgeTxt}>{latestTransaction.source}</Text>
                      </View>
                      <Text style={w.latestDate}>{latestTransaction.date}</Text>
                    </View>
                    <View style={w.latestRow}>
                      <View>
                        <Text style={w.latestLbl}>Amount</Text>
                        <Text style={w.latestAmt}>₹{latestTransaction.amount.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text style={w.latestLbl}>Type</Text>
                        <View style={latestTransaction.type === 'credit' ? w.typePillCredit : w.typePillDebit}>
                          <Text style={latestTransaction.type === 'credit' ? w.typeTxtCredit : w.typeTxtDebit}>
                            {latestTransaction.type === 'credit' ? 'Credit' : 'Debit'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={w.emptyWrap}><Text style={w.emptyTxt}>No transactions found.</Text></View>
                )}
              </View>
            </View>

            {/* ── Transaction History ── */}
            <View style={w.card}>
              <View style={w.cardHead}>
                <View style={w.cardHeadLeft}>
                  <Feather name="list" size={15} color={O[600]} />
                  <View>
                    <Text style={w.cardTitle}>Transaction history</Text>
                    <Text style={w.cardSub}>All wallet credits and debits</Text>
                  </View>
                </View>
                <View style={w.pill}>
                  <Feather name="repeat" size={12} color={O[600]} />
                  <Text style={w.pillTxt}>{totalRecords} record{totalRecords !== 1 ? 's' : ''}</Text>
                </View>
              </View>

              {loading ? (
                <Text style={w.loadingTxt}>Loading wallet data...</Text>
              ) : totalRecords === 0 ? (
                <View style={w.emptyWrap}><Text style={w.emptyTxt}>No wallet records found.</Text></View>
              ) : (
                <>
                  <View style={w.tblWrap}>
                    <View style={w.tblHdr}>
                      <Text style={[w.hc, w.colAmount]}>Amount</Text>
                      <Text style={[w.hc, w.colType]}>Type</Text>
                      <Text style={[w.hc, w.colSource]}>Source</Text>
                      <Text style={[w.hc, w.colDate]}>Date</Text>
                    </View>
                    {pagedTransactions.map((item, index) => (
                      <View key={item.id ?? index} style={[w.trow, index % 2 !== 0 && w.trowAlt]}>
                        <View style={w.colAmount}>
                          <Text style={item.type === 'credit' ? w.amtCredit : w.amtDebit}>
                            ₹{item.amount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={w.colType}>
                          <View style={item.type === 'credit' ? w.rowPillCredit : w.rowPillDebit}>
                            <Text style={item.type === 'credit' ? w.rowPillTxtCredit : w.rowPillTxtDebit}>
                              {item.type === 'credit' ? 'Credit' : 'Debit'}
                            </Text>
                          </View>
                        </View>
                        <View style={w.colSource}><Text style={w.rowTxt}>{item.source}</Text></View>
                        <View style={w.colDate}><Text style={w.rowTxt}>{item.date}</Text></View>
                      </View>
                    ))}
                  </View>
                  <View style={w.pagRow}>
                    <Text style={w.pagInfo}>
                      Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalRecords)}–{Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
                    </Text>
                    <View style={w.pagBtns}>
                      <TouchableOpacity style={[w.pb, currentPage === 1 && w.pbOff]} onPress={() => goToPage(1)} disabled={currentPage === 1}>
                        <Feather name="chevrons-left" size={13} color={currentPage === 1 ? '#CCC' : O[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[w.pb, currentPage === 1 && w.pbOff]} onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        <Feather name="chevron-left" size={13} color={currentPage === 1 ? '#CCC' : O[600]} />
                      </TouchableOpacity>
                      {pageNumbers.map((page) => (
                        <TouchableOpacity key={page} style={[w.pb, page === currentPage && w.pbOn]} onPress={() => goToPage(page)}>
                          <Text style={[w.pbTxt, page === currentPage && w.pbTxtOn]}>{page}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[w.pb, currentPage === totalPages && w.pbOff]} onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        <Feather name="chevron-right" size={13} color={currentPage === totalPages ? '#CCC' : O[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[w.pb, currentPage === totalPages && w.pbOff]} onPress={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                        <Feather name="chevrons-right" size={13} color={currentPage === totalPages ? '#CCC' : O[600]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT — new premium design inspired by screenshot
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <View style={WalletStyles.root}>

      {/* Top Bar */}
      <View style={WalletStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('QuickMenu')} style={WalletStyles.backButton}>
          <Feather name="arrow-left" size={18} color={PINK} />
          <Text style={WalletStyles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={WalletStyles.headerTitle}>Wallet</Text>
        <View style={WalletStyles.headerSpacer} />
      </View>

      <ScrollView style={WalletStyles.scrollView} contentContainerStyle={WalletStyles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HERO BALANCE CARD ── */}
        <View style={WalletStyles.heroCard}>
          <View style={WalletStyles.heroTopRow}>
            <View style={WalletStyles.heroIconWrap}>
              <Feather name="credit-card" size={20} color="#ffffff" />
            </View>
            <Text style={WalletStyles.heroBalanceLbl}>My Wallet</Text>
          </View>
          <Text style={WalletStyles.heroAmount}>₹{summary.total_balance.toLocaleString()}</Text>
          <Text style={WalletStyles.heroHint}>Available balance</Text>

          {/* Mini Credit / Debit inside hero */}
          <View style={WalletStyles.heroStatsRow}>
            <View style={WalletStyles.heroStat}>
              <View style={WalletStyles.heroStatIcon}>
                <Feather name="arrow-down-circle" size={14} color="#ffffff" />
              </View>
              <Text style={WalletStyles.heroStatLbl}>Credit</Text>
              <Text style={WalletStyles.heroStatVal}>₹{summary.total_credit.toLocaleString()}</Text>
            </View>
            <View style={WalletStyles.heroStat}>
              <View style={WalletStyles.heroStatIcon}>
                <Feather name="arrow-up-circle" size={14} color="#ffffff" />
              </View>
              <Text style={WalletStyles.heroStatLbl}>Debit</Text>
              <Text style={WalletStyles.heroStatVal}>₹{summary.total_debit.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* ── LATEST TRANSACTION ── */}
        {latestTransaction && (
          <>
            <View style={WalletStyles.sectionHeader}>
              <Text style={WalletStyles.sectionTitle}>Latest Transaction</Text>
            </View>
            <View style={WalletStyles.latestCard}>
              <View style={WalletStyles.latestCardHeader}>
                <Text style={WalletStyles.latestCardTitle}>{latestTransaction.source}</Text>
                <View style={WalletStyles.sourceBadge}>
                  <Text style={WalletStyles.sourceBadgeText}>{latestTransaction.source}</Text>
                </View>
              </View>
              <View style={WalletStyles.latestRow}>
                <View>
                  <Text style={WalletStyles.latestLbl}>Amount</Text>
                  <Text style={WalletStyles.latestAmt}>₹{latestTransaction.amount.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={WalletStyles.latestLbl}>Type</Text>
                  <View style={latestTransaction.type === 'credit' ? WalletStyles.typePillCredit : WalletStyles.typePillDebit}>
                    <Text style={latestTransaction.type === 'credit' ? WalletStyles.typeTxtCredit : WalletStyles.typeTxtDebit}>
                      {latestTransaction.type === 'credit' ? 'Credit' : 'Debit'}
                    </Text>
                  </View>
                  <Text style={[WalletStyles.latestDate, { marginTop: 6 }]}>{latestTransaction.date}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── TRANSACTION HISTORY ── */}
        <View style={WalletStyles.sectionHeader}>
          <Text style={WalletStyles.sectionTitle}>Transaction History</Text>
          <View style={WalletStyles.sectionBadge}>
            <Text style={WalletStyles.sectionBadgeText}>{totalRecords} total</Text>
          </View>
        </View>

        {loading ? (
          <Text style={WalletStyles.loadingText}>Loading wallet data...</Text>
        ) : totalRecords === 0 ? (
          <Text style={WalletStyles.emptyText}>No wallet records found.</Text>
        ) : (
          <>
            <View style={WalletStyles.tableWrap}>
              <View style={WalletStyles.tableHeader}>
                <Text style={[WalletStyles.tableHeaderText, WalletStyles.colAmount]}>Amount</Text>
                <Text style={[WalletStyles.tableHeaderText, WalletStyles.colType]}>Type</Text>
                <Text style={[WalletStyles.tableHeaderText, WalletStyles.colSource]}>Source</Text>
                <Text style={[WalletStyles.tableHeaderText, WalletStyles.colDate]}>Date</Text>
              </View>
              {pagedTransactions.map((item, index) => (
                <View key={item.id ?? index} style={[WalletStyles.tableRow, index % 2 === 0 && WalletStyles.tableRowEven]}>
                  <View style={WalletStyles.colAmount}>
                    <Text style={item.type === 'credit' ? WalletStyles.amountCredit : WalletStyles.amountDebit}>
                      ₹{item.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={WalletStyles.colType}>
                    <View style={[
                      WalletStyles.typePill,
                      item.type === 'credit' ? WalletStyles.typePillCredit : WalletStyles.typePillDebit,
                    ]}>
                      <Text style={item.type === 'credit' ? WalletStyles.typePillTextCredit : WalletStyles.typePillTextDebit}>
                        {item.type === 'credit' ? 'Credit' : 'Debit'}
                      </Text>
                    </View>
                  </View>
                  <View style={WalletStyles.colSource}>
                    <Text style={WalletStyles.rowText}>{item.source}</Text>
                  </View>
                  <View style={WalletStyles.colDate}>
                    <Text style={WalletStyles.rowText}>{item.date}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[WalletStyles.paginationWrap, { paddingHorizontal: 16 }]}>
              <Text style={WalletStyles.paginationInfo}>
                Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalRecords)}–
                {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
              </Text>
              <View style={WalletStyles.paginationControls}>
                <TouchableOpacity style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]} onPress={() => goToPage(1)} disabled={currentPage === 1}>
                  <Feather name="chevrons-left" size={14} color={currentPage === 1 ? '#fda4be' : PINK} />
                </TouchableOpacity>
                <TouchableOpacity style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]} onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                  <Feather name="chevron-left" size={14} color={currentPage === 1 ? '#fda4be' : PINK} />
                </TouchableOpacity>
                {pageNumbers.map((page) => (
                  <TouchableOpacity key={page} style={[WalletStyles.pageBtn, page === currentPage && WalletStyles.pageBtnActive]} onPress={() => goToPage(page)}>
                    <Text style={[WalletStyles.pageBtnText, page === currentPage && WalletStyles.pageBtnTextActive]}>{page}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[WalletStyles.pageBtn, currentPage === totalPages && WalletStyles.pageBtnDisabled]} onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <Feather name="chevron-right" size={14} color={currentPage === totalPages ? '#fda4be' : PINK} />
                </TouchableOpacity>
                <TouchableOpacity style={[WalletStyles.pageBtn, currentPage === totalPages && WalletStyles.pageBtnDisabled]} onPress={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
                  <Feather name="chevrons-right" size={14} color={currentPage === totalPages ? '#fda4be' : PINK} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

      </ScrollView>

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} activeItem={moduleName} />
    </View>
  );
}