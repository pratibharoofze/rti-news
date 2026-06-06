import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FooterBlock({ data = {}, isEditing = false }) {
  const {
    left = '© भारतीय माहिती अधिकार',
    right = 'www.rtinewsnetwork.com',
  } = data;

  return (
    <View style={[styles.footer, isEditing && styles.editing]}>
      {/* Double top border */}
      <View style={styles.borderTop1} />
      <View style={styles.borderTop2} />

      <View style={styles.inner}>
        <Text style={styles.text}>{left}</Text>
        <Text style={styles.center}>
          {'सर्वसामान्य जनतेत भारतीय कायद्याचे प्रबोधन करणारे एकमेव न्यूज पेपर!'}
        </Text>
        <Text style={styles.text}>{right}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#fafafa',
  },
  editing: {
    borderWidth: 2,
    borderColor: '#ea580c',
  },
  borderTop1: {
    height: 2,
    backgroundColor: '#111',
  },
  borderTop2: {
    height: 1,
    backgroundColor: '#111',
    marginTop: 2,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontSize: 9,
    color: '#444',
    flex: 1,
  },
  center: {
    fontSize: 9,
    color: '#222',
    fontWeight: '700',
    textAlign: 'center',
    flex: 2,
    fontStyle: 'italic',
  },
});