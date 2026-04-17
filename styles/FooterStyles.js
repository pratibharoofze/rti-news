import { StyleSheet, Platform } from 'react-native';

const FooterStyles = StyleSheet.create({
  footerRow: {
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === 'android' ? 8 : 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 0,
  },

  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
});

export default FooterStyles;