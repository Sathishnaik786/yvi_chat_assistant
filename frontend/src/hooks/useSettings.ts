import { useState, useEffect } from 'react';

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

const SETTINGS_KEY = 'yvi_ai_settings';

const DEFAULT_SETTINGS: AISettings = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2048,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
