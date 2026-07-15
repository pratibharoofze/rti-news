import React, { useCallback, useState, useMemo } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, TextInput, Platform, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import PremiumBadge from '../components/PremiumBadge';
import MyNetworkStyles from '../styles/MyNetworkStyles';
import { UserStore } from '../store/UserStore';

const PAGE_SIZE = 10;

// ─── Amber/Orange design tokens (web only) ────────────────────────────────────
const O = {
  50:  '#FFF4EC',
  100: '#FFE2CE',
  200: '#F8C29B',
  400: '#e8732a',
  600: '#C95C18',
  800: '#7A360E',
  900: '#4A2108',
};

// ─── Web inline styles ────────────────────────────────────────────────────────
const w = {
  // Root — no sidebar
  root: {
    flex: 1,
    backgroundColor: '#F7F4F0',
    flexDirection: 'column',
    minHeight: '100vh',
  },

  // ── Top bar ──────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8E1',
  },
  topLeft:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bcStep:      { fontSize: 13, color: '#888888' },
  bcSep:       { fontSize: 15, color: '#CCCCCC', marginHorizontal: 4 },
  bcCur:       { fontSize: 13, fontWeight: '600', color: '#111111' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200],
    borderRadius: 8,
  },
  backBtnText: { fontSize: 13, fontWeight: '600', color: O[800] },

  // ── Scroll / page ─────────────────────────────────────────────────────────
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 60, alignItems: 'center' },
  innerWrap:     { width: '100%', maxWidth: 1100, alignSelf: 'center' },

  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111111', marginBottom: 4 },
  pageSub:   { fontSize: 14, color: '#888888', marginBottom: 26 },

  // ── Metric cards ──────────────────────────────────────────────────────────
  metricsRow: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  mc: {
    flex: 1, backgroundColor: '#ffffff',
    borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#EDE8E1',
    overflow: 'hidden',
  },
  mcBar:    { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: O[200] },
  mcBarHot: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: O[400] },
  mcTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  mcIcon:   {
    width: 38, height: 38, borderRadius: 9,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[100],
    alignItems: 'center', justifyContent: 'center',
  },
  mcBadge: {
    fontSize: 11, fontWeight: '600', color: O[800],
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200],
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20,
  },
  mcVal: { fontSize: 28, fontWeight: '800', color: '#111111', marginBottom: 3 },
  mcLbl: { fontSize: 12, color: '#888888', fontWeight: '500' },

  // ── Table card ────────────────────────────────────────────────────────────
  tableCard: {
    backgroundColor: '#ffffff', borderRadius: 14,
    borderWidth: 1, borderColor: '#EDE8E1', overflow: 'hidden',
  },
  tcHead: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0,
  },
  tcTitle: { fontSize: 16, fontWeight: '800', color: '#111111' },
  tcSub:   { fontSize: 12, color: '#888888', marginTop: 2 },

  tcToolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#EDE8E1',
  },
  searchBox: {
    flex: 1, maxWidth: 300, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F7F4F0', borderWidth: 1, borderColor: '#EDE8E1',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#111111', fontWeight: '500', paddingVertical: 0 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[100],
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  pillTxt: { fontSize: 12, fontWeight: '700', color: O[800] },

  tblHeader: {
    flexDirection: 'row', backgroundColor: '#FAFAF8',
    paddingVertical: 11, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#EDE8E1', alignItems: 'center',
  },
  hc: { fontSize: 10, fontWeight: '800', color: '#999999', textTransform: 'uppercase', letterSpacing: 0.7 },

  trow: {
    flexDirection: 'row', paddingVertical: 13, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#F5F2EE',
    alignItems: 'center', backgroundColor: '#ffffff',
  },
  trowAlt: { backgroundColor: '#FDFCFB' },
  trowCur: { backgroundColor: O[50], borderLeftWidth: 3, borderLeftColor: O[400], paddingLeft: 17 },

  av:    {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: O[100], borderWidth: 1, borderColor: O[200],
    alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0,
  },
  avTxt: { fontSize: 12, fontWeight: '700', color: O[800] },

  uname:    { fontSize: 13, fontWeight: '700', color: '#111111' },
  unameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  uemail:   { fontSize: 11, color: '#AAAAAA', marginTop: 1 },
  refCell:  { fontSize: 13, color: '#666666' },

  lbadge:     {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    backgroundColor: '#F2F0ED', borderWidth: 1, borderColor: '#E5E2DE',
  },
  lbadgeHi:    { backgroundColor: O[50], borderColor: O[200] },
  lbadgeTxt:   { fontSize: 12, fontWeight: '700', color: '#666666' },
  lbadgeTxtHi: { color: O[800] },

  commTxt: { fontSize: 13, fontWeight: '800', color: '#111111' },
  eyeBtn:  {
    width: 30, height: 30, borderRadius: 7,
    backgroundColor: O[50], borderWidth: 1, borderColor: O[200],
    alignItems: 'center', justifyContent: 'center',
  },

  // column widths
  colUser:       { flex: 2, flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  colRef:        { flex: 1.4, paddingRight: 10 },
  colLevel:      { width: 72, alignItems: 'center' },
  colCommission: { width: 96, alignItems: 'center' },
  colAction:     { width: 52, alignItems: 'center' },

  // pagination
  paginationRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
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

  // states
  loadingText: { fontSize: 14, color: '#888888', paddingVertical: 40, textAlign: 'center' },
  emptyWrap:   { alignItems: 'center', paddingVertical: 40 },
  emptyText:   { fontSize: 14, color: '#888888', fontWeight: '500' },
};

// ─── Avatar initials helper ───────────────────────────────────────────────────
function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] || '?').toUpperCase();
}

