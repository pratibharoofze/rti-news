import { Platform, StyleSheet } from 'react-native';

const LoginStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollView: {
    flex: 1,
    width: '100%',
  },

  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },

  formContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'stretch',
  },

  // Close / back button (top-left like reference image)
  closeButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pink icon circle at top
  iconCircleWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fde8ec',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 8,
  },

  // Page title
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },

  // Error box
  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },

  // Input
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 6,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f7f7f7',
    borderWidth: 1.5,
    borderColor: '#eeeeee',
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  inputWrapError: {
    borderColor: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.03)',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    paddingVertical: 0,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
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
    color: '#dc2626',
    fontWeight: '600',
    flex: 1,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 2,
  },
  forgotText: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '500',
  },

  // Main CTA button — red/orange pill
  submitBtn: {
    backgroundColor: '#e8284a',
    borderRadius: 50,
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#e8284a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 18,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eeeeee',
  },
  dividerText: {
    color: '#bbbbbb',
    fontSize: 13,
  },

  // Social buttons — stacked full-width like reference
  socialRow: {
    flexDirection: 'column',
    gap: 10,
  },
  socialBtn: {
    minHeight: 50,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  socialText: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },

  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#999999',
    fontSize: 13,
    textAlign: 'center',
  },
  switchLink: {
    color: '#111111',
    fontWeight: '700',
  },
});

export default LoginStyles;