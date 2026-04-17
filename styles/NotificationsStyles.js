import { StyleSheet } from 'react-native';

const NotificationsStyles = StyleSheet.create({
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  metricPrimary: {
    backgroundColor: '#dbeafe',
  },
  metricSecondary: {
    backgroundColor: '#fef3c7',
  },
  metricAccent: {
    backgroundColor: '#dcfce7',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
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
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
  },
  fieldPillText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  unreadBadge: {
    backgroundColor: '#fef3c7',
  },
  readBadge: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
  },
  actionButtonText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '700',
  },
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

export default NotificationsStyles;



