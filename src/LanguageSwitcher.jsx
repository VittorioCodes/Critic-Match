import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  // i18n.language bazen 'en-US' gibi uzun format dönebilir — kısalt
  const langCode = i18n.language?.split('-')[0] || 'en';
  const currentLang = languages.find(l => l.code === langCode) || languages[0];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.iconButton}
        aria-label="Change language"
      >
        🌐
      </button>
      
      {isOpen && (
        <>
          <div style={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div style={styles.dropdown}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                style={{
                  ...styles.option,
                  background: currentLang.code === lang.code ? 'var(--bg-secondary)' : 'transparent',
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLang.code === lang.code && <span style={styles.check}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
  },

  iconButton: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    background: 'var(--bg-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },

  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  dropdown: {
    position: 'absolute',
    right: '0',
    bottom: 'calc(100% + 8px)',
    minWidth: '160px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'slideDown 0.2s ease-out',
  },

  option: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-ui)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    textAlign: 'left',
  },

  check: {
    marginLeft: 'auto',
    color: 'var(--accent-primary)',
    fontWeight: 700,
  },
};