export default function MyNetworkScreen({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [networkData, setNetworkData]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [currentPage, setCurrentPage]       = useState(1);

  const moduleName = 'My Network';
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileWeb = isWeb && windowWidth <= 760;

  const loadNetwork = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getMyNetwork();
    setLoading(false);
    if (!data) { navigation.replace('Login'); return; }
    setNetworkData(data);
    setCurrentPage(1);
  }, [navigation]);

  useFocusEffect(useCallback(() => { loadNetwork(); }, [loadNetwork]));

  const allRows = networkData?.rows || [];

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((row) =>
      row.name?.toLowerCase().includes(q) ||
      row.user_id?.toLowerCase().includes(q) ||
      row.referred_by?.toLowerCase().includes(q) ||
      String(row.level).toLowerCase().includes(q)
    );
  }, [allRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pagedRows  = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (text) => { setSearchQuery(text); setCurrentPage(1); };
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [safePage, totalPages]);

  // ══════════════════════════════════════════════════════════════════════════
  // WEB TABLE CONTENT
  // ══════════════════════════════════════════════════════════════════════════
  const webTableContent = () => (
    <>
      {/* Toolbar: search + pill */}
      <View style={w.tcToolbar}>
        <View style={w.searchBox}>
          <Feather name="search" size={14} color={O[600]} />
          <TextInput
            style={w.searchInput}
            placeholder="Search by name, ID, level..."
            placeholderTextColor="#AAAAAA"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={14} color={O[600]} />
            </TouchableOpacity>
          )}
        </View>
        {!loading && (
          <View style={w.pill}>
            <Feather name="list" size={12} color={O[600]} />
            <Text style={w.pillTxt}>
              {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
              {searchQuery ? ` · "${searchQuery}"` : ''}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <Text style={w.loadingText}>Loading network data...</Text>
      ) : pagedRows.length ? (
        <>
          {/* Table header */}
          <View style={w.tblHeader}>
            <Text style={[w.hc, w.colUser]}>User</Text>
            <Text style={[w.hc, w.colRef]}>Referred by</Text>
            <Text style={[w.hc, w.colLevel]}>Level</Text>
            <Text style={[w.hc, w.colCommission]}>Commission</Text>
            <Text style={[w.hc, w.colAction]}>View</Text>
          </View>

          {/* Rows */}
          {pagedRows.map((row, index) => {
            const isCur = row.isCurrentUser;
            const rowStyle = [
              w.trow,
              index % 2 !== 0 && w.trowAlt,
              isCur && w.trowCur,
            ];
            return (
              <View key={`${row.user_id}-${index}`} style={rowStyle}>
                {/* User */}
                <View style={w.colUser}>
                  <View style={w.av}>
                    <Text style={w.avTxt}>{getInitials(row.name)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={w.unameRow}>
                      <Text style={w.uname} numberOfLines={1}>{row.name}</Text>
                      {UserStore.hasActiveSubscription(row) && (
                        <PremiumBadge size={13} />
                      )}
                    </View>
                    <Text style={w.uemail} numberOfLines={1}>{row.user_id}</Text>
                  </View>
                </View>

                {/* Referred by */}
                <View style={w.colRef}>
                  <Text style={w.refCell} numberOfLines={1}>
                    {row.referred_by || 'Direct signup'}
                  </Text>
                </View>

                {/* Level */}
                <View style={w.colLevel}>
                  <View style={[w.lbadge, isCur && w.lbadgeHi]}>
                    <Text style={[w.lbadgeTxt, isCur && w.lbadgeTxtHi]}>
                      {row.level ?? '—'}
                    </Text>
                  </View>
                </View>

                {/* Commission */}
                <View style={w.colCommission}>
                  <Text style={w.commTxt}>
                    ₹{row.commission?.toLocaleString() ?? '0'}
                  </Text>
                </View>

                {/* Action */}
                <View style={w.colAction}>
                  <TouchableOpacity
                    style={w.eyeBtn}
                    onPress={() => navigation.navigate('ViewMember', { member: row })}
                  >
                    <Feather name="eye" size={13} color={O[600]} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Pagination */}
          <View style={w.paginationRow}>
            <Text style={w.pagInfo}>
              Page {safePage} of {totalPages} · {filteredRows.length} records
            </Text>
            <View style={w.pagBtns}>
              <TouchableOpacity
                style={[w.pb, safePage === 1 && w.pbOff]}
                onPress={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
              >
                <Feather name="chevron-left" size={14} color={safePage === 1 ? '#CCCCCC' : O[600]} />
              </TouchableOpacity>

              {pageNumbers.map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[w.pb, page === safePage && w.pbOn]}
                  onPress={() => goToPage(page)}
                >
                  <Text style={[w.pbTxt, page === safePage && w.pbTxtOn]}>{page}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[w.pb, safePage === totalPages && w.pbOff]}
                onPress={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
              >
                <Feather name="chevron-right" size={14} color={safePage === totalPages ? '#CCCCCC' : O[600]} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={w.emptyWrap}>
          <Text style={w.emptyText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No network data found yet.'}
          </Text>
        </View>
      )}
    </>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // WEB LAYOUT — premium amber, no sidebar
  // ══════════════════════════════════════════════════════════════════════════════════
  if (isWeb && !isMobileWeb) {
    return (
      <View style={w.root}>

        {/* ── Top Bar ── */}
        <View style={w.topBar}>
          <View style={w.topLeft}>
            <Feather name="home" size={14} color="#888888" />
            <Text style={w.bcSep}>›</Text>
            <Text style={w.bcStep}>Dashboard</Text>
            <Text style={w.bcSep}>›</Text>
            <Text style={w.bcCur}>My Network</Text>
          </View>
          <TouchableOpacity
            style={w.backBtn}
            onPress={() => navigation.navigate('QuickMenu')}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={13} color={O[800]} />
            <Text style={w.backBtnText}>Back to menu</Text>
          </TouchableOpacity>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView
          style={w.scroll}
          contentContainerStyle={w.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={w.innerWrap}>
          {/* Page heading */}
          <Text style={w.pageTitle}>My Network</Text>
          <Text style={w.pageSub}>
            Track your referred members and monitor commission activity across all levels.
          </Text>

          {/* ── Metric cards ── */}
          <View style={w.metricsRow}>

            {/* Total members — hot bar */}
            <View style={w.mc}>
              <View style={w.mcBarHot} />
              <View style={w.mcTop}>
                <View style={w.mcIcon}>
                  <Feather name="users" size={17} color={O[600]} />
                </View>
                <Text style={w.mcBadge}>All time</Text>
              </View>
              <Text style={w.mcVal}>{networkData?.totalMembers ?? 0}</Text>
              <Text style={w.mcLbl}>Total members</Text>
            </View>

            {/* Linked members */}
            <View style={w.mc}>
              <View style={w.mcBar} />
              <View style={w.mcTop}>
                <View style={w.mcIcon}>
                  <Feather name="link" size={17} color={O[600]} />
                </View>
                <Text style={w.mcBadge}>Active</Text>
              </View>
              <Text style={w.mcVal}>{networkData?.linkedMembers ?? 0}</Text>
              <Text style={w.mcLbl}>Linked members</Text>
            </View>

            {/* Total commission */}
            <View style={w.mc}>
              <View style={w.mcBar} />
              <View style={w.mcTop}>
                <View style={w.mcIcon}>
                  <Feather name="trending-up" size={17} color={O[600]} />
                </View>
                <Text style={w.mcBadge}>Earned</Text>
              </View>
              <Text style={w.mcVal}>
                ₹{(allRows.reduce((s, r) => s + (r.commission || 0), 0)).toLocaleString()}
              </Text>
              <Text style={w.mcLbl}>Total commission</Text>
            </View>
          </View>

          {/* ── Member Records Table ── */}
          <View style={w.tableCard}>
            <View style={w.tcHead}>
              <View>
                <Text style={w.tcTitle}>Member records</Text>
                <Text style={w.tcSub}>All referred members across levels</Text>
              </View>
            </View>
            {webTableContent()}
          </View>

          </View>{/* end innerWrap */}

        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT — bilkul same, koi change nahi
  // ══════════════════════════════════════════════════════════════════════════

  const PINK = '#e8732a';

  const mobileTableContent = () => {
    const colUser       = MyNetworkStyles.colUser;
    const colReferred   = MyNetworkStyles.colReferred;
    const colLevel      = MyNetworkStyles.colLevel;
    const colCommission = MyNetworkStyles.colCommission;
    const colAction     = MyNetworkStyles.colAction;

    return (
      <>
        <View style={MyNetworkStyles.searchWrap}>
          <Feather name="search" size={16} color={PINK} />
          <TextInput
            style={MyNetworkStyles.searchInput}
            placeholder="Search by name, ID, level..."
            placeholderTextColor="#AAAAAA"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="arrow-left" size={18} color={PINK} />
            </TouchableOpacity>
          )}
        </View>

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
            <View style={MyNetworkStyles.tableWrap}>
              <View style={MyNetworkStyles.tableHeader}>
                <Text style={[MyNetworkStyles.headerCell, colUser]}>User</Text>
                <Text style={[MyNetworkStyles.headerCell, colReferred]}>Referred By</Text>
                <Text style={[MyNetworkStyles.headerCell, colLevel]}>Level</Text>
                <Text style={[MyNetworkStyles.headerCell, colCommission]}>Commission</Text>
                <Text style={[MyNetworkStyles.headerCell, colAction]}>Action</Text>
              </View>

              {pagedRows.map((row, index) => {
                const isCurrentUser = row.isCurrentUser;
                const rowStyle = [
                  MyNetworkStyles.tableRow,
                  index % 2 === 0 && MyNetworkStyles.tableRowEven,
                  isCurrentUser && MyNetworkStyles.currentUserRow,
                ];
                return (
                  <View key={`${row.user_id}-${index}`} style={rowStyle}>
                    <View style={colUser}>
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
                    <View style={colReferred}>
                      <Text style={MyNetworkStyles.rowText} numberOfLines={1}>
                        {row.referred_by || '—'}
                      </Text>
                    </View>
                    <View style={colLevel}>
                      <View style={[
                        MyNetworkStyles.levelBadge,
                        isCurrentUser && MyNetworkStyles.currentLevelBadge,
                      ]}>
                        <Text style={[
                          MyNetworkStyles.levelBadgeText,
                          isCurrentUser && MyNetworkStyles.currentLevelBadgeText,
                        ]}>
                          {row.level}
                        </Text>
                      </View>
                    </View>
                    <View style={colCommission}>
                      <Text style={MyNetworkStyles.commissionText}>
                        ₹{row.commission?.toLocaleString() ?? '0'}
                      </Text>
                    </View>
                    <View style={colAction}>
                      <TouchableOpacity
                        style={MyNetworkStyles.viewBtn}
                        onPress={() => navigation.navigate('ViewMember', { member: row })}
                      >
                        <Feather name="eye" size={14} color={PINK} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={MyNetworkStyles.paginationWrap}>
              <TouchableOpacity
                style={[MyNetworkStyles.pageBtn, safePage === 1 && MyNetworkStyles.pageBtnDisabled]}
                onPress={() => goToPage(safePage - 1)} disabled={safePage === 1}
              >
                <Feather name="chevron-left" size={16} color={safePage === 1 ? '#F8C29B' : PINK} />
              </TouchableOpacity>
              {pageNumbers.map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[MyNetworkStyles.pageBtn, page === safePage && MyNetworkStyles.pageBtnActive]}
                  onPress={() => goToPage(page)}
                >
                  <Text style={[MyNetworkStyles.pageBtnText, page === safePage && MyNetworkStyles.pageBtnTextActive]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[MyNetworkStyles.pageBtn, safePage === totalPages && MyNetworkStyles.pageBtnDisabled]}
                onPress={() => goToPage(safePage + 1)} disabled={safePage === totalPages}
              >
                <Feather name="chevron-right" size={16} color={safePage === totalPages ? '#F8C29B' : PINK} />
              </TouchableOpacity>
            </View>
            <Text style={MyNetworkStyles.pageInfo}>Page {safePage} of {totalPages}</Text>
          </>
        ) : (
          <Text style={MyNetworkStyles.emptyText}>
            {searchQuery ? `No results found for "${searchQuery}"` : 'No network data found yet.'}
          </Text>
        )}
      </>
    );
  };

  return (
    <View style={MyNetworkStyles.root}>
      <TouchableOpacity
        style={MyNetworkStyles.backBtnRow}
        onPress={() => navigation.navigate('QuickMenu')}
        activeOpacity={0.8}
      >
        <View style={MyNetworkStyles.backBtnIcon}>
          <Feather name="x" size={16} color={PINK} /> 
        </View>
        <Text style={MyNetworkStyles.backBtnText}>Back to Menu</Text>
      </TouchableOpacity>

      <ScrollView
        style={MyNetworkStyles.scrollView}
        contentContainerStyle={MyNetworkStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={MyNetworkStyles.metricsRow}>
          <View style={[MyNetworkStyles.metricCard, MyNetworkStyles.metricPrimary]}>
            <Text style={MyNetworkStyles.metricValue}>{networkData?.totalMembers ?? 0}</Text>
            <Text style={MyNetworkStyles.metricLabel}>Total Members</Text>
          </View>
          <View style={[MyNetworkStyles.metricCard, MyNetworkStyles.metricAccent]}>
            <Text style={MyNetworkStyles.metricValue}>{networkData?.linkedMembers ?? 0}</Text>
            <Text style={MyNetworkStyles.metricLabel}>Linked Members</Text>
          </View>
        </View>

        <View style={MyNetworkStyles.card}>
          <Text style={MyNetworkStyles.sectionTitle}>Member Records</Text>
          {mobileTableContent()}
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
