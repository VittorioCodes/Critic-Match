# CriticMatch - Film/TV Features Module

## 🎬 Module Overview
Handles movie and TV series recommendations based on user selections (separate from critic matching which is games-only).

---

## 📁 Key Files

### Core Logic
- `src/APIService.js` - TMDBService.getSimilarContent()
- `src/ResultsPage.jsx` - Recommendations UI rendering

### Supporting Files
- `src/SelectionPage.jsx` - Movie/series selection
- `src/HubPage.jsx` - Category descriptions

---

## ⚠️ Before Starting

1. **Understand the difference:**
   - **Games:** Critic matching (reviews + scores)
   - **Movies/Series:** Content recommendations (similar titles)

2. **Read recommendation logic:**
   ```bash
   Filesystem:read_text_file src/APIService.js
   # Find: TMDBService.getSimilarContent()
   ```

3. **Read UI implementation:**
   ```bash
   Filesystem:read_text_file src/ResultsPage.jsx
   # Find: RecommendationCard, MiniRecommendationCard
   # Find: if (recommendations.length > 0) block
   ```

---

## 🎯 How It Works

### Flow
1. User selects 2+ movies or series
2. Clicks "Find My Critics" (renamed for clarity)
3. `runAnalysis()` detects movie/series selections
4. Calls `TMDBService.getSimilarContent()`
5. Renders top 3 + mini cards (4-12)

### Algorithm
```javascript
// For each selection (max 3):
1. Call TMDB /similar endpoint
2. Collect all similar items
3. Score = (appearance_count * 10) + rating
4. Sort by score descending
5. Return top 20
```

### UI Structure
```
┌─────────────────────────────────┐
│  Top 3 Recommendations          │
│  [Large cards with overview]    │
├─────────────────────────────────┤
│  More Suggestions (9 items)     │
│  [Mini cards - poster + title]  │
└─────────────────────────────────┘
```

---

## 🔧 Common Tasks

### Modify Recommendation Count
```bash
# 1. Find in ResultsPage.jsx
Filesystem:read_text_file src/ResultsPage.jsx

# 2. Change slice ranges:
recommendations.slice(0, 3)  // Top 3 → change to 5
recommendations.slice(3, 12) // Mini 4-12 → change to 5-15

# 3. Update grid layout if needed
```

### Change Scoring Algorithm
```bash
# 1. Find in APIService.js
Filesystem:read_text_file src/APIService.js

# 2. Modify in getSimilarContent():
const scoreA = (a.score * 10) + (a.rating || 0);
// Change weights: score * 20, rating * 2, etc.

# 3. Test with various selections
```

### Add More Metadata
```bash
# 1. Check TMDB API response structure
# 2. Update formatMovies/formatTV in APIService.js
# 3. Add to recommendation card in ResultsPage.jsx
```

---

## 📊 Data Format

### Recommendation Object
```javascript
{
  id: 'tmdb_movie_123',
  externalId: 123,
  title: 'Movie Name',
  type: 'movie' | 'series',
  year: '2024',
  poster: 'https://image.tmdb.org/t/p/w342/...',
  rating: 85, // 0-100 scale
  overview: 'Description (used in top 3 cards)',
  genres: ['Action', 'Drama'],
  score: 15, // Internal: appearance_count * 10 + rating
  source: 'tmdb'
}
```

---

## 🎨 UI Components

### RecommendationCard (Top 3)
- Landscape poster (16:9)
- Rank badge (#1, #2, #3)
- Title (editorial font)
- Year + Rating
- Genres (first 3)
- Overview (4 lines max)

### MiniRecommendationCard (4-12)
- Portrait poster (2:3)
- Title (2 lines max)
- Year + Rating

---

## 📋 Implementation Checklist

When modifying film/TV features:

- [ ] Read TMDBService.getSimilarContent()
- [ ] Check recommendation rendering in ResultsPage
- [ ] Test with movies only
- [ ] Test with series only
- [ ] Test with mixed selections
- [ ] Verify posters load correctly
- [ ] Check responsive layout (mobile)
- [ ] Ensure no critic matching confusion

---

## 🚨 Critical Rules

1. **Never mix with critic matching** - separate flows
2. **Max 3 selections for TMDB API** (to avoid rate limits)
3. **Always show top 3 differently** than mini cards
4. **Handle missing posters** gracefully
5. **Limit overview text** (4 lines, ellipsis)
6. **Return max 20 recommendations** total

---

## 🔍 Debugging Checklist

- [ ] Check `runAnalysis()` in ResultsPage.jsx
- [ ] Verify `hasMoviesOrSeries && gameSelections.length === 0`
- [ ] Check TMDB API key in .env
- [ ] Look for console errors from getSimilarContent()
- [ ] Verify recommendations state is populated
- [ ] Check if (recommendations.length > 0) render block

---

## 💡 Example Scenarios

### "Recommendations not showing"
```bash
# 1. Check runAnalysis logic
Filesystem:read_text_file src/ResultsPage.jsx
# Line ~120: if (hasMoviesOrSeries && gameSelections.length === 0)

# 2. Check API call
Filesystem:read_text_file src/APIService.js
# Find: TMDBService.getSimilarContent()

# 3. Console log
console.log('Recommendations:', recommendations);

# 4. Verify TMDB API key
Filesystem:read_text_file .env
```

### "Add director/cast to cards"
```bash
# 1. Check TMDB API response
# /similar endpoint returns limited data

# 2. May need additional API call
# /movie/{id} or /tv/{id} for full details

# 3. Update formatMovies/formatTV
# Add new fields to returned object

# 4. Update RecommendationCard UI
# Render new fields
```

### "Change top cards from 3 to 5"
```bash
# 1. Open ResultsPage.jsx
Filesystem:read_text_file src/ResultsPage.jsx

# 2. Find recommendations rendering:
{recommendations.slice(0, 3).map...}

# 3. Change to:
{recommendations.slice(0, 5).map...}

# 4. Adjust grid if needed:
gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
```

---

## 🎬 User-Facing Text

Current messaging:
- Hub Page: "Get personalized movie recommendations"
- Selection: Works same as games (no special warnings)
- Results Header: "Personalized Recommendations"
- Results Subtitle: "Based on X movies/series"

Update these in:
- `src/locales/*/home.json`
- `src/locales/*/results.json`

---

## 📞 Quick Commands

```bash
# Read recommendation logic
Filesystem:read_text_file src/APIService.js

# Read UI rendering
Filesystem:read_text_file src/ResultsPage.jsx

# Check translations
Filesystem:read_text_file src/locales/en/home.json
Filesystem:read_text_file src/locales/en/results.json
```

---

## 🔗 TMDB API Reference

- **Similar Movies:** `/movie/{id}/similar`
- **Similar TV:** `/tv/{id}/similar`
- **Docs:** https://developers.themoviedb.org/3/movies/get-similar-movies

---

## 📈 Performance Notes

- **API Calls:** Max 3 per analysis (based on selections.slice(0, 3))
- **Caching:** Not implemented (recommendations vary by selection)
- **Rate Limit:** TMDB has generous limits (no issue)

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Production Ready
**Feature:** Content-based recommendations (not critic matching)
