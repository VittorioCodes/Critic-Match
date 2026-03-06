# 🎬 CriticMatch

**Find Critics Who Match Your Taste**

CriticMatch helps you discover critics whose reviews align with your preferences across games, movies, and TV series.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

**Note:** If you get an error about `i18next-browser-languagedetector`, run:
```bash
npm install i18next-browser-languagedetector
```

### 2. Set Up API Keys

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your API keys:

   **TMDB API (Free):**
   - Go to https://www.themoviedb.org/
   - Create an account
   - Go to Settings > API
   - Request API key (choose "Developer")
   - Copy "API Key (v3 auth)"

   **OpenCritic API (Free tier available):**
   - Go to https://rapidapi.com/
   - Search for "OpenCritic API"
   - Subscribe to free tier
   - Copy your RapidAPI key

3. Add keys to `.env`:
   ```env
   REACT_APP_TMDB_API_KEY=your_tmdb_key_here
   REACT_APP_OPENCRITIC_API_KEY=your_rapidapi_key_here
   ```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

---

## 🎨 Features

- ✅ **Multi-category support** - Games, Movies, TV Series
- ✅ **Search & filters** - Find content easily
- ✅ **Dark/Light mode** - Editorial theme
- ✅ **Multi-language** - EN, TR, DE, FR, ES, JA, PT
- ✅ **Responsive design** - Works on all devices
- 🚧 **Critic matching** - Coming soon

---

## 📁 Project Structure

```
critic-match/
├── public/
├── src/
│   ├── locales/           # Translation files
│   │   ├── en/
│   │   ├── tr/
│   │   └── ...
│   ├── APIService.js      # API integration
│   ├── App.js             # Main app component
│   ├── HubPage.jsx        # Landing page
│   ├── SelectionPage.jsx  # Content selection
│   ├── ResultsPage.jsx    # Results (placeholder)
│   ├── ThemeProvider.jsx  # Dark mode provider
│   ├── ThemeToggle.jsx    # Theme switcher
│   ├── LanguageSwitcher.jsx
│   ├── i18n.js            # i18n configuration
│   └── theme.css          # Design system
├── .env.example           # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🎯 Current Status

### ✅ Completed
- Hub/Landing page
- Selection page with search & filters
- Dark/Light mode toggle
- Multi-language support (7 languages)
- Editorial design system
- API service structure

### 🚧 In Progress
- Critic matching algorithm
- Results page implementation
- API integration (mock data currently)

---

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production to the `build` folder

---

## 🌍 Supported Languages

- 🇬🇧 English (en)
- 🇹🇷 Turkish (tr)
- 🇩🇪 German (de)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇯🇵 Japanese (ja)
- 🇵🇹 Portuguese (pt)

---

## 🎨 Design System

**Aesthetic:** Editorial Cinematic

**Colors:**
- Light mode: Warm paper (#FDFCFA) with Crimson accent (#C84C3C)
- Dark mode: Cinema black (#0F0E0D) with Amber accent (#E8A87C)

**Typography:**
- Headlines: Playfair Display (serif)
- Body: Inter (sans-serif)
- UI: DM Sans (sans-serif)
- Scores: JetBrains Mono (monospace)

**Effects:**
- Film grain texture overlay
- Atmospheric gradients
- Sharp editorial borders (4px radius)
- Smooth transitions (300ms)

---

## 🐛 Troubleshooting

### API Keys Not Working
- Make sure `.env` file is in the root directory (same level as `package.json`)
- Restart the development server after adding keys: `npm start`
- Check that keys don't have quotes around them

### Missing Dependencies
```bash
npm install
```

### Port 3000 Already in Use
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

---

## 📝 Next Steps

1. **Install dependencies** - Run `npm install`
2. **Add API keys** - Copy `.env.example` to `.env` and add keys
3. **Start server** - Run `npm start`
4. **Test the app** - Navigate through Hub → Selection
5. **Wait for next update** - Results page implementation coming soon!

---

## 🤝 Contributing

This is a work in progress. The matching algorithm and results page are currently being developed.

---

## 📄 License

This project is for educational/portfolio purposes.

---

## 🔗 Links

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [OpenCritic API on RapidAPI](https://rapidapi.com/opencritic-opencritic-default/api/opencritic-api)

---

**Built with:** React, i18next, TMDB API, OpenCritic API

**Version:** 0.1.0 (MVP - Selection Phase)
