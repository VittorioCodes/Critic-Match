import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OpenCriticService, TMDBService, ITADService } from './APIService';

// ============================================
// MATCHING ALGORITHM
// ============================================

const MatchEngine = {
  // Ağırlıklı ortalama: yüksek puanlara bonus veriyor
  weightedAverage(selections, reviews) {
    const reviewMap = {};
    reviews.forEach(r => { reviewMap[r.gameId || r.itemId] = r.score; });

    let weighted = 0, totalWeight = 0;
    selections.forEach((item, index) => {
      const score = reviewMap[item.id];
      if (score == null) return;
      // Listedeki sıraya ve puana göre ağırlık
      const positionWeight = 1 + index * 0.05;
      const scoreBonus = score >= 90 ? 1.15 : score >= 80 ? 1.08 : 1;
      const weight = positionWeight * scoreBonus;
      weighted += score * weight;
      totalWeight += weight;
    });
    return totalWeight > 0 ? weighted / totalWeight : 0;
  },

  // Kapsam: seçimlerden kaçını incelemiş (%)
  coverage(selections, reviews) {
    const reviewedIds = new Set(reviews.map(r => r.gameId || r.itemId));
    const covered = selections.filter(item => reviewedIds.has(item.id)).length;
    return selections.length > 0 ? (covered / selections.length) * 100 : 0;
  },

  // Tutarlılık: puan dağılımının varyansı düşükse yüksek
  consistency(selections, reviews) {
    const reviewMap = {};
    reviews.forEach(r => { reviewMap[r.gameId || r.itemId] = r.score; });
    const scores = selections.map(item => reviewMap[item.id]).filter(s => s != null);
    if (scores.length < 2) return 100;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((s, x) => s + Math.pow(x - avg, 2), 0) / scores.length;
    return Math.max(0, 100 - Math.sqrt(variance) * 1.5);
  },

  // Ana skor: %50 ortalama + %30 kapsam + %20 tutarlılık
  calculate(selections, criticReviews) {
    if (!selections.length || !criticReviews.length) {
      return { total: 0, breakdown: { averageScore: 0, coverage: 0, consistency: 0 } };
    }
    const avg = this.weightedAverage(selections, criticReviews);
    const cov = this.coverage(selections, criticReviews);
    const con = this.consistency(selections, criticReviews);
    if (cov === 0) return { total: 0, breakdown: { averageScore: 0, coverage: 0, consistency: 0 } };
    const total = avg * 0.5 + cov * 0.3 + con * 0.2;
    return {
      total: Math.round(total),
      breakdown: {
        averageScore: Math.round(avg),
        coverage: Math.round(cov),
        consistency: Math.round(con),
      },
    };
  },
};

// ============================================
// RESULTS PAGE
// ============================================

