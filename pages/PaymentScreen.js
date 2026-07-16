import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import PaymentStyles from '../styles/PaymentStyles';

const S = PaymentStyles;

// ─────────────────────────────────────────────────────────────
// WEB-ONLY styles  (orange + white, smooth)
// ─────────────────────────────────────────────────────────────
const W_ORANGE      = '#F97316';
const W_ORANGE_DARK = '#ea6a0a';
const W_ORANGE_LT   = '#fff7ed';
const W_ORANGE_BDR  = '#fed7aa';

const webStyles = StyleSheet.create({

  // ── outer page ──
  page: {
    flexGrow: 1,
    backgroundColor: '#fff4ec',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 1000,
    shadowColor: W_ORANGE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 48,
    elevation: 10,
  },

  // ── LEFT panel ──
  leftPanel: {
    width: '42%',
    backgroundColor: W_ORANGE,
    padding: 40,
    paddingTop: 36,
  },
  leftTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 36,
  },
  backBtnWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnTextWeb: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },

  leftEyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 6,
  },
  leftTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 28,
    letterSpacing: -0.5,
  },

  // visual card stack
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginTop: 24,
    marginBottom: 24,
  },
  visualCard: {
    width: 260,
    height: 160,
    borderRadius: 20,
    padding: 22,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  visualCard1: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '-6deg' }],
  },
  visualCard2: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    position: 'absolute',
    top: 18,
    transform: [{ rotate: '-2deg' }],
  },
  visualCard3: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    position: 'relative',
    zIndex: 3,
  },
  visualCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipDot: {
    width: 28,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#fcd34d',
    opacity: 0.85,
  },
  cardBrandText: {
    fontSize: 13,
    fontWeight: '800',
    color: W_ORANGE,
    letterSpacing: 1,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1917',
  },

  // user info bottom of left
  leftUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  leftAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  leftUserEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 2,
  },

  // ── RIGHT panel ──
  rightPanel: {
    flex: 1,
    padding: 40,
    paddingTop: 36,
  },
  rightTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1c1917',
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  // order summary box
  orderBox: {
    backgroundColor: W_ORANGE_LT,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: W_ORANGE_BDR,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  orderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: W_ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  orderPlanName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c1917',
  },
  orderIdText: {
    fontSize: 12,
    color: '#a8a29e',
    marginTop: 2,
  },

  // amount row
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ffe8d6',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 13,
    color: '#78716c',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 30,
    fontWeight: '900',
    color: W_ORANGE,
    letterSpacing: -1,
  },

  // pay button
  payBtn: {
    backgroundColor: W_ORANGE,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    shadowColor: W_ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  payBtnDisabled: { opacity: 0.55 },
  payBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  secureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  secureBadgeText: {
    fontSize: 11,
    color: '#b0b8cc',
    fontWeight: '600',
  },

  // note card
  noteCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: W_ORANGE_LT,
    borderWidth: 1,
    borderColor: W_ORANGE_BDR,
    gap: 6,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: W_ORANGE,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#57534e',
  },
  noteValue: {
    fontWeight: '800',
    color: W_ORANGE,
  },

  // no order
  noOrderBox: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  noOrderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14b87a',
  },

  // success banner
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
    flex: 1,
  },

  // ── history section (below main card) ──
  historyWrapper: {
    width: '100%',
    maxWidth: 1000,
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: W_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe8d6',
  },
  historyLeft: { flex: 1 },
  historyAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#a8a29e',
  },
  historyMetaBold: {
    fontWeight: '700',
    color: '#78716c',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPending: { backgroundColor: '#fef3c7' },
  statusSuccess: { backgroundColor: '#dcfce7' },
  statusFailed:  { backgroundColor: '#fff0f5' },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextPending: { color: '#92400e' },
  statusTextSuccess: { color: '#166534' },
  statusTextFailed:  { color: '#F97316' },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: W_ORANGE_LT,
    borderWidth: 1,
    borderColor: W_ORANGE_BDR,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: W_ORANGE,
  },

  emptyText: {
    fontSize: 13,
    color: '#b0b8cc',
    textAlign: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 13,
    color: '#a8a29e',
    paddingVertical: 8,
  },
});

