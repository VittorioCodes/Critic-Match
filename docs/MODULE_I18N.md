# CriticMatch - Internationalization (i18n) Module

## 🌍 Module Overview
Manages translations across 7 languages with proper formatting, pluralization, and language detection.

---

## 📁 Key Files

### Configuration
- `src/i18n.js` - i18next setup, language detection
- `src/LanguageSwitcher.jsx` - Language selector UI

### Translation Files (7 Languages)
```
src/locales/
├── en/ (English) ✅
├── tr/ (Turkish) ✅
├── de/ (German) ✅
├── fr/ (French) ✅
├── es/ (Spanish) ✅
├── ja/ (Japanese) ✅
└── pt/ (Portuguese) ✅
```

Each language has 4 namespaces:
- `home.json` - Hub page
- `selection.json` - Selection page
- `results.json` - Results page
- `common.json` - Shared (nav, actions, labels)

---

## ⚠️ Before Starting

1. **Check structure with English:**
   ```bash
   Filesystem:read_text_file src/locales/en/home.json
   Filesystem:read_text_file src/locales/en/selection.json
   Filesystem:read_text_file src/locales/en/results.json
   Filesystem:read_text_file src/locales/en/common.json
   ```

2. **Check target language:**
   ```bash
   Filesystem:read_text_file src/locales/tr/home.json
   # (or de, fr, es, ja, pt)
   ```

3. **Check i18n config:**
   ```bash
   Filesystem:read_text_file src/i18n.js
   ```

---

## 🎯 Translation Structure

### home.json
```json
{
  "hero": { "title", "subtitle" },
  "categories": {
    "games": { "title", "description", "cta", "icon" },
    "movies": { "title", "description", "cta", "icon" },
    "series": { "title", "description", "cta", "icon" }
  },
  "howItWorks": { ... },
  "features": { ... },
  "infoNotice": { "text" },
  "footer": { "cacheInfo" }
}
```

### selection.json
```json
{
  "header": { ... },
  "search": {
    "placeholder": { "games", "movies", "series" },
    ...
  },
  "filters": { "title", "yearFrom", "yearTo", ... },
  "warnings": {
    "gamesOnly",
    "maxGames"
  }
}
```

### results.json
```json
{
  "header": { ... },
  "criticsList": {
    "sortBy",
    "sortOptions": {
      "matchScore",
      "averageScore",
      "coverage",
      "consistency"
    }
  },
  "detailPanel": { ... }
}
```

### common.json
```json
{
  "nav": { "home", "games", "movies", "series" },
  "actions": { "back", "analyze", "clearAll" },
  "labels": { "selected", "loading" },
  "footer": { "copyright" }
}
```

---

## 🔧 Common Tasks

### Add New Translation Key
1. **Add to English first** (src/locales/en/*.json)
2. **Copy to all 6 other languages**
3. **Translate each one**
4. **Update component** to use new key

Example:
```javascript
// 1. Add to en/common.json
{
  "newKey": "New Text"
}

// 2. Copy to tr/common.json and translate
{
  "newKey": "Yeni Metin"
}

// 3. Use in component
{t('common:newKey')}
```

### Update Existing Translation
1. **Find key in English** file
2. **Update English** text
3. **Update all other languages**
4. **Test in UI** by switching languages

### Add New Language
1. **Create directory** `src/locales/XX/`
2. **Copy all 4 JSON files** from `en/`
3. **Translate all keys**
4. **Add to i18n.js** resources
5. **Add to LanguageSwitcher.jsx** languages array

---

## 🌐 Supported Languages

| Code | Language | Native Name | Status |
|------|----------|-------------|--------|
| en | English | English | ✅ Complete |
| tr | Turkish | Türkçe | ✅ Complete |
| de | German | Deutsch | ✅ Complete |
| fr | French | Français | ✅ Complete |
| es | Spanish | Español | ✅ Complete |
| ja | Japanese | 日本語 | ✅ Complete |
| pt | Portuguese | Português | ✅ Complete |

---

## 📋 Translation Checklist

When adding/updating translations:

- [ ] Update English (en) first
- [ ] Copy key to all 6 other languages
- [ ] Translate appropriately for each language
- [ ] Check for interpolation variables ({{variable}})
- [ ] Check for pluralization (_plural suffix)
- [ ] Test HTML content (dangerouslySetInnerHTML)
- [ ] Verify in UI by switching languages
- [ ] Check text doesn't overflow in any language

---

## 🚨 Critical Rules

1. **Always update ALL 7 languages** when adding keys
2. **Never delete keys** without checking component usage
3. **Keep namespace structure consistent** across languages
4. **Use interpolation** for dynamic content: `{{count}}`
5. **Use dangerouslySetInnerHTML** for HTML (e.g., `<strong>`)
6. **Test longest translation** (often German or Portuguese)

---

## 💡 Special Cases

### HTML Content
```json
// In JSON
"text": "Critic matching works for <strong>games</strong> only."

// In Component
<p dangerouslySetInnerHTML={{ __html: t('home:infoNotice.text') }} />
```

### Interpolation
```json
// In JSON
"subtitle": "Based on {{count}} games"

// In Component
{t('results:header.subtitle', { count: gameSelections.length })}
```

### Pluralization
```json
// In JSON
"reviewCount": "{{count}} review",
"reviewCount_plural": "{{count}} reviews"

// In Component (automatic)
{t('results:criticsList.reviewCount', { count: reviews.length })}
```

---

## 🔍 Debugging Translations

### Missing Translation
```bash
# Check console for warnings like:
# "i18next: key 'home:newKey' not found"

# 1. Find which namespace (home, selection, results, common)
# 2. Check if key exists in en/*.json
# 3. Check if key exists in current language
```

### Wrong Language Showing
```bash
# 1. Check browser localStorage
localStorage.getItem('i18nextLng')

# 2. Check i18n.js configuration
Filesystem:read_text_file src/i18n.js

# 3. Check LanguageSwitcher.jsx
Filesystem:read_text_file src/LanguageSwitcher.jsx
```

---

## 💡 Example Scenarios

### "Add new warning message"
```bash
# 1. Add to English
Filesystem:read_text_file src/locales/en/selection.json
# Add: "warnings": { "newWarning": "Text here" }

# 2. Copy to Turkish
Filesystem:read_text_file src/locales/tr/selection.json
# Add: "warnings": { "newWarning": "Türkçe metin" }

# 3. Repeat for de, fr, es, ja, pt

# 4. Use in component
{t('selection:warnings.newWarning')}
```

### "Change critic sorting labels"
```bash
# 1. Find in results.json
Filesystem:read_text_file src/locales/en/results.json
# Find: "criticsList.sortOptions"

# 2. Update English
# 3. Update all other languages
# 4. Component automatically uses new text
```

---

## 📞 Quick Commands

```bash
# Check structure (English)
Filesystem:read_text_file src/locales/en/home.json
Filesystem:read_text_file src/locales/en/selection.json
Filesystem:read_text_file src/locales/en/results.json
Filesystem:read_text_file src/locales/en/common.json

# Check specific language
Filesystem:read_text_file src/locales/tr/home.json

# Check i18n setup
Filesystem:read_text_file src/i18n.js
Filesystem:read_text_file src/LanguageSwitcher.jsx
```

---

## 🎨 Language Switcher UI

Current design:
- Position: Fixed right-center (1x2 grid with theme toggle)
- Icon: 🌐 globe
- Style: Dropdown on click
- Persistence: localStorage

---

**Last Updated:** 2026-02-20
**Module Status:** ✅ Production Ready
**Languages:** 7 (en, tr, de, fr, es, ja, pt)
