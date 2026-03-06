# CriticMatch - Module Documentation Index

## 📚 Quick Navigation

This directory contains modular documentation for CriticMatch development. Each module is self-contained with specific focus areas, file references, and workflows.

---

## 🗂️ Available Modules

### 1. [UI/UX & Styling](./MODULE_UI_UX.md)
**Focus:** Visual design, theming, animations, responsive layout

**When to use:**
- Modifying colors or theme
- Changing layout/spacing
- Adding/fixing animations
- Responsive design issues
- Component styling

**Key Files:** ThemeProvider.jsx, ThemeToggle.jsx, theme.css

---

### 2. [API & Data Management](./MODULE_API_DATA.md)
**Focus:** External APIs, caching, rate limiting, data formatting

**When to use:**
- Adding/modifying API endpoints
- Cache configuration
- Data format changes
- API key management
- Rate limiting issues

**Key Files:** APIService.js, .env

---

### 3. [Internationalization (i18n)](./MODULE_I18N.md)
**Focus:** Translations, language switching, i18n configuration

**When to use:**
- Adding/updating translations
- Adding new language
- Fixing translation keys
- Language switcher issues

**Key Files:** i18n.js, LanguageSwitcher.jsx, locales/*/

---

### 4. [Film/TV Features](./MODULE_FILM_TV.md)
**Focus:** Movie/series recommendations (separate from critic matching)

**When to use:**
- Modifying recommendation logic
- Changing recommendation count
- Updating recommendation UI
- TMDB integration issues

**Key Files:** APIService.js (TMDBService), ResultsPage.jsx

---

### 5. [Deployment & Config](./MODULE_DEPLOYMENT.md)
**Focus:** Build setup, environment variables, GitHub Pages

**When to use:**
- Deploying to production
- Environment configuration
- Build issues
- Dependency updates
- GitHub Pages setup

**Key Files:** package.json, .env.example, .gitignore

---

### 6. [Bug Fixes & Polish](./MODULE_BUGS_POLISH.md)
**Focus:** Bug fixes, edge cases, performance, final polish

**When to use:**
- Fixing any bug
- Edge case handling
- Performance optimization
- Code cleanup
- Accessibility improvements

**Key Files:** Any file (context-dependent)

---

## 🚀 Quick Start for New Conversations

### Step 1: Choose Your Module
Select the module that matches your work:
- Visual changes → UI/UX
- API changes → API & Data
- Translation work → i18n
- Recommendations → Film/TV
- Deployment → Deployment
- Bug fix → Bug Fixes

### Step 2: Read Module Documentation
```bash
# Example for UI work:
Filesystem:read_text_file docs/MODULE_UI_UX.md
```

### Step 3: Follow Module Workflow
Each module has:
- ✅ "Before Starting" checklist
- ✅ Key files to read
- ✅ Common tasks
- ✅ Example scenarios
- ✅ Quick commands

---

## 📋 Universal Workflow

Regardless of module, ALWAYS:

1. **Read before writing**
   ```bash
   Filesystem:read_text_file src/FileName.jsx
   ```

2. **Understand context**
   - Check imports
   - Check state/props
   - Check related files

3. **Make minimal changes**
   - Fix one thing at a time
   - Don't refactor while fixing

4. **Test thoroughly**
   - Browser console (F12)
   - Multiple scenarios
   - Both themes (if UI)
   - Multiple languages (if i18n)

---

## 🎯 Project Overview

### Tech Stack
- **Framework:** React 19.2.4
- **i18n:** i18next
- **Styling:** Custom CSS (no frameworks)
- **APIs:** TMDB, OpenCritic, SteamGridDB
- **Deployment:** GitHub Pages

### Project Structure
```
critic-match/
├── src/
│   ├── APIService.js          # All API logic
│   ├── App.js                 # Main routing
│   ├── HubPage.jsx            # Landing page
│   ├── SelectionPage.jsx      # Content selection
│   ├── ResultsPage.jsx        # Critics/recommendations
│   ├── ThemeProvider.jsx      # Dark/light mode
│   ├── ThemeToggle.jsx        # Theme switch
│   ├── LanguageSwitcher.jsx   # Language selector
│   ├── theme.css              # Design system
│   ├── i18n.js                # i18n config
│   └── locales/               # 7 languages
├── docs/                      # This directory
├── .env                       # API keys (user-managed)
├── .env.example               # Key template
└── package.json               # Dependencies
```

### Core Features
- 🎮 Games: Critic matching with reviews
- 🎬 Movies: Content-based recommendations
- 📺 Series: Content-based recommendations
- 🌓 Dark/Light theme
- 🌍 7 languages (en, tr, de, fr, es, ja, pt)

---

## 🔗 External Resources

- **Project README:** [../README.md](../README.md)
- **Setup Guide:** [../SETUP.md](../SETUP.md)
- **Testing Checklist:** [../CHECKLIST.md](../CHECKLIST.md)
- **Project Summary:** [../PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)

---

## 💡 Pro Tips

1. **Start with the module docs** - they have context you need
2. **Always read files first** - don't assume current state
3. **Check console frequently** - catches issues early
4. **Test in multiple scenarios** - themes, languages, screen sizes
5. **Follow existing patterns** - consistency matters

---

## 📞 Quick Reference Card

```bash
# Start any module conversation with:
Filesystem:read_text_file docs/MODULE_NAME.md

# Always read files before editing:
Filesystem:read_text_file src/ComponentName.jsx

# Check project structure:
Filesystem:list_directory src/

# View available modules:
Filesystem:list_directory docs/
```

---

## 🎓 Learning Path

New to the project? Read in this order:

1. **This file** (INDEX.md) - Overview
2. **[../PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - What's been built
3. **[MODULE_UI_UX.md](./MODULE_UI_UX.md)** - Design system
4. **[MODULE_API_DATA.md](./MODULE_API_DATA.md)** - Data flow
5. **[MODULE_I18N.md](./MODULE_I18N.md)** - Translations
6. Then dive into specific modules as needed

---

**Created:** 2026-02-20  
**Version:** 1.0  
**Status:** ✅ Complete Documentation Set
