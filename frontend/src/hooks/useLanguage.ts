import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

const STORAGE_KEY = 'yvi_language';
const AUTO_TRANSLATE_KEY = 'yvi_auto_translate';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [autoTranslate, setAutoTranslate] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const autoTranslateStored = localStorage.getItem(AUTO_TRANSLATE_KEY);
    
    if (stored) {
      i18n.changeLanguage(stored);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0];
      const supported = languages.find(l => l.code === browserLang);
      if (supported) {
        i18n.changeLanguage(browserLang);
        localStorage.setItem(STORAGE_KEY, browserLang);
      }
    }

    if (autoTranslateStored) {
      setAutoTranslate(autoTranslateStored === 'true');
    }
  }, [i18n]);

  const changeLanguage = useCallback(async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, [i18n]);

  const toggleAutoTranslate = useCallback(() => {
    const newValue = !autoTranslate;
    setAutoTranslate(newValue);
    localStorage.setItem(AUTO_TRANSLATE_KEY, newValue.toString());
  }, [autoTranslate]);

  const translateText = useCallback(async (text: string, targetLang: string, sourceLang?: string): Promise<string> => {
    if (!text || !targetLang) return text;
    
    // Skip if already in target language
    if (sourceLang === targetLang) return text;

    try {
      // Using LibreTranslate API (self-hosted or public instance)
      // You can use https://libretranslate.com or host your own instance
      const LIBRETRANSLATE_URL = import.meta.env.VITE_LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
      const LIBRETRANSLATE_API_KEY = import.meta.env.VITE_LIBRETRANSLATE_API_KEY;

      const body: any = {
        q: text,
        target: targetLang,
        format: 'text',
      };

      if (sourceLang) {
        body.source = sourceLang;
      } else {
        body.source = 'auto'; // Auto-detect source language
      }

      if (LIBRETRANSLATE_API_KEY) {
        body.api_key = LIBRETRANSLATE_API_KEY;
      }

      const response = await fetch(LIBRETRANSLATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error('Translation API error:', response.status);
        return text; // Return original text on error
      }

      const data = await response.json();
      return data.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }, []);

  return {
    currentLanguage: i18n.language,
    languages,
    changeLanguage,
    autoTranslate,
    toggleAutoTranslate,
    translateText,
  };
};
