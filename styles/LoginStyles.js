import { Platform, StyleSheet, Dimensions } from 'react-native';

const LoginStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#0a1628',
  },

  scrollView: {
    flex: 1,
    width: '100%',
  },

  // ── Glow blobs ──
  glow: {
    position: 'absolute',
    borderRadius: 999,
    pointerEvents: 'none',
  },
  glowTop: {
    width: 220,
    height: 220,
    top: -70,
    right: -50,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  glowBottom: {
    width: 180,
    height: 180,
    bottom: 40,
    left: -40,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },

  // ✅ FIX: flexGrow:1 rakho but justifyContent HATAO
  // paddingVertical se top/bottom spacing aayegi bina extra height ke
  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },

  formContainer: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#111c2e',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.14)',
    elevation: 10,
    overflow: 'hidden',
  },

  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#38bdf8',
  },

  brandLogoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: '#0f172a',
  },
  brandLogo: {
    width: 120,
    height: 120,
  },

  headerBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeBack: {
    fontSize: 11,
    color: '#7dd3fc',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
  },

  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#fca5a5',
    fontWeight: '600',
  },

  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0b1423',
    borderWidth: 1,
    borderColor: '#22324a',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputWrapError: {
    borderColor: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    paddingVertical: 0,
    // ✅ FIX: browser default focus outline hatao
    ...(Platform.OS === 'web' && {
      outline: 'none',
    }),
  },

  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 4,
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#f87171',
    fontWeight: '600',
    flex: 1,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  forgotText: {
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: '600',
  },

  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#26364f',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 12,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#0b1423',
    borderWidth: 1,
    borderColor: '#22324a',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  socialText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600',
  },

  switchBtn: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  switchLink: {
    color: '#7dd3fc',
    fontWeight: '700',
  },
});

export default LoginStyles;