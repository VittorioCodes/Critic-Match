# CriticMatch - Bug Fixes & Polish Module

## 🐛 Module Overview
Handles bug fixes, edge cases, performance optimization, and final polish for production readiness.

---

## 📁 All Files Are Relevant
This module can touch any file. Always read the specific file before fixing.

---

## ⚠️ Before Starting ANY Fix

1. **Reproduce the bug** in browser
2. **Check console** for errors (F12)
3. **Read the affected file** completely
4. **Understand the context** (imports, state, props)
5. **Make minimal changes** to fix

---

## 🎯 Common Bug Categories

### 1. UI/Layout Issues
**Symptoms:**
- Elements overlapping
- Broken responsive design
- Incorrect spacing/alignment
- Animation glitches

**Debug Process:**
```bash
# 1. Identify affected component
Filesystem:read_text_file src/ComponentName.jsx

# 2. Check styles object
# Look for: position, display, flex, grid

# 3. Check media queries
# @media (max-width: 768px)

# 4. Test fix in multiple screen sizes
```

### 2. State Management Issues
**Symptoms:**
- Data not updating
- Stale state
- Infinite re-renders
- Missing dependencies in useEffect

**Debug Process:**
```bash
# 1. Find state definition
useState(...) or useCallback(...)

# 2. Check where state is updated
setState(...) calls

# 3. Check useEffect dependencies
useEffect(() => {}, [deps])

# 4. Add console.logs to track state
```

### 3. API/Data Issues
**Symptoms:**
- API calls failing
- Missing data
- Wrong data format
- Cache not working

**Debug Process:**
```bash
# 1. Check APIService.js
Filesystem:read_text_file src/APIService.js

# 2. Check Network tab in browser
# See actual API requests/responses

# 3. Check console for errors
# "Failed to fetch", "404", etc.

# 4. Verify .env keys
Filesystem:read_text_file .env
```

### 4. Translation Issues
**Symptoms:**
- Missing translations
- Wrong language
- Translation keys showing instead of text

**Debug Process:**
```bash
# 1. Check console warnings
# "key 'namespace:key' not found"

# 2. Find the key in English
Filesystem:read_text_file src/locales/en/namespace.json

# 3. Check target language
Filesystem:read_text_file src/locales/XX/namespace.json

# 4. Add missing keys
```

---

## 🔧 Common Fixes

### Fix 1: Element Overflow
```javascript
// Problem: Text overflowing container
style={{
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}}
```

### Fix 2: Missing Await
```javascript
// Problem: Async function not awaited
// Wrong:
const data = getData();

// Right:
const data = await getData();
```

### Fix 3: Stale Closure
```javascript
// Problem: useCallback has missing dependency
// Wrong:
const handler = useCallback(() => {
  doSomething(data);
}, []); // Missing 'data'

// Right:
const handler = useCallback(() => {
  doSomething(data);
}, [data]);
```

### Fix 4: Undefined Check
```javascript
// Problem: Accessing property of undefined
// Wrong:
const value = obj.property;

// Right:
const value = obj?.property || defaultValue;
```

### Fix 5: Key Prop Missing
```javascript
// Problem: List items without unique keys
// Wrong:
{items.map(item => <div>{item.name}</div>)}

// Right:
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

---

## 📋 Bug Fix Checklist

Before submitting fix:

- [ ] Bug reproduced successfully
- [ ] Root cause identified
- [ ] File read completely
- [ ] Minimal change made
- [ ] Fix tested in browser
- [ ] No new console errors
- [ ] No breaking changes elsewhere
- [ ] Tested in both themes (if UI)
- [ ] Tested in multiple languages (if i18n)
- [ ] Tested responsive (if layout)

---

## 🚨 Critical Rules

1. **Never assume** - always read the file first
2. **Minimal changes** - don't refactor while fixing
3. **Test thoroughly** - browser, console, multiple scenarios
4. **Check side effects** - might break something else
5. **Document why** - add comments for non-obvious fixes
6. **Preserve patterns** - follow existing code style

---

## 🔍 Debugging Tools

### Browser DevTools
- **Console:** Errors, warnings, logs
- **Network:** API calls, failed requests
- **Elements:** Inspect DOM, styles
- **Sources:** Set breakpoints
- **Application:** localStorage, cookies

### React DevTools (Chrome Extension)
- Component tree
- Props/state inspection
- Performance profiling

### Console Logs
```javascript
// Temporary debugging (remove after fix)
console.log('Debug:', variable);
console.table(arrayData);
console.warn('Warning:', issue);
```

---

## 💡 Common Bug Scenarios

### "Theme toggle not working"
```bash
# 1. Check ThemeToggle.jsx
Filesystem:read_text_file src/ThemeToggle.jsx

