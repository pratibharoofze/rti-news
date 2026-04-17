import { StyleSheet } from 'react-native';

const EPaperStyles = StyleSheet.create({
  // ── Root ──
  root:          { flex: 1, backgroundColor: '#f8fafc' },
  scrollView:    { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 110 },

  // ── Success Overlay ──
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 8,
    maxWidth: '82%',
  },
  successBoxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    flexShrink: 1,
  },

  // ── Hero ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle:    { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  heroSubtitle: { fontSize: 12, color: '#64748b' },

  // ── Metrics ──
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metricCard:  { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center' },
  metricPrimary:   { backgroundColor: '#dbeafe' },
  metricSecondary: { backgroundColor: '#ede9fe' },
  metricAccent:    { backgroundColor: '#fef9c3' },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  metricLabel: { fontSize: 11, fontWeight: '700', color: '#475569' },

  // ── Add Button ──
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 14,
    elevation: 3,
  },
  addBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },

  // ── Card ──
  card:         { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 14 },

  // ── Paper Card ──
  paperCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  paperTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  publishDate:  { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  paperTitle:   { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 5, lineHeight: 21 },
  paperDesc:    { fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 18 },

  // ── Media Badge ──
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  mediaBadgeText: { fontSize: 11, fontWeight: '700', color: '#2563eb' },

  // ── Stats ──
  statsRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  statItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText:  { fontSize: 12, fontWeight: '700', color: '#475569' },

  // ── Action Buttons ──
  actionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn: {
    flex: 1,
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
  },
  actionBtnText:       { fontSize: 11, fontWeight: '700', color: '#2563eb' },
  actionBtnTextPurple: { color: '#7c3aed' },
  actionBtnTextCyan:   { color: '#0891b2' },

  // ── States ──
  loadingText: { fontSize: 13, color: '#64748b' },
  emptyText:   { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 10 },

  // ── Modal Header ──
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
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
  modalHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', flex: 1, textAlign: 'center' },
  modalSaveBtn:     { backgroundColor: '#7c3aed', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, marginTop: 14, elevation: 4, shadowColor: '#7c3aed', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  modalSaveBtnText: { fontSize: 13, fontWeight: '800', color: '#ffffff' },

  // ── Form Modal Content ──
  modalContent: { padding: 16, paddingBottom: 60 },
  fieldLabel:   { fontSize: 13, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  fieldHint:    { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  stateSelector: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
  },
  stateSelectorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  stateChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338ca',
  },

  // ── RichEditor ──
  richToolbar: {
    backgroundColor: '#f1f5f9',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomWidth: 0,
    height: 44,
  },
  richEditorTitle: {
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 4,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  richEditorDesc: {
    minHeight: 160,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 4,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  // passed as editorStyle prop (plain object, not StyleSheet)
  richEditorInner: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 14,
    placeholderColor: '#94a3b8',
    contentCSSText: 'font-family: sans-serif; padding: 8px; line-height: 1.6;',
  },

  // ── Media Type Toggle ──
  mediaToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14, marginTop: 6 },
  mediaToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mediaToggleBtnActive:     { borderColor: '#7c3aed', backgroundColor: '#ede9fe' },
  mediaToggleBtnText:       { fontSize: 12, fontWeight: '700', color: '#64748b' },
  mediaToggleBtnTextActive: { color: '#7c3aed' },

  mediaShowcaseCard: {
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    elevation: 4,
  },
  mediaShowcaseEyebrow: {
    fontSize: 11,
    color: '#ea580c',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mediaShowcaseTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#7c2d12',
    marginBottom: 6,
  },
  mediaShowcaseSubtitle: {
    fontSize: 12,
    color: '#9a3412',
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
    backgroundColor: '#ffedd5',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  mediaInfoPillAlt: {
    backgroundColor: '#f5f3ff',
    borderColor: '#d8b4fe',
  },
  mediaInfoPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c2410c',
  },
  mediaInfoPillAltText: {
    color: '#6d28d9',
  },
  // Media Section
  mediaSection: {
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  mediaSectionCaption: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 8,
  },
  mediaSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  mediaPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
  },
  mediaPickBtnText: { fontSize: 13, fontWeight: '800', color: '#2563eb' },
  videoPickBtn: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  videoPickBtnText: {
    color: '#7c3aed',
  },
  videoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  videoStatusText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '700',
  },

  // State Modal
  stateModalOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    padding: 18,
    zIndex: 1000,
  },
  stateModalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  stateModalBox: {
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stateModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  stateSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  stateSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    padding: 0,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f8fafc',
  },
  stateItemActive: {
    backgroundColor: '#ede9fe',
  },
  stateItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  stateItemTextActive: {
    color: '#6d28d9',
  },
  // ── Image Thumbs ──
  imageThumbContainer: { position: 'relative', marginRight: 8, borderRadius: 10, overflow: 'hidden' },
  imageThumb:          { width: 96, height: 96, borderRadius: 14, borderWidth: 2, borderColor: '#ffffff' },
  imageRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 999,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Admin Note ──
  adminNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  adminNoteText: { flex: 1, fontSize: 12, color: '#92400e', fontWeight: '600', lineHeight: 18 },

  // ── View Modal ──
  viewModalContent: { padding: 16, paddingBottom: 60 },
  viewTextCard: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
  },
  viewTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 12,
  },
  viewDescriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  viewImage: { width: 200, height: 140, borderRadius: 12, marginRight: 10 },
});

export default EPaperStyles;



