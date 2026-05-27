import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import VideoPreview from '../components/VideoPreview';
import { useToast } from '../components/ui/ToastProvider';
import AddNewsStyles from '../styles/Addnewsstyles';
import { UserStore } from '../store/UserStore';
import { storeWebUriToIdbMedia } from '../utils/webMediaStore';
import { useLanguage } from '../contexts/LanguageContext';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const REPORT_TYPES = [
  'All',
  'Breaking News',
  'Investigation',
  'Opinion',
  'Feature',
  'Local News',
  'National',
  'International',
  'Sports',
  'Business',
  'Technology',
  'Health',
  'Politics',
];

const ROLE_TYPES = [
  'All',
  'Subscriber',
  'Premium',
  'Reporter',
  'Editor',
];

const MEDIA_TYPES = ['None', 'Image', 'Video', 'File'];

const UPLOADS_ROOT = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}uploads`
  : null;

function shouldPersistLocalUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return /^(file:|content:|ph:|asset:)/i.test(uri);
}

function getFileExtensionFromUri(uri, fallbackExt = '') {
  const safeFallback = String(fallbackExt || '').replace(/^\./, '');
  if (!uri || typeof uri !== 'string') return safeFallback;
  const cleaned = uri.split('?')[0].split('#')[0];
  const match = cleaned.match(/\.([a-z0-9]{2,6})$/i);
  return match ? match[1].toLowerCase() : safeFallback;
}

async function persistToUploadsDir({ uri, subdir, fallbackExt }) {
  if (!UPLOADS_ROOT || Platform.OS === 'web') return uri;
  if (!shouldPersistLocalUri(uri)) return uri;

  try {
    const targetDir = `${UPLOADS_ROOT}/${subdir}`;
    await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    const ext = getFileExtensionFromUri(uri, fallbackExt) || 'bin';
    const dest = `${targetDir}/${Date.now()}-${Math.floor(Math.random() * 1e9)}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    try { console.warn('persistToUploadsDir failed', { uri, subdir }); } catch {}
    return uri;
  }
}

