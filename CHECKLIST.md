# ✅ CriticMatch - Pre-Launch Checklist

## 🔧 Before Running (One-time setup)

### Step 1: Dependencies
```bash
npm install
```

If you get errors about `i18next-browser-languagedetector`:
```bash
npm install i18next-browser-languagedetector
```

**Status:** [ ]

---

### Step 2: Environment Setup

#### Option A: Demo Mode (No API keys needed)
✅ Skip this step - app will work with mock data

#### Option B: Real Data (API keys needed)

1. Create `.env` file in project root:
```bash
cp .env.example .env
```

2. Get TMDB API key:
   - Sign up: https://www.themoviedb.org/signup
   - Get key: https://www.themoviedb.org/settings/api
   - Copy "API Key (v3 auth)"

3. Get OpenCritic API key:
   - Sign up: https://rapidapi.com/auth/sign-up
   - Find: "OpenCritic API"
   - Subscribe to Free tier
   - Copy "X-RapidAPI-Key"

4. Add to `.env`:
```env
REACT_APP_TMDB_API_KEY=your_key_here
REACT_APP_OPENCRITIC_API_KEY=your_key_here
```

**Status:** [ ]

---

### Step 3: Start Development Server
```bash
npm start
```

**Status:** [ ]

---

## ✅ Functionality Testing

### Hub Page
- [ ] Page loads without errors
- [ ] Three category cards visible (Games, Movies, Series)
- [ ] Cards have hover effects
- [ ] Dark mode toggle button visible (top-right)
- [ ] Language selector visible (top-right)
- [ ] Can switch to dark mode
- [ ] Can change language
- [ ] Film grain overlay visible
- [ ] Atmospheric gradients visible

### Navigation
- [ ] Click "Games" → Goes to Games Selection
- [ ] Click "Movies" → Goes to Movies Selection
- [ ] Click "Series" → Goes to Series Selection
- [ ] Back button works
- [ ] Navigation smooth (no flashing)

### Selection Page - Games
- [ ] Header shows "🎮 Games Selection"
- [ ] Search bar present
- [ ] Filters button present
- [ ] Content grid loads
- [ ] Cards show game titles
- [ ] Can click card to select
- [ ] Selected card shows checkmark
- [ ] Selection count updates (top-right)

### Selection Page - Search
- [ ] Can type in search box
- [ ] Search shows loading spinner
- [ ] Results update after typing
- [ ] Empty state shows when no results
- [ ] Can clear search

### Selection Page - Filters
- [ ] Click "Filters" → Panel expands
- [ ] Year From input works
- [ ] Year To input works
- [ ] Min Rating input works
- [ ] Reset button clears filters
- [ ] Filters panel can collapse

### Selection Page - Bottom Bar
- [ ] Appears when items selected
- [ ] Shows selected items as chips
- [ ] Chips show item titles
- [ ] Can remove items via "×" button
- [ ] "Clear All" button works
- [ ] Shows count (e.g., "Selected (3)")
- [ ] Warning shows if <3 items
- [ ] "Find My Critics" button disabled if <3 items
- [ ] "Find My Critics" enabled if ≥3 items
- [ ] Button color matches category

### Results Page
- [ ] "Find My Critics" → Goes to Results
- [ ] Shows placeholder content
- [ ] Shows selected items list
- [ ] Back button works
- [ ] Can return to selection

### Dark Mode
- [ ] Toggle switches theme
- [ ] All pages work in dark mode
- [ ] Text readable in both modes
- [ ] Buttons visible in both modes
- [ ] Film grain visible in both modes
- [ ] Theme persists on page reload

### Languages
- [ ] Can switch to Turkish
- [ ] Can switch to German
- [ ] Can switch to French
- [ ] Can switch to Spanish
- [ ] Can switch to Japanese
- [ ] Can switch to Portuguese
- [ ] Language persists on reload
- [ ] All UI elements translate
- [ ] Numbers/dates format correctly

### Responsive Design
- [ ] Works on desktop (1920px)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)
- [ ] Bottom bar adapts on mobile
- [ ] Grid adapts on mobile
- [ ] No horizontal scroll on mobile

---

## 🐛 Error Checking

### Console (F12 → Console tab)
- [ ] No red errors on Hub page
- [ ] No red errors on Selection page
- [ ] No red errors on Results page
- [ ] No red errors when switching themes
- [ ] No red errors when changing language
- [ ] Translation warnings OK (expected if some keys missing)

### Network (F12 → Network tab)
- [ ] No failed requests (red)
- [ ] API calls work (if keys added)
- [ ] Images load properly
- [ ] Fonts load properly

---

## 🎨 Visual Quality

### Typography
- [ ] Headlines use serif font (Playfair Display)
- [ ] Body text readable (Inter)
- [ ] Monospace scores (JetBrains Mono)
- [ ] No font loading flash

### Colors
- [ ] Light mode: Warm paper background
- [ ] Dark mode: Cinema black background
- [ ] Category colors distinct
- [ ] Accent colors visible
- [ ] High contrast (readable)

### Animations
- [ ] Smooth transitions (300ms)
- [ ] Cards lift on hover
- [ ] No janky animations
- [ ] Loading spinners rotate
- [ ] No animation if user prefers reduced motion

### Layout
- [ ] No weird gaps or overlaps
- [ ] Content centered properly
- [ ] Consistent spacing
- [ ] Bottom bar fixed correctly
- [ ] Header sticky works

---

## 🚀 Performance

### Load Time
- [ ] Hub page loads in <2 seconds
- [ ] Selection page loads in <2 seconds
- [ ] Search results appear in <1 second
- [ ] Theme switch instant
- [ ] Language switch instant

### Interactions
- [ ] Click responses immediate
- [ ] Hover effects smooth
- [ ] Scroll smooth
- [ ] No lag when selecting items
- [ ] No lag with 10+ selections

---

## 📱 Browser Testing

### Chrome
- [ ] Everything works

### Firefox
- [ ] Everything works

### Safari (if available)
- [ ] Everything works

### Edge
- [ ] Everything works

---

## 🔐 Security

- [ ] `.env` file NOT in Git
- [ ] `.gitignore` includes `.env`
- [ ] No API keys in source code
- [ ] No console.logs with sensitive data

---

## 📝 Documentation

- [ ] README.md exists
- [ ] SETUP.md exists
- [ ] .env.example exists
- [ ] All instructions clear

---

## ✨ Final Checks

- [ ] No console errors
- [ ] No visual bugs
- [ ] All features work
- [ ] All pages accessible
- [ ] Theme toggle works
- [ ] Language switch works
- [ ] Search works
- [ ] Filters work
- [ ] Selection works
- [ ] Navigation works

---

## 🎉 Ready to Launch!

If all checks pass:
- ✅ **Your app is ready!**
- ✅ **Share with friends**
- ✅ **Add to portfolio**
- ✅ **Deploy when ready**

---

## 📊 Score Your Setup

**Calculate:**
- Count [ ] boxes checked
- Total possible: ~100
- Your score: ____%

**90-100%:** Excellent! 🎉
**80-89%:** Very Good! 👍
**70-79%:** Good - Minor issues
**<70%:** Needs attention

---

**Date Tested:** ___________
**Tested By:** ___________
**Version:** 0.1.0
