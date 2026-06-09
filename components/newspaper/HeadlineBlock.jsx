import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeadlineBlock({ data = {}, isEditing = false }) {
  const { title = '', sub = '', subsub = '' } = data;

  return (
    <View style={[styles.wrapper, isEditing && styles.editing]}>
      <View style={styles.inner}>
        <Text style={styles.title}>
          {title || 'आहे का गरजेचे पुर्नविचार याचिका दाखल करणे?'}
        </Text>
        {!!sub && (
          <Text style={styles.sub}>{sub}</Text>
        )}
        {!!subsub && (
          <View style={styles.subsubRow}>
            <Text style={styles.subsub}>{subsub}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#111',
    
    marginHorizontal: 20, 
    paddingHorizontal: 20,  // <-- yahan padding do wrapper pe
  },
  editing: {
    borderWidth: 2,
    borderColor: '#ea580c',
  },
  inner: {
    paddingHorizontal: 20,  // kam karo
    paddingVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.3,
  },
  sub: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  subsubRow: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  subsub: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});