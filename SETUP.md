# 🚀 CriticMatch - Setup Guide

## ✅ What's Already Done

Your project is **95% ready**! Here's what's been set up:

- ✅ React project structure
- ✅ All components (HubPage, SelectionPage, ResultsPage)
- ✅ Dark/Light mode with ThemeProvider
- ✅ Multi-language support (EN, TR, DE, FR, ES, JA, PT)
- ✅ API service structure (TMDB & OpenCritic)
- ✅ Routing between pages
- ✅ Design system (Editorial theme)
- ✅ Translation files

## 🔧 What You Need to Do

Just **2 simple steps**:

### Step 1: Install Missing Dependency

```bash
npm install i18next-browser-languagedetector
```

### Step 2: Add API Keys

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```
   Or manually create a file called `.env` in the root folder

2. **Get your API keys:**

   **Option A: Use it WITHOUT API keys (Demo Mode)**
   - The app will work with mock data
   - Just skip to Step 3!

   **Option B: Get real API keys (Recommended)**
   
   **TMDB API (Free - 5 minutes):**
   - Go to: https://www.themoviedb.org/signup
   - Create account
   - Go to: https://www.themoviedb.org/settings/api
   - Click "Request API Key"
   - Choose "Developer"
   - Fill the form (just put your name, website can be "localhost")
   - Copy the **API Key (v3 auth)** (NOT the v4 token)

   **OpenCritic API (Free tier - 5 minutes):**
   - Go to: https://rapidapi.com/auth/sign-up
   - Create account
   - Search: "OpenCritic API"
   - Click "Subscribe to Test"
   - Choose "Basic" (FREE - 500 requests/month)
   - Copy your **X-RapidAPI-Key** from the dashboard

3. **Add keys to `.env` file:**
   ```env
   REACT_APP_TMDB_API_KEY=your_tmdb_key_here
   REACT_APP_OPENCRITIC_API_KEY=your_rapidapi_key_here
   ```

### Step 3: Start the App

```bash
npm start
```

That's it! 🎉

---

## 📁 Project Structure

```
critic-match/
├── public/
├── src/
│   ├── locales/              # Translation files (7 languages)
│   │   ├── en/              # English
│   │   ├── tr/              # Turkish
│   │   ├── de/              # German
│   │   ├── fr/              # French
│   │   ├── es/              # Spanish
│   │   ├── ja/              # Japanese
│   │   └── pt/              # Portuguese
│   │
│   ├── APIService.js         # API integration layer
│   ├── App.js                # Main app with routing
│   ├── HubPage.jsx           # Landing page (3 categories)
│   ├── SelectionPage.jsx     # Content selection with search
│   ├── ResultsPage.jsx       # Results page (placeholder)
│   ├── ThemeProvider.jsx     # Dark mode provider
│   ├── ThemeToggle.jsx       # Theme switch button
│   ├── LanguageSwitcher.jsx  # Language selector
│   ├── i18n.js               # i18n configuration
│   ├── theme.css             # Design system CSS
│   └── index.js              # App entry point
│
├── .env.example              # Environment template
├── .env                      # Your API keys (create this)
├── .gitignore               # Git ignore (.env included)
├── package.json             # Dependencies
└── README.md                # Project info
```

---

## 🎮 How to Use the App

### 1. **Hub Page** (Landing)
   - Choose a category: Games 🎮 / Movies 🎬 / Series 📺
   - Toggle dark mode (moon icon, top-right)
   - Change language (flag selector, top-right)

### 2. **Selection Page**
   - Search for content
   - Use filters (year, rating)
   - Click cards to select (min 3 items)
   - See selections in bottom bar
   - Click "Find My Critics" when ready

### 3. **Results Page** (Coming Soon)
   - Currently shows placeholder
   - Will display matched critics
   - Will show match scores & reviews

---

## 🎨 Features

### ✅ Implemented
- Dark/Light mode toggle
- 7 language support
- Search functionality
- Advanced filters
- Category-based navigation
- Responsive design
- Editorial aesthetic

### 🚧 Coming Next
- Critic matching algorithm
- Real API integration
- Results page implementation
- Review display
- Score breakdown

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'i18next-browser-languagedetector'"
**Solution:**
```bash
npm install i18next-browser-languagedetector
```

### Issue: API keys not working
**Solution:**
1. Check `.env` file is in root (same level as `package.json`)
2. Keys should NOT have quotes: ✅ `KEY=abc123` ❌ `KEY="abc123"`
3. Restart dev server: Stop (Ctrl+C) and run `npm start` again

### Issue: Port 3000 already in use
**Solution (Windows):**
```bash
netstat -ano | findstr :3000
taskkill /PID <NUMBER> /F
```

### Issue: Translations not showing
**Solution:**
- Check browser console for errors
- Try changing language in the dropdown
- Clear browser cache (Ctrl+Shift+Delete)

---

## 📝 Testing Checklist

After setup, test these:

- [ ] App starts without errors
- [ ] Hub page loads with 3 categories
- [ ] Dark mode toggle works
- [ ] Language switcher works
- [ ] Can navigate to Games selection
- [ ] Can search for content
- [ ] Can select items
- [ ] Bottom bar shows selections
- [ ] "Find Critics" button works
- [ ] Results page shows placeholder

---

## 🔐 API Key Security

**Important:**
- `.env` file is in `.gitignore` - it won't be committed to Git
- Never share your API keys publicly
- Free tier limits:
  - TMDB: 1000 requests/day
  - OpenCritic: 500 requests/month

---

## 📊 Current Status

**Version:** 0.1.0 (MVP - Selection Phase)

**Completion:** 75%
- ✅ UI/UX design
- ✅ Component structure
- ✅ Navigation flow
- ✅ Dark mode
- ✅ Internationalization
- 🚧 API integration (structure ready)
- 🚧 Critic matching algorithm
- 🚧 Results page

---

## 🎯 Next Development Phase

Will implement:
1. Full API integration
2. Critic matching algorithm
3. Results page with:
   - Critic cards
   - Match scores
   - Review links
   - Score breakdown
4. Advanced features:
   - Save selections
   - Share results
   - Export data

---

## 💡 Tips

1. **Demo Mode**: App works without API keys (uses mock data)
2. **Language**: Changes are saved in localStorage
3. **Theme**: Dark/Light preference is remembered
4. **Selections**: Cleared when you go back to hub
5. **Filters**: Applied in real-time

---

## 📧 Support

If something doesn't work:
1. Check this guide first
2. Check browser console (F12) for errors
3. Make sure all steps were followed
4. Try deleting `node_modules` and run `npm install` again

---

## 🎉 You're All Set!

Run `npm start` and enjoy exploring CriticMatch!

**The app will open at:** http://localhost:3000

---

**Built with:** React 19, i18next, Editorial Design System
**Status:** Ready for API keys and testing ✅
