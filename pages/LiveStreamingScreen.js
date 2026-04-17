import React, { useCallback, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import LiveStreamPlayer from '../components/LiveStreamPlayer';
import { useToast } from '../components/ui/ToastProvider';
import LiveStreamingStyles from '../styles/LiveStreamingStyles';
import { UserStore } from '../store/UserStore';

export default function LiveStreamingScreen({ navigation }) {
  const { showToast } = useToast();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab]           = useState('Home');
  const [loading, setLoading]               = useState(true);
  const [stoppingId, setStoppingId]         = useState(null);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const currentStreamIdRef = useRef(null);

  // ── Stream data ──
  // Each item: { id, stream_title, stream_url, status }
  // status: 'live' | 'upcoming' | 'ended'
  const [streamData, setStreamData] = useState({
    currentUser:    null,
    items:          [],
    liveCount:      0,
    upcomingCount:  0,
    endedCount:     0,
  });
  const currentStream = streamData.items.find((stream) => stream.id === currentStreamId) || null;

  const moduleName = 'Live Streaming';

  // ── Load data ──
  const loadStreams = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getLiveStreamingSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }
    setStreamData(data);

    if (currentStreamIdRef.current) {
      const refreshedCurrent = data.items.find((stream) => stream.id === currentStreamIdRef.current);
      if (!refreshedCurrent || refreshedCurrent.status !== 'live') {
        currentStreamIdRef.current = null;
        setCurrentStreamId(null);
      }
    } else {
      const firstLiveStream = data.items.find((stream) => stream.status === 'live' && stream.stream_url);
      if (firstLiveStream) {
        currentStreamIdRef.current = firstLiveStream.id;
        setCurrentStreamId(firstLiveStream.id);
      }
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadStreams();
    }, [loadStreams])
  );

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  // ── Play: open YouTube link ──
  const handlePlay = async (item) => {
    if (item.status !== 'live') {
      showToast('Only live streams can be played right now.', 'error');
      return;
    }
    if (!item.stream_url) {
      showToast('Playback URL not available for this stream.', 'error');
      return;
    }
    currentStreamIdRef.current = item.id;
    setCurrentStreamId(item.id);
  };

  // ── Stop: update status on backend ──
  const handleStop = async (item) => {
    setStoppingId(item.id);
    const result = await UserStore.updateStreamStatus(item.id, 'ended');
    setStoppingId(null);

    if (!result.ok) {
      showToast(result.message || 'Failed to stop stream.', 'error');
      return;
    }
    if (currentStreamId === item.id) {
      currentStreamIdRef.current = null;
      setCurrentStreamId(null);
    }
    showToast('Stream stopped.', 'success');
    loadStreams();
  };

  // ── Status badge style ──
  const statusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':     return LiveStreamingStyles.liveBadge;
      case 'upcoming': return LiveStreamingStyles.upcomingBadge;
      default:         return LiveStreamingStyles.endedBadge;
    }
  };
  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':     return LiveStreamingStyles.liveText;
      case 'upcoming': return LiveStreamingStyles.upcomingText;
      default:         return LiveStreamingStyles.endedText;
    }
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
        {/* Hero Card – no user info */}
        <View style={LiveStreamingStyles.heroCard}>
          <Text style={LiveStreamingStyles.heroEyebrow}>Live TV</Text>
          <Text style={LiveStreamingStyles.heroTitle}>Live Streaming</Text>
          <Text style={LiveStreamingStyles.heroSubtitle}>
            Watch the active bulletin inside the app and keep a single channel on screen at a time.
          </Text>
          <TouchableOpacity
            style={LiveStreamingStyles.startLiveCta}
            onPress={() => navigation.navigate('Start Live')}
          >
            <Feather name="radio" size={16} color="#fff" />
            <Text style={LiveStreamingStyles.startLiveCtaText}>Start Live</Text>
          </TouchableOpacity>
        </View>

        <View style={LiveStreamingStyles.card}>
          <View style={LiveStreamingStyles.playerHeaderRow}>
            <Text style={LiveStreamingStyles.sectionTitle}>Live Player</Text>
            {currentStream ? (
              <View style={LiveStreamingStyles.playerLivePill}>
                <View style={LiveStreamingStyles.liveDotInline} />
                <Text style={LiveStreamingStyles.playerLivePillText}>LIVE</Text>
              </View>
            ) : null}
          </View>

          <View style={LiveStreamingStyles.playerShell}>
            <LiveStreamPlayer
              streamUrl={currentStream?.stream_url || ''}
              onError={() => {
                currentStreamIdRef.current = null;
                setCurrentStreamId(null);
                showToast('Unable to play this live stream.', 'error');
              }}
            />
          </View>

          <Text style={LiveStreamingStyles.playerCaption}>
            {currentStream?.stream_title || 'Select an active stream to start playback.'}
          </Text>
        </View>

        {/* Metrics */}
        <View style={LiveStreamingStyles.metricsRow}>
          <View style={[LiveStreamingStyles.metricCard, LiveStreamingStyles.metricLive]}>
            <View style={LiveStreamingStyles.liveMetricTop}>
              <View style={LiveStreamingStyles.liveDot} />
              <Text style={LiveStreamingStyles.metricValue}>{streamData.liveCount}</Text>
            </View>
            <Text style={LiveStreamingStyles.metricLabel}>Live</Text>
          </View>
          <View style={[LiveStreamingStyles.metricCard, LiveStreamingStyles.metricUpcoming]}>
            <Text style={LiveStreamingStyles.metricValue}>{streamData.upcomingCount}</Text>
            <Text style={LiveStreamingStyles.metricLabel}>Upcoming</Text>
          </View>
          <View style={[LiveStreamingStyles.metricCard, LiveStreamingStyles.metricEnded]}>
            <Text style={LiveStreamingStyles.metricValue}>{streamData.endedCount}</Text>
            <Text style={LiveStreamingStyles.metricLabel}>Ended</Text>
          </View>
        </View>

        {/* Stream Records */}
        <View style={LiveStreamingStyles.card}>
          <Text style={LiveStreamingStyles.sectionTitle}>Stream Records</Text>

          {loading ? (
            <Text style={LiveStreamingStyles.loadingText}>
              Loading stream records...
            </Text>
          ) : streamData.items.length ? (
            streamData.items.map((item) => {
              const isLive = item.status?.toLowerCase() === 'live';

              return (
                <View
                  key={item.id}
                  style={[
                    LiveStreamingStyles.streamCard,
                    isLive && LiveStreamingStyles.streamCardLive,
                  ]}
                >
                  {/* Top Row: title + status badge */}
                  <View style={LiveStreamingStyles.streamTopRow}>
                    <View style={LiveStreamingStyles.streamTitleWrap}>
                      {isLive && <View style={LiveStreamingStyles.liveDotInline} />}
                      <Text style={LiveStreamingStyles.streamTitle} numberOfLines={2}>
                        {item.stream_title}
                      </Text>
                    </View>
                    <View style={[LiveStreamingStyles.statusBadge, statusBadgeStyle(item.status)]}>
                      <Text style={[LiveStreamingStyles.statusBadgeText, statusTextStyle(item.status)]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Playback URL */}
                  <View style={LiveStreamingStyles.linkRow}>
                    <Feather name="video" size={13} color="#dc2626" />
                    <Text style={LiveStreamingStyles.linkText} numberOfLines={1}>
                      {item.stream_url || 'Playback URL not available'}
                    </Text>
                  </View>

                  {/* Play + Stop Buttons */}
                  <View style={LiveStreamingStyles.actionRow}>
                    <TouchableOpacity
                      style={[
                        LiveStreamingStyles.playBtn,
                        !isLive && LiveStreamingStyles.buttonDisabled,
                      ]}
                      onPress={() => handlePlay(item)}
                      disabled={!isLive}
                    >
                      <Feather name="play-circle" size={16} color="#fff" />
                      <Text style={LiveStreamingStyles.playBtnText}>
                        {isLive ? 'Watch Live' : 'Unavailable'}
                      </Text>
                    </TouchableOpacity>

                    {isLive && (
                      <TouchableOpacity
                        style={[
                          LiveStreamingStyles.stopBtn,
                          stoppingId === item.id && LiveStreamingStyles.buttonDisabled,
                        ]}
                        onPress={() => handleStop(item)}
                        disabled={stoppingId === item.id}
                      >
                        <Feather name="square" size={14} color="#fff" />
                        <Text style={LiveStreamingStyles.stopBtnText}>
                          {stoppingId === item.id ? 'Stopping...' : 'Stop'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={LiveStreamingStyles.emptyText}>
              No stream records found.
            </Text>
          )}
        </View>
      </ScrollView>

      <Footer activeTab={activeTab} onTabPress={setActiveTab} />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />
    </View>
  );
}