// ─────────────────────────────────────────────────────────────
// WebLayout — split screen payment UI
// ─────────────────────────────────────────────────────────────
function WebLayout({
  paymentData,
  loading,
  paying,
  successMessage,
  handlePay,
  handleViewStatus,
  navigation,
}) {
  const order = paymentData.pending_order;
  const user  = paymentData.currentUser;

  const statusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return webStyles.statusSuccess;
      case 'failed':  return webStyles.statusFailed;
      default:        return webStyles.statusPending;
    }
  };
  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return webStyles.statusTextSuccess;
      case 'failed':  return webStyles.statusTextFailed;
      default:        return webStyles.statusTextPending;
    }
  };

  return (
    <ScrollView
      contentContainerStyle={webStyles.page}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Main split card ── */}
      <View style={webStyles.card}>

        {/* LEFT — orange panel */}
        <View style={webStyles.leftPanel}>

          {/* Back */}
          <View>
            <TouchableOpacity
              style={webStyles.backBtnWeb}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={webStyles.backBtnTextWeb}>Back</Text>
            </TouchableOpacity>

            <Text style={[webStyles.leftEyebrow, { marginTop: 28 }]}>
              In-App Payment
            </Text>
            <Text style={webStyles.leftTitle}>Secure{'\n'}Payment</Text>
          </View>

          {/* Card stack visual */}
          <View style={webStyles.cardStack}>
            {/* card 1 — back */}
            <View style={[webStyles.visualCard, webStyles.visualCard1]}>
              <View style={webStyles.visualCardTop}>
                <View style={webStyles.chipDot} />
              </View>
            </View>
            {/* card 2 — mid */}
            <View style={[webStyles.visualCard, webStyles.visualCard2]}>
              <View style={webStyles.visualCardTop}>
                <View style={webStyles.chipDot} />
              </View>
            </View>
            {/* card 3 — front (white) */}
            <View style={[webStyles.visualCard, webStyles.visualCard3]}>
              <View style={webStyles.visualCardTop}>
                <View style={webStyles.chipDot} />
                <Text style={webStyles.cardBrandText}>VISA</Text>
              </View>
              <Text style={webStyles.cardNumber}>4455  ****  ****  6164</Text>
              <View style={webStyles.cardBottom}>
                <View>
                  <Text style={webStyles.cardLabel}>Card Holder</Text>
                  <Text style={webStyles.cardValue}>{user?.name || 'Member'}</Text>
                </View>
                <View>
                  <Text style={webStyles.cardLabel}>Expires</Text>
                  <Text style={webStyles.cardValue}>12 / 28</Text>
                </View>
              </View>
            </View>
          </View>

          {/* User info */}
          <View style={webStyles.leftUserRow}>
            <View style={webStyles.leftAvatar}>
              <Feather name="user" size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={webStyles.leftUserName}>{user?.name || 'Member'}</Text>
              <Text style={webStyles.leftUserEmail}>{user?.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* RIGHT — white form panel */}
        <View style={webStyles.rightPanel}>
          <Text style={webStyles.rightTitle}>Payment Details</Text>

          {/* Success banner */}
          {successMessage ? (
            <View style={webStyles.successBanner}>
              <Feather name="check-circle" size={16} color="#15803d" />
              <Text style={webStyles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {order ? (
            <>
              {/* Order summary */}
              <View style={webStyles.orderBox}>
                <View style={webStyles.orderIconWrap}>
                  <Feather name="shopping-bag" size={22} color={W_ORANGE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={webStyles.orderPlanName}>{order.plan_name}</Text>
                  <Text style={webStyles.orderIdText}>Order ID: {order.order_id}</Text>
                </View>
              </View>

              {/* Amount */}
              <View style={webStyles.amountRow}>
                <Text style={webStyles.amountLabel}>Amount to Pay</Text>
                <Text style={webStyles.amountValue}>Rs. {order.amount}</Text>
              </View>

              {/* Pay button */}
              <TouchableOpacity
                style={[webStyles.payBtn, paying && webStyles.payBtnDisabled]}
                onPress={handlePay}
                disabled={paying}
              >
                {paying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="credit-card" size={18} color="#fff" />
                    <Text style={webStyles.payBtnText}>Pay Rs. {order.amount}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Secure badge */}
              <View style={webStyles.secureBadgeRow}>
                <Feather name="shield" size={12} color="#b0b8cc" />
                <Text style={webStyles.secureBadgeText}>Secure in-app payment flow</Text>
              </View>

              {/* Note */}
              <View style={webStyles.noteCard}>
                <View style={webStyles.noteHeader}>
                  <Feather name="info" size={14} color={W_ORANGE} />
                  <Text style={webStyles.noteTitle}>Payment Note</Text>
                </View>
                <Text style={webStyles.noteText}>
                  Subscription activate hone ke liye{' '}
                  <Text style={webStyles.noteValue}>Pay</Text> button press karein.
                </Text>
              </View>
            </>
          ) : (
            !loading && (
              <View style={webStyles.noOrderBox}>
                <Feather name="check-circle" size={40} color="#14b87a" />
                <Text style={webStyles.noOrderText}>No pending payments</Text>
              </View>
            )
          )}

          {loading && (
            <Text style={webStyles.loadingText}>Loading payment details…</Text>
          )}
        </View>
      </View>

      {/* ── Payment History (below main card) ── */}
      <View style={webStyles.historyWrapper}>
        <Text style={webStyles.historySectionTitle}>Payment History</Text>

        {loading ? (
          <Text style={webStyles.loadingText}>Loading payment history…</Text>
        ) : paymentData.payment_history.length ? (
          paymentData.payment_history.map((item, index) => (
            <View key={item.payment_id || index} style={webStyles.historyItem}>
              <View style={webStyles.historyLeft}>
                <Text style={webStyles.historyAmount}>Rs. {item.amount}</Text>
                <Text style={webStyles.historyMeta}>
                  Order:{' '}
                  <Text style={webStyles.historyMetaBold}>{item.order_id}</Text>
                  {'  ·  '}{item.date}
                </Text>
              </View>
              <View style={webStyles.historyRight}>
                <View style={[webStyles.statusBadge, statusBadgeStyle(item.status)]}>
                  <Text style={[webStyles.statusText, statusTextStyle(item.status)]}>
                    {item.status}
                  </Text>
                </View>
                <TouchableOpacity
                  style={webStyles.viewBtn}
                  onPress={() => handleViewStatus(item)}
                >
                  <Feather name="eye" size={12} color={W_ORANGE} />
                  <Text style={webStyles.viewBtnText}>View Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={webStyles.emptyText}>No payment history found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export default function PaymentScreen({ route, navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileWeb = isWeb && windowWidth <= 760;
  const { showToast } = useToast();
  const orderFromRoute = route?.params?.order || null;
  const returnTo = route?.params?.returnTo || 'Subscription Plans';

  const [loading, setLoading]                       = useState(true);
  const [paying, setPaying]                         = useState(false);
  const [successMessage, setSuccessMessage]         = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment]       = useState(null);

  const [paymentData, setPaymentData] = useState({
    currentUser:     null,
    pending_order:   null,
    payment_history: [],
  });

  const loadPayment = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getPaymentSummary();

    if (!data) {
      setLoading(false);
      navigation.replace('Login');
      return;
    }

    if (orderFromRoute) {
      const order = await UserStore.createPaymentOrder({
        order_id:     orderFromRoute.order_id,
        amount:       orderFromRoute.amount,
        plan_id:      orderFromRoute.plan_id,
        seat_state:   orderFromRoute.seat_state,
        seat_role_id: orderFromRoute.seat_role_id,
      });
      setLoading(false);
      if (!order) {
        showToast('Unable to prepare payment order.', 'error');
        setPaymentData(data);
        return;
      }
      setPaymentData({ ...data, pending_order: order });
      return;
    }

    setLoading(false);
    setPaymentData(data);
  }, [navigation, orderFromRoute, showToast]);

  useFocusEffect(useCallback(() => { loadPayment(); }, [loadPayment]));

  const onPaymentSuccess = async (paymentId, orderId, signature, order) => {
    const verifyResult = await UserStore.verifyPayment({
      payment_id:   paymentId,
      order_id:     orderId,
      signature:    signature || '',
      plan_id:      order?.plan_id,
      seat_state:   order?.seat_state,
      seat_role_id: order?.seat_role_id,
    });

    setPaying(false);

    if (!verifyResult?.ok) {
      showToast(verifyResult?.message || 'Payment verification failed.', 'error');
      return;
    }

    const msg = `Subscription successful! ${verifyResult.role_label} activated.`;
    setSuccessMessage(msg);
    showToast(msg, 'success');
    setTimeout(() => setSuccessMessage(''), 3000);

    const updatedUser = await UserStore.getCurrentUser();
    const needsLocation =
      UserStore.hasPremiumAccess(updatedUser) && !updatedUser?.location_complete;
    if (needsLocation) {
      navigation.replace('StateSelect', { fromPremium: true });
      return;
    }

    loadPayment();
    navigation.replace(returnTo, { subscriptionSuccessMessage: msg });
  };

  const handlePay = async () => {
    const order = paymentData.pending_order;
    if (!order) { showToast('No pending order found.', 'error'); return; }
    setPaying(true);
    try {
      await onPaymentSuccess(`pay_${Date.now()}`, order.order_id, '', order);
    } catch {
      setPaying(false);
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const handleViewStatus = (payment) => {
    setSelectedPayment(payment);
    setStatusModalVisible(true);
  };

  // ── shared helpers (used by app layout & status modal) ──
  const statusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return S.statusSuccess;
      case 'failed':  return S.statusFailed;
      default:        return S.statusPending;
    }
  };
  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return S.statusTextSuccess;
      case 'failed':  return S.statusTextFailed;
      default:        return S.statusTextPending;
    }
  };
  const statusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'check-circle';
      case 'failed':  return 'x-circle';
      default:        return 'clock';
    }
  };
  const statusIconColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return '#14b87a';
      case 'failed':  return '#F97316';
      default:        return '#d97706';
    }
  };

  // ── Status Modal (shared — works on both platforms) ──
  const StatusModal = (
    <Modal
      visible={statusModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setStatusModalVisible(false)}
    >
      <View style={S.modalOverlay}>
        <View style={S.modalCard}>
          <View style={S.modalHandle} />

          <View style={S.modalHeader}>
            <Text style={S.modalTitle}>Payment Status</Text>
            <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
              <Feather name="x" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {selectedPayment ? (
            <>
              <View style={S.modalStatusWrap}>
                <View style={[S.modalStatusBadge, statusBadgeStyle(selectedPayment.status)]}>
                  <Feather
                    name={statusIcon(selectedPayment.status)}
                    size={32}
                    color={statusIconColor(selectedPayment.status)}
                  />
                  <Text style={[S.modalStatusText, statusTextStyle(selectedPayment.status)]}>
                    {selectedPayment.status}
                  </Text>
                </View>
              </View>

              {[
                { label: 'Order ID',   value: selectedPayment.order_id },
                { label: 'Payment ID', value: selectedPayment.payment_id },
                { label: 'Amount',     value: `Rs. ${selectedPayment.amount}` },
                { label: 'Date',       value: selectedPayment.date },
              ].map(({ label, value }) => (
                <View key={label} style={S.modalInfoRow}>
                  <Text style={S.modalInfoLabel}>{label}</Text>
                  <Text style={S.modalInfoValue}>{value || '-'}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );

  // ── WEB layout ──
  if (isWeb && !isMobileWeb) {
    return (
      <>
        <WebLayout
          paymentData={paymentData}
          loading={loading}
          paying={paying}
          successMessage={successMessage}
          handlePay={handlePay}
          handleViewStatus={handleViewStatus}
          navigation={navigation}
        />
        {StatusModal}
      </>
    );
  }

  // ── APP layout (original — untouched) ──
  return (
    <View style={S.root}>
      <ScrollView
        style={S.scrollView}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ── */}
        <View style={S.heroCard}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={S.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color="#ffffff" />
            <Text style={S.backBtnText}>Back</Text>
          </TouchableOpacity>

          <Text style={S.heroEyebrow}>In-App Payment</Text>
          <Text style={S.heroTitle}>Secure Payment</Text>

          <View style={S.ownerRow}>
            <View style={S.ownerBadge}>
              <Feather name="user" size={16} color="#ffffff" />
            </View>
            <View style={S.ownerInfo}>
              <Text style={S.ownerName}>
                {paymentData.currentUser?.name || 'Member'}
              </Text>
              <Text style={S.ownerEmail}>
                {paymentData.currentUser?.email || '-'}
              </Text>
            </View>
          </View>
        </View>

        {successMessage ? (
          <Text style={S.successText}>{successMessage}</Text>
        ) : null}

        {/* ── Order Card ── */}
        {paymentData.pending_order ? (
          <View style={S.orderCard}>
            <View style={S.orderHeader}>
              <View style={S.orderIconWrap}>
                <Feather name="shopping-bag" size={22} color="#F97316" />
              </View>
              <View style={S.orderHeaderInfo}>
                <Text style={S.orderPlanName}>
                  {paymentData.pending_order.plan_name}
                </Text>
                <Text style={S.orderIdText}>
                  Order ID: {paymentData.pending_order.order_id}
                </Text>
              </View>
            </View>

            <View style={S.divider} />

            <View style={S.amountRow}>
              <Text style={S.amountLabel}>Amount to Pay</Text>
              <Text style={S.amountValue}>
                Rs. {paymentData.pending_order.amount}
              </Text>
            </View>

            <TouchableOpacity
              style={[S.payBtn, paying && S.payBtnDisabled]}
              onPress={handlePay}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="credit-card" size={18} color="#fff" />
                  <Text style={S.payBtnText}>
                    Pay Rs. {paymentData.pending_order.amount}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={S.paymentBadgeRow}>
              <Feather name="shield" size={12} color="#b0b8cc" />
              <Text style={S.paymentBadgeText}>Secure in-app payment flow</Text>
            </View>

            <View style={S.testHelperCard}>
              <View style={S.testHelperHeader}>
                <Feather name="info" size={14} color="#F97316" />
                <Text style={S.testHelperTitle}>Payment Note</Text>
              </View>
              <Text style={S.testHelperText}>
                Subscription activate hone ke liye{' '}
                <Text style={S.testHelperValue}>Pay</Text> button press karein.
              </Text>
            </View>
          </View>
        ) : (
          !loading && (
            <View style={S.noOrderCard}>
              <Feather name="check-circle" size={36} color="#14b87a" />
              <Text style={S.noOrderText}>No pending payments</Text>
            </View>
          )
        )}

        {/* ── Payment History ── */}
        <View style={S.card}>
          <Text style={S.sectionTitle}>Payment History</Text>

          {loading ? (
            <Text style={S.loadingText}>Loading payment history…</Text>
          ) : paymentData.payment_history.length ? (
            paymentData.payment_history.map((item, index) => (
              <View key={item.payment_id || index} style={S.historyCard}>
                <View style={S.historyTopRow}>
                  <Text style={S.historyAmount}>Rs. {item.amount}</Text>
                  <View style={[S.statusBadge, statusBadgeStyle(item.status)]}>
                    <Text style={[S.statusText, statusTextStyle(item.status)]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={S.historyMetaRow}>
                  <Feather name="hash" size={12} color="#b0b8cc" />
                  <Text style={S.historyMeta}>
                    Order ID:{' '}
                    <Text style={S.historyMetaBold}>{item.order_id}</Text>
                  </Text>
                </View>

                {item.payment_id ? (
                  <View style={S.historyMetaRow}>
                    <Feather name="credit-card" size={12} color="#b0b8cc" />
                    <Text style={S.historyMeta}>
                      Payment ID:{' '}
                      <Text style={S.historyMetaBold}>{item.payment_id}</Text>
                    </Text>
                  </View>
                ) : null}

                <View style={S.historyMetaRow}>
                  <Feather name="calendar" size={12} color="#b0b8cc" />
                  <Text style={S.historyMeta}>{item.date}</Text>
                </View>

                <TouchableOpacity
                  style={S.viewStatusBtn}
                  onPress={() => handleViewStatus(item)}
                >
                  <Feather name="eye" size={13} color="#F97316" />
                  <Text style={S.viewStatusBtnText}>View Status</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={S.emptyText}>No payment history found.</Text>
          )}
        </View>
      </ScrollView>

      {StatusModal}
    </View>
  );
}