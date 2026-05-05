import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({

  // ── Reel Card ─────────────────────────────────────────────────────────────
  reel: {
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },

  // Bottom gradient overlay
  reelOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    pointerEvents: 'none',
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
        pointerEvents: 'none',
      },
      default: {},
    }),
  },

  // ── Pause overlay ──────────────────────────────────────────────────────────
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pausedIcon: {
    fontSize: 64,
    opacity: 0.9,
  },

  // ── Top bar (mute only) ────────────────────────────────────────────────────
  reelTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  muteBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },

  // ── Tag Badge ──────────────────────────────────────────────────────────────
  reelTagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reelTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── RIGHT action column — ALWAYS inside the video (absolute) ──────────────
  reelActions: {
    position: 'absolute',
    right: 10,
    bottom: Platform.OS === 'ios' ? 120 : 100, // above navbar
    alignItems: 'center',
    gap: 20,
    zIndex: 10,
  },

  // ── WEB ONLY: action sidebar to the right of video ─────────────────────────
  webReelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },

  webVideoContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
    maxWidth: 430,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: { borderRadius: 12 },
      default: {},
    }),
  },

  // Web action column — sits to the RIGHT of the video
  webActionsColumn: {
    width: 72,
    paddingLeft: 16,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
  },

  // ── Action button (icon + count) ───────────────────────────────────────────
  reelActionBtn: {
    alignItems: 'center',
    gap: 4,
  },

  // Circular icon button
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      },
      default: {},
    }),
  },
  actionIconCircleActive: {
    backgroundColor: 'rgba(249,115,22,0.2)',
  },
  actionIconCircleLiked: {
    backgroundColor: 'rgba(255,59,92,0.18)',
  },

  actionIconText: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 26,
    textAlign: 'center',
  },
  actionIconTextLiked: {
    color: '#ff3b5c',
  },
  actionIconTextSaved: {
    color: '#f97316',
  },

  actionCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    ...Platform.select({
      web: { textShadow: '0px 1px 3px rgba(0,0,0,0.8)' },
      default: {
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },

  actionLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
  },

  // ── Avatar in action column ────────────────────────────────────────────────
  reelAvatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'visible',
    position: 'relative',
    marginBottom: 2,
  },
  reelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  verifiedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },

  igIcon: {
    fontSize: 28,
    color: '#fff',
    ...Platform.select({
      web: {
        textShadow: '0px 1px 3px rgba(0,0,0,0.6)',
        lineHeight: '34px',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  igIconLiked: { color: '#ff3b5c' },
  igIconSaved: { color: '#f97316' },

  reelActionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Bottom info (inside video, bottom-left) ────────────────────────────────
  reelBottom: {
    position: 'absolute',
    left: 14,
    right: 80, // leave space for action icons on right
    zIndex: 5,
  },

  reelUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  reelUserAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  reelUserName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    ...Platform.select({
      web: { textShadow: '0px 1px 3px rgba(0,0,0,0.9)' },
      default: {
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  reelUserRole: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
  },

  reelLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  reelLocationIcon: { fontSize: 11 },
  reelLocationText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },

  reelHeadline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    marginBottom: 5,
    ...Platform.select({
      web: { textShadow: '0px 1px 4px rgba(0,0,0,0.95)' },
      default: {
        textShadowColor: 'rgba(0,0,0,0.95)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
    }),
  },
  reelCaption: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
  },
  reelCaptionMore: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  reelViewComments: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },

  // ── Modal Overlay ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  // ── Upload Sheet ───────────────────────────────────────────────────────────
  uploadSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: SCREEN_HEIGHT * 0.88,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // ── Comments Sheet ─────────────────────────────────────────────────────────
  commentsSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  // ── Upload Form ────────────────────────────────────────────────────────────
  mediaBox: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mediaBoxIcon: { fontSize: 30, marginBottom: 5 },
  mediaBoxText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
  mediaBoxSub: { fontSize: 11, color: '#475569', marginTop: 2 },

  captionInput: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 13,
    fontSize: 13,
    color: '#f1f5f9',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    marginBottom: 10,
  },

  tagLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 },
  tagRow: { marginBottom: 16 },
  tagChip: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagChipActive: {
    borderColor: '#f97316',
    backgroundColor: 'rgba(249,115,22,0.15)',
  },
  tagChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tagChipTextActive: { color: '#f97316', fontWeight: '800' },

  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  postBtn: {
    flex: 2,
    backgroundColor: '#f97316',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  postBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  // ── Comments List ──────────────────────────────────────────────────────────
  commentsList: {
    maxHeight: SCREEN_HEIGHT * 0.42,
    marginBottom: 10,
  },
  noComments: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 14,
    marginVertical: 28,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  commentBubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  commentUser: { fontSize: 12, fontWeight: '800', color: '#f1f5f9', marginBottom: 3 },
  commentText: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },

  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 13,
    color: '#f1f5f9',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { fontSize: 17, color: '#fff' },
  closeBtn: { alignItems: 'center', paddingVertical: 10 },
  closeBtnText: { fontSize: 14, color: '#475569', fontWeight: '600' },
});

export default styles;