function StatePickerModal({ visible, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = INDIA_STATES.filter((state) =>
    state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={AddNewsStyles.stateModalOverlay}>
        <View style={AddNewsStyles.stateModalBox}>
          <View style={AddNewsStyles.stateModalHeader}>
            <Text style={AddNewsStyles.stateModalTitle}>Select State</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={AddNewsStyles.stateSearchWrap}>
            <Feather name="search" size={15} color="#64748b" />
            <TextInput
              style={AddNewsStyles.stateSearchInput}
              placeholder="Search state..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  AddNewsStyles.stateItem,
                  selected === state && AddNewsStyles.stateItemActive,
                ]}
                onPress={() => {
                  onSelect(state);
                  onClose();
                }}
              >
                <Text
                  style={[
                    AddNewsStyles.stateItemText,
                    selected === state && AddNewsStyles.stateItemTextActive,
                  ]}
                >
                  {state}
                </Text>
                {selected === state ? <Feather name="check" size={15} color="#FF2D78" /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ReportTypeModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={AddNewsStyles.stateModalOverlay}>
        <View style={AddNewsStyles.stateModalBox}>
          <View style={AddNewsStyles.stateModalHeader}>
            <Text style={AddNewsStyles.stateModalTitle}>Select Report Type</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  AddNewsStyles.stateItem,
                  selected === type && AddNewsStyles.stateItemActive,
                ]}
                onPress={() => {
                  onSelect(type);
                  onClose();
                }}
              >
                <Text
                  style={[
                    AddNewsStyles.stateItemText,
                    selected === type && AddNewsStyles.stateItemTextActive,
                  ]}
                >
                  {type}
                </Text>
                {selected === type ? <Feather name="check" size={15} color="orange" /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function RoleTypeModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={AddNewsStyles.stateModalOverlay}>
        <View style={AddNewsStyles.stateModalBox}>
          <View style={AddNewsStyles.stateModalHeader}>
            <Text style={AddNewsStyles.stateModalTitle}>Select Role Type</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {ROLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  AddNewsStyles.stateItem,
                  selected === type && AddNewsStyles.stateItemActive,
                ]}
                onPress={() => {
                  onSelect(type);
                  onClose();
                }}
              >
                <Text
                  style={[
                    AddNewsStyles.stateItemText,
                    selected === type && AddNewsStyles.stateItemTextActive,
                  ]}
                >
                  {type}
                </Text>
                {selected === type ? <Feather name="check" size={15} color="#FF6600" /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Web Stepper Component ────────────────────────────────────────────────────
function WebStepper({ compact = false }) {
  const steps = [
    { n: '1', label: 'Content', done: true },
    { n: '2', label: 'Categorise', active: true },
    { n: '3', label: 'Location' },
    { n: '4', label: 'Media' },
  ];

  return (
    <View style={[AddNewsStyles.webStepper, compact && { flexWrap: 'wrap', gap: 10 }]}>
      {steps.map((step, index) => (
        <React.Fragment key={step.n}>
          <View style={[AddNewsStyles.webStepItem, compact && { minWidth: '45%' }]}>
            <View style={[
              AddNewsStyles.webStepCircle,
              step.done && AddNewsStyles.webStepCircleDone,
              step.active && AddNewsStyles.webStepCircleActive,
            ]}>
              {step.done
                ? <Feather name="check" size={11} color="#fff" />
                : <Text style={[
                    AddNewsStyles.webStepCircleText,
                    (step.done || step.active) && { color: '#fff' },
                  ]}>{step.n}</Text>
              }
            </View>
            <Text style={[
              AddNewsStyles.webStepLabel,
              step.done && AddNewsStyles.webStepLabelDone,
              step.active && AddNewsStyles.webStepLabelActive,
            ]}>
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[
              AddNewsStyles.webStepLine,
              step.done && AddNewsStyles.webStepLineDone,
              compact && { display: 'none' },
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export default function AddNewsScreen({ navigation }) {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isMobileWeb = isWeb && windowWidth <= 760;
  const isNarrowWeb = isWeb && windowWidth <= 980;
  const webResponsive = {
    pageContainer: {
      paddingHorizontal: isMobileWeb ? 12 : isNarrowWeb ? 18 : 24,
      paddingVertical: isMobileWeb ? 12 : 20,
      alignItems: 'center',
    },
    card: {
      maxWidth: isMobileWeb ? '100%' : 980,
      borderRadius: isMobileWeb ? 14 : 20,
    },
    cardHeader: {
      paddingHorizontal: isMobileWeb ? 14 : 24,
      paddingTop: isMobileWeb ? 14 : 20,
    },
    formHeader: {
      alignItems: isMobileWeb ? 'flex-start' : 'flex-start',
      gap: isMobileWeb ? 10 : 8,
    },
    formHeaderTitle: {
      fontSize: isMobileWeb ? 18 : 20,
      lineHeight: isMobileWeb ? 24 : 26,
    },
    formHeaderSub: {
      lineHeight: 19,
    },
    formContent: {
      paddingHorizontal: isMobileWeb ? 14 : 28,
      gap: isMobileWeb ? 14 : 18,
    },
    input: {
      fontSize: 14,
      padding: isMobileWeb ? 11 : 12,
    },
    row2Field: {
      minWidth: isMobileWeb ? '100%' : 200,
    },
    mediaToggleRow: {
      flexWrap: 'wrap',
      gap: isMobileWeb ? 8 : 10,
    },
    mediaToggleBtn: {
      flexGrow: 1,
      flexBasis: isMobileWeb ? '48%' : 'auto',
      minWidth: isMobileWeb ? '48%' : 120,
      paddingHorizontal: 8,
    },
    mediaPickBtn: {
      justifyContent: 'center',
      paddingHorizontal: isMobileWeb ? 12 : 16,
    },
    footer: {
      alignItems: 'stretch',
      flexDirection: isMobileWeb ? 'column-reverse' : 'row',
      justifyContent: isMobileWeb ? 'center' : 'flex-end',
      paddingHorizontal: isMobileWeb ? 14 : 28,
      paddingVertical: isMobileWeb ? 14 : 20,
      borderBottomLeftRadius: isMobileWeb ? 14 : 20,
      borderBottomRightRadius: isMobileWeb ? 14 : 20,
    },
    footerBtn: {
      width: isMobileWeb ? '100%' : 'auto',
      alignItems: 'center',
    },
    videoPreview: {
      height: isMobileWeb ? 170 : 190,
    },
  };

  const decodeHtmlEntities = (value) => String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const htmlToPlain = (html) => String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>\s*<div>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const escapeHtml = (text) => String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const plainToHtml = (text) => `<div>${escapeHtml(text).replace(/\n/g, '<br/>')}</div>`;

  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribedUser, setIsSubscribedUser] = useState(false);
  const [locationState, setLocationState] = useState('');
  const [locationDistrict, setLocationDistrict] = useState('');
  const [locationTaluka, setLocationTaluka] = useState('');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [reportType, setReportType] = useState('');
  const [roleType, setRoleType] = useState('');
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [subtitleExpanded, setSubtitleExpanded] = useState(false);
  const [mediaType, setMediaType] = useState('None');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoThumb, setVideoThumb] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [reportPickerVisible, setReportPickerVisible] = useState(false);
  const [rolePickerVisible, setRolePickerVisible] = useState(false);

  const titleEditorRef = useRef(null);
  const titleHtmlRef = useRef('');
  const subtitleEditorRef = useRef(null);
  const subtitleHtmlRef = useRef('');
  const descriptionEditorRef = useRef(null);
  const descriptionHtmlRef = useRef('');
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await UserStore.getCurrentUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }
      const admin = user.role === 'admin';
      const hasSubscription = UserStore.hasActiveSubscription(user);
      setUserName(user.name || 'User');
      setIsAdmin(admin);
      setIsSubscribedUser(hasSubscription);
      setLocationState(user.state || '');
      setLocationDistrict(user.district || '');
      setLocationTaluka(user.taluka || '');

      if (!admin && !hasSubscription) {
        showToast('Premium access required to add news.', 'error');
        navigation.replace('Subscription Plans');
        return;
      }
      if (!admin && hasSubscription && !user.location_complete) {
        showToast('Select your location to activate premium services.', 'error');
        navigation.replace('StateSelect', { fromPremium: true });
        return;
      }

      if (hasSubscription && user.location_complete) {
        setSelectedState(user.state || '');
      }
    };

    init();
    const timer = setTimeout(() => setEditorReady(true), 300);
    return () => clearTimeout(timer);
  }, [navigation, showToast]);

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const ensureLibraryPermission = async () => {
    if (Platform.OS === 'web') return true;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Gallery permission needed.', 'error');
      return false;
    }
    return true;
  };

  const normalizeMediaType = (typeValue) => {
    if (!typeValue) return undefined;
    const normalized = String(typeValue).toLowerCase();
    if (normalized.includes('images')) return ImagePicker.MediaType?.Images || 'images';
    if (normalized.includes('videos')) return ImagePicker.MediaType?.Videos || 'videos';
    if (normalized.includes('all')) return ImagePicker.MediaType?.All || 'all';
    return typeValue;
  };

  const getImagePickerTypes = () => {
    const mediaType = ImagePicker.MediaType;
    const mediaOption = ImagePicker.MediaTypeOptions;
    return {
      images: normalizeMediaType(mediaType?.Images || mediaOption?.Images),
      videos: normalizeMediaType(mediaType?.Videos || mediaOption?.Videos),
      all: normalizeMediaType(mediaType?.All || mediaOption?.All),
    };
  };

  const isVideoAsset = (asset) => {
    if (!asset) return false;
    return (
      asset.type === 'video' ||
      (asset.mimeType && asset.mimeType.startsWith('video/')) ||
      (asset.name && /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(asset.name)) ||
      (asset.uri && /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(asset.uri))
    );
  };

  const validateVideoDuration = (durationMs) => {
    const safeDuration = Number(durationMs || 0);
    if (!safeDuration) return true;
    if (safeDuration < 15000) {
      showToast('Video must be at least 15 seconds.', 'error');
      return false;
    }
    if (safeDuration > 60000) {
      showToast('Video must be 1 minute or less.', 'error');
      return false;
    }
    return true;
  };

  const generateVideoThumbnail = (videoSrc) => {
    return new Promise((resolve) => {
      try {
        const thumbVid = document.createElement('video');
        thumbVid.src = videoSrc;
        thumbVid.crossOrigin = 'anonymous';
        thumbVid.muted = true;
        thumbVid.preload = 'metadata';
        thumbVid.addEventListener('loadedmetadata', () => {
          thumbVid.currentTime = 0.5;
        });
        thumbVid.addEventListener('seeked', () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = thumbVid.videoWidth || 640;
            canvas.height = thumbVid.videoHeight || 360;
            canvas.getContext('2d').drawImage(thumbVid, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } catch {
            resolve(null);
          }
        });
        thumbVid.addEventListener('error', () => resolve(null));
        thumbVid.load();
      } catch {
        resolve(null);
      }
    });
  };

  const pickImages = async () => {
    try {
      const ok = await ensureLibraryPermission();
      if (!ok) return;

      const { images: imageTypes } = getImagePickerTypes();
      const imgPickResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: imageTypes || undefined,
        allowsMultipleSelection: true,
        base64: false,
        quality: 0.6,
        maxWidth: 1280,
        maxHeight: 1280,
        allowsEditing: false,
        exif: false,
      });

      if (!imgPickResult.canceled && imgPickResult.assets?.length) {
        const processedImages = [];
        const maxImages = 5;

        for (let i = 0; i < Math.min(imgPickResult.assets.length, maxImages); i++) {
          const asset = imgPickResult.assets[i];
          if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
            showToast(`Image ${i + 1} is too large (max 10MB). Skipping.`, 'warning');
            continue;
          }
          processedImages.push(asset.uri);
        }

        if (processedImages.length > 0) {
          setImages((prev) => [...prev, ...processedImages]);
          if (imgPickResult.assets.length > maxImages) {
            showToast(`Only first ${maxImages} images added.`, 'info');
          }
        }
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      showToast('Unable to open image picker.', 'error');
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const pickVideo = async () => {
    try {
      if (Platform.OS === 'web') {
        const webResult = await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          multiple: false,
          copyToCacheDirectory: true,
        });
        if (webResult.canceled) return;

        const asset = webResult.assets?.[0] || webResult;
        if (!isVideoAsset(asset)) {
          showToast('Please select a video file.', 'error');
          return;
        }

        if (asset.size && asset.size > 50 * 1024 * 1024) {
          showToast('Video is too large (max 50MB).', 'error');
          return;
        }

        if (!validateVideoDuration(asset.duration)) return;

        const persisted = await storeWebUriToIdbMedia(asset.uri, { prefix: 'video', mimeType: asset.mimeType || '' });
        setVideo(persisted);

        const thumb = await generateVideoThumbnail(persisted);
        if (thumb) setVideoThumb(thumb);

        showToast('Video selected.', 'success');
        return;
      }

      const ok = await ensureLibraryPermission();
      if (!ok) return;

      const { videos } = getImagePickerTypes();
      const nativeResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: videos || undefined,
        allowsMultipleSelection: false,
        base64: false,
        quality: 0.8,
        videoMaxDuration: 60,
        allowsEditing: false,
      });

      if (!nativeResult.canceled && nativeResult.assets?.[0]) {
        const asset = nativeResult.assets[0];

        if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
          showToast('Video is too large (max 50MB).', 'error');
          return;
        }

        if (!isVideoAsset(asset)) {
          showToast('Please select a video file.', 'error');
          return;
        }

        if (!validateVideoDuration(asset.duration)) return;
        setVideo(asset.uri);
      }
    } catch (err) {
      console.warn('Video picker error:', err);
      showToast('Unable to open video picker.', 'error');
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0] || result;
      if (!asset?.uri) return;
      setAttachment({
        uri: asset.uri,
        name: asset.name || 'attachment',
        size: asset.size || null,
        mimeType: asset.mimeType || asset.type || '',
      });
    } catch (_err) {
      showToast('Unable to open file picker.', 'error');
    }
  };

  const handleSubmit = async () => {
    const titleHtml = titleHtmlRef.current || '';
    const subtitleHtml = subtitleHtmlRef.current || '';
    const descriptionHtml = descriptionHtmlRef.current || '';
    const titlePlain = htmlToPlain(titleHtml);
    const subtitlePlain = htmlToPlain(subtitleHtml);
    const descriptionPlain = htmlToPlain(descriptionHtml);

    if (!titlePlain) { showToast('Title is required.', 'error'); return; }
    if (!descriptionPlain) { showToast('Description is required.', 'error'); return; }
    if (!reportType) { showToast('Please select a report type.', 'error'); return; }

    const stateValue = isSubscribedUser && locationState ? locationState : selectedState;
    if (!stateValue) { showToast('Please select a state.', 'error'); return; }
    if (mediaType === 'Image' && images.length === 0) { showToast('Please upload at least one image.', 'error'); return; }
    if (mediaType === 'Video' && !video) { showToast('Please upload a video.', 'error'); return; }
    if (mediaType === 'File' && !attachment) { showToast('Please upload a file.', 'error'); return; }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user) {
      showToast('Login again.', 'error');
      setSaving(false);
      return;
    }

    const savedImages = mediaType === 'Image'
      ? await Promise.all(
        (Array.isArray(images) ? images : []).map((uri) => (
          Platform.OS === 'web'
            ? storeWebUriToIdbMedia(uri, { prefix: 'image', mimeType: 'image/jpeg' })
            : persistToUploadsDir({ uri, subdir: 'images', fallbackExt: 'jpg' })
        ))
      )
      : [];

    const savedVideo = mediaType === 'Video' && video
      ? (
        Platform.OS === 'web'
          ? await storeWebUriToIdbMedia(video, { prefix: 'video', mimeType: 'video/mp4' })
          : await persistToUploadsDir({ uri: video, subdir: 'videos', fallbackExt: 'mp4' })
      )
      : null;

    const savedVideoThumb = mediaType === 'Video' && videoThumb
      ? (
        Platform.OS === 'web'
          ? await storeWebUriToIdbMedia(videoThumb, { prefix: 'image', mimeType: 'image/jpeg' })
          : await persistToUploadsDir({ uri: videoThumb, subdir: 'images', fallbackExt: 'jpg' })
      )
      : '';

    const newsItem = {
      id: `news-${Date.now()}`,
      title: titlePlain,
      subtitle: subtitlePlain,
      title_html: titleHtml,
      subtitle_html: subtitleHtml,
      description: descriptionPlain,
      description_html: descriptionHtml,
      mediaType,
      images: savedImages,
      video: savedVideo,
      image: mediaType === 'Video' ? savedVideoThumb :
             mediaType === 'Image' && savedImages.length > 0 ? savedImages[0] : '',
      thumbnail: mediaType === 'Video' ? savedVideoThumb :
             mediaType === 'Image' && savedImages.length > 0 ? savedImages[0] : '',
      file: mediaType === 'File' ? attachment : null,
      report_type: reportType,
      role_type: roleType,
      category: reportType || stateValue || 'General',
      language: String(language || '').trim().toLowerCase(),
      state: stateValue,
      district: isSubscribedUser ? locationDistrict : '',
      taluka: isSubscribedUser ? locationTaluka : '',
      status: user.role === 'admin' ? 'approved' : 'pending',
      createdBy: user.email,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
      author_has_blue_tick: UserStore.hasBlueTick(user),
      author_is_premium: UserStore.hasPremiumAccess(user),
      author_is_subscriber: UserStore.hasActiveSubscription(user),
      author_role: user.role || 'free',
      author_role_label: user.role_label || '',
      author_seat_id: user.state_seat?.seat_id || '',
      author_seat_name: user.state_seat?.seat_name || '',
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN'),
      views: 0,
      shares: 0,
      likes: 0,
      comments: 0,
      liked_by: [],
    };

    const allNews = [...(user.news || []), newsItem];
    const updated = await UserStore.updateUser(user.email, { news: allNews });
    setSaving(false);

    if (!updated) {
      showToast('Failed to save. Try again.', 'error');
      return;
    }

    showToast(
      user.role === 'admin'
        ? 'News published successfully!'
        : 'Submitted! Waiting for admin approval.',
      'success'
    );

    setTitle('');
    setSubtitle('');
    setDescriptionText('');
    setReportType('');
    setRoleType('');
    setMediaType('None');
    setImages([]);
    setVideo(null);
    setVideoThumb(null);
    setAttachment(null);
    setSelectedState('');
    titleHtmlRef.current = '';
    subtitleHtmlRef.current = '';
    descriptionHtmlRef.current = '';
    titleEditorRef.current?.setContentHTML('');
    subtitleEditorRef.current?.setContentHTML('');
    descriptionEditorRef.current?.setContentHTML('');

    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'News Feed' }],
        })
      );
    }, 800);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // WEB — Centered modal layout (no sidebar)
  // ─────────────────────────────────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={AddNewsStyles.root}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[AddNewsStyles.webPageContainer, webResponsive.pageContainer]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={[AddNewsStyles.webCard, webResponsive.card]}>

            {/* ── Card Header ── */}
            <View style={[AddNewsStyles.webCardHeader, webResponsive.cardHeader]}>

              {/* Back button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={AddNewsStyles.webBackBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="arrow-left" size={16} color="#64748b" />
                <Text style={AddNewsStyles.webBackBtnText}>Back</Text>
              </TouchableOpacity>

              {/* Title row */}
              <View style={[AddNewsStyles.webFormHeader, webResponsive.formHeader]}>
                <View style={{ flex: 1, minWidth: isMobileWeb ? '100%' : 240 }}>
                  <Text style={[AddNewsStyles.webFormHeaderTitle, webResponsive.formHeaderTitle]}>Add news article</Text>
                  <Text style={[AddNewsStyles.webFormHeaderSub, webResponsive.formHeaderSub]}>
                    Fill in the details below to publish your news report.
                  </Text>
                </View>
                <View style={AddNewsStyles.webFormBadge}>
                  <Text style={AddNewsStyles.webFormBadgeText}>PUBLISH</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={AddNewsStyles.webDivider} />

              {/* Stepper */}
              <WebStepper compact={isMobileWeb} />

              {/* Divider */}
              <View style={AddNewsStyles.webDivider} />
            </View>

            {/* ── Form Body ── */}
            <View style={[AddNewsStyles.webFormContent, webResponsive.formContent]}>

              {/* ── Title ── */}
              <View style={AddNewsStyles.webField}>
                <Text style={AddNewsStyles.webLabel}>
                  Title <Text style={AddNewsStyles.required}>*</Text>
                </Text>
                <TextInput
                  style={[AddNewsStyles.webInput, webResponsive.input, { minHeight: 52 }]}
                  placeholder="Enter news title..."
                  placeholderTextColor="#94a3b8"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    titleHtmlRef.current = plainToHtml(text);
                  }}
                  multiline
                />
              </View>

              {/* ── Subtitle ── */}
              <View style={AddNewsStyles.webField}>
                <Text style={AddNewsStyles.webLabel}>
                  Sub title{' '}
                  <Text style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</Text>
                </Text>
                <Text style={AddNewsStyles.webHint}>A short one-line summary below the headline.</Text>
                <TextInput
                  style={[AddNewsStyles.webInput, webResponsive.input, { minHeight: 52 }]}
                  placeholder="Enter subtitle (optional)..."
                  placeholderTextColor="#94a3b8"
                  value={subtitle}
                  onChangeText={(text) => {
                    setSubtitle(text);
                    subtitleHtmlRef.current = plainToHtml(text);
                  }}
                  multiline
                />
              </View>

              {/* ── Description ── */}
              <View style={AddNewsStyles.webField}>
                <Text style={AddNewsStyles.webLabel}>
                  Description <Text style={AddNewsStyles.required}>*</Text>
                </Text>
                <Text style={AddNewsStyles.webHint}>Write the full report here. Be clear, concise and factual.</Text>
                <TextInput
                  style={[AddNewsStyles.webInput, webResponsive.input, { minHeight: isMobileWeb ? 160 : 200 }]}
                  placeholder="Enter description..."
                  placeholderTextColor="#94a3b8"
                  value={descriptionText}
                  onChangeText={(text) => {
                    setDescriptionText(text);
                    descriptionHtmlRef.current = plainToHtml(text);
                  }}
                  multiline
                />
              </View>

              <View style={AddNewsStyles.webDivider} />

              {/* ── Report Type + Role Type side by side ── */}
              <View style={AddNewsStyles.webRow2}>
                <View style={[AddNewsStyles.webField, { flex: 1 }, webResponsive.row2Field]}>
                  <Text style={AddNewsStyles.webLabel}>
                    Report type <Text style={AddNewsStyles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={AddNewsStyles.webSelect}
                    onPress={() => setReportPickerVisible(true)}
                  >
                    <Feather name="tag" size={14} color="#FF6600" />
                    <Text style={[AddNewsStyles.webSelectText, !reportType && { color: '#94a3b8' }]}>
                      {reportType || 'Select report type...'}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <View style={[AddNewsStyles.webField, { flex: 1 }, webResponsive.row2Field]}>
                  <Text style={AddNewsStyles.webLabel}>Role type</Text>
                  <TouchableOpacity
                    style={AddNewsStyles.webSelect}
                    onPress={() => setRolePickerVisible(true)}
                  >
                    <Feather name="users" size={14} color="#FF6600" />
                    <Text style={[AddNewsStyles.webSelectText, !roleType && { color: '#94a3b8' }]}>
                      {roleType || 'Select role type...'}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Location ── */}
              <View style={AddNewsStyles.webField}>
                <Text style={AddNewsStyles.webLabel}>
                  Location <Text style={AddNewsStyles.required}>*</Text>
                </Text>
                {isSubscribedUser && !isAdmin ? (
                  <View style={AddNewsStyles.locationLockCard}>
                    <View style={AddNewsStyles.locationLockHeader}>
                      <View>
                        <Text style={AddNewsStyles.locationLockTitle}>Location (Premium)</Text>
                        <Text style={AddNewsStyles.locationLockSubtitle}>This is locked to your premium area.</Text>
                      </View>
                      <View style={AddNewsStyles.locationLockBadge}>
                        <Text style={AddNewsStyles.locationLockBadgeText}>LOCKED</Text>
                      </View>
                    </View>
                    <Text style={AddNewsStyles.locationLockText}>
                      {locationState || 'State not set'}
                      {locationDistrict ? `, ${locationDistrict}` : ''}
                      {locationTaluka ? `, ${locationTaluka}` : ''}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={AddNewsStyles.webSelect}
                    onPress={() => setStatePickerVisible(true)}
                  >
                    <Ionicons name="location-outline" size={15} color="#FF6600" />
                    <Text style={[AddNewsStyles.webSelectText, !selectedState && { color: '#94a3b8' }]}>
                      {selectedState || 'Select a state...'}
                    </Text>
                    <Feather name="chevron-down" size={14} color="#64748b" />
                  </TouchableOpacity>
                )}
              </View>

              {/* ── Media Type ── */}
              <View style={AddNewsStyles.webField}>
                <Text style={AddNewsStyles.webLabel}>Media type</Text>
                <View style={[AddNewsStyles.mediaToggleRow, webResponsive.mediaToggleRow]}>
                  {MEDIA_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        AddNewsStyles.mediaToggleBtn,
                        webResponsive.mediaToggleBtn,
                        mediaType === type && AddNewsStyles.mediaToggleBtnActive,
                      ]}
                      onPress={() => {
                        setMediaType(type);
                        setImages([]);
                        setVideo(null);
                        setAttachment(null);
                      }}
                    >
                      <Feather
                        name={
                          type === 'Image' ? 'image'
                          : type === 'Video' ? 'video'
                          : type === 'File' ? 'paperclip'
                          : 'slash'
                        }
                        size={13}
                        color={mediaType === type ? '#FF6600' : '#64748b'}
                      />
                      <Text style={[
                        AddNewsStyles.mediaToggleBtnText,
                        mediaType === type && AddNewsStyles.mediaToggleBtnTextActive,
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Image upload */}
              {mediaType === 'Image' ? (
                <View style={AddNewsStyles.mediaSection}>
                  <Text style={AddNewsStyles.webHint}>Upload one or more images (max 5, 10MB each).</Text>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, webResponsive.mediaPickBtn]}
                    onPress={pickImages}
                    activeOpacity={0.85}
                  >
                    <Feather name="image" size={16} color="#FF6600" />
                    <Text style={AddNewsStyles.mediaPickBtnText}>
                      {images.length > 0 ? 'Add More Images' : 'Upload Images'}
                    </Text>
                  </TouchableOpacity>
                  {images.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      {images.map((img, idx) => (
                        <View key={idx} style={AddNewsStyles.thumbContainer}>
                          <Image source={{ uri: img }} style={AddNewsStyles.thumb} />
                          <TouchableOpacity style={AddNewsStyles.thumbRemoveBtn} onPress={() => removeImage(idx)}>
                            <Feather name="x" size={10} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              ) : null}

              {/* Video upload */}
              {mediaType === 'Video' ? (
                <View style={AddNewsStyles.mediaSection}>
                  <Text style={AddNewsStyles.webHint}>Upload one video (15s to 1 minute, max 50MB).</Text>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, AddNewsStyles.videoPickBtn, webResponsive.mediaPickBtn]}
                    onPress={pickVideo}
                    activeOpacity={0.85}
                  >
                    <Feather name="video" size={16} color="#FF6600" />
                    <Text style={[AddNewsStyles.mediaPickBtnText, AddNewsStyles.videoPickBtnText]}>
                      {video ? 'Change Video' : 'Upload Video'}
                    </Text>
                  </TouchableOpacity>
                  {video ? (
                    <View style={AddNewsStyles.videoPreviewWrap}>
                      <VideoPreview uri={video} style={[AddNewsStyles.videoPreview, webResponsive.videoPreview]} contentFit="cover" />
                      <TouchableOpacity style={AddNewsStyles.videoRemoveBtn} onPress={() => setVideo(null)}>
                        <Feather name="x" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* File upload */}
              {mediaType === 'File' ? (
                <View style={AddNewsStyles.mediaSection}>
                  <Text style={AddNewsStyles.webHint}>Attach a supporting file (PDF, DOC, etc.).</Text>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, AddNewsStyles.filePickBtn, webResponsive.mediaPickBtn]}
                    onPress={pickFile}
                    activeOpacity={0.85}
                  >
                    <Feather name="paperclip" size={16} color="#FF6600" />
                    <Text style={[AddNewsStyles.mediaPickBtnText, AddNewsStyles.filePickBtnText]}>
                      {attachment ? 'Change File' : 'Upload File'}
                    </Text>
                  </TouchableOpacity>
                  {attachment ? (
                    <View style={AddNewsStyles.fileInfoRow}>
                      <Feather name="file-text" size={14} color="#FF6600" />
                      <Text style={AddNewsStyles.fileInfoText} numberOfLines={1}>
                        {attachment.name || 'attachment'}
                      </Text>
                      <TouchableOpacity style={AddNewsStyles.fileRemoveBtn} onPress={() => setAttachment(null)}>
                        <Feather name="x" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Admin note */}
              {!isAdmin ? (
                <View style={AddNewsStyles.adminNoteBox}>
                  <Feather name="info" size={14} color="#FF6600" />
                  <Text style={AddNewsStyles.adminNoteText}>
                    Your news will be reviewed by admin before appearing in the feed.
                  </Text>
                </View>
              ) : null}
            </View>

            {/* ── Card Footer ── */}
            <View style={[AddNewsStyles.webCardFooter, webResponsive.footer]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[AddNewsStyles.webCancelBtn, webResponsive.footerBtn]}
              >
                <Text style={AddNewsStyles.webCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[AddNewsStyles.webSubmitBtn, webResponsive.footerBtn, saving && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Feather name="send" size={15} color="#fff" />
                <Text style={AddNewsStyles.webSubmitBtnText}>
                  {saving ? 'Submitting...' : isAdmin ? 'Publish News' : 'Submit for Approval'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* Modals */}
        {(!isSubscribedUser || isAdmin) && (
          <StatePickerModal
            visible={statePickerVisible}
            selected={selectedState}
            onSelect={setSelectedState}
            onClose={() => setStatePickerVisible(false)}
          />
        )}
        <ReportTypeModal
          visible={reportPickerVisible}
          selected={reportType}
          onSelect={setReportType}
          onClose={() => setReportPickerVisible(false)}
        />
        <RoleTypeModal
          visible={rolePickerVisible}
          selected={roleType}
          onSelect={setRoleType}
          onClose={() => setRolePickerVisible(false)}
        />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE — Original layout (completely unchanged)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={AddNewsStyles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={AddNewsStyles.scrollView}
          contentContainerStyle={AddNewsStyles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              paddingVertical: 8,
              paddingHorizontal: 4,
              marginBottom: 6,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={20} color="#0f172a" />
            <Text style={{ marginLeft: 6, fontSize: 15, color: '#0f172a', fontWeight: '500' }}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={AddNewsStyles.heroCard}>
            <Text style={AddNewsStyles.heroEyebrow}>Publish</Text>
            <Text style={AddNewsStyles.heroTitle}>Add News</Text>
            <Text style={AddNewsStyles.heroSubtitle}>Fill in the details below to publish a news article.</Text>
          </View>

          <View style={AddNewsStyles.card}>
            <View style={AddNewsStyles.fieldHeaderRow}>
              <Text style={AddNewsStyles.fieldLabel}>Title <Text style={AddNewsStyles.required}>*</Text></Text>
              {title.length > 40 ? (
                <TouchableOpacity onPress={() => setTitleExpanded((prev) => !prev)}>
                  <Text style={AddNewsStyles.moreToggleText}>
                    {titleExpanded ? 'Less' : 'More'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {editorReady ? (
              <>
                <RichToolbar
                  editor={titleEditorRef}
                  actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.undo, actions.redo]}
                  style={AddNewsStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={titleEditorRef}
                  style={[AddNewsStyles.richEditor, titleExpanded && AddNewsStyles.richEditorExpanded]}
                  placeholder="Enter news title..."
                  initialContentHTML=""
                  onChange={(html) => { titleHtmlRef.current = html; setTitle(htmlToPlain(html)); }}
                  editorStyle={AddNewsStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            ) : null}

            <View style={[AddNewsStyles.fieldHeaderRow, { marginTop: 14 }]}>
              <Text style={AddNewsStyles.fieldLabel}>Sub Title</Text>
              {subtitle.length > 60 ? (
                <TouchableOpacity onPress={() => setSubtitleExpanded((prev) => !prev)}>
                  <Text style={AddNewsStyles.moreToggleText}>{subtitleExpanded ? 'Less' : 'More'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={AddNewsStyles.fieldHint}>Optional short subtitle.</Text>
            {editorReady ? (
              <>
                <RichToolbar
                  editor={subtitleEditorRef}
                  actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.undo, actions.redo]}
                  style={AddNewsStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={subtitleEditorRef}
                  style={[AddNewsStyles.richEditor, subtitleExpanded && AddNewsStyles.richEditorExpanded]}
                  placeholder="Enter subtitle (optional)..."
                  initialContentHTML=""
                  onChange={(html) => { subtitleHtmlRef.current = html; setSubtitle(htmlToPlain(html)); }}
                  editorStyle={AddNewsStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            ) : null}

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>
              Description <Text style={AddNewsStyles.required}>*</Text>
            </Text>
            <Text style={AddNewsStyles.fieldHint}>Write the full report description.</Text>
            {editorReady ? (
              <>
                <RichToolbar
                  editor={descriptionEditorRef}
                  actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList, actions.insertOrderedList, actions.undo, actions.redo]}
                  style={AddNewsStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={descriptionEditorRef}
                  style={AddNewsStyles.richEditor}
                  placeholder="Enter description..."
                  initialContentHTML=""
                  onChange={(html) => {
                    descriptionHtmlRef.current = html;
                    setDescriptionText(decodeHtmlEntities(htmlToPlain(html)));
                  }}
                  editorStyle={AddNewsStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            ) : null}

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>
              Report Type <Text style={AddNewsStyles.required}>*</Text>
            </Text>
            <TouchableOpacity style={AddNewsStyles.stateSelector} onPress={() => setReportPickerVisible(true)}>
              <Feather name="tag" size={16} color="#7c3aed" />
              <Text style={[AddNewsStyles.stateSelectorText, !reportType && { color: '#94a3b8' }]}>
                {reportType || 'Select report type...'}
              </Text>
              <Feather name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>Role Type</Text>
            <TouchableOpacity style={AddNewsStyles.stateSelector} onPress={() => setRolePickerVisible(true)}>
              <Feather name="users" size={16} color="#7c3aed" />
              <Text style={[AddNewsStyles.stateSelectorText, !roleType && { color: '#94a3b8' }]}>
                {roleType || 'Select role type...'}
              </Text>
              <Feather name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>
              Location <Text style={AddNewsStyles.required}>*</Text>
            </Text>
            {isSubscribedUser && !isAdmin ? (
              <View style={AddNewsStyles.locationLockCard}>
                <View style={AddNewsStyles.locationLockHeader}>
                  <View>
                    <Text style={AddNewsStyles.locationLockTitle}>Location (Premium)</Text>
                    <Text style={AddNewsStyles.locationLockSubtitle}>This is locked to your premium area.</Text>
                  </View>
                  <View style={AddNewsStyles.locationLockBadge}>
                    <Text style={AddNewsStyles.locationLockBadgeText}>LOCKED</Text>
                  </View>
                </View>
                <Text style={AddNewsStyles.locationLockText}>
                  {locationState || 'State not set'}
                  {locationDistrict ? `, ${locationDistrict}` : ''}
                  {locationTaluka ? `, ${locationTaluka}` : ''}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={AddNewsStyles.stateSelector} onPress={() => setStatePickerVisible(true)}>
                <Ionicons name="location-outline" size={16} color="#7c3aed" />
                <Text style={[AddNewsStyles.stateSelectorText, !selectedState && { color: '#94a3b8' }]}>
                  {selectedState || 'Select a state...'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
            )}

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>Media Type</Text>
            <View style={AddNewsStyles.mediaToggleRow}>
              {MEDIA_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[AddNewsStyles.mediaToggleBtn, mediaType === type && AddNewsStyles.mediaToggleBtnActive]}
                  onPress={() => { setMediaType(type); setImages([]); setVideo(null); setAttachment(null); }}
                >
                  <Feather
                    name={type === 'Image' ? 'image' : type === 'Video' ? 'video' : type === 'File' ? 'paperclip' : 'slash'}
                    size={13}
                    color={mediaType === type ? '#7c3aed' : '#64748b'}
                  />
                  <Text style={[AddNewsStyles.mediaToggleBtnText, mediaType === type && AddNewsStyles.mediaToggleBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {mediaType === 'Image' ? (
              <>
                <Text style={[AddNewsStyles.fieldLabel, { marginTop: 8 }]}>Image Upload</Text>
                <Text style={AddNewsStyles.fieldHint}>Upload one or more images for this report.</Text>
                <View style={AddNewsStyles.mediaSection}>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn]}
                    onPress={() => { if (mediaType !== 'Image') { setMediaType('Image'); setVideo(null); setAttachment(null); } pickImages(); }}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="image" size={16} color="#2563eb" />
                    <Text style={AddNewsStyles.mediaPickBtnText}>{images.length > 0 ? 'Change Image' : 'Upload Image'}</Text>
                  </TouchableOpacity>

                  {images.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                      {images.map((img, idx) => (
                        <View key={idx} style={AddNewsStyles.thumbContainer}>
                          <Image source={{ uri: img }} style={AddNewsStyles.thumb} />
                          <TouchableOpacity style={AddNewsStyles.thumbRemoveBtn} onPress={() => removeImage(idx)}>
                            <Feather name="x" size={10} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              </>
            ) : null}

            {mediaType === 'Video' ? (
              <>
                <Text style={AddNewsStyles.fieldLabel}>Video Upload</Text>
                <Text style={AddNewsStyles.fieldHint}>Upload one video (15s to 1 minute).</Text>
                <View style={AddNewsStyles.mediaSection}>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, AddNewsStyles.videoPickBtn]}
                    onPress={() => { if (mediaType !== 'Video') { setMediaType('Video'); setImages([]); setAttachment(null); } pickVideo(); }}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="video" size={16} color="#7c3aed" />
                    <Text style={[AddNewsStyles.mediaPickBtnText, AddNewsStyles.videoPickBtnText]}>
                      {video ? 'Change Video' : 'Upload Video'}
                    </Text>
                  </TouchableOpacity>

                  {video ? (
                    <View style={AddNewsStyles.videoPreviewWrap}>
                      <VideoPreview uri={video} style={AddNewsStyles.videoPreview} contentFit="cover" />
                      <TouchableOpacity style={AddNewsStyles.videoRemoveBtn} onPress={() => setVideo(null)}>
                        <Feather name="x" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}

            {mediaType === 'File' ? (
              <>
                <Text style={AddNewsStyles.fieldLabel}>Upload File</Text>
                <Text style={AddNewsStyles.fieldHint}>Attach a supporting file (PDF, DOC, etc.).</Text>
                <View style={AddNewsStyles.mediaSection}>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, AddNewsStyles.filePickBtn]}
                    onPress={() => { if (mediaType !== 'File') { setMediaType('File'); setImages([]); setVideo(null); } pickFile(); }}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="paperclip" size={16} color="#0f766e" />
                    <Text style={[AddNewsStyles.mediaPickBtnText, AddNewsStyles.filePickBtnText]}>
                      {attachment ? 'Change File' : 'Upload File'}
                    </Text>
                  </TouchableOpacity>

                  {attachment ? (
                    <View style={AddNewsStyles.fileInfoRow}>
                      <Feather name="file-text" size={14} color="#0f766e" />
                      <Text style={AddNewsStyles.fileInfoText} numberOfLines={1}>{attachment.name || 'attachment'}</Text>
                      <TouchableOpacity style={AddNewsStyles.fileRemoveBtn} onPress={() => setAttachment(null)}>
                        <Feather name="x" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}

            {!isAdmin ? (
              <View style={AddNewsStyles.adminNoteBox}>
                <Feather name="info" size={14} color="#ca8a04" />
                <Text style={AddNewsStyles.adminNoteText}>
                  Your news will be reviewed by admin before appearing in the feed.
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[AddNewsStyles.submitBtn, saving && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Feather name="send" size={16} color="#fff" />
              <Text style={AddNewsStyles.submitBtnText}>
                {saving ? 'Submitting...' : isAdmin ? 'Publish News' : 'Submit for Approval'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {(!isSubscribedUser || isAdmin) && (
        <StatePickerModal
          visible={statePickerVisible}
          selected={selectedState}
          onSelect={setSelectedState}
          onClose={() => setStatePickerVisible(false)}
        />
      )}

      <ReportTypeModal
        visible={reportPickerVisible}
        selected={reportType}
        onSelect={setReportType}
        onClose={() => setReportPickerVisible(false)}
      />

      <RoleTypeModal
        visible={rolePickerVisible}
        selected={roleType}
        onSelect={setRoleType}
        onClose={() => setRolePickerVisible(false)}
      />
    </View>
  );
}
