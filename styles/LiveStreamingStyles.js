import { Platform, StatusBar, StyleSheet } from 'react-native';

const STATUSBAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

const LiveStreamingStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: STATUSBAR_HEIGHT + 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    ...(Platform.OS === 'web' && {
      paddingHorizontal: 32,
      paddingTop: 24,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    }),
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
    boxShadow: '0px 8px 18px rgba(15, 23, 42, 0.06)',
    ...(Platform.OS === 'web' && {
      padding: 28,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    }),
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#FF6600',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 14,
  },
  startLiveCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FF6600',
  },
  startLiveCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: { flex: 1 },
  ownerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  ownerEmail: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748b',
  },

  // ── Metrics ──
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  metricLive:     { backgroundColor: '#ffe4ee' },
  metricUpcoming: { backgroundColor: '#dbeafe' },
  metricEnded:    { backgroundColor: '#f1f5f9' },
  liveMetricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  // ── Card ──
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    boxShadow: '0px 6px 16px rgba(15, 23, 42, 0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  playerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  playerLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ffe4ee',
  },
  playerLivePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6600',
  },
  playerShell: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#020617',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  playerUnavailable: {
    width: '100%',
    aspectRatio: 16 / 9,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  playerUnavailableTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  playerUnavailableText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#cbd5e1',
  },
  playerUnavailableMeta: {
    marginTop: 10,
    fontSize: 11,
    color: '#94a3b8',
  },
  playerCaption: {
    marginTop: 10,
    fontSize: 13,
    color: '#475569',
  },

  // ── Stream Card ──
  streamCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  streamCardLive: {
    borderColor: '#ffb3cc',
    backgroundColor: '#fff5f8',
    borderWidth: 1.5,
  },

  // ── Stream Top Row ──
  streamTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  streamTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  liveDotInline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
    marginTop: 6,
  },
  streamTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
  },

  // ── Status Badge ──
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveBadge:     { backgroundColor: '#ffe4ee' },
  upcomingBadge: { backgroundColor: '#dbeafe' },
  endedBadge:    { backgroundColor: '#f1f5f9' },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  liveText:     { color: '#FF6600' },
  upcomingText: { color: '#1d4ed8' },
  endedText:    { color: '#64748b' },

  // ── Link Row ──
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#16a34a',
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  stopBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FF6600',
  },
  stopBtnDisabled: {
    opacity: 0.6,
  },
  stopBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  infoBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#fff0f5',
    borderWidth: 1,
    borderColor: '#ffb3cc',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9b0038',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#FF6600',
  },
  publisherCamera: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  publisherFallback: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  publisherFallbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  publisherFallbackMeta: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default LiveStreamingStyles;