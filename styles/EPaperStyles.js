import { StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
//  COLOUR TOKENS  (inspired by the task-manager UI in the reference image)
//  Primary Orange : #F97316
//  Green Accent   : #22C55E
//  Warm White     : #FFFBF5  (page bg)
//  Surface White  : #FFFFFF  (cards)
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  orange:      '#F97316',
  orangeLight: '#FEF0E6',
  orangeMid:   '#FDBA74',
  green:       '#22C55E',
  greenLight:  '#DCFCE7',
  greenMid:    '#86EFAC',
  white:       '#FFFFFF',
  pageBg:      '#FFFBF5',
  surface:     '#F9F5F0',
  textDark:    '#1A1A1A',
  textMid:     '#555555',
  textMuted:   '#9CA3AF',
  border:      '#EDE9E1',
  red:         '#EF4444',
  redLight:    '#FEE2E2',
};

const EPaperStyles = StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root:          { flex: 1, backgroundColor: C.pageBg },
  scrollView:    { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 110 },

  // ── Success Toast ─────────────────────────────────────────────────────────
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 999,
    pointerEvents: 'none',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.greenLight,
    borderWidth: 1,
    borderColor: C.greenMid,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    elevation: 6,
    maxWidth: '85%',
  },
  successBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    flexShrink: 1,
  },

  // ── Hero Card ─────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: C.orange,
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 22,
    marginBottom: 16,
    marginTop: 4,
    elevation: 0,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#FFD7B5',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: C.white,
    marginBottom: 6,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#FFE4CC',
    fontWeight: '500',
    lineHeight: 19,
  },

  // ── Metrics Row ───────────────────────────────────────────────────────────
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 0,
  },
  metricPrimary:   { borderTopWidth: 3, borderTopColor: C.orange },
  metricSecondary: { borderTopWidth: 3, borderTopColor: C.green },
  metricAccent:    { borderTopWidth: 3, borderTopColor: C.orangeMid },
  metricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: C.textDark,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // ── Add Button ────────────────────────────────────────────────────────────
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 16,
    elevation: 0,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.2,
  },

  // ── Section Card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 14,
  },

  // ── Paper Card ────────────────────────────────────────────────────────────
  paperCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 0,
  },
  paperTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  publishDate: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '600',
  },
  paperTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 6,
    lineHeight: 22,
  },
  paperDesc: {
    fontSize: 12,
    color: C.textMid,
    marginBottom: 10,
    lineHeight: 19,
  },

  // ── Media Badge ───────────────────────────────────────────────────────────
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.orangeLight,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.orangeMid,
  },
  mediaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  statItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText:  { fontSize: 12, fontWeight: '600', color: C.textMid },

  // ── Action Buttons ────────────────────────────────────────────────────────
  actionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn: {
    flex: 1,
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.orangeLight,
    borderWidth: 1,
    borderColor: '#FDDCB5',
  },
  actionBtnText:       { fontSize: 11, fontWeight: '700', color: '#C2410C' },
  actionBtnTextPurple: { color: '#16A34A' },
  actionBtnTextCyan:   { color: '#EA580C' },

  // ── States ────────────────────────────────────────────────────────────────
  loadingText: { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingVertical: 12 },
  emptyText:   { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingVertical: 16 },

  // ── Modal Header ──────────────────────────────────────────────────────────
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    elevation: 0,
  },
  modalHeaderSide: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  modalHeaderSideRight: {
    alignItems: 'flex-end',
    paddingTop: 12,
  },
  modalCloseBtn:    { padding: 6 },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
    flex: 1,
    textAlign: 'center',
  },
  modalSaveBtn: {
    backgroundColor: C.orange,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 14,
    elevation: 0,
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.white,
  },

  // ── Form Modal Content ────────────────────────────────────────────────────
  modalContent: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: C.pageBg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 2,
  },
  fieldHint: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 8,
  },

  // ── State Selector ────────────────────────────────────────────────────────
  stateSelector: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: C.white,
  },
  stateSelectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.textDark,
  },
  stateChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.greenLight,
    borderWidth: 1,
    borderColor: C.greenMid,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  // ── Rich Editor ───────────────────────────────────────────────────────────
  richToolbar: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderBottomWidth: 0,
    height: 44,
  },
  richEditorTitle: {
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: C.border,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 4,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  richEditorDesc: {
    minHeight: 160,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: C.border,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 4,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  richEditorInner: {
    backgroundColor: C.white,
    color: C.textDark,
    fontSize: 14,
    placeholderColor: C.textMuted,
    contentCSSText: 'font-family: sans-serif; padding: 10px; line-height: 1.6;',
  },

  // ── Media Toggle ──────────────────────────────────────────────────────────
  mediaToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14, marginTop: 6 },
  mediaToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  mediaToggleBtnActive:     { borderColor: C.orange, backgroundColor: C.orangeLight },
  mediaToggleBtnText:       { fontSize: 12, fontWeight: '700', color: C.textMuted },
  mediaToggleBtnTextActive: { color: '#C2410C' },

  // ── Media Showcase Card ───────────────────────────────────────────────────
  mediaShowcaseCard: {
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 24,
    padding: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 0,
  },
  mediaShowcaseEyebrow: {
    fontSize: 11,
    color: C.orange,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mediaShowcaseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 6,
  },
  mediaShowcaseSubtitle: {
    fontSize: 12,
    color: C.textMid,
    lineHeight: 18,
    marginBottom: 14,
  },
  mediaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  mediaInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.orangeLight,
    borderWidth: 1,
    borderColor: C.orangeMid,
  },
  mediaInfoPillAlt: {
    backgroundColor: C.greenLight,
    borderColor: C.greenMid,
  },
  mediaInfoPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
  },
  mediaInfoPillAltText: {
    color: '#16A34A',
  },

  // ── Media Section ─────────────────────────────────────────────────────────
  mediaSection: {
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  mediaSectionCaption: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  mediaSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 10,
  },
  mediaPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.orange,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: C.orangeLight,
  },
  mediaPickBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2410C',
  },
  videoPickBtn: {
    borderColor: C.green,
    backgroundColor: C.greenLight,
  },
  videoPickBtnText: {
    color: '#16A34A',
  },
  videoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  videoStatusText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },

  // ── State Picker Modal ────────────────────────────────────────────────────
  stateModalOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    justifyContent: 'center',
    padding: 18,
    zIndex: 1000,
  },
  stateModalBackdrop: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.35)',
  },
  stateModalBox: {
    maxHeight: '80%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 18,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stateModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
  },
  stateSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: C.surface,
  },
  stateSearchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textDark,
    padding: 0,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: C.surface,
  },
  stateItemActive: {
    backgroundColor: C.greenLight,
  },
  stateItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMid,
  },
  stateItemTextActive: {
    color: '#16A34A',
  },

  // ── Image Thumbs ──────────────────────────────────────────────────────────
  imageThumbContainer: {
    position: 'relative',
    marginRight: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imageThumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.orangeMid,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: C.red,
    borderRadius: 999,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Admin Note ────────────────────────────────────────────────────────────
  adminNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.greenLight,
    borderWidth: 1,
    borderColor: C.greenMid,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  adminNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
    lineHeight: 18,
  },

  // ── View Modal ────────────────────────────────────────────────────────────
  viewModalContent: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: C.pageBg,
  },
  viewTextCard: {
    marginTop: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 18,
  },
  viewTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
    lineHeight: 28,
    marginBottom: 12,
  },
  viewDescriptionText: {
    fontSize: 14,
    color: C.textMid,
    lineHeight: 22,
  },
  viewImage: {
    width: 200,
    height: 140,
    borderRadius: 14,
    marginRight: 10,
  },
});

export default EPaperStyles;