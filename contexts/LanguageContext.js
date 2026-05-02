import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app_language');
        if (savedLang && translations[savedLang]) {
          setLanguage(savedLang);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const changeLanguage = async (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode);
      try {
        await AsyncStorage.setItem('app_language', langCode);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language] || translations.en;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