# 2. Check ThemeProvider.jsx
Filesystem:read_text_file src/ThemeProvider.jsx

# 3. Check localStorage
localStorage.getItem('theme')

# 4. Check CSS variables in theme.css
Filesystem:read_text_file src/theme.css
```

### "Search not returning results"
```bash
# 1. Check SelectionPage.jsx
Filesystem:read_text_file src/SelectionPage.jsx
# Find: handleSearch function

# 2. Check APIService.js
Filesystem:read_text_file src/APIService.js
# Find: searchContent function

# 3. Check Network tab
# See actual API request

# 4. Check console for errors
```

### "Cards not displaying correctly on mobile"
```bash
# 1. Check SelectionPage.jsx
Filesystem:read_text_file src/SelectionPage.jsx
# Find: styles.grid

# 2. Check media queries in animationStyles
# @media (max-width: 768px)

# 3. Test in device mode (F12 → Toggle device)
```

### "Language not switching"
```bash
# 1. Check LanguageSwitcher.jsx
Filesystem:read_text_file src/LanguageSwitcher.jsx
# Find: handleChange function

# 2. Check i18n.js
Filesystem:read_text_file src/i18n.js
# Verify language resources loaded

# 3. Check localStorage
localStorage.getItem('i18nextLng')
```

---

## 🎨 Polish Tasks

### Code Quality
- Remove unused imports
- Remove console.logs
- Add missing PropTypes
- Fix ESLint warnings

### Performance
- Lazy load images
- Debounce expensive operations
- Memoize heavy calculations
- Check for memory leaks

### Accessibility
- Add aria-labels
- Ensure keyboard navigation
- Check contrast ratios
- Test with screen reader

### UX Polish
- Add loading states
- Improve error messages
- Add empty states
- Smooth transitions

---

## 📊 Performance Monitoring

### Metrics to Check
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Bundle Size:** <500KB JS
- **API Response Time:** <1s

### Tools
- Chrome Lighthouse
- React DevTools Profiler
- Network tab (timing)
- Bundle analyzer

---

## 🧪 Testing Scenarios

Always test these after any fix:

### Basic Flow
1. ✅ Site loads without errors
2. ✅ Can select category
3. ✅ Can search content
4. ✅ Can select items
5. ✅ Can analyze selections
6. ✅ Results display correctly

### Theme & i18n
1. ✅ Theme toggle works
2. ✅ Theme persists on reload
3. ✅ Language switch works
4. ✅ Language persists on reload
5. ✅ All text translates

### Responsive
1. ✅ Mobile (375px) - no horizontal scroll
2. ✅ Tablet (768px) - proper layout
3. ✅ Desktop (1920px) - centered content

### Edge Cases
1. ✅ No selections → proper message
2. ✅ API fails → graceful fallback
3. ✅ Slow connection → loading states
4. ✅ Missing images → placeholders

---

## 📞 Quick Commands

```bash
# Check for console errors
# Open browser console (F12)

# Read any file before editing
Filesystem:read_text_file src/FileName.jsx

# Check current state of code
# Before making changes
```

---

## 🎯 Priority Levels

### P0 (Critical - Fix Immediately)
- Site doesn't load
- Major feature broken
- Data loss possible
- Security issue

### P1 (High - Fix Soon)
- Feature not working
- UI severely broken
- Performance issue
- API failing

### P2 (Medium - Fix Next)
- Minor UI glitch
- Translation missing
- Non-critical bug
- Edge case issue

### P3 (Low - Polish)
- Styling tweak
- Code cleanup
- Optimization
- Nice-to-have

---

## 🔗 Resources

- **React Docs:** https://react.dev/
- **MDN Web Docs:** https://developer.mozilla.org/
- **Can I Use:** https://caniuse.com/
- **Stack Overflow:** https://stackoverflow.com/

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Maintenance Mode
**Bug Count:** 0 known critical bugs
