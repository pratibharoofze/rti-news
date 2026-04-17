import React from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function VideoPreview({ uri, style, contentFit = 'cover' }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  if (!uri) return null;

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
