import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';

const C = {
  orange:      '#F97316',
  orangeLight: '#FFF7ED',
  orangeMid:   '#FDBA74',
  white:       '#FFFFFF',
  pageBg:      '#F3F4F6',
  surface:     '#F9FAFB',
  textDark:    '#111111',
  textMid:     '#555555',
  textMuted:   '#9CA3AF',
  border:      '#E5E7EB',
  green:       '#16a34a',
  greenLight:  '#F0FDF4',
  greenMid:    '#86EFAC',
};

const PLANS = [
  {
    id:       'quiz_1m',
    label:    '1 Month',
    price:    299,
    duration: 1,
    unit:     'month',
    tag:      null,
    perMonth: 299,
  },
  {
    id:       'quiz_2m',
    label:    '2 Months',
    price:    399,
    duration: 2,
    unit:     'months',
    tag:      'Popular',
    perMonth: 200,
  },
  {
    id:       'quiz_3m',
    label:    '3 Months',
    price:    499,
    duration: 3,
    unit:     'months',
    tag:      'Best Value',
    perMonth: 166,
  },
];

const FEATURES = [
  'Unlimited quiz attempts',
  'All certification quizzes unlocked',
  'Instant result access',
  'Progress tracking',
];

export default function QuizSubscriptionScreen({ navigation, route }) {
  const insets        = useSafeAreaInsets();
  const { showToast } = useToast();

  const quizItem = route?.params?.quizItem ?? null;

  const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id);
  const [loading, setLoading]           = useState(false);

  const doSubscribe = useCallback(async () => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    try {
      const result = await UserStore.purchaseQuizSubscription(plan);
      setLoading(false);

      if (!result?.ok) {
        showToast(result?.message || 'Subscription failed. Please try again.', 'error');
        return;
      }

      showToast(`Quiz Subscription activated! You can now attempt all quizzes.`, 'success');

      if (quizItem) {
        navigation.replace('AttemptQuiz', { quiz: quizItem });
      } else {
        navigation.goBack();
      }
    } catch (e) {
      setLoading(false);
      showToast('Something went wrong. Please try again.', 'error');
    }
  }, [selectedPlan, navigation, quizItem, showToast]);

  const handleSubscribe = useCallback(() => {
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    // Alert.alert doesn't work reliably on web, so use direct confirm
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Do you want to subscribe to ${plan.label} Quiz Subscription for ₹${plan.price}?`
      );
      if (confirmed) doSubscribe();
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Do you want to subscribe to ${plan.label} Quiz Subscription for ₹${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: doSubscribe },
      ]
    );
  }, [selectedPlan, doSubscribe]);

  const selectedPlanObj = PLANS.find(p => p.id === selectedPlan);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={{ height: insets.top, backgroundColor: C.white }} />

      {/* Back Header */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
        activeOpacity={0.75}
      >
        <Feather name="arrow-left" size={20} color={C.orange} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Feather name="lock" size={28} color={C.white} />
          </View>
          <Text style={styles.heroEyebrow}>Quiz Access</Text>
          <Text style={styles.heroTitle}>Quiz Subscription</Text>
          <Text style={styles.heroSubtitle}>
            Subscription is required to attempt quizzes
          </Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What you'll get</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Feather name="check" size={13} color={C.green} />
              </View>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plan Cards */}
        <Text style={styles.choosePlanLabel}>Choose a plan</Text>

        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {/* Tag */}
              {plan.tag ? (
                <View style={styles.planTagWrap}>
                  <View style={styles.planTag}>
                    <Text style={styles.planTagText}>{plan.tag}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.planRow}>
                {/* Radio */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>

                {/* Label */}
                <View style={styles.planInfo}>
                  <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                    {plan.label}
                  </Text>
                  <Text style={styles.planPerMonth}>
                    ₹{plan.perMonth}/month
                  </Text>
                </View>

                {/* Price */}
                <View style={styles.planPriceWrap}>
                  <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                    ₹{plan.price}
                  </Text>
                  <Text style={styles.planDuration}>
                    {plan.duration} {plan.unit}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Note */}
        <View style={styles.noteRow}>
          <Feather name="info" size={13} color={C.textMuted} />
          <Text style={styles.noteText}>
            Subscription is only for quiz attempts. Certificate download requires a separate subscription.
          </Text>
        </View>
      </ScrollView>

      {/* Subscribe Button — sticky bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.subscribeBtn, loading && styles.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={C.white} size="small" />
          ) : (
            <>
              <Feather name="zap" size={16} color={C.white} />
              <Text style={styles.subscribeBtnText}>
                Subscribe — ₹{selectedPlanObj?.price}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.pageBg },
  scrollView:    { flex: 1 },
  scrollContent: {
  flexGrow: 1,
  paddingVertical: 28,
  paddingHorizontal: 16,
  alignItems: 'center',
},

  backRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingHorizontal: 20,
    paddingVertical:   14,
    backgroundColor:   C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backText: { color: C.orange, fontSize: 14, fontWeight: '500' },

  heroCard: {
  width: '100%',
  maxWidth: 720,
  backgroundColor: C.orange,
  borderRadius:    18,
  padding:         24,
  marginBottom:    16,
  alignItems:      'flex-start',
},
  heroIconWrap: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius:    12,
    padding:         10,
    marginBottom:    14,
  },
  heroEyebrow: {
    fontSize:      11,
    color:         '#FED7AA',
    fontWeight:    '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom:  6,
  },
  heroTitle: {
    fontSize:     26,
    fontWeight:   '600',
    color:        C.white,
    lineHeight:   32,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize:   13,
    color:      '#FED7AA',
    lineHeight: 20,
  },

  ccard: {
  width: '100%',
  maxWidth: 720,
  backgroundColor: C.white,
  borderRadius:    16,
  padding:         18,
  marginBottom:    16,
  borderWidth:     1,
  borderColor:     C.border,
},
  sectionTitle: {
    fontSize:     15,
    fontWeight:   '600',
    color:        C.textDark,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  10,
  },
  featureCheck: {
    backgroundColor: C.greenLight,
    borderRadius:    999,
    width:           24,
    height:          24,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     C.greenMid,
  },
  featureText: { fontSize: 13, color: C.textMid, fontWeight: '500', flex: 1 },

  choosePlanLabel: {
  width: '100%',
  maxWidth: 720,
  fontSize:      13,
    fontWeight:    '600',
    color:         C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  10,
  },

  planCard: {
  width: '100%',
  maxWidth: 720,
  backgroundColor: C.white,
  borderRadius:    14,
  padding:         16,
  marginBottom:    12,
  borderWidth:     1.5,
  borderColor:     C.border,
},
  planCardSelected: {
    borderColor:     C.orange,
    backgroundColor: C.orangeLight,
  },

  planTagWrap: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    marginBottom:   10,
  },
  planTag: {
    backgroundColor:  C.orange,
    borderRadius:     999,
    paddingHorizontal: 12,
    paddingVertical:   4,
  },
  planTagText: { fontSize: 11, fontWeight: '600', color: C.white },

  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width:          20,
    height:         20,
    borderRadius:   10,
    borderWidth:    2,
    borderColor:    C.border,
    alignItems:     'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: C.orange },
  radioDot: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: C.orange,
  },

  planInfo:          { flex: 1 },
  planLabel:         { fontSize: 15, fontWeight: '600', color: C.textDark },
  planLabelSelected: { color: C.orange },
  planPerMonth:      { fontSize: 12, color: C.textMuted, marginTop: 2 },

  planPriceWrap:     { alignItems: 'flex-end' },
  planPrice:         { fontSize: 20, fontWeight: '700', color: C.textDark },
  planPriceSelected: { color: C.orange },
  planDuration:      { fontSize: 11, color: C.textMuted, marginTop: 2 },

  noteRow: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             8,
    marginTop:       6,
    marginBottom:    20,
    padding:         14,
    backgroundColor: C.surface,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.border,
  },
  noteText: { flex: 1, fontSize: 12, color: C.textMuted, lineHeight: 18 },

  stickyBottom: {
    backgroundColor:   C.white,
    borderTopWidth:    1,
    borderTopColor:    C.border,
    paddingHorizontal: 20,
    paddingTop:        14,
  },
  subscribeBtn: {
    backgroundColor: C.orange,
    borderRadius:    14,
    paddingVertical: 15,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnText:     { fontSize: 16, fontWeight: '600', color: C.white },
});