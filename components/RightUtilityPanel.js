import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EDITORIAL_FONT_FAMILY } from '../constants/homeData';

export default function RightUtilityPanel({ navigation, panelContent, selectedStateName, selectedDistrictName, locationOptions, onSelectState, onSelectDistrict, isCompactLayout, commonCopy, homeCopy }) {
  return (
    <View style={styles.utilityRail}>
      <View style={[styles.utilityRailCard, isCompactLayout && styles.utilityRailCardCompact]}>
   
        <Text style={styles.utilityRailEyebrow}>{panelContent.eyebrow}</Text>
        <Text style={styles.utilityRailTitle}>{panelContent.title}</Text>
        <Text style={styles.utilityRailDescription}>{panelContent.subtitle}</Text>
        {locationOptions.length ? (
          <View style={styles.utilityChipGrid}>
            {locationOptions.map((locationName) => {
              const isActive = selectedDistrictName ? selectedDistrictName === locationName : selectedStateName === locationName;
              return (
                <TouchableOpacity
                  key={locationName}
                  style={[styles.utilityChipButton, isActive && styles.utilityChipButtonActive]}
                  onPress={() => selectedStateName ? onSelectDistrict(locationName) : onSelectState(locationName)}
                  activeOpacity={0.84}
                >
                  <Text style={[styles.utilityChipButtonText, isActive && styles.utilityChipButtonTextActive]}>{locationName}</Text>
                  <Ionicons name="chevron-forward-outline" size={15} color={isActive ? '#111827' : '#475569'} />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.utilityHelperCard}>
            <Ionicons name="information-circle-outline" size={18} color="#475569" />
            <Text style={styles.utilityHelperCardText}>{homeCopy.helperText}</Text>
          </View>
        )}
        <View style={styles.utilityPreviewSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  utilityRail: { gap: 0 },
  utilityRailCard: {
    borderRadius: 0, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderTopWidth: 0, padding: 16,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { elevation: 4, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 18 },
    }),
  },
  utilityRailCardCompact: { borderRadius: 24 },
  utilityLoginButton: { minHeight: 52, borderRadius: 18, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  utilityLoginButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  utilityRailEyebrow: { color: '#f97316', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  utilityRailTitle: { color: '#0f172a', fontSize: 24, lineHeight: 32, fontWeight: '900', marginTop: 10, fontFamily: EDITORIAL_FONT_FAMILY },
  utilityRailDescription: { color: '#475569', fontSize: 14, lineHeight: 22, marginTop: 10 },
  utilityChipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  utilityChipButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe3ee' },
  utilityChipButtonActive: { backgroundColor: '#f8fafc', borderColor: '#111827' },
  utilityChipButtonText: { color: '#334155', fontSize: 13, fontWeight: '700' },
  utilityChipButtonTextActive: { color: '#111827' },
  utilityHelperCard: { marginTop: 18, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  utilityHelperCardText: { flex: 1, color: '#475569', fontSize: 13, lineHeight: 20 },
  utilityPreviewSpacer: { marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: '#e2e8f0', minHeight: 214 },
});