import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  // ── Top Bar ───────────────────────────────────────────────────────────────
  // SafeAreaView handles iOS notch automatically.
  // Android needs extra paddingTop via StatusBar.currentHeight.
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: 12,
    backgroundColor: '#e8732a',
    borderBottomWidth: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  topBarSpacer: {
    width: 38,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Hero Card ─────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#e8732a',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 4,
    lineHeight: 30,
  },

  // ── Question Card ─────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  quizProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999999',
    marginBottom: 8,
  },

  // ── Progress Bar ──────────────────────────────────────────────────────────
  progressBarWrap: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 999,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#e8732a',
    borderRadius: 999,
  },

  // ── Question ──────────────────────────────────────────────────────────────
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 24,
    marginBottom: 16,
  },

  // ── Options ───────────────────────────────────────────────────────────────
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    backgroundColor: '#F8F8F8',
    marginBottom: 10,
  },
  optionBtnSelected: {
    borderColor: '#e8732a',
    backgroundColor: '#FFE8F0',
  },
  optionLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: '#e8732a',
  },
  optionLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#555555',
  },
  optionLabelTextSelected: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#555555',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#e8732a',
    fontWeight: '700',
  },

  // ── Next / Submit Button ──────────────────────────────────────────────────
  nextBtn: {
    marginTop: 8,
    backgroundColor: '#e8732a',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#e8732a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnDisabled: {
    opacity: 0.6,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});