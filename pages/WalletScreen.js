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

  const typeColor = (type) =>
    type === 'credit' ? WalletStyles.creditValue : WalletStyles.debitValue;

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
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
      }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QuickMenu')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Feather name="arrow-left" size={20} color="#1d4ed8" />
          <Text style={{ color: '#1d4ed8', fontSize: 15, fontWeight: '700' }}>Back</Text>
        </TouchableOpacity>

        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: '800',
          color: '#0f172a',
          marginRight: 52,
        }}>
          Wallet
        </Text>
      </View>

      <ScrollView
        style={WalletStyles.scrollView}
        contentContainerStyle={WalletStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics */}
        <View style={WalletStyles.metricsGrid}>
          <View style={[WalletStyles.metricCard, WalletStyles.balanceCard]}>
            <Feather name="credit-card" size={20} color="#1d4ed8" />
            <Text style={WalletStyles.metricLabel}>Total Balance</Text>
            <Text style={WalletStyles.metricValue}>₹{summary.total_balance}</Text>
            <Text style={WalletStyles.metricHint}>Available balance</Text>
          </View>

          <View style={WalletStyles.metricRow}>
            <View style={[WalletStyles.metricCardHalf, WalletStyles.creditCard]}>
              <Feather name="arrow-down-circle" size={18} color="#16a34a" />
              <Text style={WalletStyles.metricLabel}>Total Credit</Text>
              <Text style={[WalletStyles.metricValue, WalletStyles.creditValue]}>
                ₹{summary.total_credit}
              </Text>
            </View>

            <View style={[WalletStyles.metricCardHalf, WalletStyles.debitCard]}>
              <Feather name="arrow-up-circle" size={18} color="#dc2626" />
              <Text style={WalletStyles.metricLabel}>Total Debit</Text>
              <Text style={[WalletStyles.metricValue, WalletStyles.debitValue]}>
                ₹{summary.total_debit}
              </Text>
            </View>
          </View>
        </View>

        {/* Latest Transaction */}
        <View style={WalletStyles.card}>
          <Text style={WalletStyles.sectionTitle}>Latest Transaction</Text>

          {latestTransaction ? (
            <View style={WalletStyles.latestCard}>
              <View style={WalletStyles.latestTopRow}>
                <View style={WalletStyles.sourceBadge}>
                  <Text style={WalletStyles.sourceBadgeText}>
                    {latestTransaction.source}
                  </Text>
                </View>
                <Text style={WalletStyles.latestDate}>{latestTransaction.date}</Text>
              </View>

              <View style={WalletStyles.latestAmountRow}>
                <View>
                  <Text style={WalletStyles.latestLabel}>Amount</Text>
                  <Text style={typeColor(latestTransaction.type)}>
                    ₹{latestTransaction.amount}
                  </Text>
                </View>
                <View>
                  <Text style={WalletStyles.latestLabel}>Type</Text>
                  <Text style={typeColor(latestTransaction.type)}>
                    {latestTransaction.type === 'credit' ? '▲ Credit' : '▼ Debit'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={WalletStyles.emptyText}>No transactions found.</Text>
          )}
        </View>

        {/* Wallet Records */}
        <View style={WalletStyles.card}>
          <View style={WalletStyles.tableTopRow}>
            <Text style={WalletStyles.sectionTitle}>Wallet Records</Text>
            <Text style={WalletStyles.recordCount}>
              {totalRecords} record{totalRecords !== 1 ? 's' : ''}
            </Text>
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
                  <View
                    key={item.id ?? index}
                    style={[
                      WalletStyles.tableRow,
                      index % 2 === 0 && WalletStyles.tableRowEven,
                      index === pagedTransactions.length - 1 && WalletStyles.tableRowLast,
                    ]}
                  >
                    <View style={WalletStyles.colAmount}>
                      <Text style={typeColor(item.type)}>₹{item.amount}</Text>
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
                      <Text style={WalletStyles.rowSecondary}>{item.source}</Text>
                    </View>
                    <View style={WalletStyles.colDate}>
                      <Text style={WalletStyles.rowSecondary}>{item.date}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pagination */}
              <View style={WalletStyles.paginationWrap}>
                <Text style={WalletStyles.paginationInfo}>
                  Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalRecords)}–
                  {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
                </Text>

                <View style={WalletStyles.paginationControls}>
                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(1)} disabled={currentPage === 1}
                  >
                    <Feather name="chevrons-left" size={14} color={currentPage === 1 ? '#cbd5e1' : '#475569'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === 1 && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  >
                    <Feather name="chevron-left" size={14} color={currentPage === 1 ? '#cbd5e1' : '#475569'} />
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
                    onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  >
                    <Feather name="chevron-right" size={14} color={currentPage === totalPages ? '#cbd5e1' : '#475569'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[WalletStyles.pageBtn, currentPage === totalPages && WalletStyles.pageBtnDisabled]}
                    onPress={() => goToPage(totalPages)} disabled={currentPage === totalPages}
                  >
                    <Feather name="chevrons-right" size={14} color={currentPage === totalPages ? '#cbd5e1' : '#475569'} />
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