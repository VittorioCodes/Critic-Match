import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { APIService } from './APIService';

// ============================================
// SELECTION PAGE - Content Selection
// ============================================

export default function SelectionPage({ category, onBack, onAnalyze }) {
  const { t } = useTranslation(['selection', 'common']);
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [allContent, setAllContent] = useState([]); // Tüm yüklenen içerik (filtreler için kaynak)
  const [content, setContent] = useState([]);        // Görüntülenen içerik (filtre uygulanmış)
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    genre: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Load initial content
  useEffect(() => {
    loadContent();
    // Filtre ve arama sıfırla
    setFilters({ yearFrom: '', yearTo: '', genre: '' });
    setSearchQuery('');
  }, [category]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data = await APIService.getPopularContent(category);
      setAllContent(data);
      setContent(data);
    } catch (error) {
      console.log('API unavailable, using mock data');
      const mockData = generateMockContent(category);
      setAllContent(mockData);
      setContent(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------
  // Genre listesi: allContent'ten dinamik olarak üret
  // -----------------------------------------------
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    allContent.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          if (typeof g === 'string' && g.trim()) {
            genreSet.add(g.trim());
          } else if (typeof g === 'object' && g?.name) {
            genreSet.add(g.name.trim());
          }
        });
      }
    });
    return Array.from(genreSet).sort();
  }, [allContent]);

  // -----------------------------------------------
  // Filtre uygulama (client-side, hem API hem mock için)
  // -----------------------------------------------
  const applyFiltersToData = useCallback((data, activeFilters) => {
    let results = [...data];

    if (activeFilters.yearFrom) {
      results = results.filter(item => {
        const year = parseInt(item.year);
        return !isNaN(year) && year >= parseInt(activeFilters.yearFrom);
      });
    }

    if (activeFilters.yearTo) {
      results = results.filter(item => {
        const year = parseInt(item.year);
        return !isNaN(year) && year <= parseInt(activeFilters.yearTo);
      });
    }

    if (activeFilters.genre) {
      results = results.filter(item => {
        if (!item.genres || item.genres.length === 0) return false;
        return item.genres.some(g => {
          const name = typeof g === 'string' ? g : g?.name || '';
          return name.toLowerCase() === activeFilters.genre.toLowerCase();
        });
      });
    }

    return results;
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = applyFiltersToData(allContent, filters);
    setContent(filtered);
  }, [allContent, filters, applyFiltersToData]);

  const resetFilters = useCallback(() => {
    setFilters({ yearFrom: '', yearTo: '', genre: '' });
    setContent(allContent);
  }, [allContent]);

  // -----------------------------------------------
  // Arama (debounced)
  // -----------------------------------------------
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      // Filtreler hala aktifse onları uygula
      const filtered = applyFiltersToData(allContent, filters);
      setContent(filtered);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Önce API'yı dene
        const results = await APIService.searchContent(category, query, {});
        // API sonuçlarına da filtreleri uygula
        const filtered = applyFiltersToData(results, filters);
        setContent(filtered);
      } catch (error) {
        // API yoksa allContent üzerinde ara
        const mockResults = allContent.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        const filtered = applyFiltersToData(mockResults, filters);
        setContent(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [category, allContent, filters, applyFiltersToData]);

  const MAX_GAMES = 5;

  // Toggle selection — oyunlarda max 5 limiti
  const toggleSelection = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      // Oyun ekliyorsa ve limit doluysa ekleme
      if (item.type === 'game') {
        const gameCount = prev.filter(i => i.type === 'game').length;
        if (gameCount >= MAX_GAMES) return prev;
      }
      return [...prev, item];
    });
  };

  const gameCount = selectedItems.filter(i => i.type === 'game').length;
  const gameAtLimit = gameCount >= MAX_GAMES;

  const isSelected = (itemId) => selectedItems.some(item => item.id === itemId);

  // Category colors & icons
  const CATEGORY_INFO = {
    games:  { icon: '🎮', color: '#D4826C' },
    movies: { icon: '🎬', color: '#5B7A94' },
    series: { icon: '📺', color: '#8B7355' },
  };
  const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.games;
  const categoryLabel = t(`common:nav.${category}`);

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.grainOverlay} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <button onClick={onBack} style={styles.backButton}>
            ← {t('common:actions.back')}
          </button>
          <div style={styles.headerTitle}>
            <span style={{ ...styles.categoryIcon, color: categoryInfo.color }}>
              {categoryInfo.icon}
            </span>
            <h1 style={styles.title}>{categoryLabel}</h1>
          </div>
          <span style={styles.selectionCount}>
            {selectedItems.length} {t('common:labels.selected')}
          </span>
        </div>
      </header>

      {/* Search & Filters */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={t(`selection:search.placeholder.${category}`)}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={styles.searchInput}
            />
            {isSearching && <span style={styles.searchSpinner} />}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.filterButton,
              background: showFilters ? categoryInfo.color : 'transparent',
              color: showFilters ? 'white' : 'var(--text-primary)',
              borderColor: categoryInfo.color,
            }}
          >
            ⚙️ {t('selection:filters.title')}
            {(filters.yearFrom || filters.yearTo || filters.genre) && (
              <span style={styles.filterActiveDot} />
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filterGrid}>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>{t('selection:filters.yearFrom')}</label>
                <input
                  type="number"
                  placeholder="1990"
                  value={filters.yearFrom}
                  onChange={(e) => setFilters(f => ({ ...f, yearFrom: e.target.value }))}
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>{t('selection:filters.yearTo')}</label>
                <input
                  type="number"
                  placeholder="2024"
                  value={filters.yearTo}
                  onChange={(e) => setFilters(f => ({ ...f, yearTo: e.target.value }))}
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>{t('selection:filters.genre')}</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters(f => ({ ...f, genre: e.target.value }))}
                  style={styles.filterInput}
                >
                  <option value="">{t('selection:filters.allGenres')}</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterActions}>
                <button onClick={applyFilters} style={styles.filterApply}>
                  {t('selection:filters.apply')}
                </button>
                <button onClick={resetFilters} style={styles.filterReset}>
                  {t('selection:filters.reset')}
                </button>
              </div>
            </div>

            {/* Genre count info */}
            <p style={styles.genreInfo}>
              {t('selection:filters.genreInfo', { genres: availableGenres.length, count: allContent.length })}
            </p>
          </div>
        )}
      </section>

      {/* Content Grid */}
      <main style={styles.main}>
        {isLoading ? (
          <LoadingState />
        ) : content.length === 0 ? (
          <EmptyState searchQuery={searchQuery} hasFilters={!!(filters.yearFrom || filters.yearTo || filters.genre)} onReset={resetFilters} />
        ) : (
          <div style={styles.grid}>
            {content.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                isSelected={isSelected(item.id)}
                isDisabled={category === 'games' && gameAtLimit && !isSelected(item.id)}
                onToggle={() => toggleSelection(item)}
                categoryColor={categoryInfo.color}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Selection Bar */}
      {selectedItems.length > 0 && (
        <SelectionBar
          selectedItems={selectedItems}
          onClearAll={() => setSelectedItems([])}
          onRemove={toggleSelection}
          onAnalyze={() => onAnalyze(selectedItems)}
          categoryColor={categoryInfo.color}
          gameAtLimit={gameAtLimit}
          maxGames={MAX_GAMES}
          category={category}
        />
      )}

      <style>{animationStyles}</style>
    </div>
  );
}

