import React from 'react';
import { Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import LiveStreamingStyles from '../styles/LiveStreamingStyles';

export default function LiveStreamPlayer({ streamUrl, onError }) {
  const player = useVideoPlayer(streamUrl || null, (instance) => {
    instance.loop = false;
  });

  if (!streamUrl) {
    return (
      <View style={LiveStreamingStyles.playerUnavailable}>
        <Text style={LiveStreamingStyles.playerUnavailableTitle}>No stream selected</Text>
        <Text style={LiveStreamingStyles.playerUnavailableText}>
          Choose a live bulletin to begin playback.
        </Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={LiveStreamingStyles.videoPlayer}
      contentFit="contain"
      nativeControls
      allowsFullscreen
      onMountError={onError}
    />
  );
}