export default function ResultsPage({ selectedItems, category, onBack }) {
  const { t } = useTranslation(['results', 'common']);

  // Her zaman en üstten başla
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [phase, setPhase] = useState('analyzing'); // 'analyzing' | 'done' | 'error'
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [matchedCritics, setMatchedCritics] = useState([]);
  const [selectedCritic, setSelectedCritic] = useState(null);
  const [criticReviews, setCriticReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('selections');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [criticSort, setCriticSort] = useState('matchScore');
  const [similarGames, setSimilarGames] = useState([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [itadDeals, setItadDeals] = useState([]);
  const [isItadLoading, setIsItadLoading] = useState(false);

  // Seçilen oyunlar — max 5 ile sınırla (API tasarrufu)
  const MAX_GAMES = 5;
  const gameSelections = selectedItems.filter(i => i.type === 'game').slice(0, MAX_GAMES);
  const otherSelections = selectedItems.filter(i => i.type !== 'game');

  const hasMoviesOrSeries = selectedItems.some(i => i.type === 'movie' || i.type === 'series');
  const [recommendations, setRecommendations] = useState({ movies: [], series: [] });
  const [recTab, setRecTab] = useState('movies'); // 'movies' | 'series'

  // -----------------------------------------------
  // ANALİZ - API çağrıları ve skor hesaplama
  // -----------------------------------------------
  useEffect(() => {
    if (gameSelections.length === 0 && !hasMoviesOrSeries) {
      setPhase('done');
      return;
    }
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setPhase('analyzing');
    
    // Film/dizi seçimi varsa benzer içerikler öner (oyunlarla birlikte de olabilir)
    if (hasMoviesOrSeries) {
      setProgress({ current: 0, total: 2, label: t('results:analyzing.initializing') });
      try {
        const movieSelections = selectedItems.filter(i => i.type === 'movie');
        const seriesSelections = selectedItems.filter(i => i.type === 'series');
        
        setProgress({ current: 1, total: 2, label: t('results:analyzing.findingSimilar') });
        const [movieRecs, seriesRecs] = await Promise.all([
          movieSelections.length > 0 
            ? TMDBService.getSimilarContent(movieSelections, 'movie')
            : Promise.resolve([]),
          seriesSelections.length > 0
            ? TMDBService.getSimilarContent(seriesSelections, 'tv')
            : Promise.resolve([]),
        ]);
        
        setProgress({ current: 2, total: 2, label: t('results:analyzing.done') });
        setRecommendations({ movies: movieRecs, series: seriesRecs });
        setPhase('done');
        return;
      } catch (err) {
        console.error('Recommendations error:', err);
        setPhase('error');
        return;
      }
    }
    
    // Benzer oyunları ve ITAD deals paralel olarak çek
    setIsSimilarLoading(true);
    OpenCriticService.getSimilarGames(gameSelections)
      .then(games => setSimilarGames(games))
      .catch(() => setSimilarGames([]))
      .finally(() => setIsSimilarLoading(false));

    setIsItadLoading(true);
    ITADService.getDealsForGames(gameSelections)
      .then(deals => setItadDeals(deals))
      .catch(() => setItadDeals([]))
      .finally(() => setIsItadLoading(false));

    // Oyun analizi
    setProgress({ current: 0, total: gameSelections.length, label: t('results:analyzing.fetchingReviews') });

    try {
      const allReviews = [];      // Tüm game+critic review'ları
      const criticMap = new Map(); // criticId → critic bilgisi

      // Her oyun için review'ları çek
      for (let i = 0; i < gameSelections.length; i++) {
        const game = gameSelections[i];
        setProgress({ current: i + 1, total: gameSelections.length, label: game.title });

        try {
          const reviews = await OpenCriticService.getGameReviews(game.externalId);
          reviews.forEach(review => {
            allReviews.push({ ...review, gameId: game.id, gameTitle: game.title });
            if (review.criticId && !criticMap.has(review.criticId)) {
              criticMap.set(review.criticId, {
                id: review.criticId,
                name: review.criticName,
                outlet: review.outletName,
                outletId: review.outletId,
              });
            }
          });
        } catch {
          // Bu oyun için review alınamazsa devam et
          console.warn(`Reviews not fetched for: ${game.title}`);
        }
      }

      // Her eleştirmen için skor hesapla
      setProgress({ current: gameSelections.length, total: gameSelections.length, label: t('results:analyzing.calculatingScores') });

      const scored = [];
      for (const [, critic] of criticMap) {
        const criticSpecificReviews = allReviews.filter(r => r.criticId === critic.id);
        const result = MatchEngine.calculate(gameSelections, criticSpecificReviews);
        if (result.total > 0) {
          scored.push({
            ...critic,
            matchScore: result.total,
            breakdown: result.breakdown,
            reviewCount: criticSpecificReviews.length,
            reviews: criticSpecificReviews,
          });
        }
      }

      // Başlangıç sıralaması matchScore'a göre
      scored.sort((a, b) => b.matchScore - a.matchScore);
      const top = scored.slice(0, 25);
      
      // Not: Sıralama daha sonra criticSort state'ine göre değişebilir

      setMatchedCritics(top);
      if (top.length > 0) {
        setSelectedCritic(top[0]);
        setCriticReviews(top[0].reviews || []);
      }
      setPhase('done');

    } catch (err) {
      console.error('Analysis error:', err);
      setPhase('error');
    }
  };

  // -----------------------------------------------
  // ELEŞTİRMEN SEÇİMİ
  // -----------------------------------------------
  const handleSelectCritic = useCallback((critic) => {
    setSelectedCritic(critic);
    setActiveTab('selections');
    // Selections tabı için eleştirmenin kendi reviews'larını yükle
    // (latestReviews tabı açıldığında lazy fetch yapılacak)
    setCriticReviews(critic.reviews || []);
  }, []);

  // State: latestReviews ayrı tutulur, selections tab'a dokunmaz
  const [latestReviews, setLatestReviews] = useState([]);

  // Latest Reviews tab'ına geçildiğinde lazy fetch
  const handleTabChange = useCallback(async (tab) => {
    setActiveTab(tab);
    if (tab !== 'latestReviews') return;
    if (!selectedCritic) return;

    setIsLoadingReviews(true);
    setLatestReviews([]);
    try {
      const reviews = await OpenCriticService.getCriticLatestReviews(selectedCritic.id, 15);
      setLatestReviews(reviews);
    } catch (err) {
      console.warn('[LatestReviews] fetch error:', err.message);
      setLatestReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [selectedCritic]);

  // -----------------------------------------------
  // CRITIC SORT
  // -----------------------------------------------
  const sortedCritics = [...matchedCritics].sort((a, b) => {
    switch (criticSort) {
      case 'matchScore':     return (b.matchScore || 0) - (a.matchScore || 0);
      case 'averageScore':   return (b.breakdown?.averageScore || 0) - (a.breakdown?.averageScore || 0);
      case 'coverage':       return (b.breakdown?.coverage || 0) - (a.breakdown?.coverage || 0);
      case 'consistency':    return (b.breakdown?.consistency || 0) - (a.breakdown?.consistency || 0);
      default:               return 0;
    }
  });

  // latestReviews zaten tarih sırasıyla geliyor (getCriticLatestReviews sort:date)

  // -----------------------------------------------
  // RENDER - ANALİZ AŞAMASI
  // -----------------------------------------------
  if (phase === 'analyzing') {
    return (
      <div style={styles.container}>
        <div style={styles.grainOverlay} />
        <div style={styles.analyzingScreen}>
          <div style={styles.analyzingInner}>
            <div style={styles.analyzingLogo}>◈</div>
            <h2 style={styles.analyzingTitle}>{t('results:analyzing.title')}</h2>
            <p style={styles.analyzingSubtitle}>
              {progress.label || t('results:analyzing.initializing')}
            </p>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: progress.total > 0
                    ? `${(progress.current / progress.total) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <p style={styles.progressText}>
              {progress.current} / {progress.total}
            </p>
            <div style={styles.analyzingItems}>
              {gameSelections.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.analyzingItem,
                    opacity: i < progress.current ? 1 : 0.3,
                    color: i < progress.current ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  }}
                >
                  {i < progress.current ? '✓' : '○'} {item.title}
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{animationStyles}</style>
      </div>
    );
  }

  // -----------------------------------------------
  // RENDER - HATA
  // -----------------------------------------------
  if (phase === 'error') {
    return (
      <div style={styles.container}>
        <div style={styles.grainOverlay} />
        <div style={styles.errorScreen}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2 style={styles.errorTitle}>{t('results:error.title')}</h2>
          <p style={styles.errorText}>
            {t('results:error.description')}
          </p>
          <button onClick={onBack} style={styles.errorButton}>{t('results:error.goBack')}</button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------
  // RENDER - RECOMMENDATIONS (Film/Dizi)
  // -----------------------------------------------
  const hasRecommendations = recommendations.movies.length > 0 || recommendations.series.length > 0;
  
  // Auto-select tab: ilk önce filmler, yoksa diziler
  const effectiveTab = recommendations.movies.length > 0 ? recTab : 'series';
  const activeRecs = effectiveTab === 'movies' ? recommendations.movies : recommendations.series;
  
  const movieCount = selectedItems.filter(i => i.type === 'movie').length;
  const seriesCount = selectedItems.filter(i => i.type === 'series').length;

  if (hasRecommendations) {
    return (
      <div style={styles.container}>
        <div style={styles.grainOverlay} />
        
        {/* Header */}
        <header style={styles.header}>
          <button onClick={onBack} style={styles.backButton}>
            ← {t('common:actions.back')}
          </button>
          <div style={styles.headerCenter}>
            <h1 style={styles.headerTitle}>{t('results:recommendations.title')}</h1>
            <p style={styles.headerSubtitle}>
              {t('results:recommendations.subtitle' + (selectedItems.length !== 1 ? '_plural' : ''), { count: selectedItems.length })}
            </p>
          </div>
          <button onClick={onBack} style={styles.newSearchButton}>
            {t('results:recommendations.newSearch')}
          </button>
        </header>

        {/* Tabs: Movies | Series (only show if both have results) */}
        {recommendations.movies.length > 0 && recommendations.series.length > 0 && (
          <div style={styles.recTabsRow}>
            <button
              style={{ ...styles.recTab, ...(effectiveTab === 'movies' ? styles.recTabActive : {}) }}
              onClick={() => setRecTab('movies')}
            >
              {t('results:recommendations.tabs.movies', { count: recommendations.movies.length })}
            </button>
            <button
              style={{ ...styles.recTab, ...(effectiveTab === 'series' ? styles.recTabActive : {}) }}
              onClick={() => setRecTab('series')}
            >
              {t('results:recommendations.tabs.series', { count: recommendations.series.length })}
            </button>
          </div>
        )}

        {/* Layout: Selections Sidebar + Grid */}
        <div style={styles.recLayout} className="recLayout">

          {/* LEFT: Seçimler sidebar */}
          <aside style={styles.selectionsSidebar} className="selectionsSidebar">
            <h3 style={styles.sidebarTitle}>{t('results:recommendations.yourSelections')}</h3>
            <div style={styles.sidebarList}>
              {selectedItems.map(item => (
                <div key={item.id} style={styles.sidebarItem}>
                  <div style={styles.sidebarPoster}>
                    {item.poster && item.poster.startsWith('http')
                      ? <img src={item.poster} alt={item.title} style={styles.sidebarPosterImg} />
                      : <span style={styles.sidebarPosterIcon}>
                          {item.type === 'game' ? '🎮' : item.type === 'movie' ? '🎬' : '📺'}
                        </span>
                    }
                  </div>
                  <div style={styles.sidebarItemInfo}>
                    <span style={styles.sidebarItemTitle}>{item.title}</span>
                    <span style={styles.sidebarItemMeta}>
                      {item.year}
                      {item.rating && (
                        <>
                          <span style={{ color: getScoreColor(item.rating), marginLeft: '6px' }}>
                            ★ {item.rating}
                          </span>
                          {item.voteCount !== undefined && item.voteCount < 1000 && (
                            <span
                              title={`Only ${item.voteCount.toLocaleString()} votes — score may not reflect true quality`}
                              style={{ marginLeft: '3px', cursor: 'help' }}
                            >⚠️</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT: Recommendations Grid */}
          <main style={styles.recommendationsMain}>
            <div style={styles.recommendationsGrid}>
              {activeRecs.slice(0, 24).map((item, index) => (
                <RecommendationCard key={item.id} item={item} rank={index + 1} />
              ))}
            </div>

            {activeRecs.length === 0 && (
              <div style={styles.noResults}>
                <span style={styles.noResultsIcon}>🔍</span>
                <p style={styles.noResultsTitle}>{t('results:recommendations.noResults')}</p>
                <p style={styles.noResultsDesc}>{t('results:recommendations.noResultsDesc')}</p>
              </div>
            )}
          </main>
        </div>

        <style>{animationStyles}</style>
      </div>
    );
  }

  // -----------------------------------------------
  // RENDER - SONUÇLAR (Oyunlar için Critics)
  // -----------------------------------------------
  return (
    <div style={styles.container}>
      <div style={styles.grainOverlay} />

      {/* Header */}
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← {t('common:actions.back')}
        </button>
        <div style={styles.headerCenter}>
          <h1 style={styles.headerTitle}>{t('results:header.title')}</h1>
          <p style={styles.headerSubtitle}>
            {t('results:header.subtitle', { count: gameSelections.length })}
          </p>
        </div>
        <button onClick={onBack} style={styles.newSearchButton}>
          + {t('results:header.newSearch')}
        </button>
      </header>

      {/* Layout: Critics List + Detail Panel */}
      <main style={styles.resultsLayout}>

        {/* LEFT: Critics List */}
        <section style={styles.criticsPanel}>
          <div style={styles.criticsPanelHeader}>
            <h2 style={styles.criticsPanelTitle}>{t('results:criticsList.title')}</h2>
            <span style={styles.criticsPanelCount}>{t('results:criticsList.found', { count: matchedCritics.length })}</span>
          </div>
          
          {/* Sort dropdown */}
          {matchedCritics.length > 0 && (
            <div style={styles.sortRow}>
              <span style={styles.sortLabel}>{t('results:criticsList.sortBy')}:</span>
              <select value={criticSort} onChange={e => setCriticSort(e.target.value)} style={styles.sortSelect}>
                <option value="matchScore">{t('results:criticsList.sortOptions.matchScore')}</option>
                <option value="averageScore">{t('results:criticsList.sortOptions.averageScore')}</option>
                <option value="coverage">{t('results:criticsList.sortOptions.coverage')}</option>
                <option value="consistency">{t('results:criticsList.sortOptions.consistency')}</option>
              </select>
            </div>
          )}

          {matchedCritics.length === 0 ? (
            <div style={styles.noResults}>
              <span style={styles.noResultsIcon}>🔍</span>
              <p style={styles.noResultsTitle}>{t('results:criticsList.noResults')}</p>
              <p style={styles.noResultsDesc}>{t('results:criticsList.noResultsDesc')}</p>
            </div>
          ) : (
            <div style={styles.criticsList}>
              {sortedCritics.map((critic, index) => (
                <CriticCard
                  key={critic.id}
                  critic={critic}
                  rank={index + 1}
                  isActive={selectedCritic?.id === critic.id}
                  onClick={() => handleSelectCritic(critic)}
                  animDelay={index * 0.05}
                />
              ))}
            </div>
          )}
        </section>

        {/* RIGHT: Detail Panel */}
        {selectedCritic && (
          <section style={styles.detailPanel}>
            {/* Critic header */}
            <div style={styles.detailHeader}>
              <div style={styles.detailCriticInfo}>
                <h2 style={styles.detailCriticName}>{selectedCritic.name}</h2>
                {selectedCritic.outlet && (
                  <span style={styles.detailOutlet}>{selectedCritic.outlet}</span>
                )}
              </div>
              <div style={styles.detailScoreBadge}>
                <span style={{
                  ...styles.detailScoreNumber,
                  color: getScoreColor(selectedCritic.matchScore),
                }}>
                  {selectedCritic.matchScore}
                </span>
                <span style={styles.detailScoreLabel}>
                  {t('results:detailPanel.score.label')}
                </span>
              </div>
            </div>

            {/* Breakdown */}
            {selectedCritic.breakdown && (
              <div style={styles.breakdown}>
                <BreakdownItem
                  label={t('results:detailPanel.breakdown.averageScore.label')}
                  value={selectedCritic.breakdown.averageScore}
                  tooltip={t('results:detailPanel.breakdown.averageScore.tooltip')}
                  suffix=""
                />
                <BreakdownItem
                  label={t('results:detailPanel.breakdown.coverage.label')}
                  value={selectedCritic.breakdown.coverage}
                  tooltip={t('results:detailPanel.breakdown.coverage.tooltip')}
                  suffix="%"
                />
                <BreakdownItem
                  label={t('results:detailPanel.breakdown.consistency.label')}
                  value={selectedCritic.breakdown.consistency}
                  tooltip={t('results:detailPanel.breakdown.consistency.tooltip')}
                  suffix="%"
                />
              </div>
            )}

            {/* Tabs */}
            <div style={styles.tabs}>
              <button
                onClick={() => handleTabChange('selections')}
                style={{ ...styles.tab, ...(activeTab === 'selections' ? styles.tabActive : {}) }}
              >
                {t('results:detailPanel.tabs.yourSelections')}
              </button>
              <button
                onClick={() => handleTabChange('latestReviews')}
                style={{ ...styles.tab, ...(activeTab === 'latestReviews' ? styles.tabActive : {}) }}
              >
                {t('results:detailPanel.tabs.latestReviews')}
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'selections' ? (
              <SelectionsTab
                gameSelections={gameSelections}
                criticReviews={criticReviews}
              />
            ) : (
              <LatestReviewsTab
                reviews={latestReviews}
                isLoading={isLoadingReviews}
              />
            )}

            {/* Game Recommendations - İki panel yan yana */}
            <GameRecommendationsSection
              similarGames={similarGames}
              isSimilarLoading={isSimilarLoading}
              itadDeals={itadDeals}
              isItadLoading={isItadLoading}
              gameSelections={gameSelections}
            />
          </section>
        )}
      </main>

      <style>{animationStyles}</style>
    </div>
  );
}

// ============================================
// CRITIC CARD
// ============================================

function CriticCard({ critic, rank, isActive, onClick, animDelay }) {
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation('results');
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.criticCard,
        background: isActive ? 'var(--bg-tertiary)' : hovered ? 'var(--bg-secondary)' : 'transparent',
        borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
        animationDelay: `${animDelay}s`,
      }}
      className="critic-card-anim"
    >
      <span style={styles.criticRank}>#{rank}</span>
      <div style={styles.criticCardInfo}>
        <span style={styles.criticCardName}>{critic.name}</span>
        <span style={styles.criticCardOutlet}>{critic.outlet}</span>
      </div>
      <div style={styles.criticCardScore}>
        <span style={{ ...styles.criticCardScoreNum, color: getScoreColor(critic.matchScore) }}>
          {critic.matchScore}
        </span>
        <span style={styles.criticCardScoreLabel}>{t('results:criticsList.matchLabel')}</span>
      </div>
    </div>
  );
}

// ============================================
// BREAKDOWN ITEM
// ============================================

function BreakdownItem({ label, value, tooltip, suffix }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={styles.breakdownItem}>
      <div style={styles.breakdownTop}>
        <span style={styles.breakdownLabel}>{label}</span>
        <button
          style={styles.tooltipTrigger}
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
        >?
          {showTip && <div style={styles.tooltipBox}>{tooltip}</div>}
        </button>
      </div>
      <span style={styles.breakdownValue}>{value}{suffix}</span>
    </div>
  );
}

// ============================================
// SELECTIONS TAB
// ============================================

function SelectionsTab({ gameSelections, criticReviews }) {
  const { t } = useTranslation('results');
  const reviewMap = {};
  criticReviews.forEach(r => { reviewMap[r.gameId || r.itemId] = r; });

  return (
    <div style={styles.tabContent}>
      {gameSelections.map(item => {
        const review = reviewMap[item.id];
        return (
          <div key={item.id} style={styles.selectionRow}>
            <span style={styles.selectionTitle}>{item.title}</span>
            {review ? (
              <a
                href={review.reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.reviewScoreLink, color: getScoreColor(review.score) }}
                title={t('detailPanel.yourSelections.clickToRead')}
              >
                {review.score} ↗
              </a>
            ) : (
              <span style={styles.noReviewBadge}>{t('detailPanel.yourSelections.noReview')}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// LATEST REVIEWS TAB
// ============================================

function LatestReviewsTab({ reviews, isLoading }) {
  const { t } = useTranslation('results');

  if (isLoading) {
    return (
      <div style={styles.tabContent}>
        <div style={styles.reviewsLoading}>
          <div style={styles.smallSpinner} />
          <span>{t('results:detailPanel.latestReviews.loading')}</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div style={styles.tabContent}>
        <p style={styles.noReviewsText}>{t('results:detailPanel.latestReviews.noReviews')}</p>
      </div>
    );
  }

  return (
    <div style={styles.tabContent}>
      {reviews.map((review, idx) => {
        const dateStr = review.publishedDate
          ? new Date(review.publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
          : null;
        return (
          <a
            key={review.id || idx}
            href={review.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.latestReviewRow}
          >
            <div style={styles.latestReviewLeft}>
              <span style={styles.reviewRowRank}>#{idx + 1}</span>
              <div style={styles.latestReviewInfo}>
                <span style={styles.latestReviewTitle}>{review.gameTitle || 'Unknown'}</span>
                {dateStr && <span style={styles.latestReviewDate}>{dateStr}</span>}
              </div>
            </div>
            <div style={styles.latestReviewRight}>
              {review.score != null && (
                <span style={{ ...styles.reviewRowScore, color: getScoreColor(review.score) }}>
                  {review.score}
                </span>
              )}
              <span style={styles.latestReviewLink}>
                {t('results:detailPanel.latestReviews.readReview')} ↗
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ============================================
// GAME RECOMMENDATIONS SECTION (2 panel)
// Sol: ITAD (IsThereAnyDeal) fiyat/deal bilgisi
// Sağ: OpenCritic genre tabanlı önerileri
// ============================================

function GameRecommendationsSection({ similarGames, isSimilarLoading, itadDeals, isItadLoading, gameSelections }) {
  const { t } = useTranslation('results');

  const hasAnyContent =
    isSimilarLoading || similarGames.length > 0 ||
    isItadLoading || itadDeals.length > 0;

  if (!hasAnyContent) return null;

  // Genre etiketlerini seçimlerden topla
  const allGenres = [];
  gameSelections.forEach(g => {
    (g.genres || []).forEach(genre => {
      const name = typeof genre === 'string' ? genre : genre.name;
      if (name && !allGenres.includes(name)) allGenres.push(name);
    });
  });
  const genreLabel = allGenres.slice(0, 3).join(', ');

  return (
    <div style={styles.gameRecsSection}>
      {/* İki kolon layout */}
      <div style={styles.gameRecsTwoCol}>

        {/* SOL: ITAD Deals */}
        <div style={styles.gameRecsCol}>
          <div style={styles.gameRecsColHeader}>
            <h3 style={styles.gameRecsColTitle}>💰 Best Deals</h3>
            <p style={styles.gameRecsColSubtitle}>
              Seçtiğin oyunlar için en iyi fiyatlar
            </p>
          </div>
          {isItadLoading ? (
            <div style={styles.reviewsLoading}>
              <div style={styles.smallSpinner} />
              <span>Fiyatlar aranıyor...</span>
            </div>
          ) : itadDeals.length === 0 ? (
            <div style={styles.gameRecsEmpty}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>💳</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-tertiary)' }}>
                {!process.env.REACT_APP_ITAD_API_KEY
                  ? 'ITAD API anahtarı girilmedi'
                  : 'Bu oyunlar için fiyat bulunamadı'}
              </p>
            </div>
          ) : (
            <div style={styles.itadDealsList}>
              {itadDeals.map((deal, idx) => (
                <ITADDealRow key={deal.id || idx} deal={deal} />
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Genre Tabanlı Oyun Önerileri */}
        <div style={styles.gameRecsCol}>
          <div style={styles.gameRecsColHeader}>
            <h3 style={styles.gameRecsColTitle}>🎮 You Might Also Like</h3>
            <p style={styles.gameRecsColSubtitle}>
              {genreLabel
                ? `${genreLabel} kategorilerinden öneriler`
                : 'Seçtiğin oyunlara benzer öneriler'}
            </p>
          </div>
          {isSimilarLoading ? (
            <div style={styles.reviewsLoading}>
              <div style={styles.smallSpinner} />
              <span>Benzer oyunlar aranıyor...</span>
            </div>
          ) : similarGames.length === 0 ? (
            <div style={styles.gameRecsEmpty}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔍</span>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Benzer oyun bulunamadı
              </p>
            </div>
          ) : (
            <div style={styles.similarGamesGrid}>
              {similarGames.slice(0, 9).map((game, idx) => (
                <SimilarGameCard key={game.id} game={game} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ITADDealRow({ deal }) {
  const hasDiscount = deal.discount != null && deal.discount > 0;
  const curr = deal.currency === 'TRY' ? '₺' : '$';
  const priceStr = deal.currentPrice != null ? curr + deal.currentPrice.toFixed(2) : null;
  const regularStr = deal.regularPrice != null && hasDiscount ? curr + deal.regularPrice.toFixed(2) : null;

  return (
    <div style={styles.itadDealRow}>
      <div style={styles.itadDealPoster}>
        {deal.poster && deal.poster.startsWith('http') ? (
          <img src={deal.poster} alt={deal.title} style={styles.itadDealPosterImg} />
        ) : (
          <span style={{ fontSize: '20px' }}>🎮</span>
        )}
      </div>
      <div style={styles.itadDealInfo}>
        <span style={styles.itadDealTitle}>{deal.title}</span>
        {deal.storeName && <span style={styles.itadDealStore}>{deal.storeName}</span>}
      </div>
      <div style={styles.itadDealPrice}>
        {priceStr ? (
          <>
            {hasDiscount && regularStr && <span style={styles.itadDealRegular}>{regularStr}</span>}
            <a href={deal.storeUrl || deal.url} target="_blank" rel="noopener noreferrer" style={styles.itadDealCurrent}>
              {priceStr}
              {hasDiscount && <span style={styles.itadDealDiscount}>-{deal.discount}%</span>}
            </a>
          </>
        ) : (
          <a href={deal.url} target="_blank" rel="noopener noreferrer" style={styles.itadDealLink}>
            Fiyata bak ↗
          </a>
        )}
      </div>
    </div>
  );
}

function SimilarGameCard({ game, rank }) {
  const [imgError, setImgError] = useState(false);
  const showPoster = game.poster && game.poster.startsWith('http') && !imgError;
  return (
    <div style={styles.similarGameCard}>
      <div style={styles.similarGamePoster}>
        {showPoster ? (
          <img src={game.poster} alt={game.title} style={styles.similarGamePosterImg} onError={() => setImgError(true)} />
        ) : (
          <div style={styles.similarGamePosterPlaceholder}>🎮</div>
        )}
        <span style={styles.similarGameRank}>#{rank}</span>
      </div>
      <div style={styles.similarGameInfo}>
        <span style={styles.similarGameTitle}>{game.title}</span>
        <div style={styles.similarGameMeta}>
          {game.year && <span style={styles.similarGameYear}>{game.year}</span>}
          {game.score != null && (
            <span style={{ ...styles.similarGameScore, color: getScoreColor(game.score) }}>
              {game.score}
            </span>
          )}
        </div>
        {game.genres && game.genres.length > 0 && (
          <div style={styles.similarGameGenres}>
            {game.genres.slice(0, 2).map((g, i) => (
              <span key={i} style={styles.similarGameGenreTag}>
                {typeof g === 'string' ? g : g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// RECOMMENDATION CARDS (Film/Dizi)
// ============================================

function getMatchReason(item, t) {
  const score = item.overlapScore || 0;
  const basedOn = item.basedOn || [];
  const first = basedOn[0] ? `"${basedOn[0]}"` : '';
  const mr = (key, opts) => t ? t(`recommendations.matchReasons.${key}`, opts) : key;

  if (score >= 6) return {
    signal: mr('veryStrong'),
    detail: mr('veryStrongDetail', { title: first }),
  };
  if (score >= 4) return {
    signal: mr('strong'),
    detail: mr('strongDetail', { title: first, others: basedOn.length > 1 ? mr('strongDetailOthers') : '' }),
  };
  if (score >= 2) return {
    signal: basedOn.length > 0 ? mr('direct') : mr('similar'),
    detail: basedOn.length > 0
      ? mr('directDetail', { title: first })
      : mr('similarDetail'),
  };
  return {
    signal: mr('thematic'),
    detail: mr('thematicDetail'),
  };
}

function RecommendationCard({ item, rank }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { t } = useTranslation('results');
  const reason = getMatchReason(item, t);
  const showPoster = item.poster && item.poster.startsWith('http') && !imgError;

  return (
    <div style={{
      ...styles.recommendationCard,
      animationDelay: `${rank * 0.1}s`,
    }} className="recommendation-card-anim">
      {/* Poster */}
      <div style={styles.recPosterContainer}>
        {showPoster ? (
          <img
            src={item.poster}
            alt={item.title}
            style={styles.recPoster}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.recPosterPlaceholder}>
            {item.type === 'movie' ? '🎬' : '📺'}
          </div>
        )}
        {/* Rank badge + why tooltip */}
        <div
          style={{ ...styles.recRankBadge, cursor: 'help', userSelect: 'none' }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          #{rank} <span style={{ opacity: 0.65, fontSize: '11px' }}>(?)</span>
          {showTooltip && (
            <div style={styles.recTooltip}>
              <div style={styles.recTooltipSignal}>{reason.signal}</div>
              <div style={styles.recTooltipDetail}>{reason.detail}</div>
              {item.basedOn && item.basedOn.length > 1 && (
                <div style={styles.recTooltipBased}>
                  {t('recommendations.matchReasons.basedOn')} {item.basedOn.slice(0, 3).map(title => `"${title}"`).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Info */}
      <div style={styles.recInfo}>
        <h3 style={styles.recTitle}>{item.title}</h3>
        <div style={styles.recMeta}>
          <span style={styles.recYear}>{item.year}</span>
          {item.rating && (
            <>
              <span style={styles.recMetaDivider}>•</span>
              <span style={{ ...styles.recRating, color: getScoreColor(item.rating) }}>
                ★ {item.rating}
              </span>
            </>
          )}
        </div>
        
        {/* Genres */}
        {item.genres && item.genres.length > 0 && (
          <div style={styles.recGenres}>
            {item.genres.slice(0, 3).map((genre, idx) => (
              <span key={idx} style={styles.recGenreTag}>
                {typeof genre === 'string' ? genre : genre.name}
              </span>
            ))}
          </div>
        )}
        
        {/* Overview sadece hover tooltip'te gösterilebilir, portrait kart için yer yok */}
      </div>
    </div>
  );
}

function MiniRecommendationCard({ item }) {
  return (
    <div style={styles.miniRecCard}>
      <div style={styles.miniRecPoster}>
        {item.poster ? (
          <img src={item.poster} alt={item.title} style={styles.miniRecPosterImg} />
        ) : (
          <div style={styles.miniRecPlaceholder}>
            {item.type === 'movie' ? '🎬' : '📺'}
          </div>
        )}
      </div>
      <div style={styles.miniRecInfo}>
        <h4 style={styles.miniRecTitle}>{item.title}</h4>
        <div style={styles.miniRecMeta}>
          <span>{item.year}</span>
          {item.rating && (
            <span style={{ color: getScoreColor(item.rating) }}>
              ★ {item.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function getScoreColor(score) {
  if (score >= 90) return '#6B8E67';
  if (score >= 80) return '#D4A348';
  if (score >= 70) return '#E8A87C';
  return '#C84C3C';
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)',
  },
  grainOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E")`,
    opacity: 0.6, mixBlendMode: 'multiply', zIndex: 1,
  },

  // Analyzing screen
  analyzingScreen: {
    position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
  },
  analyzingInner: { textAlign: 'center', maxWidth: '480px', width: '100%' },
  analyzingLogo: {
    fontSize: '48px', color: 'var(--accent-primary)',
    animation: 'pulse 2s ease-in-out infinite', marginBottom: '24px',
  },
  analyzingTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '32px', fontWeight: 600,
    color: 'var(--text-primary)', marginBottom: '8px',
  },
  analyzingSubtitle: {
    fontFamily: 'var(--font-body)', fontSize: '15px',
    color: 'var(--text-secondary)', marginBottom: '32px', minHeight: '24px',
  },
  progressBar: {
    width: '100%', height: '4px', background: 'var(--bg-tertiary)',
    borderRadius: '2px', overflow: 'hidden', marginBottom: '12px',
  },
  progressFill: {
    height: '100%', background: 'var(--accent-primary)',
    borderRadius: '2px', transition: 'width 0.4s ease',
  },
  progressText: {
    fontFamily: 'var(--font-mono)', fontSize: '13px',
    color: 'var(--text-tertiary)', marginBottom: '32px',
  },
  analyzingItems: { display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' },
  analyzingItem: {
    fontFamily: 'var(--font-body)', fontSize: '14px', transition: 'all 0.3s ease',
  },

  // Error screen
  errorScreen: {
    position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', textAlign: 'center', gap: '16px',
  },
  errorIcon: { fontSize: '64px' },
  errorTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '28px', fontWeight: 600,
    color: 'var(--text-primary)',
  },
  errorText: {
    fontFamily: 'var(--font-body)', fontSize: '15px',
    color: 'var(--text-secondary)', maxWidth: '440px',
  },
  errorButton: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', padding: '12px 24px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
  },

  // Header
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 32px', background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(12px)',
  },
  backButton: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', padding: '8px 16px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  headerCenter: { textAlign: 'center' },
  headerTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '22px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0,
  },
  headerSubtitle: {
    fontFamily: 'var(--font-body)', fontSize: '13px',
    color: 'var(--text-secondary)', margin: 0,
  },
  newSearchButton: {
    fontFamily: 'var(--font-ui)', fontSize: '13px', padding: '8px 16px',
    border: '1px solid var(--accent-primary)', borderRadius: '4px',
    background: 'transparent', color: 'var(--accent-primary)', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  // Results layout
  resultsLayout: {
    position: 'relative', zIndex: 10,
    display: 'grid', gridTemplateColumns: '320px 1fr',
    gap: '0', maxWidth: '1400px', margin: '0 auto',
    minHeight: 'calc(100vh - 73px)',
  },

  // Critics panel (left)
  criticsPanel: {
    borderRight: '1px solid var(--border-subtle)',
    padding: '24px', overflowY: 'auto',
    maxHeight: 'calc(100vh - 73px)',
    position: 'sticky', top: '73px',
  },
  criticsPanelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '20px',
  },
  criticsPanelTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '18px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0,
  },
  criticsPanelCount: {
    fontFamily: 'var(--font-mono)', fontSize: '12px',
    color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)',
    padding: '4px 10px', borderRadius: '12px',
  },
  criticsList: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' },
  noResults: { textAlign: 'center', padding: '40px 16px' },
  noResultsIcon: { fontSize: '40px', display: 'block', marginBottom: '12px', opacity: 0.4 },
  noResultsTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '18px',
    color: 'var(--text-primary)', marginBottom: '8px',
  },
  noResultsDesc: { fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' },

  // Critic card
  criticCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', borderRadius: '4px', cursor: 'pointer',
    transition: 'all 0.2s ease', border: '1px solid transparent',
    animation: 'fadeSlideIn 0.4s ease-out forwards', opacity: 0,
  },
  criticRank: {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    color: 'var(--text-tertiary)', width: '24px', textAlign: 'center', flexShrink: 0,
  },
  criticCardInfo: { flex: 1, minWidth: 0 },
  criticCardName: {
    fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
    color: 'var(--text-primary)', display: 'block', marginBottom: '2px',
  },
  criticCardOutlet: {
    fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-tertiary)',
  },
  criticCardScore: { textAlign: 'center', flexShrink: 0 },
  criticCardScoreNum: {
    fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700,
    display: 'block', lineHeight: 1,
  },
  criticCardScoreLabel: {
    fontFamily: 'var(--font-ui)', fontSize: '9px',
    color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em',
  },

  // Detail panel (right)
  detailPanel: {
    padding: '32px', overflowY: 'auto',
    maxHeight: 'calc(100vh - 73px)',
  },
  detailHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: '16px', marginBottom: '24px', paddingBottom: '24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  detailCriticInfo: { flex: 1 },
  detailCriticName: {
    fontFamily: 'var(--font-editorial)', fontSize: '26px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0, marginBottom: '4px',
  },
  detailOutlet: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)',
  },
  detailScoreBadge: { textAlign: 'center' },
  detailScoreNumber: {
    fontFamily: 'var(--font-mono)', fontSize: '48px', fontWeight: 700,
    display: 'block', lineHeight: 1,
  },
  detailScoreLabel: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },

  // Breakdown
  breakdown: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', marginBottom: '24px',
  },
  breakdownItem: {
    padding: '16px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
  },
  breakdownTop: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '8px',
  },
  breakdownLabel: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-tertiary)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  tooltipTrigger: {
    width: '16px', height: '16px', borderRadius: '50%',
    background: 'var(--bg-tertiary)', border: 'none',
    fontFamily: 'var(--font-ui)', fontSize: '10px',
    color: 'var(--text-tertiary)', cursor: 'pointer',
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  tooltipBox: {
    position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
    width: '200px', padding: '10px 12px',
    background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
    borderRadius: '4px', fontSize: '12px', lineHeight: '1.5',
    color: 'var(--text-secondary)', zIndex: 50,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  breakdownValue: {
    fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600,
    color: 'var(--text-primary)',
  },

  // Tabs
  tabs: {
    display: 'flex', gap: '4px', marginBottom: '16px',
    borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0',
  },
  tab: {
    fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 500,
    padding: '10px 16px', border: 'none', borderBottom: '2px solid transparent',
    background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
    transition: 'all 0.2s ease', marginBottom: '-1px',
  },
  tabActive: {
    color: 'var(--accent-primary)', borderBottomColor: 'var(--accent-primary)',
  },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '4px' },

  // Selections tab
  selectionRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', background: 'var(--bg-secondary)',
    borderRadius: '4px', border: '1px solid var(--border-subtle)',
  },
  selectionTitle: {
    flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px',
    color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  reviewScoreLink: {
    fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700,
    textDecoration: 'none', cursor: 'pointer', flexShrink: 0,
  },
  noReviewBadge: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', padding: '3px 8px',
    background: 'var(--bg-tertiary)', borderRadius: '10px',
    color: 'var(--text-tertiary)', flexShrink: 0,
  },

  // All reviews tab
  sortRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '12px',
  },
  sortLabel: {
    fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-tertiary)',
  },
  sortSelect: {
    fontFamily: 'var(--font-ui)', fontSize: '12px', padding: '4px 8px',
    border: '1px solid var(--border-subtle)', borderRadius: '4px',
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
  },
  reviewRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px', background: 'var(--bg-secondary)',
    borderRadius: '4px', textDecoration: 'none',
    transition: 'background 0.15s ease',
  },
  reviewRowRank: {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    color: 'var(--text-tertiary)', width: '28px', flexShrink: 0,
  },
  reviewRowTitle: {
    flex: 1, fontFamily: 'var(--font-body)', fontSize: '13px',
    color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  reviewRowScore: {
    fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, flexShrink: 0,
  },
  reviewsLoading: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '24px',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px',
  },
  smallSpinner: {
    width: '20px', height: '20px', flexShrink: 0,
    border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)',
    borderRadius: '50%', animation: 'spin 0.6s linear infinite',
  },
  noReviewsText: {
    fontFamily: 'var(--font-body)', fontSize: '14px',
    color: 'var(--text-tertiary)', padding: '24px', textAlign: 'center',
  },

  // Latest Reviews tab
  latestReviewRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', padding: '10px 12px',
    background: 'var(--bg-secondary)', borderRadius: '4px',
    textDecoration: 'none', transition: 'background 0.15s ease',
    marginBottom: '4px',
  },
  latestReviewLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  latestReviewInfo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  latestReviewTitle: {
    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
    color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  latestReviewDate: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px',
  },
  latestReviewRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  latestReviewLink: {
    fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--accent-primary)',
    whiteSpace: 'nowrap',
  },

  // Similar Games Panel
  similarGamesPanel: {
    marginTop: '32px',
    paddingTop: '28px',
    borderTop: '1px solid var(--border-subtle)',
  },
  similarGamesHeader: { marginBottom: '16px' },
  similarGamesTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '18px', fontWeight: 600,
    color: 'var(--text-primary)', margin: '0 0 4px 0',
  },
  similarGamesSubtitle: {
    fontFamily: 'var(--font-body)', fontSize: '13px',
    color: 'var(--text-secondary)', margin: 0,
  },
  similarGamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '12px',
  },
  similarGameCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
    borderRadius: '6px', overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  similarGamePoster: {
    position: 'relative', aspectRatio: '2/3',
    background: 'var(--bg-tertiary)', overflow: 'hidden',
  },
  similarGamePosterImg: { width: '100%', height: '100%', objectFit: 'cover' },
  similarGamePosterPlaceholder: {
    width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', opacity: 0.2,
  },
  similarGameRank: {
    position: 'absolute', top: '6px', left: '6px',
    background: 'rgba(0,0,0,0.8)', color: 'white',
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
    padding: '3px 7px', borderRadius: '3px',
  },
  similarGameInfo: { padding: '8px' },
  similarGameTitle: {
    fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-primary)', display: 'block', marginBottom: '4px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  similarGameMeta: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-ui)', fontSize: '11px', marginBottom: '4px',
  },
  similarGameYear: { color: 'var(--text-tertiary)' },
  similarGameScore: { fontFamily: 'var(--font-mono)', fontWeight: 600 },
  similarGameGenres: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  similarGameGenreTag: {
    fontFamily: 'var(--font-ui)', fontSize: '10px', padding: '2px 6px',
    background: 'var(--bg-tertiary)', borderRadius: '3px',
    color: 'var(--text-secondary)',
  },

  // ============================================
  // RECOMMENDATIONS STYLES
  // ============================================

  // Tabs row (Movies | Series)
  recTabsRow: {
    display: 'flex', gap: '8px', padding: '16px 32px',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'relative', zIndex: 10,
  },
  recTab: {
    fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500,
    padding: '8px 20px', border: '1px solid var(--border-subtle)',
    borderRadius: '4px', background: 'transparent',
    color: 'var(--text-secondary)', cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  recTabActive: {
    background: 'var(--accent-primary)', color: 'white',
    borderColor: 'var(--accent-primary)',
  },

  // Two-column layout: sidebar + grid
  recLayout: {
    position: 'relative', zIndex: 10,
    display: 'grid', gridTemplateColumns: '260px 1fr',
    minHeight: 'calc(100vh - 73px)',
  },

  // Selections sidebar
  selectionsSidebar: {
    borderRight: '1px solid var(--border-subtle)',
    padding: '24px 20px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 73px)',
    position: 'sticky', top: '73px',
    background: 'var(--bg-secondary)',
  },
  sidebarTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '15px', fontWeight: 600,
    color: 'var(--text-primary)', margin: '0 0 16px 0',
    paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  sidebarList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sidebarItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px', borderRadius: '4px',
    background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)',
  },
  sidebarPoster: {
    width: '40px', height: '56px', flexShrink: 0,
    borderRadius: '3px', overflow: 'hidden',
    background: 'var(--bg-tertiary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sidebarPosterImg: { width: '100%', height: '100%', objectFit: 'cover' },
  sidebarPosterIcon: { fontSize: '20px', opacity: 0.5 },
  sidebarItemInfo: { flex: 1, minWidth: 0 },
  sidebarItemTitle: {
    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
    color: 'var(--text-primary)', display: 'block',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginBottom: '4px',
  },
  sidebarItemMeta: {
    fontFamily: 'var(--font-ui)', fontSize: '11px',
    color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
  },

  recommendationsMain: {
    position: 'relative', zIndex: 10,
    padding: '32px 24px',
  },
  recommendationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  recommendationCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    overflow: 'visible', // tooltip'in kart dışına taşmasına izin ver
    transition: 'all 0.3s ease',
    animation: 'fadeSlideUp 0.5s ease-out forwards',
    opacity: 0,
  },
  recPosterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
    background: 'var(--bg-tertiary)',
    overflow: 'hidden', // posteri kliple, tooltip rank badge'dan dışarı taşar
    borderRadius: '8px 8px 0 0',
  },
  recPosterImg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
  },
  recPoster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recPosterPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
    opacity: 0.2,
  },
  recRankBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(0,0,0,0.85)',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '4px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 700,
    zIndex: 5,
  },
  recTooltip: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '220px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    padding: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: 50,
    pointerEvents: 'none',
  },
  recTooltipSignal: {
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--accent-primary)',
    marginBottom: '6px',
  },
  recTooltipDetail: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  recTooltipBased: {
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid var(--border-subtle)',
  },
  recInfo: {
    padding: '12px',
  },
  recTitle: {
    fontFamily: 'var(--font-editorial)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '6px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  recMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-ui)',
    fontSize: '13px',
    marginBottom: '12px',
  },
  recYear: {
    color: 'var(--text-tertiary)',
  },
  recMetaDivider: {
    color: 'var(--text-tertiary)',
    opacity: 0.5,
  },
  recRating: {
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
  },
  recGenres: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  recGenreTag: {
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    padding: '4px 10px',
    background: 'var(--bg-tertiary)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  recOverview: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  // More recommendations
  moreRecommendations: {
    marginTop: '48px',
  },
  moreTitle: {
    fontFamily: 'var(--font-editorial)',
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '24px',
  },
  moreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
  },
  miniRecCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  miniRecPoster: {
    position: 'relative',
    aspectRatio: '2/3',
    background: 'var(--bg-tertiary)',
  },
  miniRecPosterImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  miniRecPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    opacity: 0.2,
  },
  miniRecInfo: {
    padding: '12px',
  },
  miniRecTitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '4px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  miniRecMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'var(--font-ui)',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },

  // Game Recommendations Section (2-col)
  gameRecsSection: {
    marginTop: '32px', paddingTop: '28px',
    borderTop: '1px solid var(--border-subtle)',
  },
  gameRecsTwoCol: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
  },
  gameRecsCol: {},
  gameRecsColHeader: { marginBottom: '12px' },
  gameRecsColTitle: {
    fontFamily: 'var(--font-editorial)', fontSize: '16px', fontWeight: 600,
    color: 'var(--text-primary)', margin: '0 0 4px 0',
  },
  gameRecsColSubtitle: {
    fontFamily: 'var(--font-body)', fontSize: '12px',
    color: 'var(--text-secondary)', margin: 0,
  },
  gameRecsEmpty: {
    padding: '24px', textAlign: 'center',
    background: 'var(--bg-secondary)', borderRadius: '6px',
    border: '1px solid var(--border-subtle)',
  },
  itadDealsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  itadDealRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: '6px',
  },
  itadDealPoster: {
    width: '36px', height: '50px', flexShrink: 0,
    borderRadius: '3px', overflow: 'hidden',
    background: 'var(--bg-tertiary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  itadDealPosterImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itadDealInfo: { flex: 1, minWidth: 0 },
  itadDealTitle: {
    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
    color: 'var(--text-primary)', display: 'block',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    marginBottom: '2px',
  },
  itadDealStore: {
    fontFamily: 'var(--font-ui)', fontSize: '11px',
    color: 'var(--text-tertiary)', display: 'block',
  },
  itadDealPrice: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    gap: '2px', flexShrink: 0,
  },
  itadDealRegular: {
    fontFamily: 'var(--font-mono)', fontSize: '11px',
    color: 'var(--text-tertiary)', textDecoration: 'line-through',
  },
  itadDealCurrent: {
    fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700,
    color: 'var(--accent-primary)', textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  itadDealDiscount: {
    fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 700,
    background: 'var(--accent-primary)', color: 'white',
    padding: '1px 5px', borderRadius: '3px',
  },
  itadDealLink: {
    fontFamily: 'var(--font-ui)', fontSize: '12px',
    color: 'var(--accent-primary)', textDecoration: 'none',
  },
};

const animationStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .critic-card-anim { animation: fadeSlideIn 0.35s ease-out forwards; opacity: 0; }
  .recommendation-card-anim { animation: fadeSlideUp 0.5s ease-out forwards; opacity: 0; }

  @media (max-width: 900px) {
    .resultsLayout { grid-template-columns: 1fr !important; }
    .criticsPanel { position: static !important; max-height: 320px; border-right: none; border-bottom: 1px solid var(--border-subtle); }
    .detailPanel { max-height: none; }
  }

  @media (max-width: 900px) {
    .recLayout { grid-template-columns: 1fr !important; }
    .selectionsSidebar { display: none !important; }
  }
  @media (max-width: 768px) {
    .recommendationsGrid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
    .moreGrid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important; }
  }
`;
