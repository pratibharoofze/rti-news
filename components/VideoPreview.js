import React from 'react';
import { Platform, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

function isLikelyPlayableVideoSource(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    return false;
  }

  if (Platform.OS !== 'web') {
    return true;
  }

  return /^(https?:|blob:|data:)/i.test(uri) && /\.(mp4|m4v|mov|webm|ogv|m3u8)(\?.*)?$/i.test(uri);
}

export default function VideoPreview({ uri, style, contentFit = 'cover' }) {
  const playableUri = isLikelyPlayableVideoSource(uri) ? uri : null;
  const player = useVideoPlayer(playableUri, (p) => {
    p.loop = false;
  });

  if (!playableUri) return null;

  return (
    <View>
      <VideoView
        player={player}
        style={style}
        contentFit={contentFit}
        fullscreenOptions={{ enabled: true }}
      />
    </View>
  );
}
