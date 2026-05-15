import React, { useCallback, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, View, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../components/ui/ToastProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { UserStore } from '../store/UserStore';
import { INDIAN_STATES, getDistricts, getTalukas } from '../pages/locationData';

// ── Step Indicator (Clickable) ────────────────────────────────────────────────
function StepIndicator({ current, locState, locDistrict, onStepPress }) {
  const steps = [1, 2, 3];

  const canGoToStep = (s) => {
    if (s === 1) return true;                          // Step 1 hamesha accessible
    if (s === 2) return locState !== '';               // Step 2 tabhi jab state select ho
    if (s === 3) return locState !== '' && locDistrict !== ''; // Step 3 tabhi jab dono select ho
    return false;
  };

  return (
    <View style={si.row}>
      {steps.map((s, idx) => {
        const accessible = canGoToStep(s);
        const isDone     = current > s;
        const isActive   = current === s;
        return (
          <React.Fragment key={s}>
            <TouchableOpacity
              style={[
                si.circle,
                isActive && si.circleActive,
                isDone   && si.circleDone,
                !accessible && si.circleDisabled,
              ]}
              onPress={() => accessible && onStepPress(s)}
              activeOpacity={accessible ? 0.7 : 1}
            >
              {isDone
                ? <Ionicons name="checkmark" size={14} color="#fff" />
                : <Text style={[si.num, isActive && si.numActive, !accessible && si.numDisabled]}>{s}</Text>
              }
            </TouchableOpacity>
            {idx < steps.length - 1 && (
              <View style={[si.line, isDone && si.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const si = StyleSheet.create({
  row:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  circle:          { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0',
                     alignItems: 'center', justifyContent: 'center' },
  circleActive:    { backgroundColor: '#16a34a' },
  circleDone:      { backgroundColor: '#16a34a' },
  circleDisabled:  { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  num:             { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  numActive:       { color: '#fff' },
  numDisabled:     { color: '#cbd5e1' },
  line:            { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 6 },
  lineDone:        { backgroundColor: '#16a34a' },
});

// ── Location Card ─────────────────────────────────────────────────────────────
function LocationCard({ nameEn, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[lc.card, selected && lc.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[lc.nameEn, selected && lc.nameEnSelected]}>{nameEn}</Text>
      {selected && <Ionicons name="checkmark-circle" size={22} color="#16a34a" />}
    </TouchableOpacity>
  );
}

const lc = StyleSheet.create({
  card:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5,
                    borderColor: '#e2e8f0', paddingHorizontal: 18, paddingVertical: 18,
                    marginBottom: 10, elevation: 1 },
  cardSelected:   { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  nameEn:         { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1 },
  nameEnSelected: { color: '#15803d' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ChangeLocationScreen({ navigation }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [saving, setSaving]           = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep]               = useState(1);

  const [locState, setLocState]       = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locTaluka, setLocTaluka]     = useState('');
  const [search, setSearch]           = useState('');

  useFocusEffect(useCallback(() => {
    (async () => {
      const data = await UserStore.getSettingsSummary();
      if (!data) { navigation.replace('Login'); return; }
      setCurrentUser(data.currentUser);
      setLocState(data.currentUser?.state || '');
      setLocDistrict(data.currentUser?.district || '');
      setLocTaluka(data.currentUser?.taluka || '');
    })();
  }, []));

  const districtList = locState    ? getDistricts(locState)             : [];
  const talukaList   = locDistrict ? getTalukas(locState, locDistrict)  : [];
  const rawList      = step === 1  ? INDIAN_STATES : step === 2 ? districtList : talukaList;
  const filteredList = rawList.filter(i => i.toLowerCase().includes(search.toLowerCase()));

  const stepConfig = {
    1: { headerText: t('choose.state'),    titleText: t('choose.state.title'),    placeholder: t('search.state')    },
    2: { headerText: t('choose.district'), titleText: t('choose.district.title'), placeholder: t('search.district') },
    3: { headerText: t('choose.taluka'),   titleText: t('choose.taluka.title'),   placeholder: t('search.taluka')   },
  };
  const cfg = stepConfig[step];

  const handleSaveDirect = async (state, district, taluka) => {
    if (!state || !currentUser) return;
    setSaving(true);
    const result = await UserStore.updateUser(currentUser.email, { state, district, taluka });
    setSaving(false);
    if (!result) { showToast(t('location.update.error'), 'error'); return; }
    showToast(t('location.updated'), 'success');
    navigation.goBack();
  };

  const handleSelect = (val) => {
    setSearch('');
    if (step === 1) {
      setLocState(val); setLocDistrict(''); setLocTaluka('');
      const dList = getDistricts(val);
      if (dList.length > 0) setStep(2); else handleSaveDirect(val, '', '');
    } else if (step === 2) {
      setLocDistrict(val); setLocTaluka('');
      const tList = getTalukas(locState, val);
      if (tList.length > 0) setStep(3); else handleSaveDirect(locState, val, '');
    } else {
      setLocTaluka(val);
      handleSaveDirect(locState, locDistrict, val);
    }
  };

  // Step indicator click handler
  const handleStepPress = (s) => {
    setSearch('');
    setStep(s);
  };

  const handleBack = () => {
    setSearch('');
    if (step > 1) setStep(s => s - 1);
    else navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cfg.headerText}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step Indicator — Clickable */}
      <StepIndicator
        current={step}
        locState={locState}
        locDistrict={locDistrict}
        onStepPress={handleStepPress}
      />

      {/* Title */}
      <View style={styles.titleWrap}>
        <Text style={styles.titleText}>{cfg.titleText}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color="#16a34a" />
        <TextInput
          style={styles.searchInput}
          placeholder={cfg.placeholder}
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LocationCard
            nameEn={item}
            selected={
              step === 1 ? locState === item :
              step === 2 ? locDistrict === item :
              locTaluka === item
            }
            onPress={() => handleSelect(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyText}>{t('no.results')}</Text>
          </View>
        }
      />

      {/* Skip Taluka — Step 3 */}
      {step === 3 && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => handleSaveDirect(locState, locDistrict, '')}
          disabled={saving}
        >
          <Text style={styles.skipText}>
            {saving ? t('saving') : t('skip.taluka')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f8fafc' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
                 backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9',
                 alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  titleWrap:   { alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  titleText:   { fontSize: 15, fontWeight: '600', color: '#334155', textAlign: 'center' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16,
                 backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
                 borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  list:        { paddingHorizontal: 16, paddingBottom: 30 },
  emptyWrap:   { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText:   { fontSize: 14, color: '#94a3b8' },
  skipBtn:     { marginHorizontal: 16, marginBottom: 24, paddingVertical: 14,
                 borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
                 alignItems: 'center', backgroundColor: '#fff' },
  skipText:    { fontSize: 14, fontWeight: '600', color: '#64748b' },
});