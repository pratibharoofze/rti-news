import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function HeaderBlock({ data = {}, isEditing = false }) {
  const {
    newspaperName = 'भारतीय माहिती अधिकार',
    tagline = 'मराठी, हिंदी व इंग्रजी भाषेमध्ये सर्वत्र प्रसिद्ध होणारे एकमेव असे न्यूजपेपर',
    date = '',
    contact = '',
    extra = '',
    regNo = '',
    website = '',
    editorName = '',
  } = data;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.header, isEditing && styles.editing]}>

      {/* Top strip: contact left, reg no right */}
      <View style={styles.topStrip}>
        <Text style={styles.stripText}>{contact || 'M. 8484029332 / 7020667971'}</Text>
        <View style={styles.pressBox}>
          <Text style={styles.pressText}>PRESS</Text>
        </View>
        <Text style={styles.stripText}>{regNo || 'REG. NO. : RNIMAH/MUL/2014/66399'}</Text>
      </View>

      {/* Main name row */}
      <View style={styles.nameRow}>
        <Text style={[styles.name, isWeb && styles.nameWeb]}>{newspaperName}</Text>
      </View>

      {/* Tagline */}
      <View style={styles.taglineRow}>
        <Text style={styles.tagline}>{tagline}</Text>
      </View>

      {/* Bottom info row */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {website ? `web : ${website}` : 'web : www.rtinewsnetwork.com'}
        </Text>
        <Text style={styles.infoSep}>|</Text>
        <Text style={styles.infoText}>
          {extra || 'e-mail : rticheck@gmail.com'}
        </Text>
        <Text style={styles.infoSep}>|</Text>
        <Text style={styles.editorName}>{editorName || 'मा. शौकत अब्दुलकलाम नायकवडी'}</Text>
      </View>

      {/* Date/vol strip */}
      <View style={styles.dateStrip}>
        <Text style={styles.dateText}>
          {date || '● वर्ष : ६ वे  ● महिना : जुलै २०१९'}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 4,
    borderBottomColor: '#111',
    borderTopWidth: 2,
    borderTopColor: '#111',
  },
  editing: {
    borderColor: '#ea580c',
    borderWidth: 2,
  },

  // Top strip
  topStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  stripText: { fontSize: 9, color: '#444' },
  pressBox: {
    borderWidth: 1.5,
    borderColor: '#111',
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  pressText: { fontSize: 10, fontWeight: '900', color: '#111', letterSpacing: 2 },

  // Main name
  nameRow: {
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111',
  },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 1,
    textAlign: 'center',
  },
  nameWeb: { fontSize: 36 },

  // Tagline
  taglineRow: {
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
  },
  tagline: {
    fontSize: 9,
    color: '#444',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  infoText: { fontSize: 9, color: '#333' },
  infoSep: { fontSize: 9, color: '#888', marginHorizontal: 3 },
  editorName: { fontSize: 9, fontWeight: '700', color: '#111' },

  // Date strip
  dateStrip: {
    backgroundColor: '#f5f0e8',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  dateText: { fontSize: 9, color: '#555' },
});