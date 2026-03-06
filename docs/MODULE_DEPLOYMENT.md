# CriticMatch - Deployment & Configuration Module

## 🚀 Module Overview
Handles project configuration, build setup, environment variables, and GitHub Pages deployment.

---

## 📁 Key Files

### Configuration
- `package.json` - Dependencies, scripts, homepage
- `.env` - API keys (user-managed)
- `.env.example` - Template for API keys
- `.gitignore` - Files to exclude from git

### Build Files
- `public/index.html` - HTML template
- `public/manifest.json` - PWA config
- Build output: `build/` directory (generated)

---

## ⚠️ Before Starting

1. **Check package.json:**
   ```bash
   Filesystem:read_text_file package.json
   ```
   Look for: homepage, dependencies, scripts

2. **Check .env template:**
   ```bash
   Filesystem:read_text_file .env.example
   ```

3. **Check .gitignore:**
   ```bash
   Filesystem:read_text_file .gitignore
   ```

---

## 🎯 Project Configuration

### package.json Settings

```json
{
  "name": "critic-match",
  "version": "0.1.0",
  "homepage": ".",  // Relative path for GitHub Pages
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "i18next": "^25.8.5",
    "i18next-browser-languagedetector": "^8.2.0",
    "react-i18next": "^16.5.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "deploy": "gh-pages -d build"
  }
}
```

### Environment Variables

**.env (user-managed, in .gitignore):**
```bash
REACT_APP_TMDB_API_KEY=actual_key_here
REACT_APP_OPENCRITIC_API_KEY=actual_key_here
```

**.env.example (template in git):**
```bash
REACT_APP_TMDB_API_KEY=your_tmdb_key_here
REACT_APP_OPENCRITIC_API_KEY=your_rapidapi_key_here
```

---

## 🔧 Common Tasks

### Update Dependencies
```bash
# 1. Check current versions
Filesystem:read_text_file package.json

# 2. User runs:
npm update

# 3. Verify no breaking changes
npm start
```

### Change Homepage Path
```bash
# 1. Open package.json
Filesystem:read_text_file package.json

# 2. Modify "homepage":
"homepage": "."  → relative (recommended)
"homepage": "https://user.github.io/repo"  → absolute

# 3. Rebuild
npm run build
```

### Add New Environment Variable
```bash
# 1. Add to .env (user does this)
REACT_APP_NEW_KEY=value

# 2. Add to .env.example (template)
REACT_APP_NEW_KEY=your_key_here

# 3. Add comment explaining where to get it

# 4. Update APIService.js to use it
API_CONFIG.NEW_KEY = process.env.REACT_APP_NEW_KEY || '';

# 5. Document in README.md
```

---

## 🌐 GitHub Pages Deployment

### Setup Steps (User Actions)

1. **Create GitHub Repo**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/critic-match.git
   git push -u origin main
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

4. **Configure GitHub Pages**
   - Go to repo Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages
   - Folder: / (root)

### Deployment Checklist

- [ ] API keys in .env (NOT in git)
- [ ] .gitignore includes .env
- [ ] homepage is "." in package.json
- [ ] npm run build succeeds
- [ ] build/ folder created
- [ ] gh-pages branch created
- [ ] GitHub Pages configured
- [ ] Site accessible at URL

---

## 📋 Build Configuration

### Production Build
```bash
npm run build
```

Creates optimized build:
- Minified JavaScript
- Optimized images
- CSS combined
- Source maps generated
- Output: `build/` directory

### Build Size
- Target: <2MB total
- Current: ~500KB JS, ~100KB CSS
- Images: Loaded from external APIs (not bundled)

---

## 🚨 Critical Rules

1. **NEVER commit .env** to git
2. **ALWAYS use relative homepage** for portability
3. **Test build locally** before deploying
4. **Verify API keys work** in production
5. **Check console for errors** after deployment
6. **Use environment variables** for all secrets

---

## 🔒 Security

### What's Safe to Commit
✅ .env.example (template)
✅ package.json
✅ All source code
✅ Public assets

### What's NOT Safe to Commit
❌ .env (actual keys)
❌ node_modules/
❌ build/
❌ .DS_Store

### API Key Security
- **TMDB:** Frontend use is fine (domain-restricted)
- **OpenCritic:** Exposed but rate-limited (100/month)
- **Risk:** Low - free tiers, no billing info

---

## 🔍 Troubleshooting

### Build Fails
```bash
# Check Node version
node --version  # Should be 14+

# Clear cache
rm -rf node_modules
npm install

# Check for syntax errors
npm run build
```

### Deployment Issues
```bash
# Check gh-pages branch exists
git branch -a

# Check GitHub Pages settings
# Settings → Pages → Source = gh-pages

# Check homepage in package.json
# Should be "." or full URL

# Rebuild and redeploy
npm run build
npm run deploy
```

### White Screen After Deploy
```bash
# 1. Check console for errors (F12)
# 2. Verify homepage in package.json
# 3. Check if assets loading (Network tab)
# 4. Ensure relative paths used
```

---

## 💡 Example Scenarios

### "Setup for new developer"
```bash
# 1. Clone repo
git clone https://github.com/user/critic-match.git
cd critic-match

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Add API keys to .env
# Edit .env file

# 5. Start development
npm start
```

### "Deploy to production"
```bash
# 1. Test locally
npm start
# Verify everything works

# 2. Build
npm run build
# Check build/ folder created

# 3. Deploy
npm run deploy
# Pushes to gh-pages branch

# 4. Verify
# Visit GitHub Pages URL
# Check console for errors
```

### "Add new dependency"
```bash
# 1. Install
npm install package-name

# 2. Import in code
import Something from 'package-name';

# 3. Test locally
npm start

# 4. Commit package.json changes
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

---

## 📞 Quick Commands

```bash
# Check configuration
Filesystem:read_text_file package.json
Filesystem:read_text_file .env.example
Filesystem:read_text_file .gitignore

# Check build output
Filesystem:list_directory build/
```

---

## 🔗 External Resources

- **Create React App:** https://create-react-app.dev/
- **GitHub Pages:** https://pages.github.com/
- **gh-pages package:** https://www.npmjs.com/package/gh-pages

---

## ⚙️ Environment-Specific Behavior

### Development (npm start)
- Hot reload enabled
- Source maps available
- Console logs visible
- Unminified code

### Production (npm run build)
- Minified code
- No console logs (production build strips them)
- Optimized assets
- Service worker (if configured)

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Production Ready
**Deployment:** GitHub Pages ready
**Build Tool:** Create React App (react-scripts)
