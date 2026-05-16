import { StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
//  COLOUR TOKENS  — Orange · White · Green
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
  redMid:      '#FCA5A5',
};

const CertificationStyles = StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: C.pageBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
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
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  ownerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: { flex: 1 },
  ownerName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
  },
  ownerEmail: {
    marginTop: 2,
    fontSize: 12,
    color: '#FFE4CC',
  },

  // ── Metrics ───────────────────────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
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

  // ── Cert Card ─────────────────────────────────────────────────────────────
  certCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    backgroundColor: C.white,
    elevation: 0,
  },
  certTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  certTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: C.textDark,
    lineHeight: 22,
  },

  // ── Result Badge ──────────────────────────────────────────────────────────
  resultBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  passBadge:  { backgroundColor: C.greenLight, borderWidth: 1, borderColor: C.greenMid },
  retryBadge: { backgroundColor: C.redLight,   borderWidth: 1, borderColor: C.redMid   },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  passText: { color: '#16A34A' },
  failText: { color: '#DC2626' },

  pendingBadge: {
    backgroundColor: C.orangeLight,
    borderWidth: 1,
    borderColor: C.orangeMid,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },

  // ── Score Row ─────────────────────────────────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 13,
    color: C.textMid,
  },
  scoreBold: {
    fontWeight: '800',
    color: C.textDark,
  },

  // ── Cert File Row ─────────────────────────────────────────────────────────
  certFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    backgroundColor: C.greenLight,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.greenMid,
  },
  certFileText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },

  // ── Action Buttons ────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.orangeLight,
    borderWidth: 1,
    borderColor: '#FDDCB5',
  },
  actionBtnDisabled: {
    backgroundColor: C.surface,
    borderColor: C.border,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  actionBtnTextPurple: {
    color: '#C2410C',
  },
  actionBtnTextGreen: {
    color: '#16A34A',
  },
  actionBtnTextDisabled: {
    color: C.textMuted,
  },

  // ── Modal Overlay ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textDark,
  },

  // ── Quiz Modal ────────────────────────────────────────────────────────────
  quizProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    marginBottom: 8,
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 999,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.orange,
    borderRadius: 999,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    marginBottom: 10,
  },
  optionBtnSelected: {
    borderColor: C.orange,
    backgroundColor: C.orangeLight,
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: C.orange,
  },
  optionLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: C.textMid,
  },
  optionLabelTextSelected: {
    color: C.white,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: C.textMid,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#C2410C',
    fontWeight: '700',
  },
  nextBtn: {
    marginTop: 8,
    backgroundColor: C.orange,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 0,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
  },

  // ── Result Modal ──────────────────────────────────────────────────────────
  resultCenterWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultBigBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 22,
  },
  resultBigText: {
    fontSize: 22,
    fontWeight: '800',
  },
  resultInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  resultInfoLabel: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '600',
  },
  resultInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    maxWidth: '60%',
    textAlign: 'right',
  },
  downloadBtn: {
    marginTop: 20,
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 0,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: C.white,
  },

  // ── States ────────────────────────────────────────────────────────────────
  loadingText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default CertificationStyles;