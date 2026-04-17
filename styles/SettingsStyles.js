import { StyleSheet } from 'react-native';

const SettingsStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 96,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 10px 18px rgba(15, 23, 42, 0.05)',
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 34,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  ownerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  ownerEmail: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
  },
});

export default SettingsStyles;



