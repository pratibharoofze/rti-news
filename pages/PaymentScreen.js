import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import PaymentStyles from '../styles/PaymentStyles';

const RAZORPAY_KEY_ID = 'rzp_test_Scy5dqh0x5707V';

export default function PaymentScreen({ route, navigation }) {
  const { showToast } = useToast();
  const orderFromRoute = route?.params?.order || null;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
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

  const moduleName = 'Payment';

  const loadPayment = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getPaymentSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }

    if (orderFromRoute) {
      setPaymentData({
        ...data,
        pending_order: {
          order_id: orderFromRoute.order_id || `ORD_${Date.now()}`,
          amount: orderFromRoute.amount,
          plan_name: orderFromRoute.plan_name,
          plan_id: orderFromRoute.plan_id,
        },
      });
      return;
    }

    setPaymentData(data);
  }, [navigation, orderFromRoute]);

  useFocusEffect(
    useCallback(() => {
      loadPayment();
    }, [loadPayment])
  );

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const handlePay = async () => {
    const order = paymentData.pending_order;

    if (!order) {
      showToast('No pending order found.', 'error');
      return;
    }

    if (Platform.OS === 'web') {
      showToast('Razorpay checkout web par supported nahi hai. Android app build me check karein.', 'error');
      return;
    }

    setPaying(true);

    try {
      const options = {
        description: `Payment for ${order.plan_name}`,
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: Math.round(Number(order.amount) * 100),
        name: 'RTI News',
        prefill: {
          email: paymentData.currentUser?.email || '',
          contact: paymentData.currentUser?.mobile || '',
          name: paymentData.currentUser?.name || '',
        },
        notes: {
          app_order_id: order.order_id,
          plan_id: order.plan_id,
          plan_name: order.plan_name,
        },
        theme: { color: '#2563eb' },
      };

      const razorpayData = await RazorpayCheckout.open(options);
      const verifyResult = await UserStore.verifyPayment({
        payment_id: razorpayData?.razorpay_payment_id || `pay_${Date.now()}`,
        order_id: order.order_id,
        signature: razorpayData?.razorpay_signature || '',
        plan_id: order.plan_id,
      });

      setPaying(false);

      if (!verifyResult?.ok) {
        showToast(verifyResult?.message || 'Payment verification failed.', 'error');
        return;
      }

      const subscriptionSuccessMessage = 'Subscription successful! Plan activated.';
      setSuccessMessage(subscriptionSuccessMessage);
      showToast(subscriptionSuccessMessage, 'success');
      setTimeout(() => setSuccessMessage(''), 3000);

      const updatedUser = await UserStore.getCurrentUser();
      const needsLocation = UserStore.hasPremiumAccess(updatedUser) && !updatedUser?.location_complete;
      if (needsLocation) {
        navigation.replace('StateSelect', { fromPremium: true });
        return;
      }

      loadPayment();
      navigation.replace('Subscription Plans', { subscriptionSuccessMessage });
    } catch (error) {
      setPaying(false);
      if (error?.code === 0) {
        showToast('Payment cancelled.', 'error');
      } else {
        showToast(error?.description || 'Payment failed. Please try again.', 'error');
      }
    }
  };

  const handleViewStatus = (payment) => {
    setSelectedPayment(payment);
    setStatusModalVisible(true);
  };

  const statusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return PaymentStyles.statusSuccess;
      case 'failed': return PaymentStyles.statusFailed;
      default: return PaymentStyles.statusPending;
    }
  };

  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return PaymentStyles.statusTextSuccess;
      case 'failed': return PaymentStyles.statusTextFailed;
      default: return PaymentStyles.statusTextPending;
    }
  };

  return (
    <View style={PaymentStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView
        style={PaymentStyles.scrollView}
        contentContainerStyle={PaymentStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={PaymentStyles.heroCard}>
          <Text style={PaymentStyles.heroEyebrow}>Razorpay</Text>
          <Text style={PaymentStyles.heroTitle}>Secure Payment</Text>
          <View style={PaymentStyles.ownerRow}>
            <View style={PaymentStyles.ownerBadge}>
              <Feather name="user" size={16} color="#2563eb" />
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
                <Feather name="shopping-bag" size={22} color="#2563eb" />
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

            <View style={PaymentStyles.razorpayBadgeRow}>
              <Feather name="shield" size={12} color="#64748b" />
              <Text style={PaymentStyles.razorpayBadgeText}>
                Secured by Razorpay - 256-bit SSL
              </Text>
            </View>

            <View style={PaymentStyles.testHelperCard}>
              <View style={PaymentStyles.testHelperHeader}>
                <Feather name="info" size={14} color="#1d4ed8" />
                <Text style={PaymentStyles.testHelperTitle}>Razorpay Test Details</Text>
              </View>

              <Text style={PaymentStyles.testHelperText}>
                Test Card: <Text style={PaymentStyles.testHelperValue}>4111 1111 1111 1111</Text>
              </Text>
              <Text style={PaymentStyles.testHelperText}>
                Expiry: <Text style={PaymentStyles.testHelperValue}>12/29</Text> | CVV: <Text style={PaymentStyles.testHelperValue}>123</Text>
              </Text>
              <Text style={PaymentStyles.testHelperText}>
                Test UPI Success: <Text style={PaymentStyles.testHelperValue}>success@razorpay</Text>
              </Text>
              <Text style={PaymentStyles.testHelperText}>
                Test UPI Failure: <Text style={PaymentStyles.testHelperValue}>failure@razorpay</Text>
              </Text>
              <Text style={PaymentStyles.testHelperText}>
                OTP: <Text style={PaymentStyles.testHelperValue}>123456</Text>
              </Text>
            </View>
          </View>
        ) : (
          !loading && (
            <View style={PaymentStyles.noOrderCard}>
              <Feather name="check-circle" size={36} color="#16a34a" />
              <Text style={PaymentStyles.noOrderText}>
                No pending payments
              </Text>
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
                  <Text style={PaymentStyles.historyAmount}>
                    Rs. {item.amount}
                  </Text>
                  <View style={[PaymentStyles.statusBadge, statusBadgeStyle(item.status)]}>
                    <Text style={[PaymentStyles.statusText, statusTextStyle(item.status)]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={PaymentStyles.historyMetaRow}>
                  <Feather name="hash" size={12} color="#94a3b8" />
                  <Text style={PaymentStyles.historyMeta}>
                    Order ID: <Text style={PaymentStyles.historyMetaBold}>{item.order_id}</Text>
                  </Text>
                </View>

                {item.payment_id ? (
                  <View style={PaymentStyles.historyMetaRow}>
                    <Feather name="credit-card" size={12} color="#94a3b8" />
                    <Text style={PaymentStyles.historyMeta}>
                      Payment ID: <Text style={PaymentStyles.historyMetaBold}>{item.payment_id}</Text>
                    </Text>
                  </View>
                ) : null}

                <View style={PaymentStyles.historyMetaRow}>
                  <Feather name="calendar" size={12} color="#94a3b8" />
                  <Text style={PaymentStyles.historyMeta}>{item.date}</Text>
                </View>

                <TouchableOpacity
                  style={PaymentStyles.viewStatusBtn}
                  onPress={() => handleViewStatus(item)}
                >
                  <Feather name="eye" size={13} color="#2563eb" />
                  <Text style={PaymentStyles.viewStatusBtnText}>View Status</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={PaymentStyles.emptyText}>No payment history found.</Text>
          )}
        </View>
      </ScrollView>

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
                <Feather name="x" size={22} color="#0f172a" />
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
                  { label: 'Order ID', value: selectedPayment.order_id },
                  { label: 'Payment ID', value: selectedPayment.payment_id },
                  { label: 'Amount', value: `Rs. ${selectedPayment.amount}` },
                  { label: 'Date', value: selectedPayment.date },
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

      <Footer activeTab={activeTab} onTabPress={setActiveTab} />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />
    </View>
  );
}
