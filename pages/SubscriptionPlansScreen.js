import React, { useCallback, useEffect, useMemo, useState } from 'react'; 
import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
} from 'react-native'; 
import { Feather } from '@expo/vector-icons'; 
import { useFocusEffect } from '@react-navigation/native'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import SubscriptionPlansStyles from '../styles/SubscriptionPlansStyles';
import { UserStore } from '../store/UserStore';

// ✅ Role badge colors
const ROLE_COLORS = {
  free:    { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
  basic:   { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' },
  pro:     { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  premium: { bg: '#fefce8', text: '#b45309', border: '#fcd34d' },
};

function RoleBadge({ role = 'free', label }) { 
  const colors = ROLE_COLORS[role] || ROLE_COLORS.free;
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 99,
      borderWidth: 1,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      alignSelf: 'flex-start',
    }}>
      <Feather
        name={role === 'premium' ? 'star' : role === 'pro' ? 'award' : role === 'basic' ? 'check-circle' : 'user'}
        size={12}
        color={colors.text}
      />
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
        {label || UserStore.getRoleLabel(role)}
      </Text>
    </View>
  ); 
} 
 
function SeatSelectModal({
  visible,
  stateName,
  seats,
  selectedSeatId,
  onClose,
  onSelectSeatId,
}) {
  const seatsToShow = Array.isArray(seats) ? seats : [];
  const isLoadingSeats = seatsToShow.length === 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={onClose} />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: 16,
          paddingBottom: 18,
          maxHeight: '78%',
        }}
      >
        <View style={{ width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 99, alignSelf: 'center', marginBottom: 12 }} />

        <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a' }}>
          Select Seat
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, color: '#64748b', fontWeight: '700' }}>
          State: {stateName || '-'}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
          {isLoadingSeats ? (
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '700', paddingVertical: 10 }}>
              Loading seats…
            </Text>
          ) : null}

          <View style={{ gap: 8, paddingBottom: 18 }}>
            {seatsToShow.map((seat) => {
              const isTaken = seat.status === 'taken';
              const isDisabled = seat.status === 'disabled';
              const isSelected = selectedSeatId === seat.id;
              const disabled = isTaken || isDisabled;

              const borderColor = isSelected ? '#1d4ed8' : disabled ? '#e2e8f0' : '#cbd5e1';
              const backgroundColor = isSelected ? '#eff6ff' : disabled ? '#f8fafc' : '#ffffff';
              const statusText =
                seat.status === 'mine' ? 'Yours'
                : isTaken ? 'Taken'
                : isDisabled ? 'Select state first'
                : 'Available';
              const statusColor = disabled ? '#64748b' : '#1d4ed8';

              return (
                <TouchableOpacity
                  key={seat.id}
                  activeOpacity={0.85}
                  disabled={disabled}
                  onPress={() => onSelectSeatId(seat.id)}
                  style={{
                    borderWidth: 1,
                    borderColor,
                    backgroundColor,
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: disabled ? '#64748b' : '#0f172a' }}>
                      {seat.name}
                    </Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: statusColor, fontWeight: '800' }}>
                      {statusText}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View style={{ backgroundColor: '#1d4ed8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>Selected</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SubscriptionPlansScreen({ navigation, route }) { 
  const { showToast, showPopup } = useToast(); 
  const [sidebarVisible, setSidebarVisible]   = useState(false); 
  const [loading, setLoading]                 = useState(true); 
  const [seatSummary, setSeatSummary]         = useState(null); 
  const [selectedSeatId, setSelectedSeatId]   = useState(''); 
  const [pendingPlan, setPendingPlan]         = useState(null);
  const [seatModalOpen, setSeatModalOpen]     = useState(false);
 
  const [subscriptionData, setSubscriptionData] = useState({ 
    currentUser:      null, 
    activePlan:       null, 
    plans:            [], 
    currentRole:      'free',
    currentRoleLabel: 'Free Member',
  });

  const moduleName = 'Subscription Plans';

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const [data, seatData] = await Promise.all([
      UserStore.getSubscriptionSummary(),
      UserStore.getStateSeatSummary(),
    ]);
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }
    setSubscriptionData(data);
    setSeatSummary(seatData || null);
    const seatId = seatData?.current_seat?.seat_id || '';
    setSelectedSeatId((prev) => prev || seatId);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [loadPlans])
  );

  useFocusEffect( 
    useCallback(() => { 
      if (route?.params?.subscriptionSuccessMessage) { 
        showToast(route.params.subscriptionSuccessMessage, 'success'); 
        navigation.setParams({ subscriptionSuccessMessage: undefined }); 
      } 
    }, [navigation, route?.params?.subscriptionSuccessMessage, showToast]) 
  ); 

  useEffect(() => {
    const preselectedPlanId = route?.params?.preselectedPlanId;
    const preselectedSeatId = route?.params?.preselectedSeatId;
    if (!preselectedPlanId || !preselectedSeatId) return;
    if (!subscriptionData?.plans?.length) return;

    const plan = subscriptionData.plans.find((p) => p.plan_id === preselectedPlanId) || null;
    if (!plan) return;

    setPendingPlan(plan);
    setSelectedSeatId(preselectedSeatId);

    navigation.setParams({
      preselectedPlanId: undefined,
      preselectedSeatId: undefined,
      fromDashboard: undefined,
    });
  }, [navigation, route?.params?.preselectedPlanId, route?.params?.preselectedSeatId, subscriptionData?.plans]);

  const stateName = seatSummary?.state || subscriptionData.currentUser?.state || '';
  const activeSeatId = seatSummary?.current_seat?.seat_id || '';
  const effectiveSeatId = activeSeatId || selectedSeatId;
  const canBuy = useMemo(() => Boolean(pendingPlan && stateName && effectiveSeatId), [effectiveSeatId, pendingPlan, stateName]);

  const handleLogout = async () => { 
    await UserStore.clearCurrentUser(); 
    navigation.replace('Login'); 
  }; 
 
  const navigateToPayment = (plan, stateName, seatRoleIdToUse) => {
    navigation.navigate('Payment', { 
      order: { 
        plan_id:   plan.plan_id, 
        plan_name: plan.plan_name, 
        amount:    plan.price, 
        seat_state: stateName, 
        seat_role_id: seatRoleIdToUse, 
      }, 
    }); 
  };

  const handleBuyPlan = (plan) => {
    if (!stateName) {
      showPopup('Please select your state first.', 'error', {
        primaryLabel: 'Open',
        secondaryLabel: 'Cancel',
        onPrimaryPress: () => navigation.navigate('StateSelect', { fromPremium: true, autoOpen: true }),  
      });  
      return;
    }

    setPendingPlan(plan);
    if (activeSeatId) {
      navigateToPayment(plan, stateName, activeSeatId);
      setPendingPlan(null);
      return;
    }
    // If no seat picked yet, open seat selector; selecting a seat will start subscription.
    setSeatModalOpen(true);
  };
 
  return (
    <View style={SubscriptionPlansStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView
        contentContainerStyle={SubscriptionPlansStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={SubscriptionPlansStyles.heroCard}>
          <Text style={SubscriptionPlansStyles.heroEyebrow}>Plans</Text>
          <Text style={SubscriptionPlansStyles.heroTitle}>Subscription Plans</Text>
          <Text style={SubscriptionPlansStyles.heroSubtitle}>
            Choose a plan that suits your needs
          </Text>
        </View>

        {/* ✅ Current Role Banner */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          borderRadius: 14,
          padding: 14,
          marginHorizontal: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          elevation: 2,
        }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>
              YOUR CURRENT ROLE
            </Text>
            <RoleBadge
              role={subscriptionData.currentRole}
              label={subscriptionData.currentRoleLabel}
            />
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>
              MEMBER
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>
              {subscriptionData.currentUser?.name || '-'}
            </Text>
          </View>
        </View>

        {/* Active Plan Banner */}
        {subscriptionData.activePlan && (
          <View style={SubscriptionPlansStyles.activeBanner}>
            <View style={SubscriptionPlansStyles.activeBannerLeft}>
              <Text style={SubscriptionPlansStyles.activeBannerLabel}>
                Current Active Plan
              </Text>
              <Text style={SubscriptionPlansStyles.activeBannerName}>
                {subscriptionData.activePlan.plan_name}
              </Text>
              <Text style={SubscriptionPlansStyles.activeBannerMeta}>
                ₹{subscriptionData.activePlan.price} · {subscriptionData.activePlan.duration}
              </Text>
            </View>
            <View style={SubscriptionPlansStyles.activeBannerIcon}>
              <Feather name="check-circle" size={28} color="#16a34a" />
            </View>
          </View>
        )}

        {/* State Seats */} 
        <View style={SubscriptionPlansStyles.card}> 
          <Text style={SubscriptionPlansStyles.sectionTitle}>State Seats</Text> 
 
          {!seatSummary ? ( 
            <Text style={SubscriptionPlansStyles.loadingText}>Loading seats...</Text> 
          ) : ( 
            <> 
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}> 
                <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '700' }}> 
                  STATE 
                </Text> 
                <Text style={{ fontSize: 12, color: '#0f172a', fontWeight: '800' }}> 
                  {seatSummary.state || '-'} 
                </Text> 
              </View> 
 
              {seatSummary.current_seat?.seat_id ? ( 
                <View style={{ 
                  marginTop: 10, 
                  backgroundColor: '#ecfdf5', 
                  borderColor: '#86efac', 
                  borderWidth: 1, 
                  borderRadius: 12, 
                  padding: 12, 
                }}> 
                  <Text style={{ fontSize: 12, color: '#166534', fontWeight: '900' }}> 
                    YOUR SELECTED SEAT 
                  </Text> 
                  <Text style={{ marginTop: 4, fontSize: 14, color: '#14532d', fontWeight: '800' }}> 
                    {seatSummary.current_seat.seat_name || seatSummary.current_seat.seat_id} 
                  </Text> 
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#166534' }}> 
                    Payment ke baad seat lock ho jaati hai. 
                  </Text> 
                </View> 
              ) : ( 
                <>
                  <Text style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}> 
                    Apni state ke liye ek seat select karein. Payment success ke baad woh seat dusre users ke liye available nahi rahegi. 
                  </Text>
                  <TouchableOpacity
                    style={[SubscriptionPlansStyles.buyBtn, { marginTop: 12, backgroundColor: '#0f172a' }]}
                    onPress={() => setSeatModalOpen(true)}
                    activeOpacity={0.85}
                  >
                    <Feather name="user-check" size={14} color="#fff" />
                    <Text style={SubscriptionPlansStyles.buyBtnText}>Select Seat</Text>
                  </TouchableOpacity>
                </>
              )} 
            </> 
          )} 
        </View> 
 
        {/* Available Plans */} 
        <View style={SubscriptionPlansStyles.card}> 
          <Text style={SubscriptionPlansStyles.sectionTitle}>Available Plans</Text> 
 
          {loading ? ( 
            <Text style={SubscriptionPlansStyles.loadingText}>
              Loading plans...
            </Text>
          ) : subscriptionData.plans.length ? (
            subscriptionData.plans.map((plan) => { 
              const isActive = subscriptionData.activePlan?.plan_id === plan.plan_id; 
              const planRole = UserStore.getRoleFromPlanId(plan.plan_id); 
              const isPending = pendingPlan?.plan_id === plan.plan_id;
              const cardDisabled = isActive;
 
              return ( 
                <TouchableOpacity
                  key={plan.plan_id} 
                  activeOpacity={cardDisabled ? 1 : 0.92}
                  disabled={cardDisabled}
                  onPress={() => {
                    if (cardDisabled) return;
                    handleBuyPlan(plan);
                  }}
                  style={[ 
                    SubscriptionPlansStyles.planCard, 
                    isActive && SubscriptionPlansStyles.planCardActive, 
                    isPending && !isActive && { borderWidth: 2, borderColor: '#0f172a' },
                  ]} 
                > 
                  {/* Plan Top Row */}
                  <View style={SubscriptionPlansStyles.planTopRow}>
                    <View style={SubscriptionPlansStyles.planTitleWrap}>
                      <Text style={SubscriptionPlansStyles.planName}>
                        {plan.plan_name}
                      </Text>
                      <Text style={SubscriptionPlansStyles.planDuration}>
                        {plan.duration}
                      </Text>
                    </View>

                    <View style={{ gap: 6, alignItems: 'flex-end' }}>
                      {/* ✅ Role badge on each plan */}
                      <RoleBadge role={planRole} />
                      {isActive && (
                        <View style={SubscriptionPlansStyles.activePill}>
                          <Text style={SubscriptionPlansStyles.activePillText}>
                            Active
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Price */}
                  <Text style={SubscriptionPlansStyles.planPrice}>
                    ₹{plan.price}
                  </Text>

                  {/* Features list */}
                  {Array.isArray(plan.features) && plan.features.length > 0 && ( 
                    <View style={SubscriptionPlansStyles.featuresList}> 
                      {plan.features.map((feature, idx) => ( 
                        <View key={idx} style={SubscriptionPlansStyles.featureRow}> 
                          <Feather
                            name="check"
                            size={13}
                            color="#16a34a"
                            style={SubscriptionPlansStyles.featureIcon}
                          />
                          <Text style={SubscriptionPlansStyles.featureText}>
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View> 
                  )} 

                  {/* ✅ Role assignment info */} 
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 6, 
                    marginTop: 8, 
                    marginBottom: 4, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 8, 
                    padding: 8, 
                  }}> 
                    <Feather name="shield" size={13} color="#64748b" /> 
                    <Text style={{ fontSize: 12, color: '#64748b' }}> 
                      After purchase: Role will be assigned as{' '} 
                      <Text style={{ fontWeight: '700', color: '#0f172a' }}> 
                        {UserStore.getRoleLabel(planRole)} 
                      </Text> 
                    </Text> 
                  </View> 

                  {!isActive ? (
                    <Text style={{ marginTop: 6, fontSize: 12, color: '#1d4ed8', fontWeight: '900' }}>
                      Tap to select seat and continue
                    </Text>
                  ) : null}
                </TouchableOpacity> 
              ); 
            }) 
          ) : ( 
            <Text style={SubscriptionPlansStyles.emptyText}>
              No plans available.
            </Text>
          )}
        </View>
      </ScrollView>

      <Footer />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />

      <SeatSelectModal
        visible={seatModalOpen}
        stateName={stateName}
        seats={seatSummary?.seats || []}
        selectedSeatId={effectiveSeatId}
        onClose={() => setSeatModalOpen(false)}
        onSelectSeatId={(seatId) => {
          setSelectedSeatId(seatId);
          const plan = pendingPlan;
          if (!plan || !stateName || !seatId) return;
          setSeatModalOpen(false);
          setPendingPlan(null);
          navigateToPayment(plan, stateName, seatId);
        }}
      />
    </View>
  );
}
