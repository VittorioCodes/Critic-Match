import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files - English
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enSelection from './locales/en/selection.json';
import enResults from './locales/en/results.json';
import enErrors from './locales/en/errors.json';

// Import translation files - Turkish
import trCommon from './locales/tr/common.json';
import trHome from './locales/tr/home.json';
import trSelection from './locales/tr/selection.json';
import trResults from './locales/tr/results.json';
import trErrors from './locales/tr/errors.json';

// Import translation files - German
import deCommon from './locales/de/common.json';
import deHome from './locales/de/home.json';
import deSelection from './locales/de/selection.json';
import deResults from './locales/de/results.json';
import deErrors from './locales/de/errors.json';

// Import translation files - French
import frCommon from './locales/fr/common.json';
import frHome from './locales/fr/home.json';
import frSelection from './locales/fr/selection.json';
import frResults from './locales/fr/results.json';
import frErrors from './locales/fr/errors.json';

// Import translation files - Spanish
import esCommon from './locales/es/common.json';
import esHome from './locales/es/home.json';
import esSelection from './locales/es/selection.json';
import esResults from './locales/es/results.json';
import esErrors from './locales/es/errors.json';

// Import translation files - Japanese
import jaCommon from './locales/ja/common.json';
import jaHome from './locales/ja/home.json';
import jaSelection from './locales/ja/selection.json';
import jaResults from './locales/ja/results.json';
import jaErrors from './locales/ja/errors.json';

// Import translation files - Portuguese
import ptCommon from './locales/pt/common.json';
import ptHome from './locales/pt/home.json';
import ptSelection from './locales/pt/selection.json';
import ptResults from './locales/pt/results.json';
import ptErrors from './locales/pt/errors.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        selection: enSelection,
        results: enResults,
        errors: enErrors,
      },
      tr: {
        common: trCommon,
        home: trHome,
        selection: trSelection,
        results: trResults,
        errors: trErrors,
      },
      de: {
        common: deCommon,
        home: deHome,
        selection: deSelection,
        results: deResults,
        errors: deErrors,
      },
      fr: {
        common: frCommon,
        home: frHome,
        selection: frSelection,
        results: frResults,
        errors: frErrors,
      },
      es: {
        common: esCommon,
        home: esHome,
        selection: esSelection,
        results: esResults,
        errors: esErrors,
      },
      ja: {
        common: jaCommon,
        home: jaHome,
        selection: jaSelection,
        results: jaResults,
        errors: jaErrors,
      },
      pt: {
        common: ptCommon,
        home: ptHome,
        selection: ptSelection,
        results: ptResults,
        errors: ptErrors,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home', 'selection', 'results', 'errors'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
