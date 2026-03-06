import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './theme.css'; // Tasarımını yükle
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import HubPage from './HubPage';
import SelectionPage from './SelectionPage';
import ResultsPage from './ResultsPage';

function App() {
  const { i18n } = useTranslation();
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [view, setView] = useState('hub'); // 'hub', 'selection', 'results'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Wait for i18n to be ready
  useEffect(() => {
    // Check if i18n is already initialized
    if (i18n.isInitialized) {
      setIsI18nReady(true);
    } else {
      // Wait for initialization
      i18n.on('initialized', () => {
        setIsI18nReady(true);
      });
    }

    return () => {
      i18n.off('initialized');
    };
  }, [i18n]);

  // Hub sayfasından bir kategoriye tıklandığında çalışır
  const handleNavigate = (category) => {
    setSelectedCategory(category);
    setView('selection');
  };

  // Geri butonuna tıklandığında çalışır
  const handleBackToHub = () => {
    setView('hub');
    setSelectedCategory(null);
    setSelectedItems([]);
  };

  // Selection page'den results'a geçiş
  const handleAnalyze = (items) => {
    setSelectedItems(items);
    setView('results');
  };

  // Results'tan selection'a geri dön
  const handleBackToSelection = () => {
    setView('selection');
  };

  // Loading UI — ThemeProvider içinde olmalı ki dark mode flash olmasın
  const loadingScreen = (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(200, 76, 60, 0.2)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '14px', fontFamily: 'var(--font-body)' }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="App">
        {/* Right center controls - 1x2 grid */}
        <div style={{
          position: 'fixed',
          right: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gap: '12px',
        }}>
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* View Routing */}
        {!isI18nReady ? loadingScreen : view === 'hub' && (
          <HubPage onNavigate={handleNavigate} />
        )}

        {isI18nReady && view === 'selection' && (
          <SelectionPage 
            category={selectedCategory} 
            onBack={handleBackToHub}
            onAnalyze={handleAnalyze}
          />
        )}

        {isI18nReady && view === 'results' && (
          <ResultsPage 
            selectedItems={selectedItems}
            category={selectedCategory}
            onBack={handleBackToSelection}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
