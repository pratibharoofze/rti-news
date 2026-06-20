import { Platform, StatusBar, StyleSheet } from 'react-native';

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
    }),
  },

  // ── Custom Header ──
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 54,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4ef',
    elevation: 3,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fff0f5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  headerPlaceholder: {
    width: 40,
  },

  // ── Hero ──
  heroCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffe4ef',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#F97316',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Result Card ──
  resultCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe4ef',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginBottom: 16,
  },
  passBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  failBadge: {
    backgroundColor: '#fff0f5',
    borderWidth: 1,
    borderColor: '#ffe4ef',
  },
  resultText: {
    fontSize: 20,
    fontWeight: '800',
  },
  passText: {
    color: '#16a34a',
  },
  failText: {
    color: '#F97316',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fff0f5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  infoValuePass: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  infoValueFail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
  },

  // ── Certificate Section Label ──
  certSectionLabel: {
    width: '100%',
    maxWidth: 720,
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  // ── Certificate Outer wrapper ──
  certOuter: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    marginBottom: 16,
    padding: 4,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  // ── Gold border frame ──
  certFrame: {
    borderWidth: 3,
    borderColor: '#d97706',
    borderRadius: 18,
    padding: 20,
    backgroundColor: '#fffdf5',
    alignItems: 'center',
  },

  // ── Header band ──
  certHeaderBand: {
    backgroundColor: '#1e3a5f',
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  certHeaderText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 4,
  },
  certHeaderSub: {
    fontSize: 11,
    color: '#93c5fd',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  },

  // ── Seal ──
  certSealRow: {
    marginBottom: 12,
  },
  certSeal: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#d97706',
    backgroundColor: '#fef9c3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Title block ──
  certTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e3a5f',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  certPresented: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },

  // ── Recipient name ──
  certName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1e3a5f',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },

  certDivider: {
    width: '80%',
    height: 1.5,
    backgroundColor: '#d97706',
    marginVertical: 12,
    opacity: 0.5,
  },

  // ── Body ──
  certBody: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  certQuizTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a5f',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },

  // ── Score row ──
  certScoreRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  certScoreBox: {
    alignItems: 'center',
    backgroundColor: '#fff0f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#ffe4ef',
  },
  certScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  certScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a5f',
  },
  certScoreValuePass: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
  },

  // ── Footer ──
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  certSignatureBox: {
    alignItems: 'center',
    gap: 6,
  },
  certSignatureLine: {
    width: 100,
    height: 2,
    backgroundColor: '#1e3a5f',
    borderRadius: 1,
  },
  certSignatureLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  certStampBox: {
    alignItems: 'center',
    gap: 6,
  },
  certStamp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
  },
  certStampText: {
    fontSize: 20,
    color: '#16a34a',
    fontWeight: '900',
  },
  certFooterNote: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // ── Download / View buttons ──
  downloadBtn: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 10,
  },
  downloadBtnDisabled: {
    opacity: 0.7,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  savedNote: {
    width: '100%',
    maxWidth: 720,
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  // ── Fail / Lock message ──
  failMessageBox: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff0f5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe4ef',
  },
  failMessageText: {
    flex: 1,
    fontSize: 13,
    color: '#F97316',
    fontWeight: '600',
    lineHeight: 20,
  },
});