import { Platform, StyleSheet } from 'react-native';

const RegisterStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0a1e',
  },

  scrollView: {
    flex: 1,
  },

  glow: {
    position: 'absolute',
    borderRadius: 999,
    pointerEvents: 'none',
  },
  glowTop: {
    width: 220,
    height: 220,
    top: -70,
    left: -40,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  glowBottom: {
    width: 180,
    height: 180,
    bottom: 50,
    right: -40,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },

  // ✅ FIX: justifyContent:'center' HATAYA
  // Yahi white space ka cause tha — center karne ke liye
  // ScrollView apni height double kar leta tha mobile browser mein
  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 32,
  },

  formContainer: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#1a1329',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.16)',
    elevation: 10,
    overflow: 'hidden',
    position: 'relative', // Added for absolute positioning of close button
  },

  // Close button styling
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: '#8b5cf6',
  },
  brandLogoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: '#120d1d',
  },
  brandLogo: {
    width: 120,
    height: 120,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  formIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  welcomeBack: {
    fontSize: 13,
    color: '#c4b5fd',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  formTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#faf5ff',
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#a78bfa',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Back Button ──
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  backButtonText: {
    fontSize: 14,
    color: '#c4b5fd',
    fontWeight: '600',
    marginLeft: 8,
  },

  // ── Input ──
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    color: '#ddd6fe',
    marginBottom: 6,
    fontWeight: '600',
  },
  required: {
    color: '#f87171',
    fontWeight: '800',
  },
  optional: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 11,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#120d1d',
    borderWidth: 1,
    borderColor: '#302246',
    borderRadius: 16,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#f5f3ff',
    paddingVertical: 0,
    // ✅ FIX: browser default focus outline hatao
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },

  // ── Subscription Cards ──
  inputWrapError: {
    borderColor: 'rgba(248,113,113,0.75)',
  },
  errorText: {
    marginTop: 6,
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  passwordHintsBox: {
    marginTop: 8,
    backgroundColor: 'rgba(2,6,23,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.12)',
    borderRadius: 14,
    padding: 12,
  },
  helperTitle: {
    color: '#ddd6fe',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  helperText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  helperTextOk: {
    color: '#22c55e',
  },

  subRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 6,
    backgroundColor: '#120d1d',
    borderWidth: 1.5,
    borderColor: '#302246',
    borderRadius: 16,
    position: 'relative',
  },
  subCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  subDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Submit ──
  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  switchBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  switchText: {
    color: '#a78bfa',
    fontSize: 13,
    textAlign: 'center',
  },
  switchLink: {
    color: '#ddd6fe',
    fontWeight: '700',
  },
});

export default RegisterStyles;
