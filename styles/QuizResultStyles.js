import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Custom Header ──
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerPlaceholder: {
    width: 40,
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
  },

  // ── Result Card ──
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
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
  passBadge: { backgroundColor: '#dcfce7' },
  failBadge: { backgroundColor: '#fee2e2' },
  resultText: { fontSize: 20, fontWeight: '800' },
  passText:   { color: '#16a34a' },
  failText:   { color: '#dc2626' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },

  // ── Certificate Section Label ──
  certSectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  // ── Certificate Outer wrapper (captured by ViewShot) ──
  certOuter: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    marginBottom: 16,
    padding: 4,
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
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 70,
  },
  certScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  certScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a5f',
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

  // ── Download button ──
  downloadBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    marginBottom: 10,
  },
  downloadBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },

  savedNote: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  // ── Fail message ──
  failMessageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  failMessageText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
    lineHeight: 20,
  },
});