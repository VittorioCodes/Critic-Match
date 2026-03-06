# CriticMatch - API & Data Management Module

## 🔌 Module Overview
Handles all external API integrations, caching strategy, rate limiting, and data formatting.

---

## 📁 Key Files

### Primary File (ALWAYS READ FIRST)
- `src/APIService.js` - **CRITICAL** - All API logic, caching, formatting

### Configuration
- `.env` - API keys (READ-ONLY, never modify directly)
- `package.json` - Dependency versions

### Consumers
- `src/SelectionPage.jsx` - Uses APIService.getPopularContent, searchContent
- `src/ResultsPage.jsx` - Uses OpenCriticService, TMDBService

---

## ⚠️ MANDATORY FIRST STEP

**ALWAYS** read the entire APIService.js before ANY changes:

```bash
Filesystem:read_text_file src/APIService.js
```

This file contains:
- 3 API services (TMDB, OpenCritic, SteamGridDB)
- Cache system with 7-day TTL
- Data formatting functions
- Rate limiting logic

---

## 🎯 API Services

### 1. TMDBService (Movies & Series)
**Endpoints:**
- `getPopularMovies()` - Top movies
- `getPopularTV()` - Top series
- `searchMovies(query)` - Search movies
- `searchTV(query)` - Search series
- `getSimilarContent(selections, type)` - Recommendations

**Data Format:**
```javascript
{
  id: 'tmdb_movie_123',
  externalId: 123,
  title: 'Movie Name',
  type: 'movie' | 'series',
  year: '2024',
  poster: 'https://image.tmdb.org/t/p/w342/...',
  rating: 85, // 0-100 scale
  overview: 'Description...',
  genres: ['Action', 'Drama'],
  source: 'tmdb'
}
```

### 2. OpenCriticService (Games)
**Endpoints:**
- `getPopularGames()` - Hall of fame games
- `searchGames(query)` - Search games
- `getGameReviews(gameId, limit=75)` - Game reviews (cached, rate-limited)
- `getCriticReviews(criticId)` - All reviews by critic (cached)

**Data Format:**
```javascript
{
  id: 'oc_456',
  externalId: 456,
  title: 'Game Name',
  type: 'game',
  year: '2023',
  poster: 'https://...' | null,
  rating: 92, // topCriticScore
  genres: ['RPG', 'Action'],
  platforms: ['PC', 'PS5'],
  source: 'opencritic'
}
```

### 3. SteamGridDBService (Game Covers)
**Endpoints:**
- `searchGameCover(gameName)` - Returns 600x900 portrait cover

**Priority:**
1. SteamGridDB (better quality)
2. OpenCritic fallback

---

## 💾 Cache System

### TTL (Time To Live)
```javascript
GAME_REVIEWS: 7 days
POPULAR: 7 days
CRITIC_REVIEWS: 7 days
```

### Cache Keys
```javascript
cm_reviews_{gameId}
cm_popular_{category}
cm_critic_{criticId}
```

### Cache Operations
```javascript
Cache.get(key) // Returns data or null
Cache.set(key, data, ttl) // Stores with expiration
Cache.clear(prefix) // Clear by prefix
Cache.stats() // { entries, kb }
```

---

## 🔧 Common Tasks

### Add New API Endpoint
1. Read existing service structure in APIService.js
2. Add request method to appropriate service
3. Add formatting function if needed
4. Decide if caching is needed (search = no, popular = yes)
5. Update consumers (SelectionPage, ResultsPage)

### Modify Data Format
1. Find formatGames/formatMovies/formatTV function
2. Read current structure
3. Update mapping logic
4. Check all consumers for breaking changes

### Change Cache TTL
1. Find `const TTL = {...}` in APIService.js
2. Update specific key (e.g., GAME_REVIEWS: 7 days)
3. Clear existing cache: `Cache.clear()`
4. Restart app

### Add Rate Limiting
1. Check existing limit (MAX_GAMES = 5)
2. Add validation in service method
3. Update UI to show limit warning
4. Test edge cases

---

## 📋 API Keys Status

Current keys in `.env`:
```bash
TMDB: ✅ Active (free, unlimited)
OpenCritic: ✅ Active (100 requests/month)
SteamGridDB: ✅ Active (free, unlimited)
```

**Never modify .env file directly** - user manages keys.

---

## 🚨 Critical Rules

1. **Always check cache first** before API call
2. **Never bypass rate limits** (OpenCritic = 100/month)
3. **Always use await** with async formatting functions
4. **Log errors to console** (console.warn, not console.error)
5. **Return empty array on error**, never throw
6. **Respect API response structure** (check docs)

---

## 🔍 Debugging Checklist

- [ ] Read APIService.js completely
- [ ] Check console for "[Cache HIT]" logs
- [ ] Verify API keys in .env
- [ ] Check network tab for failed requests
- [ ] Validate data format with console.log
- [ ] Test with and without cache
- [ ] Check rate limit warnings

---

## 💡 Example Scenarios

### "Game covers not loading"
```bash
# 1. Check API call
Filesystem:read_text_file src/APIService.js
# Look at formatGames() and SteamGridDBService

# 2. Check console logs
# Should see: "✓ SteamGridDB cover found: Game Name"

# 3. Verify API key
# REACT_APP_STEAMGRIDDB_API_KEY in .env

# 4. Check consumer
Filesystem:read_text_file src/SelectionPage.jsx
# Verify loadContent() awaits properly
```

### "Add caching to new endpoint"
```javascript
// 1. Define cache key
const cacheKey = CACHE_KEYS.MY_DATA + id;

// 2. Check cache first
const cached = Cache.get(cacheKey);
if (cached) return cached;

// 3. Fetch from API
const data = await this.request('/endpoint');

// 4. Store in cache
Cache.set(cacheKey, data, TTL.MY_DATA);
return data;
```

### "Recommendations not working"
```bash
# 1. Check TMDB service
Filesystem:read_text_file src/APIService.js
# Find getSimilarContent()

# 2. Check ResultsPage usage
Filesystem:read_text_file src/ResultsPage.jsx
# Find runAnalysis() - film/dizi branch

# 3. Verify TMDB API key
# Check console for TMDB errors
```

---

## 📊 Performance Metrics

### Expected API Usage (with cache)
- **Popular content:** 1 call per week per category
- **Game reviews:** 5 calls per analysis (max)
- **Critic reviews:** Lazy loaded (only on tab switch)
- **Recommendations:** 3 calls per analysis

### Cache Hit Rate
- **Target:** >95% for popular content
- **Actual:** Check with `Cache.stats()`

---

## 📞 Quick Commands

```bash
# Read entire API system
Filesystem:read_text_file src/APIService.js

# Check how it's used
Filesystem:read_text_file src/SelectionPage.jsx
Filesystem:read_text_file src/ResultsPage.jsx

# Check API keys
Filesystem:read_text_file .env
```

---

## 🔗 API Documentation Links

- **TMDB:** https://developers.themoviedb.org/3
- **OpenCritic:** https://rapidapi.com/opencritic/api/opencritic-api
- **SteamGridDB:** https://www.steamgriddb.com/api/v2

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Production Ready
**Cache Strategy:** 7-day TTL for all endpoints
