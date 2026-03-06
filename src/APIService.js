// ============================================
// API CACHE - localStorage tabanlı, TTL destekli
// ============================================

const CACHE_KEYS = {
  GAME_REVIEWS: 'cm_reviews_',
  POPULAR: 'cm_popular_',
  CRITIC_REVIEWS: 'cm_critic_',
};

const TTL = {
  GAME_REVIEWS: 7 * 24 * 60 * 60 * 1000,
  POPULAR: 7 * 24 * 60 * 60 * 1000,
  CRITIC_REVIEWS: 7 * 24 * 60 * 60 * 1000,
};

// Cache version bump: OpenCritic image URL düzeltmesi
// v5: logo.og öncelikli, undefined path'leri filtreli
(function cleanStaleCache() {
  try {
    const CACHE_VERSION = 'cm_cache_clean_v5';
    if (localStorage.getItem(CACHE_VERSION)) return;

    // Tüm eski popular + sgdb cache'leri temizle
    Object.keys(localStorage)
      .filter(k => k.startsWith('cm_popular_') || k.startsWith('sgdb_'))
      .forEach(k => localStorage.removeItem(k));

    localStorage.setItem(CACHE_VERSION, '1');
  } catch {}
})();

export const Cache = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, expires } = JSON.parse(raw);
      if (Date.now() > expires) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set(key, data, ttl) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        expires: Date.now() + ttl,
      }));
    } catch (e) {
      console.warn('Cache write failed:', e.message);
    }
  },

  clear(prefix) {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix || 'cm_'))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  },

  stats() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cm_'));
    const bytes = keys.reduce((sum, k) => sum + (localStorage.getItem(k) || '').length * 2, 0);
    return { entries: keys.length, kb: Math.round(bytes / 1024) };
  },
};

// ============================================
// API CONFIG
// ============================================

const API_CONFIG = {
  TMDB_API_KEY: process.env.REACT_APP_TMDB_API_KEY || '',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',

  OPENCRITIC_API_KEY: process.env.REACT_APP_OPENCRITIC_API_KEY || '',
  OPENCRITIC_BASE_URL: 'https://opencritic-api.p.rapidapi.com',

  // OpenCritic CDN - browser'dan direkt erişilebilir, CORS yok
  // images.box.og path'ini bu base'e ekle
  OPENCRITIC_CDN: 'https://img.opencritic.com/',

  // IsThereAnyDeal
  ITAD_API_KEY: process.env.REACT_APP_ITAD_API_KEY || '',
  ITAD_BASE_URL: 'https://api.isthereanydeal.com',
};

const GENRE_NAMES = {
  movies: {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
    10752: 'War', 37: 'Western',
  },
  series: {
    10759: 'Action', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
    99: 'Documentary', 18: 'Drama', 10751: 'Family', 10762: 'Kids',
    9648: 'Mystery', 10765: 'Sci-Fi', 10766: 'Soap', 37: 'Western',
  },
};

// ============================================
// TMDB SERVICE
// ============================================

