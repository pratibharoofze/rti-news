import React from 'react';
import { Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import LiveStreamingStyles from '../styles/LiveStreamingStyles';

function isLikelyPlayableStream(streamUrl) {
  return typeof streamUrl === 'string' && /^(https?:|blob:|data:)/i.test(streamUrl);
}

export default function LiveStreamPlayer({ streamUrl, onError }) {
  const playableStreamUrl = isLikelyPlayableStream(streamUrl) ? streamUrl : null;
  const player = useVideoPlayer(playableStreamUrl, (instance) => {
    instance.loop = false;
  });

  if (!playableStreamUrl) {
    return (
      <View style={LiveStreamingStyles.playerUnavailable}>
        <Text style={LiveStreamingStyles.playerUnavailableTitle}>No stream selected</Text>
        <Text style={LiveStreamingStyles.playerUnavailableText}>
          Choose a valid live bulletin to begin playback.
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
