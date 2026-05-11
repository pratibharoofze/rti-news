import React, { useCallback, useEffect, useState } from 'react';
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

const ROLE_COLORS = {
  free: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
  basic: { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd' },
  pro: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  premium: { bg: '#fefce8', text: '#b45309', border: '#fcd34d' },
};

function RoleBadge({ role = 'free', label }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.free;

  return (
    <View
      style={{
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
      }}
    >
      <Feather
        name={
          role === 'premium'
            ? 'star'
            : role === 'pro'
            ? 'award'
            : role === 'basic'
            ? 'check-circle'
            : 'user'
        }
        size={12}
        color={colors.text}
      />

      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: colors.text,
        }}
      >
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
  pendingPlan,
  onClose,
  onSelectSeatId,
}) {
  const seatsToShow = Array.isArray(seats) ? seats : [];
  const isLoadingSeats = seatsToShow.length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
        activeOpacity={1}
        onPress={onClose}
      />

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
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: '#e2e8f0',
            borderRadius: 99,
            alignSelf: 'center',
            marginBottom: 12,
          }}
        />

        <Text
          style={{
            fontSize: 16,
            fontWeight: '900',
            color: '#0f172a',
          }}
        >
          Select Seat
        </Text>

        <Text
          style={{
            marginTop: 4,
            fontSize: 12,
            color: '#64748b',
            fontWeight: '700',
          }}
        >
          State: {stateName || '-'}
        </Text>

        {/* ✅ Selected Plan Show */}
        {pendingPlan ? (
          <View
            style={{
              marginTop: 12,
              backgroundColor: '#eff6ff',
              borderWidth: 1,
              borderColor: '#bfdbfe',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: '#1d4ed8',
              }}
            >
              SELECTED PLAN
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 15,
                fontWeight: '900',
                color: '#0f172a',
              }}
            >
              {pendingPlan.plan_name}
            </Text>

            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                color: '#475569',
                fontWeight: '700',
              }}
            >
              ₹{pendingPlan.price} • {pendingPlan.duration}
            </Text>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 14 }}
        >
          {isLoadingSeats ? (
            <Text
              style={{
                fontSize: 12,
                color: '#64748b',
                fontWeight: '700',
                paddingVertical: 10,
              }}
            >
              Loading seats...
            </Text>
          ) : null}

          <View style={{ gap: 8, paddingBottom: 18 }}>
            {seatsToShow.map((seat) => {
              const isTaken = seat.status === 'taken';
              const isDisabled = seat.status === 'disabled';
              const isSelected = selectedSeatId === seat.id;
              const disabled = isTaken || isDisabled;

              const borderColor = isSelected
                ? '#1d4ed8'
                : disabled
                ? '#e2e8f0'
                : '#cbd5e1';

              const backgroundColor = isSelected
                ? '#eff6ff'
                : disabled
                ? '#f8fafc'
                : '#ffffff';

              const statusText =
                seat.status === 'mine'
                  ? 'Yours'
                  : isTaken
                  ? 'Taken'
                  : isDisabled
                  ? 'Disabled'
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
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '900',
                        color: disabled ? '#64748b' : '#0f172a',
                      }}
                    >
                      {seat.name}
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: statusColor,
                        fontWeight: '800',
                      }}
                    >
                      {statusText}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View
                      style={{
                        backgroundColor: '#1d4ed8',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: '900',
                        }}
                      >
                        Selected
                      </Text>
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

