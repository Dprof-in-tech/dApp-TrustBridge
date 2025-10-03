"use client";

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Set HTML lang attribute based on current language
    const htmlElement = document.documentElement;
    
    const updateHtmlAttributes = () => {
      htmlElement.setAttribute('lang', i18n.language);
      // Set direction for RTL languages
      const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);
      htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    };

    // Update on initial load
    updateHtmlAttributes();

    // Update when language changes
    i18n.on('languageChanged', updateHtmlAttributes);

    return () => {
      i18n.off('languageChanged', updateHtmlAttributes);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

