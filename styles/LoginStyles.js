import { Platform, StyleSheet } from 'react-native';

const LoginStyles = StyleSheet.create({
  flex: { flex: 1 },

  root: {
    flex: 1,
    backgroundColor: '#F0F0F5',
  },

  scrollView: {
    flex: 1,
    width: '100%',
  },

  // KEY FIX: justifyContent centers card vertically, paddingTop for status bar
  formScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 40,
  },

  formContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    paddingTop: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    alignItems: 'stretch',
  },

  // Close button — top-left of card
  closeButton: {
    position: 'absolute',
    top: 14, left: 14, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },

  iconCircleWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#FFE8F0',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 16, marginTop: 8,
  },

  // Header
  pageTitle: {
    fontSize: 28, fontWeight: '800', color: '#111111',
    textAlign: 'center', marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13, color: '#999999',
    textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },

  // General error box
  generalErrorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,45,120,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,45,120,0.2)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 14,
  },
  generalErrorText: { flex: 1, fontSize: 13, color: '#e8732a', fontWeight: '600' },

  // Inputs
  inputGroup:  { marginBottom: 14 },
  inputLabel:  { fontSize: 13, color: '#555555', marginBottom: 6, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8F8F8', borderWidth: 1.5, borderColor: '#EEEEEE',
    borderRadius: 16, paddingHorizontal: 16, minHeight: 52,
  },
  inputWrapError: { borderColor: '#e8732a', backgroundColor: 'rgba(255,45,120,0.03)' },
  input: {
    flex: 1, fontSize: 14, color: '#111111', paddingVertical: 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },

  inlineErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5, paddingHorizontal: 4 },
  inlineErrorText: { fontSize: 12, color: '#e8732a', fontWeight: '600', flex: 1 },

  forgotBtn:  { alignSelf: 'flex-end', marginBottom: 20, marginTop: 2 },
  forgotText: { color: '#999999', fontSize: 13, fontWeight: '500' },

  // Submit button
  submitBtn: {
    backgroundColor: '#e8732a', borderRadius: 50,
    minHeight: 52, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginBottom: 18,
    shadowColor: '#e8732a', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 6,
  },
  btnDisabled:   { opacity: 0.6 },
  submitBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EEEEEE' },
  dividerText: { color: '#BBBBBB', fontSize: 13 },

  // Social buttons
  socialRow: { flexDirection: 'column', gap: 10 },
  socialBtn: {
    minHeight: 48, borderRadius: 50,
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#EEEEEE',
    justifyContent: 'center', alignItems: 'center',
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
  },
  socialText: { fontSize: 14, color: '#111111', fontWeight: '600' },

  // Switch to register
  switchBtn:  { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#999999', fontSize: 13, textAlign: 'center' },
  switchLink: { color: '#111111', fontWeight: '700' },

  // Unused stubs kept for compatibility
  glow:        { display: 'none', position: 'absolute' },
  glowTop:     {},
  glowBottom:  {},
  topAccent:   { display: 'none' },
});

export default LoginStyles;