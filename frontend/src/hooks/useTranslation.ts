import { useTranslation as useI18nTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/@types/i18n.types';

/**
 * Custom hook wrapper for react-i18next's useTranslation
 * Provides additional utilities for translation and formatting
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  /**
   * Change the current language
   */
  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  /**
   * Get the current language
   */
  const currentLanguage = i18n.language;

  /**
   * Get the current language info
   */
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  ) || SUPPORTED_LANGUAGES[0];

  /**
   * Format a number according to the current locale
   */
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(currentLanguage, options).format(value);
  };

  /**
   * Format a currency amount according to the current locale
   */
  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency,
    }).format(value);
  };

  /**
   * Format a percentage according to the current locale
   */
  const formatPercentage = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  };

  /**
   * Format a date according to the current locale
   */
  const formatDate = (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
  };

  /**
   * Format a relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 604800) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  };

  /**
   * Check if the current language is RTL
   */
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage);

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    currentLanguageInfo,
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatDate,
    formatRelativeTime,
    isRTL,
  };
}

