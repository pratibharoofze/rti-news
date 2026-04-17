import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/FooterStyles';

export default function Footer({ visible = true }) {
  if (!visible) return null;

  return (
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>Designed & Developed by Roofze Digital Hub</Text>
    </View>
  );
}