export const TMDBService = {
  async request(endpoint, params = {}) {
    const url = new URL(`${API_CONFIG.TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_CONFIG.TMDB_API_KEY);
    url.searchParams.append('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  },

  getPosterUrl(path, size = 'w342') {
    return path ? `${API_CONFIG.TMDB_IMAGE_BASE}/${size}${path}` : null;
  },

  getGenreNames(ids, type = 'movies') {
    const map = GENRE_NAMES[type] || {};
    return (ids || []).map(id => map[id]).filter(Boolean);
  },

  formatMovies(results) {
    return results.map(m => ({
      id: `tmdb_movie_${m.id}`,
      externalId: m.id,
      title: m.title,
      type: 'movie',
      year: m.release_date?.split('-')[0] || 'N/A',
      poster: this.getPosterUrl(m.poster_path),
      rating: m.vote_average ? Math.round(m.vote_average * 10) : null,
      voteCount: m.vote_count || 0,
      overview: m.overview,
      genres: this.getGenreNames(m.genre_ids, 'movies'),
      source: 'tmdb',
    }));
  },

  formatTV(results) {
    return results.map(t => ({
      id: `tmdb_tv_${t.id}`,
      externalId: t.id,
      title: t.name,
      type: 'series',
      year: t.first_air_date?.split('-')[0] || 'N/A',
      poster: this.getPosterUrl(t.poster_path),
      rating: t.vote_average ? Math.round(t.vote_average * 10) : null,
      voteCount: t.vote_count || 0,
      overview: t.overview,
      genres: this.getGenreNames(t.genre_ids, 'series'),
      source: 'tmdb',
    }));
  },

  async getPopularMovies() {
    const data = await this.request('/movie/popular');
    return this.formatMovies(data.results || []);
  },

  async getPopularTV() {
    const data = await this.request('/tv/popular');
    return this.formatTV(data.results || []);
  },

  async searchMovies(query) {
    const data = await this.request('/search/movie', { query });
    return this.formatMovies(data.results || []);
  },

  async searchTV(query) {
    const data = await this.request('/search/tv', { query });
    return this.formatTV(data.results || []);
  },

  async discoverMovies(filters = {}) {
    const data = await this.request('/discover/movie', {
      sort_by: 'popularity.desc',
      'primary_release_date.gte': filters.yearFrom ? `${filters.yearFrom}-01-01` : undefined,
      'primary_release_date.lte': filters.yearTo   ? `${filters.yearTo}-12-31`   : undefined,
      with_genres: filters.genre || undefined,
    });
    return this.formatMovies(data.results || []);
  },

  async discoverTV(filters = {}) {
    const data = await this.request('/discover/tv', {
      sort_by: 'popularity.desc',
      'first_air_date.gte': filters.yearFrom ? `${filters.yearFrom}-01-01` : undefined,
      'first_air_date.lte': filters.yearTo   ? `${filters.yearTo}-12-31`   : undefined,
      with_genres: filters.genre || undefined,
    });
    return this.formatTV(data.results || []);
  },

  async getSimilarContent(selections, type = 'movie') {
    const recommendations = new Map();
    const maxItems = Math.min(selections.length, 5);

    const allKeywordIds = new Set();
    const allGenreIds = new Set();
    const allCastIds = [];

    for (let i = 0; i < maxItems; i++) {
      const item = selections[i];
      const baseEndpoint = type === 'movie' ? `/movie/${item.externalId}` : `/tv/${item.externalId}`;

      const [keywordsData, creditsData] = await Promise.allSettled([
        this.request(`${baseEndpoint}/keywords`),
        this.request(`${baseEndpoint}/credits`),
      ]);

      if (keywordsData.status === 'fulfilled') {
        const kws = keywordsData.value?.keywords || keywordsData.value?.results || [];
        kws.slice(0, 5).forEach(kw => allKeywordIds.add(kw.id));
      }

      try {
        const detail = await this.request(baseEndpoint);
        (detail.genres || []).map(g => g.id).forEach(id => allGenreIds.add(id));
      } catch {}

      if (creditsData.status === 'fulfilled') {
        (creditsData.value?.cast || []).slice(0, 3).forEach(a => allCastIds.push(a.id));
      }

      for (const endpoint of [`${baseEndpoint}/similar`, `${baseEndpoint}/recommendations`]) {
        try {
          const data = await this.request(endpoint);
          const formatted = type === 'movie'
            ? this.formatMovies(data.results || [])
            : this.formatTV(data.results || []);

          formatted.forEach(rec => {
            if (selections.some(s => s.externalId === rec.externalId)) return;
            if (recommendations.has(rec.id)) {
              const existing = recommendations.get(rec.id);
              existing.overlapScore += 2;
              if (!existing.basedOn.includes(item.title)) existing.basedOn.push(item.title);
            } else {
              recommendations.set(rec.id, { ...rec, overlapScore: 2, basedOn: [item.title] });
            }
          });
        } catch (err) {
          console.warn(`Similar/rec fetch error (${endpoint}):`, err.message);
        }
      }
    }

    if (allKeywordIds.size > 0 || allGenreIds.size > 0) {
      try {
        const discoverEndpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
        const discoverData = await this.request(discoverEndpoint, {
          sort_by: 'popularity.desc',
          with_keywords: Array.from(allKeywordIds).slice(0, 5).join('|') || undefined,
          with_genres: Array.from(allGenreIds).slice(0, 3).join(',') || undefined,
          'vote_average.gte': 6.5,
          'vote_count.gte': 100,
        });
        const formatted = type === 'movie'
          ? this.formatMovies(discoverData.results || [])
          : this.formatTV(discoverData.results || []);

        formatted.forEach(rec => {
          if (selections.some(s => s.externalId === rec.externalId)) return;
          if (recommendations.has(rec.id)) {
            recommendations.get(rec.id).overlapScore += 1;
          } else {
            recommendations.set(rec.id, { ...rec, overlapScore: 1, basedOn: [] });
          }
        });
      } catch (err) {
        console.warn('Discover fetch error:', err.message);
      }
    }

    if (allCastIds.length > 0) {
      try {
        const castFreq = {};
        allCastIds.forEach(id => { castFreq[id] = (castFreq[id] || 0) + 1; });
        const topCast = Object.entries(castFreq)
          .sort(([,a],[,b]) => b - a).slice(0, 2).map(([id]) => id);

        if (topCast.length > 0) {
          const discoverEndpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
          const castData = await this.request(discoverEndpoint, {
            sort_by: 'popularity.desc',
            with_cast: topCast.join(','),
            'vote_average.gte': 6.0,
          });
          const formatted = type === 'movie'
            ? this.formatMovies(castData.results || [])
            : this.formatTV(castData.results || []);

          formatted.forEach(rec => {
            if (selections.some(s => s.externalId === rec.externalId)) return;
            if (recommendations.has(rec.id)) {
              recommendations.get(rec.id).overlapScore += 1;
            } else {
              recommendations.set(rec.id, { ...rec, overlapScore: 1, basedOn: [] });
            }
          });
        }
      } catch (err) {
        console.warn('Cast discover error:', err.message);
      }
    }

    for (const [, rec] of recommendations) {
      const reasons = [];
      if (rec.basedOn?.length > 0) reasons.push(`Similar to: ${rec.basedOn.slice(0, 2).join(', ')}`);
      if (rec.overlapScore >= 4) reasons.push('Strong match across multiple titles');
      else if (rec.overlapScore >= 2) reasons.push('Appears in similar & recommended lists');
      else reasons.push('Matches your taste in genre/themes');
      rec.matchReasons = reasons;
    }

    return Array.from(recommendations.values())
      .sort((a, b) => ((b.overlapScore * 12) + (b.rating || 0)) - ((a.overlapScore * 12) + (a.rating || 0)))
      .slice(0, 24)
      .map((rec, idx) => ({ ...rec, rank: idx + 1 }));
  },
};

// ============================================
// OPENCRITIC SERVICE
// Görseller: OpenCritic'in kendi CDN'i (img.opencritic.com)
// Browser'dan doğrudan erişilebilir, CORS sorunu yok
// images.box.og  → kutu kapak (portrait, en iyi kalite)
// images.box.sm  → küçük kutu kapak (fallback)
// ============================================

export const OpenCriticService = {
  async request(endpoint, params = {}) {
    const url = new URL(`${API_CONFIG.OPENCRITIC_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_CONFIG.OPENCRITIC_API_KEY,
        'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com',
      },
    });
    if (!res.ok) throw new Error(`OpenCritic ${res.status}`);
    return res.json();
  },

  // OpenCritic images objesinden poster URL'si üret
  // ÖNEMLİ: API'den gelen image path'leri 'game/undefined/...' olabilir — bunları atla!
  // Güvenilir path'ler: game/{numericId}/... içerenler
  // Öncelik: logo.og (ID'li) > box.og > box.sm > banner.og
  getPosterUrl(images) {
    if (!images) return null;
    const candidates = [
      images.logo?.og,
      images.box?.og,
      images.box?.sm,
      images.banner?.og,
      images.masthead?.og,
    ];
    for (const path of candidates) {
      // 'game/undefined/...' içeriyorsa güvenilir değil, atla
      if (path && !path.includes('undefined')) {
        return `${API_CONFIG.OPENCRITIC_CDN}${path}`;
      }
    }
    return null;
  },

  // Ham API verisini formatla
  // Hall-of-fame ve /game/{id} zaten tüm field'ları döndürür
  formatGames(results) {
    return results.map(g => {
      const rawScore = g.topCriticScore ?? g.medianScore ?? g.averageScore ?? null;
      const rating = rawScore != null && rawScore > 0 ? Math.round(rawScore) : null;

      let year = 'N/A';
      if (g.firstReleaseDate) {
        const parsed = new Date(g.firstReleaseDate);
        if (!isNaN(parsed.getFullYear())) year = String(parsed.getFullYear());
      }

      const genres = (g.Genres || g.genres || [])
        .map(x => typeof x === 'string' ? x : (x.name || ''))
        .filter(Boolean);

      const platforms = (g.Platforms || g.platforms || [])
        .map(p => p.shortName || p.name || '')
        .filter(Boolean);

      return {
        id: `oc_${g.id}`,
        externalId: g.id,
        title: g.name,
        type: 'game',
        year,
        poster: this.getPosterUrl(g.images), // OpenCritic CDN
        rating,
        numReviews: g.numReviews || 0,
        percentRecommended: g.percentRecommended ?? null,
        genres,
        platforms,
        source: 'opencritic',
      };
    });
  },

  // /game/search sadece {id, name, dist} döndürür — detay yok
  // Detaylı bilgi (score, genres, images) için /game/{id} çağırıyoruz
  // Concurrency: 3 paralel istek
  async enrichGamesWithDetails(games) {
    const CONCURRENCY = 3;
    const enriched = games.map(g => ({ ...g }));

    for (let i = 0; i < games.length; i += CONCURRENCY) {
      const batch = games.slice(i, i + CONCURRENCY);
      const details = await Promise.allSettled(
        batch.map(g => this.request(`/game/${g.externalId}`))
      );
      details.forEach((result, idx) => {
        if (result.status !== 'fulfilled') return;
        const d = result.value;
        const g = enriched[i + idx];

        // Score
        const rawScore = d.topCriticScore ?? d.medianScore ?? d.averageScore ?? null;
        if (rawScore != null && rawScore > 0) g.rating = Math.round(rawScore);

        // Reviews
        if (d.numReviews) g.numReviews = d.numReviews;
        if (d.percentRecommended != null) g.percentRecommended = d.percentRecommended;

        // Genres
        const genres = (d.Genres || []).map(x => x.name || '').filter(Boolean);
        if (genres.length > 0) g.genres = genres;

        // Platforms
        const platforms = (d.Platforms || []).map(p => p.shortName || p.name || '').filter(Boolean);
        if (platforms.length > 0) g.platforms = platforms;

        // Year
        if (d.firstReleaseDate && g.year === 'N/A') {
          const parsed = new Date(d.firstReleaseDate);
          if (!isNaN(parsed.getFullYear())) g.year = String(parsed.getFullYear());
        }

        // Poster: OpenCritic CDN'den al
        const posterUrl = this.getPosterUrl(d.images);
        if (posterUrl) g.poster = posterUrl;
      });
    }
    return enriched;
  },

  // Hall-of-fame: tam veri geliyor, enrich gerekebilir (poster + eksik field'lar için)
  async getPopularGames() {
    const data = await this.request('/game/hall-of-fame');
    const games = this.formatGames(data || []);

    // Poster veya rating eksikse enrich et
    const needsDetail = games.filter(g => !g.poster || g.rating === null || g.genres.length === 0);
    if (needsDetail.length === 0) return games;

    const enriched = await this.enrichGamesWithDetails(needsDetail);
    const enrichMap = {};
    enriched.forEach(g => { enrichMap[g.id] = g; });
    return games.map(g => enrichMap[g.id] || g);
  },

  // Search: sadece {id, name, dist} döndürür → enrich zorunlu
  async searchGames(query) {
    const raw = await this.request('/game/search', { criteria: query });
    const minimal = this.formatGames(raw || []);
    // Tümünü enrich et (score + genre + poster için)
    return this.enrichGamesWithDetails(minimal);
  },

  // -----------------------------------------------
  // getGameReviews: Cache'li + limit
  // -----------------------------------------------
  async getGameReviews(gameId, limit = 75) {
    const cacheKey = CACHE_KEYS.GAME_REVIEWS + gameId;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.request(`/reviews/game/${gameId}`, {
      sort: 'score',
      order: 'desc',
    });

    const reviews = (data || []).slice(0, limit).map(r => ({
      id: r.id,
      score: r.score,
      snippet: r.snippet,
      reviewUrl: r.externalUrl,
      publishedDate: r.publishedDate,
      criticId: r.Authors?.[0]?.id || null,
      criticName: r.Authors?.[0]?.name || 'Unknown',
      outletId: r.Outlet?.id,
      outletName: r.Outlet?.name || 'Unknown',
    }));

    Cache.set(cacheKey, reviews, TTL.GAME_REVIEWS);
    return reviews;
  },

  // -----------------------------------------------
  // getCriticLatestReviews: En son 15 inceleme (tarih sırası)
  // OpenCritic API: /critic/{id}/reviews endpoint'i kullanır
  // -----------------------------------------------
  async getCriticLatestReviews(criticId, limit = 15) {
    const cacheKey = CACHE_KEYS.CRITIC_REVIEWS + 'latest_' + criticId;
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    // OpenCritic doğru endpoint: /critic/{id}/reviews
    const data = await this.request(`/critic/${criticId}/reviews`, {
      sort: 'date',
      order: 'desc',
    });

    const reviews = (data || []).slice(0, limit).map(r => ({
      id: r.id,
      gameId: r.Game?.id,
      gameTitle: r.Game?.name || r.game?.name || 'Unknown',
      score: r.score ?? r.externalScore ?? null,
      reviewUrl: r.externalUrl || r.url,
      publishedDate: r.publishedDate || r.date,
      outletName: r.Outlet?.name || r.outlet?.name || 'Unknown',
    }));

    Cache.set(cacheKey, reviews, TTL.CRITIC_REVIEWS);
    return reviews;
  },

  // -----------------------------------------------
  // getSimilarGames: Seçilen oyunların genre'larına göre benzer oyunlar öner
  // Strateji: /game?sort=score&order=desc ile top oyunları çek,
  // seçilen oyunların genre ID'leriyle kesişimi hesapla, overlap'e göre sırala
  // -----------------------------------------------
  async getSimilarGames(selections) {
    if (!selections || selections.length === 0) return [];

    // Seçilen oyunların tüm genre'larını ve platform'larını topla
    const selectionIds = new Set(selections.map(s => s.externalId));
    const genreFreq = {};    // genreId → kaç seçimde geçiyor
    const genreNames = {};   // genreId → name
    const platformFreq = {}; // platform shortName → frekans

    // Her seçim için detay çek (genres garantili)
    const detailResults = await Promise.allSettled(
      selections.map(s => this.request(`/game/${s.externalId}`))
    );

    detailResults.forEach(r => {
      if (r.status !== 'fulfilled') return;
      const d = r.value;
      (d.Genres || []).forEach(g => {
        genreFreq[g.id] = (genreFreq[g.id] || 0) + 1;
        genreNames[g.id] = g.name;
      });
      (d.Platforms || []).forEach(p => {
        const name = p.shortName || p.name || '';
        if (name) platformFreq[name] = (platformFreq[name] || 0) + 1;
      });
    });

    // En sık geçen genre'ları al (en fazla 3)
    const topGenreIds = Object.entries(genreFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    if (topGenreIds.length === 0) {
      // Genre yoksa (yeni oyunlar) genel top-rated listesi döndür
      const fallback = await this.request('/game', { sort: 'score', order: 'desc', skip: 0, take: 20 });
      const formatted = this.formatGames(fallback || []);
      return formatted
        .filter(g => !selectionIds.has(g.externalId))
        .slice(0, 12)
        .map((g, i) => ({ ...g, similarityScore: 50, basedOn: [] }));
    }

    // Genre listesiyle top oyunları çek
    const genreParam = topGenreIds.join(',');
    const [byGenre, topRated] = await Promise.allSettled([
      this.request('/game', { sort: 'score', order: 'desc', skip: 0, take: 40, genres: genreParam }),
      this.request('/game', { sort: 'score', order: 'desc', skip: 0, take: 20 }),
    ]);

    const candidates = new Map();

    // Genre-matched oyunlar: her oyunun genre overlap'ini hesapla
    const genreGames = byGenre.status === 'fulfilled' ? (byGenre.value || []) : [];
    genreGames.forEach(g => {
      if (selectionIds.has(g.id)) return;
      const gameGenreIds = (g.Genres || []).map(x => x.id);
      const overlap = gameGenreIds.filter(id => topGenreIds.includes(String(id)) || topGenreIds.includes(id)).length;
      const basedOn = gameGenreIds
        .filter(id => genreNames[id])
        .map(id => genreNames[id]);

      if (!candidates.has(g.id)) {
        candidates.set(g.id, {
          ...g,
          _overlapScore: overlap * 2 + (g.topCriticScore || 0) / 100,
          _basedOn: basedOn,
        });
      }
    });

    // Top-rated oyunları da ekle (düşük ağırlıkla)
    const topGames = topRated.status === 'fulfilled' ? (topRated.value || []) : [];
    topGames.forEach(g => {
      if (selectionIds.has(g.id) || candidates.has(g.id)) return;
      candidates.set(g.id, {
        ...g,
        _overlapScore: 0.5 + (g.topCriticScore || 0) / 100,
        _basedOn: [],
      });
    });

    // Sırala ve formatla
    const sorted = Array.from(candidates.values())
      .sort((a, b) => b._overlapScore - a._overlapScore)
      .slice(0, 18);

    const formatted = this.formatGames(sorted);

    // Poster eksikse enrich et (sadece poster için, score zaten var)
    const needsPoster = formatted.filter(g => !g.poster);
    let enriched = formatted;
    if (needsPoster.length > 0) {
      const posterResults = await this.enrichGamesWithDetails(needsPoster);
      const posterMap = {};
      posterResults.forEach(g => { posterMap[g.id] = g; });
      enriched = formatted.map(g => posterMap[g.id] || g);
    }

    return enriched.map((g, i) => ({
      ...g,
      similarityScore: sorted[i]?._overlapScore || 0,
      basedOn: (sorted[i]?._basedOn || []).slice(0, 3),
      rank: i + 1,
    }));
  },
};

