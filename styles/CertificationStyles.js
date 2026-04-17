import { StyleSheet } from 'react-native';

const CertificationStyles = StyleSheet.create({
  // ── Root ──
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    elevation: 3,
    boxShadow: '0px 8px 18px rgba(15, 23, 42, 0.06)',
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#2563eb',
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
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
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
  metricPrimary:   { backgroundColor: '#dbeafe' },
  metricSecondary: { backgroundColor: '#dcfce7' },
  metricAccent:    { backgroundColor: '#ede9fe' },
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
    textAlign: 'center',
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

  // ── Cert Card ──
  certCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  certTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  certTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Result Badge ──
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  passBadge:  { backgroundColor: '#dcfce7' },
  retryBadge: { backgroundColor: '#fee2e2' },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  passText: { color: '#16a34a' },
  failText: { color: '#dc2626' },

  pendingBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },

  // ── Score Row ──
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 13,
    color: '#475569',
  },
  scoreBold: {
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Cert File Row ──
  certFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  certFileText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#eff6ff',
  },
  actionBtnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  actionBtnTextPurple: {
    color: '#7c3aed',
  },
  actionBtnTextGreen: {
    color: '#16a34a',
  },
  actionBtnTextDisabled: {
    color: '#94a3b8',
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    color: '#0f172a',
  },

  // ── Quiz Modal ──
  quizProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  progressBarWrap: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 999,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  optionBtnSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: '#2563eb',
  },
  optionLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  optionLabelTextSelected: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  nextBtn: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.6,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  // ── Result Modal ──
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
    borderRadius: 20,
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
    borderBottomColor: '#f1f5f9',
  },
  resultInfoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  resultInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '60%',
    textAlign: 'right',
  },
  downloadBtn: {
    marginTop: 20,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: {
    fontSize: 15,
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
});

export default CertificationStyles;