export default function SubscriptionPlansScreen({
  navigation,
  route,
}) {
  const { showToast, showPopup } = useToast();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seatSummary, setSeatSummary] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState('');
  const [pendingPlan, setPendingPlan] = useState(null);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  const [subscriptionData, setSubscriptionData] = useState({
    currentUser: null,
    activePlan: null,
    plans: [],
    currentRole: 'free',
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

  const stateName =
    seatSummary?.state ||
    subscriptionData.currentUser?.state ||
    '';

  const activeSeatId =
    seatSummary?.current_seat?.seat_id || '';

  const navigateToPayment = (plan, stateName, seatRoleIdToUse) => {
    navigation.navigate('Payment', {
      order: {
        plan_id: plan.plan_id,
        plan_name: plan.plan_name,
        amount: plan.price,
        seat_state: stateName,
        seat_role_id: seatRoleIdToUse,
      },
    });
  };

  const handleBuyPlan = (plan) => {
    if (!stateName) {
      showPopup(
        'Please select your state first.',
        'error',
        {
          primaryLabel: 'Open',
          secondaryLabel: 'Cancel',
          onPrimaryPress: () =>
            navigation.navigate('StateSelect', {
              fromPremium: true,
              autoOpen: true,
            }),
        }
      );
      return;
    }

    setPendingPlan(plan);

    if (activeSeatId) {
      navigateToPayment(plan, stateName, activeSeatId);
      return;
    }

    setSeatModalOpen(true);
  };

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
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
        <View style={SubscriptionPlansStyles.heroCard}>

          {/* ✅ Back Button — Dashboard Screen par navigate karega */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginBottom: 10,
              paddingVertical: 4,
              paddingHorizontal: 2,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color="#7c3aed" />
            <Text
              style={{
                color: '#7c3aed',
                fontSize: 14,
                marginLeft: 5,
                fontWeight: '600',
              }}
            >
              Back
            </Text>
          </TouchableOpacity>

          <Text style={SubscriptionPlansStyles.heroEyebrow}>
            Plans
          </Text>

          <Text style={SubscriptionPlansStyles.heroTitle}>
            Subscription Plans
          </Text>

          <Text style={SubscriptionPlansStyles.heroSubtitle}>
            Choose a plan that suits your needs
          </Text>
        </View>

        <View style={SubscriptionPlansStyles.card}>
          <Text style={SubscriptionPlansStyles.sectionTitle}>
            Available Plans
          </Text>

          {loading ? (
            <Text style={SubscriptionPlansStyles.loadingText}>
              Loading plans...
            </Text>
          ) : (
            subscriptionData.plans.map((plan) => {
              const isActive =
                subscriptionData.activePlan?.plan_id === plan.plan_id;

              const planRole = UserStore.getRoleFromPlanId(plan.plan_id);

              return (
                <TouchableOpacity
                  key={plan.plan_id}
                  activeOpacity={0.92}
                  disabled={isActive}
                  onPress={() => handleBuyPlan(plan)}
                  style={[
                    SubscriptionPlansStyles.planCard,
                    isActive && SubscriptionPlansStyles.planCardActive,
                  ]}
                >
                  <View style={SubscriptionPlansStyles.planTopRow}>
                    <View style={SubscriptionPlansStyles.planTitleWrap}>
                      <Text style={SubscriptionPlansStyles.planName}>
                        {plan.plan_name}
                      </Text>

                      <Text style={SubscriptionPlansStyles.planDuration}>
                        {plan.duration}
                      </Text>
                    </View>

                    <RoleBadge role={planRole} />
                  </View>

                  <Text style={SubscriptionPlansStyles.planPrice}>
                    ₹{plan.price}
                  </Text>

                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <View style={SubscriptionPlansStyles.featuresList}>
                      {plan.features.map((feature, idx) => (
                        <View key={idx} style={SubscriptionPlansStyles.featureRow}>
                          <Feather name="check" size={13} color="#16a34a" />
                          <Text style={SubscriptionPlansStyles.featureText}>
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {!isActive && (
                    <Text
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: '#1d4ed8',
                        fontWeight: '900',
                      }}
                    >
                      Tap to continue
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
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
        selectedSeatId={selectedSeatId}
        pendingPlan={pendingPlan}
        onClose={() => setSeatModalOpen(false)}
        onSelectSeatId={(seatId) => {
          if (!seatId || !pendingPlan) return;

          setSelectedSeatId(seatId);
          setSeatModalOpen(false);

          const selectedPlan = pendingPlan;
          setPendingPlan(null);

          navigateToPayment(selectedPlan, stateName, seatId);
        }}
      />
    </View>
  );
}