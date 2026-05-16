import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import PaymentStyles from '../styles/PaymentStyles';

export default function PaymentScreen({ route, navigation }) {
  const { showToast } = useToast();
  const orderFromRoute = route?.params?.order || null;
  const returnTo = route?.params?.returnTo || 'Subscription Plans';

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [paymentData, setPaymentData] = useState({
    currentUser: null,
    pending_order: null,
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
        order_id: orderFromRoute.order_id,
        amount: orderFromRoute.amount,
        plan_id: orderFromRoute.plan_id,
        seat_state: orderFromRoute.seat_state,
        seat_role_id: orderFromRoute.seat_role_id,
      });
      setLoading(false);
      if (!order) {
        showToast('Unable to prepare payment order.', 'error');
        setPaymentData(data);
        return;
      }
      setPaymentData({
        ...data,
        pending_order: order,
      });
      return;
    }

    setLoading(false);
    setPaymentData(data);
  }, [navigation, orderFromRoute, showToast]);

  useFocusEffect(
    useCallback(() => {
      loadPayment();
    }, [loadPayment])
  );

  const onPaymentSuccess = async (paymentId, orderId, signature, order) => {
    const verifyResult = await UserStore.verifyPayment({
      payment_id: paymentId,
      order_id: orderId,
      signature: signature || '',
      plan_id: order?.plan_id,
      seat_state: order?.seat_state,
      seat_role_id: order?.seat_role_id,
    });

    setPaying(false);

    if (!verifyResult?.ok) {
      showToast(verifyResult?.message || 'Payment verification failed.', 'error');
      return;
    }

    const subscriptionSuccessMessage = `Subscription successful! ${verifyResult.role_label} activated.`;
    setSuccessMessage(subscriptionSuccessMessage);
    showToast(subscriptionSuccessMessage, 'success');
    setTimeout(() => setSuccessMessage(''), 3000);

    const updatedUser = await UserStore.getCurrentUser();
    const needsLocation =
      UserStore.hasPremiumAccess(updatedUser) && !updatedUser?.location_complete;
    if (needsLocation) {
      navigation.replace('StateSelect', { fromPremium: true });
      return;
    }

    loadPayment();
    navigation.replace(returnTo, { subscriptionSuccessMessage });
  };

  const handlePay = async () => {
    const order = paymentData.pending_order;

    if (!order) {
      showToast('No pending order found.', 'error');
      return;
    }

    setPaying(true);

    try {
      await onPaymentSuccess(`pay_${Date.now()}`, order.order_id, '', order);
    } catch (_error) {
      setPaying(false);
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const handleViewStatus = (payment) => {
    setSelectedPayment(payment);
    setStatusModalVisible(true);
  };

  const statusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return PaymentStyles.statusSuccess;
      case 'failed':  return PaymentStyles.statusFailed;
      default:        return PaymentStyles.statusPending;
    }
  };

  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return PaymentStyles.statusTextSuccess;
      case 'failed':  return PaymentStyles.statusTextFailed;
      default:        return PaymentStyles.statusTextPending;
    }
  };

  return (
    <View style={PaymentStyles.root}>
      <ScrollView
        style={PaymentStyles.scrollView}
        contentContainerStyle={PaymentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={PaymentStyles.heroCard}>

          {/* ✅ Back Button — Android status bar fix */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginBottom: 10,
              paddingHorizontal: 2,
              paddingVertical: 4,
              paddingTop: Platform.OS === 'android'
                ? (StatusBar.currentHeight || 24) + 4
                : 4,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color="#d95f00" />
            <Text style={{ color: '#d95f00', fontSize: 14, marginLeft: 5, fontWeight: '600' }}>
              Back
            </Text>
          </TouchableOpacity>

          <Text style={PaymentStyles.heroEyebrow}>In-App Payment</Text>
          <Text style={PaymentStyles.heroTitle}>Secure Payment</Text>

          <View style={PaymentStyles.ownerRow}>
            <View style={PaymentStyles.ownerBadge}>
              <Feather name="user" size={16} color="#d95f00" />
            </View>
            <View style={PaymentStyles.ownerInfo}>
              <Text style={PaymentStyles.ownerName}>
                {paymentData.currentUser?.name || 'Member'}
              </Text>
              <Text style={PaymentStyles.ownerEmail}>
                {paymentData.currentUser?.email || '-'}
              </Text>
            </View>
          </View>
        </View>

        {successMessage ? (
          <Text style={PaymentStyles.successText}>{successMessage}</Text>
        ) : null}

        {paymentData.pending_order ? (
          <View style={PaymentStyles.orderCard}>
            <View style={PaymentStyles.orderHeader}>
              <View style={PaymentStyles.orderIconWrap}>
                <Feather name="shopping-bag" size={22} color="#d95f00" />
              </View>
              <View style={PaymentStyles.orderHeaderInfo}>
                <Text style={PaymentStyles.orderPlanName}>
                  {paymentData.pending_order.plan_name}
                </Text>
                <Text style={PaymentStyles.orderIdText}>
                  Order ID: {paymentData.pending_order.order_id}
                </Text>
              </View>
            </View>

            <View style={PaymentStyles.divider} />

            <View style={PaymentStyles.amountRow}>
              <Text style={PaymentStyles.amountLabel}>Amount to Pay</Text>
              <Text style={PaymentStyles.amountValue}>
                Rs. {paymentData.pending_order.amount}
              </Text>
            </View>

            <TouchableOpacity
              style={[PaymentStyles.payBtn, paying && PaymentStyles.payBtnDisabled]}
              onPress={handlePay}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="credit-card" size={18} color="#fff" />
                  <Text style={PaymentStyles.payBtnText}>
                    Pay Rs. {paymentData.pending_order.amount}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={PaymentStyles.paymentBadgeRow}>
              <Feather name="shield" size={12} color="#aaaaaa" />
              <Text style={PaymentStyles.paymentBadgeText}>
                Secure in-app payment flow
              </Text>
            </View>

            <View style={PaymentStyles.testHelperCard}>
              <View style={PaymentStyles.testHelperHeader}>
                <Feather name="info" size={14} color="#d95f00" />
                <Text style={PaymentStyles.testHelperTitle}>Payment Note</Text>
              </View>
              <Text style={PaymentStyles.testHelperText}>
                Subscription activate hone ke liye{' '}
                <Text style={PaymentStyles.testHelperValue}>Pay</Text> button press karein.
              </Text>
            </View>
          </View>
        ) : (
          !loading && (
            <View style={PaymentStyles.noOrderCard}>
              <Feather name="check-circle" size={36} color="#16a34a" />
              <Text style={PaymentStyles.noOrderText}>No pending payments</Text>
            </View>
          )
        )}

        <View style={PaymentStyles.card}>
          <Text style={PaymentStyles.sectionTitle}>Payment History</Text>

          {loading ? (
            <Text style={PaymentStyles.loadingText}>Loading payment history...</Text>
          ) : paymentData.payment_history.length ? (
            paymentData.payment_history.map((item, index) => (
              <View key={item.payment_id || index} style={PaymentStyles.historyCard}>
                <View style={PaymentStyles.historyTopRow}>
                  <Text style={PaymentStyles.historyAmount}>Rs. {item.amount}</Text>
                  <View style={[PaymentStyles.statusBadge, statusBadgeStyle(item.status)]}>
                    <Text style={[PaymentStyles.statusText, statusTextStyle(item.status)]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={PaymentStyles.historyMetaRow}>
                  <Feather name="hash" size={12} color="#aaaaaa" />
                  <Text style={PaymentStyles.historyMeta}>
                    Order ID:{' '}
                    <Text style={PaymentStyles.historyMetaBold}>{item.order_id}</Text>
                  </Text>
                </View>

                {item.payment_id ? (
                  <View style={PaymentStyles.historyMetaRow}>
                    <Feather name="credit-card" size={12} color="#aaaaaa" />
                    <Text style={PaymentStyles.historyMeta}>
                      Payment ID:{' '}
                      <Text style={PaymentStyles.historyMetaBold}>{item.payment_id}</Text>
                    </Text>
                  </View>
                ) : null}

                <View style={PaymentStyles.historyMetaRow}>
                  <Feather name="calendar" size={12} color="#aaaaaa" />
                  <Text style={PaymentStyles.historyMeta}>{item.date}</Text>
                </View>

                <TouchableOpacity
                  style={PaymentStyles.viewStatusBtn}
                  onPress={() => handleViewStatus(item)}
                >
                  <Feather name="eye" size={13} color="#d95f00" />
                  <Text style={PaymentStyles.viewStatusBtnText}>View Status</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={PaymentStyles.emptyText}>No payment history found.</Text>
          )}
        </View>
      </ScrollView>

      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={PaymentStyles.modalOverlay}>
          <View style={PaymentStyles.modalCard}>
            <View style={PaymentStyles.modalHeader}>
              <Text style={PaymentStyles.modalTitle}>Payment Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Feather name="x" size={22} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            {selectedPayment ? (
              <>
                <View style={PaymentStyles.modalStatusWrap}>
                  <View
                    style={[
                      PaymentStyles.modalStatusBadge,
                      statusBadgeStyle(selectedPayment.status),
                    ]}
                  >
                    <Feather
                      name={
                        selectedPayment.status?.toLowerCase() === 'success'
                          ? 'check-circle'
                          : selectedPayment.status?.toLowerCase() === 'failed'
                          ? 'x-circle'
                          : 'clock'
                      }
                      size={32}
                      color={
                        selectedPayment.status?.toLowerCase() === 'success'
                          ? '#16a34a'
                          : selectedPayment.status?.toLowerCase() === 'failed'
                          ? '#dc2626'
                          : '#d97706'
                      }
                    />
                    <Text
                      style={[
                        PaymentStyles.modalStatusText,
                        statusTextStyle(selectedPayment.status),
                      ]}
                    >
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
                  <View key={label} style={PaymentStyles.modalInfoRow}>
                    <Text style={PaymentStyles.modalInfoLabel}>{label}</Text>
                    <Text style={PaymentStyles.modalInfoValue}>{value || '-'}</Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}