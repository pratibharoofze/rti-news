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
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import VideoPreview from '../components/VideoPreview';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import AddNewsStyles from '../styles/Addnewsstyles';
import { UserStore } from '../store/UserStore';
import { storeWebUriToIdbMedia } from '../utils/webMediaStore';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const REPORT_TYPES = ['Crime', 'Murder', 'Accident', 'Politics', 'Other'];

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
                {selected === state ? <Feather name="check" size={15} color="#7c3aed" /> : null}
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
                {selected === type ? <Feather name="check" size={15} color="#7c3aed" /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function AddNewsScreen({ navigation }) {
  const { showToast } = useToast();
  const isWeb = Platform.OS === 'web';

  const htmlToPlain = (html) => String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const escapeHtml = (text) => String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const plainToHtml = (text) => `<div>${escapeHtml(text).replace(/\n/g, '<br/>')}</div>`;

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
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
  const [titleExpanded, setTitleExpanded] = useState(false);
  const [subtitleExpanded, setSubtitleExpanded] = useState(false);
  const [mediaType, setMediaType] = useState('None');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [reportPickerVisible, setReportPickerVisible] = useState(false);

  const titleEditorRef = useRef(null);
  const titleHtmlRef = useRef('');
  const subtitleEditorRef = useRef(null);
  const subtitleHtmlRef = useRef('');
  const descriptionEditorRef = useRef(null);
  const descriptionHtmlRef = useRef('');
  const [editorReady, setEditorReady] = useState(false);

  const moduleName = 'Add News';

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

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
    setFooterVisible(contentOffset.y + layoutMeasurement.height >= contentSize.height - 8);
  };

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const ensureLibraryPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }
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

  const pickImages = async () => {
    try {
      const ok = await ensureLibraryPermission();
      if (!ok) return;

      const { images } = getImagePickerTypes();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: images || undefined,
        allowsMultipleSelection: true,
        base64: false,
        quality: 0.6,
        maxWidth: 1280,
        maxHeight: 1280,
        allowsEditing: false,
        exif: false,
      });

      if (!result.canceled && result.assets?.length) {
        // Process images to prevent OOM - limit to 5 images max
        const processedImages = [];
        const maxImages = 5;

        for (let i = 0; i < Math.min(result.assets.length, maxImages); i++) {
          const asset = result.assets[i];

          // Check file size - skip if over 10MB
          if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
            showToast(`Image ${i + 1} is too large (max 10MB). Skipping.`, 'warning');
            continue;
          }

          processedImages.push(asset.uri);
        }

        if (processedImages.length > 0) {
          setImages((prev) => [...prev, ...processedImages]);
          if (result.assets.length > maxImages) {
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
        const result = await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          multiple: false,
          copyToCacheDirectory: true,
        });
        if (result.canceled) return;

        const asset = result.assets?.[0] || result;
        if (!isVideoAsset(asset)) {
          showToast('Please select a video file.', 'error');
          return;
        }

        // Check file size for web - max 50MB
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          showToast('Video is too large (max 50MB).', 'error');
          return;
        }

        if (!validateVideoDuration(asset.duration)) return;
        const persisted = await storeWebUriToIdbMedia(asset.uri, { prefix: 'video', mimeType: asset.mimeType || '' });
        setVideo(persisted);
        showToast('Video selected.', 'success');
        return;
      }

      const ok = await ensureLibraryPermission();
      if (!ok) return;

      const { videos } = getImagePickerTypes();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: videos || undefined,
        allowsMultipleSelection: false,
        base64: false,
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute max
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];

        // Check file size - max 50MB
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

    if (!titlePlain) {
      showToast('Title is required.', 'error');
      return;
    }
    if (!descriptionPlain) {
      showToast('Description is required.', 'error');
      return;
    }
    if (!reportType) {
      showToast('Please select a report type.', 'error');
      return;
    }
    const stateValue = isSubscribedUser && locationState ? locationState : selectedState;
    if (!stateValue) {
      showToast('Please select a state.', 'error');
      return;
    }
    if (mediaType === 'Image' && images.length === 0) {
      showToast('Please upload at least one image.', 'error');
      return;
    }
    if (mediaType === 'Video' && !video) {
      showToast('Please upload a video.', 'error');
      return;
    }
    if (mediaType === 'File' && !attachment) {
      showToast('Please upload a file.', 'error');
      return;
    }

    setSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user) {
      showToast('Login again.', 'error');
      setSaving(false);
      return;
    }

    const newsItem = {
      id: `news-${Date.now()}`,
      title: titlePlain,
      subtitle: subtitlePlain,
      title_html: titleHtml,
      subtitle_html: subtitleHtml,
      description: descriptionHtml,
      mediaType,
      images: mediaType === 'Image'
        ? await Promise.all(
          (Array.isArray(images) ? images : []).map((uri) =>
            persistToUploadsDir({ uri, subdir: 'images', fallbackExt: 'jpg' })
          )
        )
        : [],
      video: mediaType === 'Video'
        ? await persistToUploadsDir({ uri: video, subdir: 'videos', fallbackExt: 'mp4' })
        : null,
      file: mediaType === 'File' ? attachment : null,
      report_type: reportType,
      category: reportType || stateValue || 'General',
      state: stateValue,
      district: isSubscribedUser ? locationDistrict : '',
      taluka: isSubscribedUser ? locationTaluka : '',
      status: user.role === 'admin' ? 'approved' : 'pending',
      createdBy: user.email,
      author_name: user.name || 'User',
      author_profile_image: user.profile_image || '',
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
    setMediaType('None');
    setImages([]);
    setVideo(null);
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
          routes: [{ name: 'Home' }],
        })
      );
    }, 800);
  };

  return (
    <View style={AddNewsStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
        userName={userName}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={AddNewsStyles.scrollView}
          contentContainerStyle={AddNewsStyles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
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
            {isWeb ? (
              <TextInput
                style={[
                  AddNewsStyles.webTextInput,
                  { minHeight: 60 },
                  { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
                  titleExpanded && { minHeight: 120 },
                ]}
                placeholder="Enter news title..."
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  titleHtmlRef.current = plainToHtml(text);
                }}
                multiline
              />
            ) : editorReady ? (
              <>
                <RichToolbar
                  editor={titleEditorRef}
                  actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.undo,
                    actions.redo,
                  ]}
                  style={AddNewsStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={titleEditorRef}
                  style={[AddNewsStyles.richEditor, titleExpanded && AddNewsStyles.richEditorExpanded]}
                  placeholder="Enter news title..."
                  initialContentHTML=""
                  onChange={(html) => {
                    titleHtmlRef.current = html;
                    setTitle(htmlToPlain(html));
                  }}
                  editorStyle={AddNewsStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            ) : null}

            <View style={[AddNewsStyles.fieldHeaderRow, { marginTop: 14 }]}>
              <Text style={AddNewsStyles.fieldLabel}>Sub Title</Text>
              {subtitle.length > 60 ? (
                <TouchableOpacity onPress={() => setSubtitleExpanded((prev) => !prev)}>
                  <Text style={AddNewsStyles.moreToggleText}>
                    {subtitleExpanded ? 'Less' : 'More'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={AddNewsStyles.fieldHint}>Optional short subtitle.</Text>
            {isWeb ? (
              <TextInput
                style={[
                  AddNewsStyles.webTextInput,
                  { minHeight: 70 },
                  { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
                  subtitleExpanded && { minHeight: 140 },
                ]}
                placeholder="Enter subtitle (optional)..."
                placeholderTextColor="#94a3b8"
                value={subtitle}
                onChangeText={(text) => {
                  setSubtitle(text);
                  subtitleHtmlRef.current = plainToHtml(text);
                }}
                multiline
              />
            ) : editorReady ? (
              <>
                <RichToolbar
                  editor={subtitleEditorRef}
                  actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.undo,
                    actions.redo,
                  ]}
                  style={AddNewsStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={subtitleEditorRef}
                  style={[AddNewsStyles.richEditor, subtitleExpanded && AddNewsStyles.richEditorExpanded]}
                  placeholder="Enter subtitle (optional)..."
                  initialContentHTML=""
                  onChange={(html) => {
                    subtitleHtmlRef.current = html;
                    setSubtitle(htmlToPlain(html));
                  }}
                  editorStyle={AddNewsStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            ) : null}

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>
              Description <Text style={AddNewsStyles.required}>*</Text>
            </Text>
            <Text style={AddNewsStyles.fieldHint}>Write the full report description.</Text>

            {isWeb ? (
              <TextInput
                style={[
                  AddNewsStyles.webTextInput,
                  { minHeight: 220 },
                  { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
                ]}
                placeholder="Enter description..."
                placeholderTextColor="#94a3b8"
                value={descriptionText}
                onChangeText={(text) => {
                  setDescriptionText(text);
                  descriptionHtmlRef.current = plainToHtml(text);
                }}
                multiline
              />
            ) : editorReady ? (
              <>
                <RichToolbar
                  editor={descriptionEditorRef}
                  actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.insertBulletsList,
                    actions.insertOrderedList,
                    actions.undo,
                    actions.redo,
                  ]}
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

            <Text style={[AddNewsStyles.fieldLabel, { marginTop: 14 }]}>
              Location <Text style={AddNewsStyles.required}>*</Text>
            </Text>
            {isSubscribedUser && !isAdmin ? (
              <View style={AddNewsStyles.locationLockCard}>
                <View style={AddNewsStyles.locationLockHeader}>
                  <View>
                    <Text style={AddNewsStyles.locationLockTitle}>Location (Premium)</Text>
                    <Text style={AddNewsStyles.locationLockSubtitle}>
                      This is locked to your premium area.
                    </Text>
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
                  style={[
                    AddNewsStyles.mediaToggleBtn,
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
                      type === 'Image'
                        ? 'image'
                        : type === 'Video'
                          ? 'video'
                          : type === 'File'
                            ? 'paperclip'
                            : 'slash'
                    }
                    size={13}
                    color={mediaType === type ? '#7c3aed' : '#64748b'}
                  />
                  <Text
                    style={[
                      AddNewsStyles.mediaToggleBtnText,
                      mediaType === type && AddNewsStyles.mediaToggleBtnTextActive,
                    ]}
                  >
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
                    onPress={() => {
                      if (mediaType !== 'Image') {
                        setMediaType('Image');
                        setVideo(null);
                        setAttachment(null);
                      }
                      pickImages();
                    }}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="image" size={16} color="#2563eb" />
                    <Text style={AddNewsStyles.mediaPickBtnText}>
                      {images.length > 0 ? 'Change Image' : 'Upload Image'}
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
              </>
            ) : null}

            {mediaType === 'Video' ? (
              <>
                <Text style={AddNewsStyles.fieldLabel}>Video Upload</Text>
                <Text style={AddNewsStyles.fieldHint}>Upload one video (15s to 1 minute).</Text>
                <View style={AddNewsStyles.mediaSection}>
                  <TouchableOpacity
                    style={[AddNewsStyles.mediaPickBtn, AddNewsStyles.videoPickBtn]}
                    onPress={() => {
                      if (mediaType !== 'Video') {
                        setMediaType('Video');
                        setImages([]);
                        setAttachment(null);
                      }
                      pickVideo();
                    }}
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
                    onPress={() => {
                      if (mediaType !== 'File') {
                        setMediaType('File');
                        setImages([]);
                        setVideo(null);
                      }
                      pickFile();
                    }}
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
                      <Text style={AddNewsStyles.fileInfoText} numberOfLines={1}>
                        {attachment.name || 'attachment'}
                      </Text>
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

          <Footer visible={footerVisible} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />

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
    </View>
  );
}

