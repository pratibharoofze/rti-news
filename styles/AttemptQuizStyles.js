import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({

  // ── Root ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // ── Top Bar ───────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 14,
    paddingBottom: 12,
    backgroundColor: '#F97316',
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
    flexGrow: 1,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',          // center horizontally
  },

  // ── Hero Card ─────────────────────────────────────────────────────────────
  heroCard: {
    width: '100%',
    maxWidth: 720,                 // center cap
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#F97316',
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
    width: '100%',
    maxWidth: 720,                 // center cap
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quizProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
  },

  // ── Progress Bar ──────────────────────────────────────────────────────────
  progressBarWrap: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 999,
  },

  // ── Question ──────────────────────────────────────────────────────────────
  questionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 26,
    marginBottom: 20,
  },

  // ── Options ───────────────────────────────────────────────────────────────
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
  },
  optionBtnSelected: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },
  optionLabel: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabelSelected: {
    backgroundColor: '#F97316',
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
    color: '#F97316',
    fontWeight: '700',
  },

  // ── Next / Submit Button ──────────────────────────────────────────────────
  nextBtn: {
    marginTop: 12,
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 15,
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
});