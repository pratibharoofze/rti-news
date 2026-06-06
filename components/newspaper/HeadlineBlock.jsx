import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeadlineBlock({ data = {}, isEditing = false }) {
  const { title = '', sub = '' } = data;

  return (
    <View style={[styles.wrapper, isEditing && styles.editing]}>
      {/* Thick top rule */}
      <View style={styles.topRule} />

      <View style={styles.inner}>
        <Text style={styles.title}>
          {title || 'मुख्य समाचार शीर्षक यहाँ लिखें...'}
        </Text>
        {!!sub && (
          <View style={styles.subRow}>
            <Text style={styles.sub}>{sub}</Text>
          </View>
        )}
      </View>

      {/* Thick bottom rule */}
      <View style={styles.bottomRule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
  },
  editing: {
    borderWidth: 2,
    borderColor: '#ea580c',
  },
  topRule: {
    height: 3,
    backgroundColor: '#111',
  },
  inner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  subRow: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 3,
    width: '100%',
    alignItems: 'center',
  },
  sub: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomRule: {
    height: 3,
    backgroundColor: '#111',
  },
});