// ============================================
// CONTENT CARD
// ============================================

function ContentCard({ item, isSelected, isDisabled, onToggle, categoryColor }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation('selection');

  return (
    <article
      style={{
        ...styles.card,
        borderColor: isSelected ? categoryColor : 'transparent',
        transform: isHovered && !isDisabled ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        opacity: isDisabled ? 0.4 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isDisabled ? undefined : onToggle}
    >
      <div style={styles.posterContainer}>
        {item.poster && item.poster.startsWith('http') && !imgError ? (
          <img
            src={item.poster}
            alt={item.title}
            style={styles.poster}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.posterPlaceholder}>
            <span style={styles.placeholderIcon}>
              {item.type === 'game' ? '🎮' : item.type === 'movie' ? '🎬' : '📺'}
            </span>
          </div>
        )}
        {isSelected && (
          <div style={styles.selectedOverlay}>
            <div style={{ ...styles.checkmark, background: categoryColor }}>✓</div>
          </div>
        )}
        {isHovered && !isSelected && (
          <div style={styles.hoverOverlay}>
            <span style={styles.hoverText}>{t('selection:card.select')}</span>
          </div>
        )}
      </div>

      <div style={styles.cardInfo}>
        <h3 style={styles.cardTitle}>{item.title}</h3>
        <div style={styles.cardMeta}>
          <span style={styles.year}>{item.year}</span>
          {item.rating && (
            <>
              <span style={styles.metaDivider}>•</span>
              <span style={{ ...styles.rating, color: getRatingColor(item.rating) }}>
                ★ {item.rating}
                {/* Az oy uyarısı: TMDB için 1000 altı */}
                {item.voteCount !== undefined && item.voteCount < 1000 && (
                  <span
                    title={`Only ${item.voteCount.toLocaleString()} votes — score may not be reliable`}
                    style={styles.lowVoteBadge}
                  >⚠️</span>
                )}
              </span>
            </>
          )}
          {/* Puan yok ama TMDB içerigi */}
          {!item.rating && item.voteCount !== undefined && (
            <span style={styles.noRatingBadge}>{t('selection:card.noScore')}</span>
          )}
        </div>
        {item.genres && item.genres.length > 0 && (
          <div style={styles.genres}>
            {item.genres.slice(0, 2).map((genre, idx) => (
              <span key={idx} style={styles.genreTag}>
                {typeof genre === 'string' ? genre : genre.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================
// SELECTION BAR
// ============================================

function SelectionBar({ selectedItems, onClearAll, onRemove, onAnalyze, categoryColor, gameAtLimit, maxGames, category }) {
  const { t } = useTranslation(['selection', 'common']);

  return (
    <div style={styles.selectionBar}>
      <div style={styles.selectionBarContent}>
        <div style={styles.selectionBarLeft}>
          <h3 style={styles.selectionBarTitle}>
            {t('selection:sidebar.title')} ({selectedItems.length})
          </h3>
          <button onClick={onClearAll} style={styles.clearButton}>
            {t('common:actions.clearAll')}
          </button>
        </div>

        <div style={styles.selectedChips}>
          {selectedItems.slice(0, 5).map((item) => (
            <div key={item.id} style={styles.chip}>
              <span style={styles.chipTitle}>{item.title}</span>
              <button onClick={(e) => { e.stopPropagation(); onRemove(item); }} style={styles.chipRemove}>×</button>
            </div>
          ))}
          {selectedItems.length > 5 && (
            <span style={styles.chipMore}>{t('selection:sidebar.more', { count: selectedItems.length - 5 })}</span>
          )}
        </div>

        <button
          onClick={onAnalyze}
          disabled={selectedItems.length < 2}
          style={{
            ...styles.analyzeButton,
            background: selectedItems.length >= 2
              ? `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}DD 100%)`
              : 'var(--border-subtle)',
            cursor: selectedItems.length >= 2 ? 'pointer' : 'not-allowed',
          }}
        >
          <span>◈</span>
          <span>{t('common:actions.analyze')}</span>
        </button>
      </div>

      {selectedItems.length < 2 && (
        <div style={styles.warning}>
          ⚠️ {t('selection:warnings.minSelection', { min: 2 })}
        </div>
      )}
      {selectedItems.filter(i => i.type === 'game').length < 2 && selectedItems.length >= 2 && category === 'games' && (
        <div style={{ ...styles.warning, borderColor: 'rgba(212,163,72,0.4)', color: '#D4A348', background: 'rgba(212,163,72,0.08)' }}>
          ⚠️ {t('selection:warnings.gamesOnly')}
        </div>
      )}
      {gameAtLimit && (
        <div style={{ ...styles.warning, borderColor: 'rgba(139,115,85,0.4)', color: '#8B7355', background: 'rgba(139,115,85,0.08)' }}>
          {t('selection:warnings.maxGames', { max: maxGames })}
        </div>
      )}
    </div>
  );
}

// ============================================
// LOADING & EMPTY
// ============================================

function LoadingState() {
  const { t } = useTranslation('selection');
  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingSpinner} />
      <p style={styles.loadingText}>{t('selection:content.loading')}</p>
    </div>
  );
}

function EmptyState({ searchQuery, hasFilters, onReset }) {
  const { t } = useTranslation('selection');
  return (
    <div style={styles.emptyContainer}>
      <span style={styles.emptyIcon}>🔍</span>
      <h3 style={styles.emptyTitle}>{t('search.noResults')}</h3>
      <p style={styles.emptyText}>
        {searchQuery ? t('search.tryAgain') : t('content.noData')}
      </p>
      {hasFilters && (
        <button onClick={onReset} style={styles.emptyResetButton}>
          {t('selection:filters.reset')}
        </button>
      )}
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function getRatingColor(rating) {
  if (rating >= 90) return '#6B8E67';
  if (rating >= 80) return '#D4A348';
  if (rating >= 70) return '#E8A87C';
  return '#C84C3C';
}

function generateMockContent(category) {
  const games = [
    { id: 'g1',  title: 'Elden Ring',            year: '2022', rating: 96, type: 'game', poster: null, genres: ['Action', 'RPG'] },
    { id: 'g2',  title: 'The Witcher 3',          year: '2015', rating: 92, type: 'game', poster: null, genres: ['RPG', 'Adventure'] },
    { id: 'g3',  title: 'Hades',                  year: '2020', rating: 93, type: 'game', poster: null, genres: ['Action', 'Indie'] },
    { id: 'g4',  title: 'Celeste',                year: '2018', rating: 92, type: 'game', poster: null, genres: ['Platformer', 'Indie'] },
    { id: 'g5',  title: 'Hollow Knight',          year: '2017', rating: 90, type: 'game', poster: null, genres: ['Action', 'Indie'] },
    { id: 'g6',  title: "Baldur's Gate 3",        year: '2023', rating: 96, type: 'game', poster: null, genres: ['RPG', 'Strategy'] },
    { id: 'g7',  title: 'God of War',             year: '2018', rating: 94, type: 'game', poster: null, genres: ['Action', 'Adventure'] },
    { id: 'g8',  title: 'Red Dead Redemption 2',  year: '2018', rating: 97, type: 'game', poster: null, genres: ['Action', 'Adventure'] },
    { id: 'g9',  title: 'Disco Elysium',          year: '2019', rating: 91, type: 'game', poster: null, genres: ['RPG', 'Adventure'] },
    { id: 'g10', title: 'Sekiro',                 year: '2019', rating: 91, type: 'game', poster: null, genres: ['Action'] },
    { id: 'g11', title: 'NieR: Automata',         year: '2017', rating: 88, type: 'game', poster: null, genres: ['Action', 'RPG'] },
    { id: 'g12', title: 'Divinity: Original Sin 2', year: '2017', rating: 93, type: 'game', poster: null, genres: ['RPG', 'Strategy'] },
  ];

  const movies = [
    { id: 'm1', title: 'Oppenheimer',                          year: '2023', rating: 84, type: 'movie', poster: null, genres: ['Drama', 'History'] },
    { id: 'm2', title: 'Parasite',                             year: '2019', rating: 85, type: 'movie', poster: null, genres: ['Drama', 'Thriller'] },
    { id: 'm3', title: 'Everything Everywhere All at Once',   year: '2022', rating: 81, type: 'movie', poster: null, genres: ['Action', 'Comedy', 'Sci-Fi'] },
    { id: 'm4', title: 'The Batman',                           year: '2022', rating: 76, type: 'movie', poster: null, genres: ['Action', 'Crime'] },
    { id: 'm5', title: 'Dune',                                 year: '2021', rating: 80, type: 'movie', poster: null, genres: ['Sci-Fi', 'Adventure'] },
    { id: 'm6', title: 'Spider-Man: Across the Spider-Verse', year: '2023', rating: 86, type: 'movie', poster: null, genres: ['Action', 'Animation'] },
    { id: 'm7', title: 'Top Gun: Maverick',                   year: '2022', rating: 83, type: 'movie', poster: null, genres: ['Action', 'Drama'] },
    { id: 'm8', title: 'The Banshees of Inisherin',           year: '2022', rating: 74, type: 'movie', poster: null, genres: ['Comedy', 'Drama'] },
  ];

  const series = [
    { id: 's1', title: 'Breaking Bad',  year: '2008', rating: 89, type: 'series', poster: null, genres: ['Crime', 'Drama'] },
    { id: 's2', title: 'The Bear',      year: '2022', rating: 84, type: 'series', poster: null, genres: ['Comedy', 'Drama'] },
    { id: 's3', title: 'Severance',     year: '2022', rating: 83, type: 'series', poster: null, genres: ['Drama', 'Sci-Fi', 'Mystery'] },
    { id: 's4', title: 'Succession',    year: '2018', rating: 85, type: 'series', poster: null, genres: ['Drama'] },
    { id: 's5', title: 'The Last of Us',year: '2023', rating: 85, type: 'series', poster: null, genres: ['Drama', 'Action'] },
    { id: 's6', title: 'Arcane',        year: '2021', rating: 90, type: 'series', poster: null, genres: ['Animation', 'Action'] },
    { id: 's7', title: 'Shogun',        year: '2024', rating: 86, type: 'series', poster: null, genres: ['Drama', 'Action'] },
    { id: 's8', title: 'True Detective',year: '2014', rating: 79, type: 'series', poster: null, genres: ['Crime', 'Drama', 'Mystery'] },
  ];

  return category === 'games' ? games : category === 'movies' ? movies : series;
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    paddingBottom: '200px',
  },
  grainOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E")`,
    opacity: 0.6, pointerEvents: 'none', mixBlendMode: 'multiply', zIndex: 1,
  },
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)',
    padding: '24px', backdropFilter: 'blur(12px)',
  },
  headerTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: '1400px', margin: '0 auto',
  },
  backButton: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', padding: '8px 16px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
  },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
  categoryIcon: { fontSize: '28px' },
  title: {
    fontFamily: 'var(--font-editorial)', fontSize: '28px', fontWeight: 600,
    margin: 0, color: 'var(--text-primary)',
  },
  selectionCount: {
    fontFamily: 'var(--font-mono)', fontSize: '14px', padding: '8px 16px',
    background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-secondary)',
  },
  searchSection: {
    position: 'relative', zIndex: 10, padding: '24px',
    maxWidth: '1400px', margin: '0 auto',
  },
  searchContainer: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchBar: { flex: 1, position: 'relative' },
  searchIcon: {
    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
    fontSize: '18px', pointerEvents: 'none',
  },
  searchInput: {
    width: '100%', padding: '12px 48px 12px 48px',
    fontFamily: 'var(--font-body)', fontSize: '15px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
  },
  searchSpinner: {
    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
    width: '20px', height: '20px',
    border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
  },
  filterButton: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600,
    padding: '12px 24px', border: '2px solid', borderRadius: '4px',
    cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
    position: 'relative', display: 'flex', alignItems: 'center', gap: '8px',
  },
  filterActiveDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#E8A87C', display: 'inline-block',
  },
  filtersPanel: {
    padding: '20px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    animation: 'slideDown 0.3s ease-out',
  },
  filterGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px',
  },
  filterItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
  filterLabel: {
    fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  filterInput: {
    padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: '14px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
  },
  filterActions: { display: 'flex', gap: '8px', alignItems: 'end' },
  filterApply: {
    fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 600,
    padding: '8px 16px', border: 'none', borderRadius: '4px',
    background: 'var(--accent-primary)', color: 'white', cursor: 'pointer',
  },
  filterReset: {
    fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 600,
    padding: '8px 16px', border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
  },
  genreInfo: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-tertiary)',
    marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
  },
  main: { position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: '1400px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' },
  card: {
    position: 'relative', cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '2px solid transparent', borderRadius: '4px', overflow: 'hidden',
  },
  posterContainer: {
    position: 'relative', aspectRatio: '2/3', background: 'var(--bg-tertiary)',
    borderRadius: '4px', overflow: 'hidden', marginBottom: '12px',
  },
  poster: { width: '100%', height: '100%', objectFit: 'cover' },
  posterPlaceholder: {
    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
  },
  placeholderIcon: { fontSize: '48px', opacity: 0.3 },
  selectedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  checkmark: {
    width: '48px', height: '48px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '24px', fontWeight: 'bold',
  },
  hoverOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.15s ease-out forwards',
  },
  hoverText: {
    fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 600,
    color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  cardInfo: { padding: '0 4px' },
  cardTitle: {
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
    color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-ui)', fontSize: '12px', marginBottom: '6px',
  },
  year: { color: 'var(--text-tertiary)' },
  metaDivider: { color: 'var(--text-tertiary)', opacity: 0.5 },
  rating: { fontFamily: 'var(--font-mono)', fontWeight: 600 },
  lowVoteBadge: {
    display: 'inline-block', marginLeft: '4px', fontSize: '11px',
    cursor: 'help', verticalAlign: 'middle',
  },
  noRatingBadge: {
    fontFamily: 'var(--font-ui)', fontSize: '10px', padding: '2px 6px',
    background: 'var(--bg-tertiary)', borderRadius: '2px', color: 'var(--text-tertiary)',
  },
  genres: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  genreTag: {
    fontFamily: 'var(--font-ui)', fontSize: '10px', padding: '2px 6px',
    background: 'var(--bg-tertiary)', borderRadius: '2px', color: 'var(--text-tertiary)',
  },
  selectionBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
    background: 'var(--bg-primary)', borderTop: '2px solid var(--border-subtle)',
    padding: '20px 24px', boxShadow: '0 -8px 24px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(12px)',
  },
  selectionBarContent: {
    maxWidth: '1400px', margin: '0 auto',
    display: 'flex', alignItems: 'center', gap: '24px',
  },
  selectionBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  selectionBarTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '18px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0,
  },
  clearButton: {
    fontFamily: 'var(--font-ui)', fontSize: '12px', padding: '6px 12px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
  },
  selectedChips: { flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
    borderRadius: '4px', fontSize: '13px',
  },
  chipTitle: {
    fontFamily: 'var(--font-body)', color: 'var(--text-primary)',
    maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  chipRemove: {
    background: 'none', border: 'none', color: 'var(--text-tertiary)',
    cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0,
  },
  chipMore: { fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-tertiary)' },
  analyzeButton: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600,
    padding: '12px 32px', border: 'none', borderRadius: '4px',
    color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase',
    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  },
  warning: {
    position: 'absolute', top: '-32px', left: '50%', transform: 'translateX(-50%)',
    fontFamily: 'var(--font-ui)', fontSize: '13px', padding: '8px 16px',
    background: 'rgba(212,163,72,0.1)', border: '1px solid rgba(212,163,72,0.3)',
    borderRadius: '4px', color: '#D4A348',
  },
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px',
  },
  loadingSpinner: {
    width: '40px', height: '40px',
    border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px',
  },
  loadingText: { fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' },
  emptyContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px', textAlign: 'center',
  },
  emptyIcon: { fontSize: '64px', marginBottom: '16px', opacity: 0.3 },
  emptyTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '24px', fontWeight: 600,
    color: 'var(--text-primary)', marginBottom: '8px',
  },
  emptyText: { fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '400px' },
  emptyResetButton: {
    marginTop: '16px', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600,
    padding: '10px 24px', border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
  },
};

const animationStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  [data-theme="dark"] .grainOverlay { mix-blend-mode: screen; opacity: 0.03; }
  @media (max-width: 768px) {
    .grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 16px !important; }
  }
`;
