import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import SubscriptionPlansStyles from '../styles/SubscriptionPlansStyles';
import { UserStore } from '../store/UserStore';

export default function SubscriptionPlansScreen({ navigation, route }) {
  const { showToast } = useToast();
  const [sidebarVisible, setSidebarVisible]   = useState(false);
  const [activeTab, setActiveTab]             = useState('Home');
  const [loading, setLoading]                 = useState(true);

  const [subscriptionData, setSubscriptionData] = useState({
    currentUser: null,
    activePlan:  null,
    plans:       [],
  });

  const moduleName = 'Subscription Plans';

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getSubscriptionSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }
    setSubscriptionData(data);
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

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const handleBuyPlan = (plan) => {
    navigation.navigate('Payment', {
      order: {
        plan_id:   plan.plan_id,
        plan_name: plan.plan_name,
        amount:    plan.price,
      },
    });
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

        {/* Available Plans */}
        <View style={SubscriptionPlansStyles.card}>
          <Text style={SubscriptionPlansStyles.sectionTitle}>Available Plans</Text>

          {loading ? (
            <Text style={SubscriptionPlansStyles.loadingText}>
              Loading plans...
            </Text>
          ) : subscriptionData.plans.length ? (
            subscriptionData.plans.map((plan) => {
              const isActive =
                subscriptionData.activePlan?.plan_id === plan.plan_id;

              return (
                <View
                  key={plan.plan_id}
                  style={[
                    SubscriptionPlansStyles.planCard,
                    isActive && SubscriptionPlansStyles.planCardActive,
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

                    {isActive ? (
                      <View style={SubscriptionPlansStyles.activePill}>
                        <Text style={SubscriptionPlansStyles.activePillText}>
                          Active
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Price */}
                  <Text style={SubscriptionPlansStyles.planPrice}>
                    ₹{plan.price}
                  </Text>

                  {/* Features list */}
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <View style={SubscriptionPlansStyles.featuresList}>
                      {plan.features.map((feature, idx) => (
                        <View
                          key={idx}
                          style={SubscriptionPlansStyles.featureRow}
                        >
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

                  {/* Buy Button */}
                  {!isActive && (
                    <TouchableOpacity
                      style={SubscriptionPlansStyles.buyBtn}
                      onPress={() => handleBuyPlan(plan)}
                    >
                      <Feather name="credit-card" size={14} color="#fff" />
                      <Text style={SubscriptionPlansStyles.buyBtnText}>
                        Buy Plan
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
    </View>
  );
}