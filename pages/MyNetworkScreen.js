import React, { useCallback, useState, useMemo } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';


import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import PremiumBadge from '../components/PremiumBadge';
import MyNetworkStyles from '../styles/MyNetworkStyles';
import { UserStore } from '../store/UserStore';

const PAGE_SIZE = 10;

export default function MyNetworkScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [networkData, setNetworkData]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [currentPage, setCurrentPage]       = useState(1);

  const moduleName = 'My Network';

  // ── Load data ──
  const loadNetwork = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getMyNetwork();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }
    setNetworkData(data);
    setCurrentPage(1);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadNetwork();
    }, [loadNetwork])
  );

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const allRows = networkData?.rows || [];

  // ── Search filter ──
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (row) =>
        row.name?.toLowerCase().includes(q) ||
        row.user_id?.toLowerCase().includes(q) ||
        row.referred_by?.toLowerCase().includes(q) ||
        String(row.level).toLowerCase().includes(q)
    );
  }, [allRows, searchQuery]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pagedRows  = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Page number buttons (max 5 shown) ──
  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  return (
    <View style={MyNetworkStyles.root}>

      {/* ── Back Arrow Button ── */}
      <TouchableOpacity
        onPress={() => navigation.navigate('QuickMenu')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 12,
paddingBottom: 12,
          paddingVertical: 12,
          gap: 8,
          backgroundColor: '#fff7ed',
          borderBottomWidth: 1,
          borderBottomColor: '#fed7aa',
        }}
      >
        <Feather name="arrow-left" size={20} color="#f97316" />
        <Text style={{ color: '#000000', fontSize: 14, fontWeight: '700' }}>Back to Menu</Text>
      </TouchableOpacity>

      <ScrollView
        style={MyNetworkStyles.scrollView}
        contentContainerStyle={MyNetworkStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Metrics Row (without Hero Card) ── */}
        <View style={MyNetworkStyles.metricsRow}>
          <View style={[MyNetworkStyles.metricCard, MyNetworkStyles.metricPrimary]}>
            <Text style={MyNetworkStyles.metricValue}>
              {networkData?.totalMembers ?? 0}
            </Text>
            <Text style={MyNetworkStyles.metricLabel}>Total Members</Text>
          </View>
          <View style={[MyNetworkStyles.metricCard, MyNetworkStyles.metricAccent]}>
            <Text style={MyNetworkStyles.metricValue}>
              {networkData?.linkedMembers ?? 0}
            </Text>
            <Text style={MyNetworkStyles.metricLabel}>Linked Members</Text>
          </View>
        </View>

        {/* ── DataTable Card ── */}
        <View style={MyNetworkStyles.card}>
          <Text style={MyNetworkStyles.sectionTitle}>Member Records</Text>

          {/* ── Search bar ── */}
          <View style={MyNetworkStyles.searchWrap}>
            <Feather name="search" size={16} color="#f97316" />
            <TextInput
              style={MyNetworkStyles.searchInput}
              placeholder="Search by name, ID, level..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Feather name="x" size={16} color="#f97316" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Results info ── */}
          {!loading && (
            <Text style={MyNetworkStyles.resultsInfo}>
              Showing {pagedRows.length} of {filteredRows.length} records
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </Text>
          )}

          {loading ? (
            <Text style={MyNetworkStyles.loadingText}>Loading network data...</Text>
          ) : pagedRows.length ? (
            <>
              {/* ── Table ── */}
              <View style={MyNetworkStyles.tableWrap}>
                {/* Header */}
                <View style={MyNetworkStyles.tableHeader}>
                  <Text style={[MyNetworkStyles.headerCell, MyNetworkStyles.colUser]}>
                    User
                  </Text>
                  <Text style={[MyNetworkStyles.headerCell, MyNetworkStyles.colReferred]}>
                    Referred By
                  </Text>
                  <Text style={[MyNetworkStyles.headerCell, MyNetworkStyles.colLevel]}>
                    Level
                  </Text>
                  <Text style={[MyNetworkStyles.headerCell, MyNetworkStyles.colCommission]}>
                    Commission
                  </Text>
                  <Text style={[MyNetworkStyles.headerCell, MyNetworkStyles.colAction]}>
                    Action
                  </Text>
                </View>

                {/* Rows */}
                {pagedRows.map((row, index) => (
                  <View
                    key={`${row.user_id}-${index}`}
                    style={[
                      MyNetworkStyles.tableRow,
                      index % 2 === 0 && MyNetworkStyles.tableRowEven,
                      row.isCurrentUser && MyNetworkStyles.currentUserRow,
                    ]}
                  >
                    {/* User */}
                    <View style={MyNetworkStyles.colUser}>
                      <View style={MyNetworkStyles.rowTitleWrap}>
                        <Text style={MyNetworkStyles.rowTitle} numberOfLines={1}>
                          {row.name}
                        </Text>
                        {UserStore.hasActiveSubscription(row) ? (
                          <PremiumBadge size={14} style={MyNetworkStyles.rowBadge} />
                        ) : null}
                      </View>
                      <Text style={MyNetworkStyles.rowSubText} numberOfLines={1}>
                        {row.user_id}
                      </Text>
                    </View>

                    {/* Referred By */}
                    <View style={MyNetworkStyles.colReferred}>
                      <Text style={MyNetworkStyles.rowText} numberOfLines={1}>
                        {row.referred_by || '—'}
                      </Text>
                    </View>

                    {/* Level */}
                    <View style={MyNetworkStyles.colLevel}>
                      <View style={[
                        MyNetworkStyles.levelBadge,
                        row.isCurrentUser && MyNetworkStyles.currentLevelBadge,
                      ]}>
                        <Text style={[
                          MyNetworkStyles.levelBadgeText,
                          row.isCurrentUser && MyNetworkStyles.currentLevelBadgeText,
                        ]}>
                          {row.level}
                        </Text>
                      </View>
                    </View>

                    {/* Commission */}
                    <View style={MyNetworkStyles.colCommission}>
                      <Text style={MyNetworkStyles.commissionText}>
                        ₹{row.commission?.toLocaleString() ?? '0'}
                      </Text>
                    </View>

                    {/* Action */}
                    <View style={MyNetworkStyles.colAction}>
                      <TouchableOpacity
                        style={MyNetworkStyles.viewBtn}
                        onPress={() =>
                          navigation.navigate('ViewMember', { member: row })
                        }
                      >
                        <Feather name="eye" size={14} color="#f97316" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── Pagination ── */}
              <View style={MyNetworkStyles.paginationWrap}>
                <TouchableOpacity
                  style={[
                    MyNetworkStyles.pageBtn,
                    safePage === 1 && MyNetworkStyles.pageBtnDisabled,
                  ]}
                  onPress={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  <Feather
                    name="chevron-left"
                    size={16}
                    color={safePage === 1 ? '#fed7aa' : '#f97316'}
                  />
                </TouchableOpacity>

                {pageNumbers.map((page) => (
                  <TouchableOpacity
                    key={page}
                    style={[
                      MyNetworkStyles.pageBtn,
                      page === safePage && MyNetworkStyles.pageBtnActive,
                    ]}
                    onPress={() => goToPage(page)}
                  >
                    <Text
                      style={[
                        MyNetworkStyles.pageBtnText,
                        page === safePage && MyNetworkStyles.pageBtnTextActive,
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    MyNetworkStyles.pageBtn,
                    safePage === totalPages && MyNetworkStyles.pageBtnDisabled,
                  ]}
                  onPress={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={safePage === totalPages ? '#fed7aa' : '#f97316'}
                  />
                </TouchableOpacity>
              </View>

              {/* Page info */}
              <Text style={MyNetworkStyles.pageInfo}>
                Page {safePage} of {totalPages}
              </Text>
            </>
          ) : (
            <Text style={MyNetworkStyles.emptyText}>
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : 'No network data found yet.'}
            </Text>
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