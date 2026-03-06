# CriticMatch - UI/UX & Styling Module

## 🎨 Module Overview
This module handles all visual design, theming, animations, and responsive layout concerns.

---

## 📁 Key Files

### Core Files
- `src/ThemeProvider.jsx` - Dark/light mode state management
- `src/ThemeToggle.jsx` - Theme switch button with animations
- `src/theme.css` - Design system (colors, fonts, variables)
- `src/App.js` - Language/theme control positioning

### Component Styling
- `src/HubPage.jsx` - Landing page layout
- `src/SelectionPage.jsx` - Content selection grid
- `src/ResultsPage.jsx` - Critics list + recommendations

---

## ⚠️ Before Starting - READ THESE FIRST

1. **Design System:**
   ```bash
   Filesystem:read_text_file src/theme.css
   ```
   Understand CSS variables, color scheme, fonts

2. **Current Theme:**
   ```bash
   Filesystem:read_text_file src/ThemeProvider.jsx
   Filesystem:read_text_file src/ThemeToggle.jsx
   ```
   Check theme state management and toggle logic

3. **Layout Structure:**
   ```bash
   Filesystem:read_text_file src/App.js
   ```
   See how controls are positioned (right-center, 1x2 grid)

---

## 🎯 Common Tasks

### Modify Colors
1. Read `theme.css` to see current CSS variables
2. Understand light/dark mode color mappings
3. Update specific variables (never hardcode colors)
4. Test in both themes

### Add Animations
1. Check existing animations in component files
2. Use CSS keyframes (defined in `animationStyles` const)
3. Apply via `animation` property with delay
4. Follow existing pattern: `fadeSlideIn`, `fadeSlideUp`, etc.

### Responsive Design
1. Check media queries at bottom of style objects
2. Mobile breakpoint: 768px
3. Tablet breakpoint: 900px
4. Use grid auto-fit for cards

### Update Layout
1. Read component's inline styles object
2. Modify layout properties (display, grid, flex)
3. Keep spacing consistent (8px increments)
4. Test on multiple screen sizes

---

## 🔧 Technical Details

### Color System
```css
/* Light Mode */
--bg-primary: #FDFCFA (warm paper)
--accent-primary: #C84C3C (crimson)

/* Dark Mode */
--bg-primary: #0F0E0D (cinema black)
--accent-primary: #E8A87C (amber)
```

### Typography
- Headlines: `var(--font-editorial)` → Playfair Display (serif)
- Body: `var(--font-body)` → Inter (sans-serif)
- UI: `var(--font-ui)` → DM Sans (sans-serif)
- Scores: `var(--font-mono)` → JetBrains Mono (monospace)

### Animation Timing
- Standard: 0.3s ease
- Smooth: 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
- Quick: 0.2s ease

---

## 📋 Checklist for Changes

- [ ] Read current implementation
- [ ] Check both light and dark themes
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)
- [ ] Verify animations are smooth
- [ ] Check accessibility (contrast, focus states)
- [ ] No hardcoded colors (use CSS variables)

---

## 🚨 Critical Rules

1. **Never remove film grain overlay** (`.grainOverlay` in each page)
2. **Always use CSS variables** for colors
3. **Maintain 8px spacing grid**
4. **Test animations with reduced motion preference**
5. **Keep component styles in same file** (inline style objects)

---

## 💡 Example Scenarios

### "Change accent color"
1. Read `theme.css` to find `--accent-primary`
2. Update both light and dark mode values
3. Verify in all pages (Hub, Selection, Results)

### "Add new animation"
1. Define keyframes in component's `animationStyles` const
2. Apply to element: `animation: 'myAnim 0.5s ease-out'`
3. Add animation delay for staggered effects

### "Fix responsive issue"
1. Read component file to find media queries
2. Check breakpoint (768px or 900px)
3. Adjust grid columns or padding
4. Test with browser dev tools

---

## 📞 Quick Commands

```bash
# Check theme system
Filesystem:read_text_file src/theme.css
Filesystem:read_text_file src/ThemeProvider.jsx

# Check page layout
Filesystem:read_text_file src/HubPage.jsx
Filesystem:read_text_file src/SelectionPage.jsx

# Check controls positioning
Filesystem:read_text_file src/App.js
```

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Production Ready
