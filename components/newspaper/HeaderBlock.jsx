import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const LOGO_SIZE = 160;
const BANNER_HEIGHT = 120;
const OVERLAP = 40;

export default function HeaderBlock({ data = {}, isEditing = false, onDataChange }) {
  const {
    newspaperName = 'भारतीय माहिती अधिकार',
    tagline = 'मराठी, हिंदी व इंग्रजी भाषेमध्ये सर्वत्र प्रसिद्ध होणारे एकमेव असे न्यूजपेपर',
    date = '● वर्ष : ६ वे  ● महिना : जुलै २०१९  ● १२ अंक साठी वार्षिक वर्गणी : फक्त १९०/-  ● Posting Registration No. SGL/108/2019-2021',
    contact1 = 'M. 8484029332',
    contact2 = '7020667971',
    extra = 'e-mail : rticheck@gmail.com',
    regNo = 'REG. NO. : RNIMAH/MUL/2014/66399  |  TITLE REGN. NO. : MAH/MUL/03200/13/1/2013-TC',
    website = 'web : www.rtinewsnetwork.com',
    editorName = 'मा. शौकत अब्दुलकलाम नायकवडी',
    editorTitle = 'मुख्य संपादक, संस्थापक, अध्यक्ष, प्रकाशक, मालक',
    officeInfo = '● क्षेत्रीय कार्यालय : व्हीनस कॉर्नर, स्टेशन रोड, केव्हिज प्लाझा, कोल्हापूर.',
    logoUri = '',
  } = data;

  const isWeb = Platform.OS === 'web';
  const fileInputRef = useRef(null);

  const pickLogoMobile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library access needed.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const base64Uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        onDataChange && onDataChange({ ...data, logoUri: base64Uri });
      }
    } catch (e) {
      Alert.alert('Error', 'Image pick failed: ' + e.message);
    }
  };

  const handleWebFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'File size should be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      if (base64 && base64.startsWith('data:image')) {
        onDataChange && onDataChange({ ...data, logoUri: base64 });
      }
    };
    reader.onerror = () => {
      Alert.alert('Error', 'Failed to read file');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleLogoPress = () => {
    if (!isEditing) return;
    if (isWeb) {
      fileInputRef.current?.click();
    } else {
      pickLogoMobile();
    }
  };

  return (
    <View style={[styles.container, isEditing && styles.editing]}>
      <View style={styles.header}>
        {isWeb && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleWebFileSelect}
          />
        )}

        {/* Top Row - Phone | PRESS | Govt Info - COMPLETELY NO BORDERS */}
        <View style={styles.topRow}>
          <View style={styles.leftColumn}>
            <Text style={styles.phoneText}>{contact1}</Text>
            <Text style={styles.phoneText}>{contact2}</Text>
          </View>

          <View style={styles.centerColumn}>
            <View style={styles.pressBox}>
              <Text style={styles.pressText}>PRESS</Text>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.govtText}>Govt. of INDIA approved</Text>
            <Text style={styles.govtText}>Registered Ministry of Broadcasting, Delhi.</Text>
            <View style={styles.rtiRow}>
              <Text style={styles.rtiAll}>All </Text>
              <Text style={styles.rtiIndia}>INDIA </Text>
              <Text style={styles.rtiRti}>RTi</Text>
            </View>
            <Text style={styles.rtiNetwork}>NEWS NETWORK</Text>
          </View>
        </View>

        {/* Registration Numbers - NO BORDERS */}
        <View style={styles.regSection}>
          <Text style={styles.regNumber}>{regNo}</Text>
        </View>

        {/* Logo and Banner Section - Logo overlaps both top and bottom */}
        <View style={styles.logoBannerWrapper}>
          {/* Logo - positioned to overlap */}
          <TouchableOpacity
            onPress={handleLogoPress}
            activeOpacity={isEditing ? 0.7 : 1}
            style={[styles.logoContainer, { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }]}
          >
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>{isEditing ? '📷\nUpload' : 'LOGO'}</Text>
              </View>
            )}
            {isEditing && logoUri && <View style={styles.logoEditOverlay}><Text style={styles.editIcon}>📷</Text></View>}
          </TouchableOpacity>

          {/* Black Banner with text */}
          <View style={styles.blackBanner}>
            <Text style={styles.newspaperName} numberOfLines={1} adjustsFontSizeToFit>
              {newspaperName}
            </Text>
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        {/* Website and Editor */}
        <View style={styles.infoSection}>
          <View style={styles.websiteRow}>
            <Text style={styles.infoText}>{website}</Text>
            <Text style={styles.separator}>  |  </Text>
            <Text style={styles.infoText}>{extra}</Text>
          </View>
          <View style={styles.editorSection}>
            <Text style={styles.editorName}>{editorName}</Text>
            <Text style={styles.editorTitle}>{editorTitle}</Text>
          </View>
        </View>

        {/* Office Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressText}>{officeInfo}</Text>
        </View>

        {/* Date Strip */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
  },
  editing: {
    borderColor: '#111',
    borderWidth: 2,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  // Top Row - COMPLETELY NO BORDERS OR SHADOWS
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: '#fff',
    // NO borders at all
  },
  leftColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  phoneText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    lineHeight: 20,
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pressBox: {
    backgroundColor: '#e00000',
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 40,
    // NO borders, NO shadows
    borderWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  pressText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  govtText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 17,
  },
  rtiRow: {
    flexDirection: 'row',
    marginTop: 1,
  },
  rtiAll: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiIndia: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiRti: {
    fontSize: 25,
    fontWeight: '900',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiNetwork: {
    fontSize: 20,
    fontWeight: '800',
    color: '#cc0000',
    fontStyle: 'italic',
    marginTop: 1,
  },

  // Registration Section - NO BORDERS
  regSection: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  regNumber: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },

  // Logo and Banner Wrapper
  logoBannerWrapper: {
    position: 'relative',
    marginTop: 0,
    marginBottom: 0,
    height: LOGO_SIZE + (OVERLAP * 2),
    overflow: 'visible',
  },
  logoContainer: {
    position: 'absolute',
    top: OVERLAP,
    left: 18,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 10,
  },

  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: '#fff',
    fontSize: 14,
  },
  // Black Banner
  blackBanner: {
    backgroundColor: '#111',
    width: '100%',
    height: LOGO_SIZE,
    paddingHorizontal: 20,
    paddingLeft: LOGO_SIZE + 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newspaperName: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Tagline Section
  taglineSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 10,
    color: '#222',
    textAlign: 'center',
  },

  // Info Section
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 10,
    color: '#333',
  },
  separator: {
    fontSize: 10,
    color: '#888',
  },
  editorSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  editorName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111',
  },
  editorTitle: {
    fontSize: 8,
    color: '#555',
    textAlign: 'right',
  },

  // Address Section
  addressSection: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  addressText: {
    fontSize: 9,
    color: '#333',
  },

  // Date Section
  dateSection: {
    backgroundColor: '#f0ede6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#bbb',
    borderBottomWidth: 2,
    borderBottomColor: '#111',
  },
  dateText: {
    fontSize: 9,
    color: '#333',
  },
});