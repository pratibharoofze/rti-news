import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import WalletStyles from '../styles/WalletStyles';
import { UserStore } from '../store/UserStore';

const PAGE_SIZE = 10;

export default function WalletScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [currentUser, setCurrentUser]       = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);

  const [summary, setSummary] = useState({
    total_balance: 0,
    total_credit:  0,
    total_debit:   0,
    transactions:  [],
  });

  const moduleName = 'Wallet';

  const loadWallet = useCallback(async () => {
    setLoading(true);
    const [walletSummary, user] = await Promise.all([
      UserStore.getWalletSummary(),
      UserStore.getCurrentUser(),
    ]);
    setLoading(false);

    if (!walletSummary || !user) {
      navigation.replace('Login');
      return;
    }

    setSummary(walletSummary);
    setCurrentUser(user);
    setCurrentPage(1);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const latestTransaction = useMemo(
    () => summary.transactions.length ? summary.transactions[0] : null,
    [summary.transactions]
  );

  // ── Pagination ──
  const totalRecords = summary.transactions.length;
  const totalPages   = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const pagedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return summary.transactions.slice(start, start + PAGE_SIZE);
  }, [summary.transactions, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <View style={WalletStyles.root}>

      {/* ── Top Bar with Back Button ── */}
      <View style={WalletStyles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QuickMenu')}
          style={WalletStyles.backButton}
        >
          <Feather name="arrow-left" size={20} color="#f97316" />
          <Text style={WalletStyles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={WalletStyles.headerTitle}>
          Wallet
        </Text>
        
        <View style={{ width: 52 }} />
      </View>

      <ScrollView
        style={WalletStyles.scrollView}
        contentContainerStyle={WalletStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Balance Card - Hero */}
        <View style={WalletStyles.balanceHeroCard}>
          <View style={WalletStyles.balanceIconWrap}>
            <Feather name="wallet" size={28} color="#f97316" />
          </View>
          <Text style={WalletStyles.balanceLabel}>Total Balance</Text>
          <Text style={WalletStyles.balanceAmount}>₹{summary.total_balance.toLocaleString()}</Text>
          <Text style={WalletStyles.balanceHint}>Available balance in wallet</Text>
        </View>

        {/* Credit/Debit Stats Row */}
        <View style={WalletStyles.statsRow}>
          <View style={[WalletStyles.statCard, WalletStyles.creditStatCard]}>
            <View style={WalletStyles.statIconWrap}>
              <Feather name="arrow-down-circle" size={22} color="#ffffff" />
            </View>
            <Text style={WalletStyles.statLabel}>Total Credit</Text>
            <Text style={WalletStyles.statValue}>₹{summary.total_credit.toLocaleString()}</Text>
          </View>

          <View style={[WalletStyles.statCard, WalletStyles.debitStatCard]}>
            <View style={WalletStyles.statIconWrap}>
              <Feather name="arrow-up-circle" size={22} color="#ffffff" />
            </View>
            <Text style={WalletStyles.statLabel}>Total Debit</Text>
            <Text style={WalletStyles.statValue}>₹{summary.total_debit.toLocaleString()}</Text>
          </View>
        </View>

        {/* Latest Transaction Card */}
        <View style={WalletStyles.card}>
          <View style={WalletStyles.cardHeader}>
            <Feather name="clock" size={18} color="#f97316" />
            <Text style={WalletStyles.cardTitle}>Latest Transaction</Text>
          </View>

          {latestTransaction ? (
            <View style={WalletStyles.latestCard}>
              <View style={WalletStyles.latestHeader}>
                <View style={WalletStyles.sourceBadge}>
                  <Text style={WalletStyles.sourceBadgeText}>
                    {latestTransaction.source}
                  </Text>
                </View>
                <Text style={WalletStyles.latestDate}>{latestTransaction.date}</Text>
              </View>

              <View style={WalletStyles.latestDetails}>
                <View>
                  <Text style={WalletStyles.latestLabel}>Amount</Text>
                  <Text style={latestTransaction.type === 'credit' ? WalletStyles.latestCreditAmount : WalletStyles.latestDebitAmount}>
                    ₹{latestTransaction.amount.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text style={WalletStyles.latestLabel}>Type</Text>
                  <View style={latestTransaction.type === 'credit' ? WalletStyles.latestCreditBadge : WalletStyles.latestDebitBadge}>
                    <Text style={latestTransaction.type === 'credit' ? WalletStyles.latestCreditText : WalletStyles.latestDebitText}>
                      {latestTransaction.type === 'credit' ? 'Credit' : 'Debit'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Text style={WalletStyles.emptyText}>No transactions found.</Text>
          )}
        </View>

        {/* Transaction History Card */}
        <View style={WalletStyles.card}>
          <View style={WalletStyles.cardHeader}>
            <Feather name="list" size={18} color="#f97316" />
            <Text style={WalletStyles.cardTitle}>Transaction History</Text>
          </View>
          
          <View style={WalletStyles.statsBadge}>
            <Text style={WalletStyles.statsBadgeText}>
              {totalRecords} Transaction{totalRecords !== 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <Text style={WalletStyles.loadingText}>Loading wallet data...</Text>
          ) : totalRecords === 0 ? (
            <Text style={WalletStyles.emptyText}>No wallet records found.</Text>
          ) : (
            <>
              <View style={WalletStyles.tableWrap}>
                {/* Header */}
                <View style={WalletStyles.tableHeader}>
                  <Text style={[WalletStyles.tableHeaderText, WalletStyles.colAmount]}>Amount</Text>
                  <Text style={[WalletStyles.tableHeaderText, WalletStyles.colType]}>Type</Text>
                  <Text style={[WalletStyles.tableHeaderText, WalletStyles.colSource]}>Source</Text>
                  <Text style={[WalletStyles.tableHeaderText, WalletStyles.colDate]}>Date</Text>
                </View>

                {/* Rows */}
                {pagedTransactions.map((item, index) => (
                  <View
                    key={item.id ?? index}
                    style={[
                      WalletStyles.tableRow,
                      index % 2 === 0 && WalletStyles.tableRowEven,
                    ]}
                  >
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
                        <Text style={[
                          WalletStyles.typePillText,
                          item.type === 'credit' ? WalletStyles.typePillTextCredit : WalletStyles.typePillTextDebit,
                        ]}>
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

              {/* Pagination */}
              <View style={WalletStyles.paginationWrap}>
                <Text style={WalletStyles.paginationInfo}>
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalRecords)} –{' '}
                  {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
                </Text>

                <View style={WalletStyles.paginationControls}>
                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(1)} 
                    disabled={currentPage === 1}
                  >
                    <Feather name="chevrons-left" size={14} color={currentPage === 1 ? '#fed7aa' : '#f97316'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                  >
                    <Feather name="chevron-left" size={14} color={currentPage === 1 ? '#fed7aa' : '#f97316'} />
                  </TouchableOpacity>

                  {pageNumbers.map((page) => (
                    <TouchableOpacity
                      key={page}
                      style={[WalletStyles.pageBtn, page === currentPage && WalletStyles.pageBtnActive]}
                      onPress={() => goToPage(page)}
                    >
                      <Text style={[WalletStyles.pageBtnText, page === currentPage && WalletStyles.pageBtnTextActive]}>
                        {page}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === totalPages && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                  >
                    <Feather name="chevron-right" size={14} color={currentPage === totalPages ? '#fed7aa' : '#f97316'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === totalPages && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(totalPages)} 
                    disabled={currentPage === totalPages}
                  >
                    <Feather name="chevrons-right" size={14} color={currentPage === totalPages ? '#fed7aa' : '#f97316'} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />
    </View>
  );
}