// ============================================
// UNIFIED API SERVICE (Cache'li popular)
// ============================================

export const APIService = {
  async getPopularContent(category) {
    const cacheKey = CACHE_KEYS.POPULAR + category;
    const cached = Cache.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] popular: ${category}`);
      return cached;
    }

    let data;
    switch (category) {
      case 'games':   data = await OpenCriticService.getPopularGames(); break;
      case 'movies':  data = await TMDBService.getPopularMovies(); break;
      case 'series':  data = await TMDBService.getPopularTV(); break;
      default: throw new Error(`Unknown category: ${category}`);
    }

    Cache.set(cacheKey, data, TTL.POPULAR);
    return data;
  },

  async searchContent(category, query, filters = {}) {
    const hasFilters = filters.yearFrom || filters.yearTo || filters.genre;
    switch (category) {
      case 'games':   return OpenCriticService.searchGames(query);
      case 'movies':  return hasFilters
        ? TMDBService.discoverMovies(filters)
        : TMDBService.searchMovies(query);
      case 'series':  return hasFilters
        ? TMDBService.discoverTV(filters)
        : TMDBService.searchTV(query);
      default: throw new Error(`Unknown category: ${category}`);
    }
  },
};

export class APIError extends Error {
  constructor(message, status, source) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.source = source;
  }
}

// ============================================
// ISTHEREANYDEAL SERVICE
// Benzer oyun önerileri + fiyat bilgisi
// API docs: https://docs.isthereanydeal.com
// ============================================

export const ITADService = {
  get apiKey() {
    return API_CONFIG.ITAD_API_KEY;
  },

  async request(endpoint, params = {}, method = 'GET', body = null) {
    const key = this.apiKey;
    if (!key) throw new Error('ITAD_NO_KEY');

    const url = new URL(`${API_CONFIG.ITAD_BASE_URL}${endpoint}`);
    url.searchParams.append('key', key);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });

    const opts = { method };
    if (body) {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), opts);
    if (!res.ok) throw new Error(`ITAD ${res.status}`);
    return res.json();
  },

  // Oyun adından ITAD ID'si (slug) al
  async lookupGame(title) {
    try {
      const data = await this.request('/games/search/v1', { title, results: 1 });
      return data?.[0] || null;
    } catch {
      return null;
    }
  },

  // Bir oyunun benzerlerini öner (ITAD 'similar' endpoint)
  // ITAD'da direkt "similar" endpoint yok; bunun yerine:
  // 1. Oyunun ITAD ID'sini bul
  // 2. /games/storeinfo/v2 ile detay çek (tags/genres)
  // 3. Aynı tag'lere sahip oyunları öner (search ile)
  async getSimilarDeals(selections) {
    if (!selections || selections.length === 0) return [];
    if (!this.apiKey) return [];

    const CACHE_KEY = 'itad_similar_' + selections.map(s => s.externalId).join('_');
    const cached = Cache.get(CACHE_KEY);
    if (cached) return cached;

    try {
      // Her seçim için ITAD oyun ID'sini bul
      const lookupResults = await Promise.allSettled(
        selections.slice(0, 5).map(s => this.lookupGame(s.title))
      );

      const itadGames = lookupResults
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      if (itadGames.length === 0) return [];

      // Her oyun için detay + fiyat bilgisi çek
      const gameIds = itadGames.map(g => g.id).filter(Boolean);
      if (gameIds.length === 0) return [];

      // Fiyat bilgisi al (POST endpoint)
      const priceData = await this.request('/games/prices/v3', { country: 'TR', shops: 'steam' }, 'POST', gameIds);

      const results = [];
      if (Array.isArray(priceData)) {
        priceData.forEach((item, idx) => {
          const game = itadGames[idx];
          if (!game) return;

          const shops = item?.deals || [];
          const bestDeal = shops.reduce((best, deal) => {
            if (!best) return deal;
            return (deal.price?.amount || 999) < (best.price?.amount || 999) ? deal : best;
          }, null);

          results.push({
            id: game.id,
            title: game.title,
            slug: game.slug,
            poster: null, // ITAD poster yok, sonra Steam'den çekeceğiz
            url: `https://isthereanydeal.com/game/${game.slug}/info/`,
            currentPrice: bestDeal?.price?.amount ?? null,
            currency: bestDeal?.price?.currency ?? 'USD',
            storeName: bestDeal?.shop?.name ?? null,
            storeUrl: bestDeal?.url ?? null,
            regularPrice: bestDeal?.regular?.amount ?? null,
            discount: bestDeal?.cut ?? null,
            type: 'deal',
          });
        });
      }

      Cache.set(CACHE_KEY, results, 60 * 60 * 1000); // 1 saatlik cache
      return results;
    } catch (err) {
      console.warn('[ITAD] getSimilarDeals error:', err.message);
      return [];
    }
  },

  // Seçilen oyunların ITAD fiyatlarını getir (yan panel için)
  // Şu anki en iyi fiyat + indirim oranını göster
  async getDealsForGames(selections) {
    if (!selections || selections.length === 0) return [];
    if (!this.apiKey) return [];

    const CACHE_KEY = 'itad_deals_' + selections.map(s => s.externalId).join('_');
    const cached = Cache.get(CACHE_KEY);
    if (cached) return cached;

    try {
      // Her oyun için ITAD'da ara
      const lookupResults = await Promise.allSettled(
        selections.slice(0, 5).map(s => this.lookupGame(s.title))
      );

      const matched = [];
      lookupResults.forEach((r, idx) => {
        if (r.status === 'fulfilled' && r.value) {
          matched.push({ selection: selections[idx], itad: r.value });
        }
      });

      if (matched.length === 0) return [];

      const gameIds = matched.map(m => m.itad.id);
      const priceData = await this.request('/games/prices/v3', { country: 'TR', shops: 'steam' }, 'POST', gameIds);

      const results = [];
      if (Array.isArray(priceData)) {
        priceData.forEach((item, idx) => {
          const { selection, itad } = matched[idx] || {};
          if (!selection) return;

          const deals = item?.deals || [];
          const bestDeal = deals[0] || null;

          results.push({
            id: itad.id,
            selectionId: selection.id,
            title: selection.title,
            poster: selection.poster,
            slug: itad.slug,
            url: `https://isthereanydeal.com/game/${itad.slug}/info/`,
            currentPrice: bestDeal?.price?.amount ?? null,
            currency: bestDeal?.price?.currency ?? 'USD',
            storeName: bestDeal?.shop?.name ?? null,
            storeUrl: bestDeal?.url ?? null,
            regularPrice: bestDeal?.regular?.amount ?? null,
            discount: bestDeal?.cut ?? null,
          });
        });
      }

      Cache.set(CACHE_KEY, results, 60 * 60 * 1000);
      return results;
    } catch (err) {
      console.warn('[ITAD] getDealsForGames error:', err.message);
      return [];
    }
  },
};
