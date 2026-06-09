import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const LOGO_SIZE = 160;
const BANNER_HEIGHT = 120;
const OVERLAP = 40;

export default function HeaderBlock({ data = {}, isEditing = false, onDataChange }) {
  const [localLogoUri, setLocalLogoUri] = useState(data.logoUri || '');
  
  // Load logo from localStorage on component mount (web only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedLogo = localStorage.getItem('newspaper_logo');
      if (savedLogo && savedLogo !== 'undefined' && savedLogo !== 'null') {
        setLocalLogoUri(savedLogo);
        if (onDataChange && !data.logoUri) {
          onDataChange({ ...data, logoUri: savedLogo });
        }
      }
    }
  }, []);

  // Save logo to localStorage whenever it changes (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && localLogoUri && localLogoUri !== 'undefined') {
      localStorage.setItem('newspaper_logo', localLogoUri);
    }
  }, [localLogoUri]);

  // Update local state when data prop changes
  useEffect(() => {
    if (data.logoUri && data.logoUri !== localLogoUri) {
      setLocalLogoUri(data.logoUri);
      if (Platform.OS === 'web') {
        localStorage.setItem('newspaper_logo', data.logoUri);
      }
    }
  }, [data.logoUri]);

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
        let imageUri;
        if (asset.base64) {
          imageUri = `data:image/jpeg;base64,${asset.base64}`;
        } else {
          imageUri = asset.uri;
        }
        setLocalLogoUri(imageUri);
        onDataChange && onDataChange({ ...data, logoUri: imageUri });
        Alert.alert('Success', 'Logo uploaded successfully!');
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
        setLocalLogoUri(base64);
        onDataChange && onDataChange({ ...data, logoUri: base64 });
        Alert.alert('Success', 'Logo uploaded successfully!');
      } else {
        Alert.alert('Error', 'Invalid image data');
      }
    };
    reader.onerror = () => Alert.alert('Error', 'Failed to read file');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleLogoPress = () => {
    if (!isEditing) return;
    if (isWeb) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    } else {
      pickLogoMobile();
    }
  };

  const displayLogoUri = localLogoUri || logoUri;

  return (
    <View style={[styles.container, isEditing && styles.editing]}>
      <View style={styles.header}>
        {isWeb && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
            id="logo-upload-input"
            style={{ display: 'none' }}
            onChange={handleWebFileSelect}
          />
        )}

        {/* Top Row - Phone | PRESS | Govt Info */}
        <View style={styles.topRow}>
          <View style={styles.leftColumn}>
            <Text style={styles.phoneText}>{contact1}</Text>
            <Text style={styles.phoneText}>{contact2}</Text>
          </View>
          <View style={styles.centerColumn}>
            <View style={styles.pressBox}>
              <View style={styles.pressInnerBorder}>
                <Text style={styles.pressText}>PRESS</Text>
              </View>
            </View>
          </View>
          <View style={styles.rightColumn}>
            <Text style={styles.govtText}>Govt. of INDIA approved</Text>
            <Text style={styles.govtText}>Registered Ministry of Broadcasting, Delhi.</Text>
          </View>
        </View>

        {/* Registration Numbers */}
        <View style={styles.regSection}>
          <Text style={styles.regNumber} numberOfLines={1} adjustsFontSizeToFit>{regNo}</Text>
          <View style={styles.rtiTopRight}>
            <View style={styles.rtiRow}>
              <Text style={styles.rtiAll}>All </Text>
              <Text style={styles.rtiIndia}>INDIA </Text>
              <Text style={styles.rtiRti}>RTi</Text>
            </View>
            <Text style={styles.rtiNetwork}>NEWS NETWORK</Text>
          </View>
        </View>

        {/* Black Banner with Logo */}
        <View style={styles.logoBannerWrapper}>
          <View style={styles.blackBanner}>
            <Text style={styles.newspaperName} numberOfLines={1} adjustsFontSizeToFit>
              {newspaperName}
            </Text>
          </View>
          <View style={styles.logoOuterContainer}>
            {isWeb && isEditing ? (
              <label
                htmlFor="logo-upload-input"
                style={{
                  width: LOGO_SIZE,
                  height: LOGO_SIZE,
                  borderRadius: LOGO_SIZE / 2,
                  overflow: 'hidden',
                  border: '12px solid #000',
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {displayLogoUri && displayLogoUri !== 'undefined' ? (
                  <img
                    src={displayLogoUri}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Logo"
                    onError={(e) => {
                      console.error('Image failed to load');
                      e.target.style.display = 'none';
                      if (e.target.parentElement) {
                        e.target.parentElement.innerHTML = '<span style="color:#aaa;font-size:11px;font-weight:600;text-align:center;">📷<br/>Upload</span>';
                      }
                    }}
                  />
                ) : (
                  <span style={{ color: '#aaa', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>📷{'\n'}Upload</span>
                )}
              </label>
            ) : (
              <TouchableOpacity
                onPress={handleLogoPress}
                activeOpacity={isEditing ? 0.7 : 1}
                style={styles.logoContainer}
              >
                {displayLogoUri && displayLogoUri !== 'undefined' ? (
                  <Image
                    source={{ uri: displayLogoUri }}
                    style={styles.logoImage}
                    resizeMode="cover"
                    onError={(error) => console.error('Image loading error:', error)}
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoPlaceholderText}>{isEditing ? '📷\nUpload' : 'LOGO'}</Text>
                  </View>
                )}
                {isEditing && displayLogoUri && displayLogoUri !== 'undefined' && (
                  <View style={styles.logoEditOverlay}>
                    <Text style={styles.editIcon}>📷</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.tagline}>{tagline}</Text>
        </View>

        {/* Info Row: website+email LEFT | editor name RIGHT (large bold) */}
        <View style={styles.infoSection}>
          <View style={styles.websiteRow}>
            <Text style={styles.infoText}>{website}</Text>
            <Text style={styles.separator}>  |  </Text>
            <Text style={styles.infoText}>{extra}</Text>
          </View>
          <View style={styles.editorSection}>
            <Text style={styles.editorName}>{editorName}</Text>
          </View>
        </View>

        {/* Address LEFT | editor title RIGHT (small) */}
        <View style={styles.addressSection}>
          <Text style={styles.addressText}>{officeInfo}</Text>
          <Text style={styles.editorTitle}>{editorTitle}</Text>
        </View>

        {/* Date Strip */}
<View style={styles.dateSection}>
  <Text style={styles.dateText}>● वर्ष : ६ वे</Text>
  <Text style={styles.dateText}>● महिना : जुलै २०१९</Text>
  <Text style={styles.dateText}>● १२ अंक साठी वार्षिक वर्गणी : फक्त १९०/-</Text>
  <Text style={styles.dateText}>● Posting Registration No. SGL/108/2019-2021</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: '#fff',
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
    backgroundColor: '#dd0000',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 40,
    alignSelf: 'center',
  },
  pressInnerBorder: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#fff',
  },
  pressText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 3,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiIndia: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiRti: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111',
    fontStyle: 'italic',
  },
  rtiNetwork: {
    fontSize: 15,
    fontWeight: '800',
    color: '#cc0000',
    fontStyle: 'italic',
    marginTop: 1,
  },
  regSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingBottom: 0,
    paddingLeft: LOGO_SIZE - 20,
    backgroundColor: '#fff',
  },
  rtiTopRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
    flexShrink: 0,
  },
  regNumber: {
    fontSize: 16,
    color: '#111',
    textAlign: 'center',
    fontWeight: '400',
    flex: 1,
    paddingLeft: LOGO_SIZE - 140,
  },
  logoBannerWrapper: {
    position: 'relative',
    marginTop: 0,
    marginBottom: 0,
  },
  logoOuterContainer: {
    position: 'absolute',
    top: (100 / 2) - (LOGO_SIZE / 2),
    left: 30,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    zIndex: 20,
    elevation: 10,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 12,
    borderColor: '#000',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
  blackBanner: {
    backgroundColor: '#111',
    width: '100%',
    height: 100,
    paddingLeft: LOGO_SIZE + 20,
    paddingRight: 12,
    justifyContent: 'center',
  },
  newspaperName: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  taglineSection: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 0,
    width: '100%',
  },
  tagline: {
    fontSize: 20,
    color: '#222',
    textAlign: 'center',
    fontWeight: '900',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 3,
  },
  infoText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '700',
  },
  separator: {
    fontSize: 22,
    color: '#555',
    fontWeight: '700',
  },
  editorSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
    flexShrink: 0,
  },
  editorName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  editorTitle: {
    fontSize: 14,
    color: '#111',
    textAlign: 'right',
    flexShrink: 0,
    marginLeft: 10,
    fontWeight: '900',
  },
  dateSection: {
    backgroundColor: '#111',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#bbb',
    borderBottomWidth: 2,
    borderBottomColor: '#111',
    flexDirection: 'row',              // <-- add
    justifyContent: 'space-between',   // <-- add
    alignItems: 'center',              // <-- add
  },
   dateText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    // textAlign: 'justify' hatao
  },
});