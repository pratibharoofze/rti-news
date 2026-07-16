import { Platform } from 'react-native';

export const IS_WEB = Platform.OS === 'web';

export const EDITORIAL_FONT_FAMILY = Platform.select({
  web: 'Georgia, "Times New Roman", serif',
  ios: 'Georgia',
  android: 'serif',
  default: undefined,
});

export const SIDEBAR_MENU_ITEMS = [
  { key: 'latest', labelKey: 'latestNews', fallbackLabel: 'Latest News', icon: 'flame-outline', accentColor: '#fb923c', surfaceColor: '#fff7ed' },
  { key: 'states', labelKey: 'news', fallbackLabel: 'News', icon: 'newspaper-outline', accentColor: '#ec4899', surfaceColor: '#fdf2f8' },
  { key: 'politics', labelKey: 'politics', fallbackLabel: 'Politics', icon: 'library-outline', accentColor: '#0ea5e9', surfaceColor: '#eff6ff' },
  { key: 'elections', labelKey: 'elections', fallbackLabel: 'Elections', icon: 'checkbox-outline', accentColor: '#22c55e', surfaceColor: '#effcf3' },
  { key: 'viral', labelKey: 'viral', fallbackLabel: 'Viral', icon: 'megaphone-outline', accentColor: '#3b82f6', surfaceColor: '#eff6ff' },
  { key: 'astrology', labelKey: 'astrology', fallbackLabel: 'Astrology', icon: 'sparkles-outline', accentColor: '#8b5cf6', surfaceColor: '#f5f3ff' },
  { key: 'horoscope_hindi', labelKey: 'horoscopeHindi', fallbackLabel: 'Horoscope in Hindi', icon: 'moon-outline', accentColor: '#f43f5e', surfaceColor: '#fff1f2' },
  { key: 'horoscope_english', labelKey: 'horoscopeEnglish', fallbackLabel: 'Horoscope in English', icon: 'planet-outline', accentColor: '#4f46e5', surfaceColor: '#eef2ff' },
  { key: 'latest_political', labelKey: 'latestPoliticalNews', fallbackLabel: 'Latest Political News', icon: 'albums-outline', accentColor: '#10b981', surfaceColor: '#ecfdf5' },
];

export const STATE_LABELS = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra And Nagar Haveli And Daman And Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu And Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const STATE_CARD_COLORS = ['#fb923c', '#8b5cf6', '#f97316', '#ec4899', '#0ea5e9', '#f59e0b', '#3b82f6'];

export const CATEGORY_COLOR_MAP = {
  latest: '#f97316',
  politics: '#0ea5e9',
  elections: '#22c55e',
  viral: '#3b82f6',
  astrology: '#8b5cf6',
  horoscope_hindi: '#f43f5e',
  horoscope_english: '#4f46e5',
  latest_political: '#10b981',
};

export const FEATURED_STATE_OPTIONS = ['Maharashtra', 'Bihar', 'Uttar Pradesh', 'Delhi', 'Karnataka', 'West Bengal'];

export const FALLBACK_DISTRICT_MAP = {
  Bihar: ['Araria', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Buxar', 'Darbhanga', 'Gaya'],
  Delhi: ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'South Delhi', 'West Delhi'],
  Gujarat: ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Bhavnagar', 'Kutch'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Ballari'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Kolhapur', 'Aurangabad', 'Solapur'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota', 'Bikaner'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Vellore'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Meerut', 'Varanasi', 'Prayagraj', 'Agra', 'Noida', 'Gorakhpur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Darjeeling'],
};
