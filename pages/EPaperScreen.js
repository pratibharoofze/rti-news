import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import EPaperStyles from '../styles/EPaperStyles';
import { UserStore } from '../store/UserStore';


// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    approved: { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
    pending:  { bg: '#fef9c3', color: '#ca8a04', label: 'Pending'  },
    rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  }[status] || { bg: '#f1f5f9', color: '#64748b', label: status || '—' };

  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 10, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
    </View>
  );
}

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// Expo exposes these enums differently across SDK versions.
// eslint-disable-next-line import/namespace
const IMAGE_PICKER_MEDIA_TYPE = ImagePicker?.['MediaType'];
// eslint-disable-next-line import/namespace
const IMAGE_PICKER_MEDIA_TYPE_OPTIONS = ImagePicker?.['MediaTypeOptions'];

function StatePickerModal({ visible, selected, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!visible) {
      setSearch('');
    }
  }, [visible]);

  const filtered = INDIA_STATES.filter((state) =>
    state.toLowerCase().includes(search.toLowerCase())
  );

  if (!visible) return null;

  return (
    <View style={EPaperStyles.stateModalOverlay}>
      <TouchableOpacity style={EPaperStyles.stateModalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={EPaperStyles.stateModalBox}>
        <View style={EPaperStyles.stateModalHeader}>
          <Text style={EPaperStyles.stateModalTitle}>Select State</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <View style={EPaperStyles.stateSearchWrap}>
          <Feather name="search" size={15} color="#64748b" />
          <TextInput
            style={EPaperStyles.stateSearchInput}
            placeholder="Search state..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {filtered.map((state) => (
            <TouchableOpacity
              key={state}
              style={[
                EPaperStyles.stateItem,
                selected === state && EPaperStyles.stateItemActive,
              ]}
              onPress={() => {
                onSelect(state);
                onClose();
              }}
            >
              <Text
                style={[
                  EPaperStyles.stateItemText,
                  selected === state && EPaperStyles.stateItemTextActive,
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
  );
}


// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EPaperScreen({ navigation }) {
  const { showToast } = useToast();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [footerVisible, setFooterVisible]   = useState(false);
  const [loading, setLoading]               = useState(true);
  const [userName, setUserName]             = useState('');
  const [currentUser, setCurrentUser]       = useState(null);
  const [isAdmin, setIsAdmin]               = useState(false);

  const [items, setItems]         = useState([]);
  const [totalViews, setTotalViews] = useState(0);

  const [formVisible, setFormVisible] = useState(false);
  const [editItem, setEditItem]       = useState(null);

  const [fMediaType, setFMediaType] = useState('None');
  const [fImages, setFImages]       = useState([]);
  const [fVideo, setFVideo]         = useState(null);
  const [fSaving, setFSaving]       = useState(false);

  const [selectedState, setSelectedState] = useState('' );
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  // HTML stored in refs (RichEditor onChange)
  const fTitleRef = useRef('');
  const fDescRef  = useRef('');

  const [viewItem, setViewItem] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const moduleName = 'E-Paper';

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Load ──────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const user = await UserStore.getCurrentUser();
    if (!user) { navigation.replace('Login'); return; }
    setCurrentUser(user);
    setUserName(user.name || 'User');
    setIsAdmin(user.role === 'admin');

    const data = await UserStore.getEPaperSummary();
    if (data) {
      const filtered = user.role === 'admin'
        ? data.items
        : data.items.filter(i => i.status === 'approved' || i.createdBy === user.email);
      setItems(filtered);
      setTotalViews(data.totalViews);
    }
    setLoading(false);
  }, [navigation]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
    setFooterVisible(contentOffset.y + layoutMeasurement.height >= contentSize.height - 8);
  };

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  // ── Form helpers ──────────────────────────
  const openAddForm = () => {
    setEditItem(null);
    fTitleRef.current = '';
    fDescRef.current  = '';
    setFMediaType('None');
    setFImages([]);
    setFVideo(null);
    setSelectedState('');
    setStatePickerVisible(false);
    setFormVisible(true);
  };

  const openEditForm = (item) => {
    setEditItem(item);
    fTitleRef.current = item.title || '';
    fDescRef.current  = item.description || '';
    setFMediaType(item.mediaType || 'None');
    setFImages(item.images || []);
    setFVideo(item.video || null);
    setSelectedState(item.state || '');
    setStatePickerVisible(false);
    setFormVisible(true);
  };

  const closeForm = () => {
    setStatePickerVisible(false);
    setFormVisible(false);
    setEditItem(null);
  };

  // ── Media pickers ─────────────────────────
  // �� Media pickers ��������������������������������
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('Gallery permission needed.', 'error'); return; }
    setFMediaType('Images');
    setFVideo(null);
    const imageType = IMAGE_PICKER_MEDIA_TYPE?.Images ?? IMAGE_PICKER_MEDIA_TYPE_OPTIONS?.Images;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: imageType ? [imageType] : undefined,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.length) {
      setFImages(prev => [...prev, ...result.assets.map(a => `data:image/jpeg;base64,${a.base64}`)]);
    }
  };

  const removeImage = (idx) => setFImages(prev => prev.filter((_, i) => i !== idx));

  const isVideoAsset = (asset) => {
    if (!asset) return false;
    return (
      asset.type === 'video' ||
      (asset.mimeType && asset.mimeType.startsWith('video/')) ||
      (asset.name && /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(asset.name)) ||
      (asset.uri && /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(asset.uri))
    );
  };

  const pickVideo = async () => {
    setFMediaType('Video');
    setFImages([]);
    if (Platform.OS === 'web') {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0] || result;
      if (!isVideoAsset(asset) || !asset?.uri) {
        showToast('Please select a video file.', 'error');
        return;
      }
      setFVideo(asset.uri);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { showToast('Gallery permission needed.', 'error'); return; }
    const videoType = IMAGE_PICKER_MEDIA_TYPE?.Videos ?? IMAGE_PICKER_MEDIA_TYPE_OPTIONS?.Videos;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: videoType ? [videoType] : undefined,
      allowsMultipleSelection: false,
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]) {
      if (!isVideoAsset(result.assets[0])) {
        showToast('Please select a video file.', 'error');
        return;
      }
      setFVideo(`data:video/mp4;base64,${result.assets[0].base64}`);
    }
  };

  // �� Save �����������������������������������������������
  const handleSave = async () => {
    const titleHtml  = fTitleRef.current || '';
    const descHtml   = fDescRef.current  || '';
    const titlePlain = titleHtml.replace(/<[^>]*>/g, '').trim();
    const descPlain  = descHtml.replace(/<[^>]*>/g, '').trim();

    if (!titlePlain) { showToast('Title required.', 'error'); return; }
    if (!descPlain)  { showToast('Description required.', 'error'); return; }
    setFSaving(true);
    const user = await UserStore.getCurrentUser();
    if (!user) { showToast('Login again.', 'error'); setFSaving(false); return; }

    const all = [...(user.epapers || [])];

    if (editItem) {
      const idx = all.findIndex(e => e.id === editItem.id);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          title:       titleHtml,
          description: descHtml,
          mediaType:   fMediaType,
          images:      fMediaType === 'Images' ? fImages : [],
          video:       fMediaType === 'Video'  ? fVideo  : null,
          updatedAt:   new Date().toISOString(),
          state:       selectedState,
        };
      }
    } else {
      all.push({
        id:          `ep-${Date.now()}`,
        title:       titleHtml,
        description: descHtml,
        mediaType:   fMediaType,
        images:      fMediaType === 'Images' ? fImages : [],
        video:       fMediaType === 'Video'  ? fVideo  : null,
        status:      user.role === 'admin' ? 'approved' : 'pending',
        state:       selectedState,
        createdBy:   user.email,
        createdAt:   new Date().toISOString(),
        views:       0,
        downloads:   0,
      });
    }

    const updated = await UserStore.updateUser(user.email, { epapers: all });
    setFSaving(false);
    if (!updated) { showToast('Save failed.', 'error'); return; }

    closeForm();
    showSuccess(
      editItem ? 'E-Paper updated!' :
      user.role === 'admin' ? 'E-Paper added!' :
      'Submitted! Waiting for admin approval.'
    );
    loadData();
  };

  // ── Delete ────────────────────────────────
  const handleDelete = (item) => {
    Alert.alert('Delete', `"${(item.title || '').replace(/<[^>]*>/g, '') || 'This item'}" delete karein?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const user = await UserStore.getCurrentUser();
          if (!user) return;
          const filtered = (user.epapers || []).filter(e => e.id !== item.id);
          await UserStore.updateUser(user.email, { epapers: filtered });
          showSuccess('Deleted.');
          loadData();
        },
      },
    ]);
  };

  // ── Approve / Reject ──────────────────────
  const handleApprove = async (item) => {
    const user = await UserStore.getCurrentUser();
    if (!user) return;
    await UserStore.updateUser(user.email, {
      epapers: (user.epapers || []).map(e => e.id === item.id ? { ...e, status: 'approved' } : e),
    });
    showSuccess('Approved!');
    loadData();
  };

  const handleReject = async (item) => {
    const user = await UserStore.getCurrentUser();
    if (!user) return;
    await UserStore.updateUser(user.email, {
      epapers: (user.epapers || []).map(e => e.id === item.id ? { ...e, status: 'rejected' } : e),
    });
    showSuccess('Rejected.');
    loadData();
  };

  // ── View ──────────────────────────────────
  const handleView = async (item) => {
    const result = await UserStore.updateEPaperItem(item.id, 'view');
    if (!result?.ok) { showToast(result?.message || 'Error.', 'error'); return; }
    setViewItem({ ...item, views: (item.views || 0) + 1 });
    loadData();
  };

  // ── Share ─────────────────────────────────
  const handleShare = async (item) => {
    try {
      await Share.share({
        title:   (item.title || '').replace(/<[^>]*>/g, ''),
        message: (item.description || '').replace(/<[^>]*>/g, ''),
      });
      showSuccess('Shared!');
    } catch { showToast('Share failed.', 'error'); }
  };

  // ─────────────────────────────────────────────
  // FORM MODAL
  // ─────────────────────────────────────────────
  const FormModal = () => {
    const titleEditorRef = useRef(null);
    const descEditorRef  = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      // wait for modal slide animation before mounting editors
      const t = setTimeout(() => setReady(true), 350);
      return () => clearTimeout(t);
    }, []);

    return (
      <Modal visible={formVisible} animationType="slide" onRequestClose={closeForm}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={EPaperStyles.modalHeader}>
            <View style={EPaperStyles.modalHeaderSide}>
              <TouchableOpacity onPress={closeForm} style={EPaperStyles.modalCloseBtn}>
                <Feather name="x" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <Text style={EPaperStyles.modalHeaderTitle}>
              {editItem ? 'Edit E-Paper' : 'Add E-Paper'}
            </Text>
            <View style={[EPaperStyles.modalHeaderSide, EPaperStyles.modalHeaderSideRight]}>
              <TouchableOpacity style={EPaperStyles.modalSaveBtn} onPress={handleSave} disabled={fSaving}>
                <Text style={EPaperStyles.modalSaveBtnText}>{fSaving ? 'Saving�' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={EPaperStyles.modalContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {ready && (
              <>
                {/* ── Title ── */}
                <Text style={EPaperStyles.fieldLabel}>Title *</Text>
                
                <RichToolbar
                  editor={titleEditorRef}
                  actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.undo, actions.redo]}
                  style={EPaperStyles.richToolbar}
                  iconTint="#475569"
                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={titleEditorRef}
                  style={EPaperStyles.richEditorTitle}
                  placeholder="Title yahan likhein…"
                  initialContentHTML={fTitleRef.current}
                  onChange={(html) => { fTitleRef.current = html; }}
                  editorStyle={EPaperStyles.richEditorInner}
                  useContainer={false}
                />

                {/* ── Description ── */}
                <Text style={[EPaperStyles.fieldLabel, { marginTop: 16 }]}>Description *</Text>
                <Text style={EPaperStyles.fieldHint}>Bold, italic, lists — sab supported</Text>
                <RichToolbar
                  editor={descEditorRef}
                  actions={[
                    actions.setBold,
                    actions.setItalic,
                    actions.setUnderline,
                    actions.insertBulletsList,
                    actions.insertOrderedList,
                    actions.undo,
                    actions.redo,
                  ]}
                  style={EPaperStyles.richToolbar}
                  iconTint="#475569"

                  selectedIconTint="#7c3aed"
                />
                <RichEditor
                  ref={descEditorRef}
                  style={EPaperStyles.richEditorDesc}
                  placeholder="Description yahan likhein…"
                  initialContentHTML={fDescRef.current}
                  onChange={(html) => { fDescRef.current = html; }}
                  editorStyle={EPaperStyles.richEditorInner}
                  useContainer={false}
                />
              </>
            )}
            <Text style={[EPaperStyles.fieldLabel, { marginTop: 14 }]}>State</Text>
            <Text style={EPaperStyles.fieldHint}>Choose the state this e-paper belongs to.</Text>
            <TouchableOpacity style={EPaperStyles.stateSelector} onPress={() => setStatePickerVisible(true)}>
              <Feather name="map-pin" size={16} color="#7c3aed" />
              <Text style={[EPaperStyles.stateSelectorText, !selectedState && { color: '#94a3b8' }]}>
                {selectedState || 'Select a state...'}
              </Text>
              <Feather name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
            {selectedState ? (
              <View style={EPaperStyles.stateChip}>
                <Feather name="map-pin" size={12} color="#4338ca" />
                <Text style={EPaperStyles.stateChipText}>{selectedState}</Text>
              </View>
            ) : null}

            <View style={EPaperStyles.mediaShowcaseCard}>
              <Text style={EPaperStyles.mediaShowcaseEyebrow}>Creative Assets</Text>
              <Text style={EPaperStyles.mediaShowcaseTitle}>Media Upload</Text>
              <Text style={EPaperStyles.mediaShowcaseSubtitle}>
                By default aap image ya video dono me se kuch bhi select kar sakte hain.
              </Text>
              <View style={EPaperStyles.mediaBadgeRow}>
                <View style={EPaperStyles.mediaInfoPill}>
                  <Feather name="layers" size={13} color="#ea580c" />
                  <Text style={EPaperStyles.mediaInfoPillText}>
                    {fImages.length > 0 ? `${fImages.length} image selected` : 'Gallery ready'}
                  </Text>
                </View>
                <View style={[EPaperStyles.mediaInfoPill, EPaperStyles.mediaInfoPillAlt]}>
                  <Feather name="film" size={13} color="#7c3aed" />
                  <Text style={[EPaperStyles.mediaInfoPillText, EPaperStyles.mediaInfoPillAltText]}>
                    {fVideo ? 'Video attached' : 'Video optional'}
                  </Text>
                </View>
              </View>

              <View style={EPaperStyles.mediaSection}>
                <Text style={EPaperStyles.mediaSectionCaption}>Showcase multiple visuals for your e-paper story.</Text>
                <Text style={EPaperStyles.mediaSectionTitle}>Image Gallery</Text>
                <TouchableOpacity style={EPaperStyles.mediaPickBtn} onPress={pickImages}>
                  <Feather name="image" size={16} color="#2563eb" />
                  <Text style={EPaperStyles.mediaPickBtnText}>
                    {fImages.length > 0 ? 'Change Images' : 'Pick Images (multiple)'}
                  </Text>
                </TouchableOpacity>
                {fImages.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {fImages.map((img, idx) => (
                      <View key={idx} style={EPaperStyles.imageThumbContainer}>
                        <Image source={{ uri: img }} style={EPaperStyles.imageThumb} />
                        <TouchableOpacity style={EPaperStyles.imageRemoveBtn} onPress={() => removeImage(idx)}>
                          <Feather name="x" size={10} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={EPaperStyles.mediaSection}>
                <Text style={EPaperStyles.mediaSectionTitle}>Video Upload</Text>
                <Text style={EPaperStyles.mediaSectionCaption}>Add one highlight clip for a richer presentation.</Text>
                <TouchableOpacity style={[EPaperStyles.mediaPickBtn, EPaperStyles.videoPickBtn]} onPress={pickVideo}>
                  <Feather name="video" size={16} color="#7c3aed" />
                  <Text style={[EPaperStyles.mediaPickBtnText, EPaperStyles.videoPickBtnText]}>
                    {fVideo ? 'Change Video' : 'Pick Video (single)'}
                  </Text>
                </TouchableOpacity>
                {fVideo && (
                  <View style={EPaperStyles.videoStatusRow}>
                    <Feather name="check-circle" size={14} color="#16a34a" />
                    <Text style={EPaperStyles.videoStatusText}>Video selected</Text>
                    <TouchableOpacity onPress={() => setFVideo(null)}>
                      <Feather name="x-circle" size={14} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Admin note */}
            {!isAdmin && (
              <View style={EPaperStyles.adminNoteBox}>
                <Feather name="info" size={14} color="#ca8a04" />
                <Text style={EPaperStyles.adminNoteText}>
                  Your entry will appear in the news feed after it is approved by the admin..
                </Text>
              </View>
            )}
          </ScrollView>

          <StatePickerModal
            visible={statePickerVisible}
            selected={selectedState}
            onSelect={setSelectedState}
            onClose={() => setStatePickerVisible(false)}
          />
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  // ─────────────────────────────────────────────
  // VIEW MODAL
  // ─────────────────────────────────────────────
  const ViewModal = () => {
    if (!viewItem) return null;
    const plainTitle = (viewItem.title || '').replace(/<[^>]*>/g, ' ').trim();
    const plainDescription = (viewItem.description || '').replace(/<[^>]*>/g, ' ').trim();

    return (
      <Modal visible={!!viewItem} animationType="slide" onRequestClose={() => setViewItem(null)}>
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={EPaperStyles.modalHeader}>
            <TouchableOpacity onPress={() => setViewItem(null)} style={EPaperStyles.modalCloseBtn}>
              <Feather name="arrow-left" size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={EPaperStyles.modalHeaderTitle} numberOfLines={1}>View E-Paper</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={EPaperStyles.viewModalContent} nestedScrollEnabled>
            <StatusBadge status={viewItem.status} />

            <View style={EPaperStyles.viewTextCard}>
              <Text style={EPaperStyles.viewTitleText}>
                {plainTitle || 'Untitled E-Paper'}
              </Text>
              <Text style={EPaperStyles.viewDescriptionText}>
                {plainDescription || 'No description available.'}
              </Text>
            </View>
              {viewItem.state ? (
                <View style={EPaperStyles.stateChip}>
                  <Feather name="map-pin" size={12} color="#4338ca" />
                  <Text style={EPaperStyles.stateChipText}>{viewItem.state}</Text>
                </View>
              ) : null}


            {viewItem.mediaType === 'Images' && viewItem.images?.length > 0 && (
              <View style={{ marginTop: 14 }}>
                <Text style={EPaperStyles.fieldLabel}>Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {viewItem.images.map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={EPaperStyles.viewImage} />
                  ))}
                </ScrollView>
              </View>
            )}

            {viewItem.mediaType === 'Video' && viewItem.video && (
              <View style={[EPaperStyles.adminNoteBox, { marginTop: 12 }]}>
                <Feather name="video" size={14} color="#7c3aed" />
                <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '700', flex: 1 }}>Video attached</Text>
              </View>
            )}

            <View style={[EPaperStyles.statsRow, { marginTop: 14 }]}>
              <View style={EPaperStyles.statItem}>
                <Feather name="eye" size={12} color="#64748b" />
                <Text style={EPaperStyles.statText}>{viewItem.views ?? 0} Views</Text>
              </View>
              <View style={EPaperStyles.statItem}>
                <Feather name="clock" size={12} color="#64748b" />
                <Text style={EPaperStyles.statText}>{viewItem.createdAt?.slice(0, 10) || ''}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <View style={EPaperStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
        userName={userName}
      />

      {successMsg ? (
        <View style={EPaperStyles.successOverlay}>
          <View style={EPaperStyles.successBox}>
            <Feather name="check-circle" size={18} color="#16a34a" />
            <Text style={EPaperStyles.successBoxText}>{successMsg}</Text>
          </View>
        </View>
      ) : null}

      <ScrollView
        style={EPaperStyles.scrollView}
        contentContainerStyle={EPaperStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={EPaperStyles.heroCard}>
          <Text style={EPaperStyles.heroEyebrow}>Digital Newspaper</Text>
          <Text style={EPaperStyles.heroTitle}>E-Paper</Text>
          <Text style={EPaperStyles.heroSubtitle}>Rich-text articles with images or video.</Text>
        </View>

        {/* Metrics */}
        <View style={EPaperStyles.metricsRow}>
          <View style={[EPaperStyles.metricCard, EPaperStyles.metricPrimary]}>
            <Text style={EPaperStyles.metricValue}>{items.length}</Text>
            <Text style={EPaperStyles.metricLabel}>Articles</Text>
          </View>
          <View style={[EPaperStyles.metricCard, EPaperStyles.metricSecondary]}>
            <Text style={EPaperStyles.metricValue}>{totalViews}</Text>
            <Text style={EPaperStyles.metricLabel}>Views</Text>
          </View>
          <View style={[EPaperStyles.metricCard, EPaperStyles.metricAccent]}>
            <Text style={EPaperStyles.metricValue}>{items.filter(i => i.status === 'pending').length}</Text>
            <Text style={EPaperStyles.metricLabel}>Pending</Text>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={EPaperStyles.addBtn} onPress={openAddForm}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={EPaperStyles.addBtnText}>Add E-Paper</Text>
        </TouchableOpacity>

        {/* List */}
        <View style={EPaperStyles.card}>
          <Text style={EPaperStyles.sectionTitle}>E-Paper Articles</Text>

          {loading ? (
            <Text style={EPaperStyles.loadingText}>Loading…</Text>
          ) : items.length === 0 ? (
            <Text style={EPaperStyles.emptyText}>No e-paper records found.</Text>
          ) : (
            items.map(item => (
              <View key={item.id} style={EPaperStyles.paperCard}>

                <View style={EPaperStyles.paperTopRow}>
                  <StatusBadge status={item.status} />
                  <Text style={EPaperStyles.publishDate}>{item.createdAt?.slice(0, 10) || ''}</Text>
                </View>

                {item.state ? (
                  <View style={EPaperStyles.stateChip}>
                    <Feather name="map-pin" size={12} color="#4338ca" />
                    <Text style={EPaperStyles.stateChipText}>{item.state}</Text>
                  </View>
                ) : null}

                <Text style={EPaperStyles.paperTitle} numberOfLines={2}>

                  {(item.title || '').replace(/<[^>]*>/g, '')}
                </Text>

                <Text style={EPaperStyles.paperDesc} numberOfLines={2}>
                  {(item.description || '').replace(/<[^>]*>/g, '')}
                </Text>

                {item.mediaType && item.mediaType !== 'None' && (
                  <View style={EPaperStyles.mediaBadge}>
                    <Feather name={item.mediaType === 'Images' ? 'image' : 'video'} size={11} color="#2563eb" />
                    <Text style={EPaperStyles.mediaBadgeText}>
                      {item.mediaType === 'Images' ? `${item.images?.length || 0} Image(s)` : 'Video attached'}
                    </Text>
                  </View>
                )}

                <View style={EPaperStyles.statsRow}>
                  <View style={EPaperStyles.statItem}>
                    <Feather name="eye" size={12} color="#64748b" />
                    <Text style={EPaperStyles.statText}>{item.views ?? 0} Views</Text>
                  </View>
                  <View style={EPaperStyles.statItem}>
                    <Feather name="user" size={12} color="#64748b" />
                    <Text style={EPaperStyles.statText}>{item.createdBy?.split('@')[0] || 'user'}</Text>
                  </View>
                </View>

                <View style={EPaperStyles.actionRow}>
                  <TouchableOpacity style={EPaperStyles.actionBtn} onPress={() => handleView(item)}>
                    <Feather name="eye" size={13} color="#2563eb" />
                    <Text style={EPaperStyles.actionBtnText}>View</Text>
                  </TouchableOpacity>

                  {(isAdmin || item.createdBy === currentUser?.email) && (
                    <TouchableOpacity style={EPaperStyles.actionBtn} onPress={() => openEditForm(item)}>
                      <Feather name="edit-2" size={13} color="#7c3aed" />
                      <Text style={[EPaperStyles.actionBtnText, EPaperStyles.actionBtnTextPurple]}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  {(isAdmin || item.createdBy === currentUser?.email) && (
                    <TouchableOpacity style={EPaperStyles.actionBtn} onPress={() => handleDelete(item)}>
                      <Feather name="trash-2" size={13} color="#dc2626" />
                      <Text style={[EPaperStyles.actionBtnText, { color: '#dc2626' }]}>Delete</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={EPaperStyles.actionBtn} onPress={() => handleShare(item)}>
                    <Feather name="share-2" size={13} color="#0891b2" />
                    <Text style={[EPaperStyles.actionBtnText, EPaperStyles.actionBtnTextCyan]}>Share</Text>
                  </TouchableOpacity>
                </View>

                {isAdmin && item.status === 'pending' && (
                  <View style={[EPaperStyles.actionRow, { marginTop: 8 }]}>
                    <TouchableOpacity
                      style={[EPaperStyles.actionBtn, { backgroundColor: '#dcfce7' }]}
                      onPress={() => handleApprove(item)}
                    >
                      <Feather name="check" size={13} color="#16a34a" />
                      <Text style={[EPaperStyles.actionBtnText, { color: '#16a34a' }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[EPaperStyles.actionBtn, { backgroundColor: '#fee2e2' }]}
                      onPress={() => handleReject(item)}
                    >
                      <Feather name="x" size={13} color="#dc2626" />
                      <Text style={[EPaperStyles.actionBtnText, { color: '#dc2626' }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            ))
          )}
        </View>

        <Footer visible={footerVisible} />
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />


      <FormModal />
      <ViewModal />
    </View>
  );
}





