import { StyleSheet } from 'react-native';

const SidebarStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 999,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.18)',
  },

  drawer: {
    width: 280,
    backgroundColor: '#ffffff',
    paddingTop: 24,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 16,
  },

  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  drawerLogo: { fontSize: 24 },

  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },

  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  menuScroll: {
    flex: 1,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
    gap: 14,
  },

  menuItemActive: {
    backgroundColor: '#eff6ff',
  },

  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIconActive: {
    backgroundColor: '#1d4ed8',
  },

  menuText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },

  menuTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },

  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38bdf8',
  },

  /* 🔥 NEW FOOTER STYLE */
  drawerFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },

  drawerFooterText: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '700',
  },

  drawerFooterSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
});

export default SidebarStyles;