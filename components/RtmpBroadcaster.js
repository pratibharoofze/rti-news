import React from 'react';
import { Platform, Text, UIManager, View } from 'react-native';
import Constants from 'expo-constants';
import LiveStreamingStyles from '../styles/LiveStreamingStyles';

let NodeCameraView = null;

try {
  const publisherModule = require('react-native-rtmp-publisher');
  NodeCameraView =
    publisherModule.NodeCameraView ||
    publisherModule.default?.NodeCameraView ||
    publisherModule.default ||
    null;
} catch {
  NodeCameraView = null;
}

const isExpoGo = Constants.appOwnership === 'expo';
const hasNativePublisher =
  Platform.OS !== 'web' &&
  (
    UIManager.getViewManagerConfig?.('RTMPPublisher') ||
    UIManager.getViewManagerConfig?.('NodeCameraView')
  );

export default function RtmpBroadcaster({
  streamUrl,
  streamKey,
  isPublishing,
  onConnectionSuccess,
  onConnectionFailed,
  onDisconnect,
}) {
  if (isExpoGo || !NodeCameraView || !hasNativePublisher) {
    return (
      <View style={LiveStreamingStyles.publisherFallback}>
        <Text style={LiveStreamingStyles.publisherFallbackTitle}>Broadcaster unavailable here</Text>
        <Text style={LiveStreamingStyles.playerUnavailableText}>
          {isExpoGo
            ? 'Expo Go supports viewing the live stream, but RTMP publishing needs a native Android build.'
            : 'RTMP publisher native module is not present in this app build yet. Rebuild the Android app to enable broadcasting.'}
        </Text>
        <Text style={LiveStreamingStyles.publisherFallbackMeta}>RTMP URL: {streamUrl}</Text>
        <Text style={LiveStreamingStyles.publisherFallbackMeta}>Stream Key: {streamKey}</Text>
      </View>
    );
  }

  return (
    <NodeCameraView
      style={LiveStreamingStyles.publisherCamera}
      outputUrl={streamUrl}
      camera={{ cameraId: 1, cameraFrontMirror: false }}
      audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
      video={{ preset: 12, bitrate: 1200000, profile: 1, fps: 24, videoFrontMirror: false }}
      autopreview
      onConnectionSuccess={onConnectionSuccess}
      onConnectionFailed={onConnectionFailed}
      onDisconnect={onDisconnect}
      isPublishing={isPublishing}
    />
  );
}
