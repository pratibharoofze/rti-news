import React, { useCallback, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import RtmpBroadcaster from '../components/RtmpBroadcaster';
import { useToast } from '../components/ui/ToastProvider';
import LiveStreamingStyles from '../styles/LiveStreamingStyles';
import { UserStore } from '../store/UserStore';
import {
  DEMO_PLAYBACK_URL,
  DEMO_STREAM_TITLE,
  YOUTUBE_RTMPS_URL,
  YOUTUBE_STREAM_KEY_PLACEHOLDER,
} from '../constants/liveStreamingConfig';

const DEFAULT_RTMP_URL = YOUTUBE_RTMPS_URL;
const DEFAULT_STREAM_KEY = YOUTUBE_STREAM_KEY_PLACEHOLDER;
const DEFAULT_PLAYBACK_URL = DEMO_PLAYBACK_URL;
const isExpoGo = Constants.appOwnership === 'expo';
const hasNativePublisher =
  UIManager.getViewManagerConfig?.('RTMPPublisher') ||
  UIManager.getViewManagerConfig?.('NodeCameraView');

export default function LiveBroadcastScreen({ navigation }) {
  const { showToast } = useToast();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    stream_title: DEMO_STREAM_TITLE,
    stream_url: DEFAULT_PLAYBACK_URL,
    ingest_url: DEFAULT_RTMP_URL,
    stream_key: DEFAULT_STREAM_KEY,
  });

  const moduleName = 'Start Live';

  useFocusEffect(
    useCallback(() => {
      setIsPublishing(false);
    }, [])
  );

  const publishUrl = useMemo(() => {
    const ingest = form.ingest_url.trim();
    const key = form.stream_key.trim();

    if (!ingest) return '';
    if (!key) return ingest;
    return ingest.endsWith(`/${key}`) ? ingest : `${ingest.replace(/\/+$/, '')}/${key}`;
  }, [form.ingest_url, form.stream_key]);

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleStartLive = async () => {
    if (isExpoGo || !hasNativePublisher) {
      showToast('Start Live works only in a native Android build. Expo Go can watch live streams only.', 'error');
      return;
    }
    if (form.stream_key.trim() === YOUTUBE_STREAM_KEY_PLACEHOLDER) {
      showToast('Paste the real YouTube Studio stream key before going live.', 'error');
      return;
    }
    if (!form.stream_title.trim()) {
      showToast('Enter a stream title before going live.', 'error');
      return;
    }
    if (!publishUrl) {
      showToast('RTMP ingest URL is required.', 'error');
      return;
    }
    if (!form.stream_url.trim()) {
      showToast('HLS playback URL is required.', 'error');
      return;
    }

    setIsSaving(true);
    const result = await UserStore.startLiveStream({
      stream_title: form.stream_title.trim(),
      stream_url: form.stream_url.trim(),
      ingest_url: form.ingest_url.trim(),
      stream_key: form.stream_key.trim(),
    });
    setIsSaving(false);

    if (!result.ok) {
      showToast(result.message || 'Unable to start the live stream.', 'error');
      return;
    }

    setIsPublishing(true);
    showToast('Live session started. Viewers can now join the HLS stream.', 'success');
  };

  const handleStopLive = async () => {
    setIsSaving(true);
    const result = await UserStore.stopActiveLiveStream();
    setIsSaving(false);
    setIsPublishing(false);

    if (!result.ok) {
      showToast(result.message || 'Unable to stop the live stream.', 'error');
      return;
    }

    showToast('Live session stopped.', 'success');
  };

  return (
    <View style={LiveStreamingStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView
        style={LiveStreamingStyles.scrollView}
        contentContainerStyle={LiveStreamingStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={LiveStreamingStyles.heroCard}>
          <Text style={LiveStreamingStyles.heroEyebrow}>Reporter Console</Text>
          <Text style={LiveStreamingStyles.heroTitle}>Broadcast To YouTube RTMP</Text>
          <Text style={LiveStreamingStyles.heroSubtitle}>
            Configure the YouTube Live encoder target and keep the demo playback URL ready for viewer-side testing.
          </Text>
          {isExpoGo || !hasNativePublisher ? (
            <View style={LiveStreamingStyles.infoBox}>
              <Text style={LiveStreamingStyles.infoTitle}>Native build required</Text>
              <Text style={LiveStreamingStyles.infoText}>
                This screen can preview configuration in Expo Go, but actual RTMP broadcasting works only in a native Android app build.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={LiveStreamingStyles.card}>
          <Text style={LiveStreamingStyles.sectionTitle}>Camera Preview</Text>
          <RtmpBroadcaster
            streamUrl={publishUrl}
            streamKey={form.stream_key.trim()}
            isPublishing={isPublishing}
            onConnectionSuccess={() => showToast('RTMP connection established.', 'success')}
            onConnectionFailed={() => {
              setIsPublishing(false);
              showToast('RTMP connection failed. Check server URL and stream key.', 'error');
            }}
            onDisconnect={() => {
              setIsPublishing(false);
              showToast('Broadcast disconnected.', 'error');
            }}
          />
        </View>

        <View style={LiveStreamingStyles.card}>
          <Text style={LiveStreamingStyles.sectionTitle}>Live Settings</Text>

          <Text style={LiveStreamingStyles.fieldLabel}>Stream Title</Text>
          <TextInput
            value={form.stream_title}
            onChangeText={(value) => updateField('stream_title', value)}
            style={LiveStreamingStyles.input}
            placeholder="RTI News Live Bulletin"
            placeholderTextColor="#94a3b8"
          />

          <Text style={LiveStreamingStyles.fieldLabel}>RTMP Ingest URL</Text>
          <TextInput
            value={form.ingest_url}
            onChangeText={(value) => updateField('ingest_url', value)}
            style={LiveStreamingStyles.input}
            placeholder="rtmp://your-server/live"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Text style={LiveStreamingStyles.fieldLabel}>Stream Key</Text>
          <TextInput
            value={form.stream_key}
            onChangeText={(value) => updateField('stream_key', value)}
            style={LiveStreamingStyles.input}
            placeholder="stream"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <Text style={LiveStreamingStyles.fieldLabel}>Playback URL (.m3u8)</Text>
          <TextInput
            value={form.stream_url}
            onChangeText={(value) => updateField('stream_url', value)}
            style={LiveStreamingStyles.input}
            placeholder="https://your-server/live/stream.m3u8"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
          />

          <View style={LiveStreamingStyles.infoBox}>
            <Text style={LiveStreamingStyles.infoTitle}>YouTube setup</Text>
            <Text style={LiveStreamingStyles.infoText}>
              Copy the stream key from YouTube Studio Live Control Room and paste it here. Replace the stream URL too if Studio shows a different RTMP or RTMPS target.
            </Text>
            <Text style={LiveStreamingStyles.infoText}>Publish target: {publishUrl || 'Not ready'}</Text>
            <Text style={LiveStreamingStyles.infoText}>Demo playback: {DEFAULT_PLAYBACK_URL}</Text>
          </View>

          <View style={LiveStreamingStyles.actionRow}>
            <TouchableOpacity
              style={[
                LiveStreamingStyles.playBtn,
                (isSaving || isPublishing || isExpoGo || !hasNativePublisher) && LiveStreamingStyles.buttonDisabled,
              ]}
              onPress={handleStartLive}
              disabled={isSaving || isPublishing || isExpoGo || !hasNativePublisher}
            >
              <Feather name="radio" size={16} color="#fff" />
              <Text style={LiveStreamingStyles.playBtnText}>
                {isSaving && !isPublishing ? 'Starting...' : 'Start Live'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                LiveStreamingStyles.stopBtn,
                (!isPublishing || isSaving) && LiveStreamingStyles.buttonDisabled,
              ]}
              onPress={handleStopLive}
              disabled={!isPublishing || isSaving}
            >
              <Feather name="square" size={14} color="#fff" />
              <Text style={LiveStreamingStyles.stopBtnText}>
                {isSaving && isPublishing ? 'Stopping...' : 'Stop Live'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer activeTab={activeTab} onTabPress={setActiveTab} />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem="Live Streaming"
      />
    </View>
  );
}
