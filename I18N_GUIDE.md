# Umukozi Internationalization (i18n) Guide

## Overview
Umukozi now supports three languages:
- **English** (en) - Default
- **Français** (fr) - French
- **Kinyarwanda** (rw) - Kinyarwanda

## Architecture

### Frontend i18n
- **File**: `js/i18n.js`
- Uses localStorage to persist user's language preference
- Automatically loads translation files from `locales/` directory
- Provides translation methods for dynamic content

### Backend i18n
- **File**: `backend/middleware/i18n.js`
- Express middleware that detects and manages language preferences
- Supports language detection from:
  1. Query parameter (`?lang=en`)
  2. Accept-Language header
  3. Browser cookies
  4. Local storage
- Provides translation methods for API responses

### Language Files
Translation files are located in `locales/` directory:
- `locales/en.json` - English translations
- `locales/fr.json` - French translations
- `locales/rw.json` - Kinyarwanda translations

## How to Use

### Frontend Usage

#### 1. Add i18n Script
Include in your HTML `<head>`:
```html
<script src="js/i18n.js"></script>
<script src="js/language-selector.js"></script>
```

#### 2. Mark Elements for Translation
Use `data-i18n` attribute:
```html
<!-- Text content -->
<h1 data-i18n="header.home">Home</h1>

<!-- Button content -->
<button data-i18n="header.login">Login</button>

<!-- Placeholder text -->
<input type="email" data-i18n-placeholder="auth.email" placeholder="Email">
```

#### 3. Translate Dynamic Content in JavaScript
```javascript
// Get translated text
const translatedText = i18nInstance.t('header.home');

// With parameters
const welcomeMsg = i18nInstance.t('dashboard.welcome', { name: 'John' });

// Format currency
const price = i18nInstance.formatCurrency(5000, 'RWF');

// Format date
const date = i18nInstance.formatDate('2024-04-26', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// Change language
i18nInstance.setLanguage('fr'); // Switch to French
```

#### 4. Language Selector Component
The application includes a language dropdown in the header. Users can click the globe icon to select their preferred language.

### Backend Usage

#### 1. Initialize i18n in server.js
```javascript
const I18nBackend = require('./middleware/i18n');

const i18n = new I18nBackend();
i18n.loadTranslations();

// Add middleware
app.use(i18n.middleware());
```

#### 2. Use in Route Handlers
```javascript
router.get('/api/example', (req, res) => {
    // req.language contains current language code
    const currentLang = req.language; // 'en', 'fr', or 'rw'
    
    // Use translation function
    const welcomeMsg = req.t('hero.title');
    
    return res.json({
        message: welcomeMsg,
        language: currentLang
    });
});
```

#### 3. Language API Endpoints
```
GET  /api/language                 - Get current language
POST /api/language                 - Set language preference
GET  /api/language/translations/:lang - Get translations for a language
```

## Adding New Translations

### 1. Update Translation Files
Edit the corresponding JSON file in `locales/`:

```json
{
  "common": {
    "myNewKey": "My translated text"
  }
}
```

### 2. Update All Three Language Files
Ensure consistency across `en.json`, `fr.json`, and `rw.json`.

### Example Structure
```json
{
  "section": {
    "subsection": {
      "key": "Translated text"
    }
  }
}
```

### 3. Use in HTML
```html
<p data-i18n="section.subsection.key">Default English text</p>
```

### 4. Use in JavaScript
```javascript
const text = i18nInstance.t('section.subsection.key');
```

## Translation Keys Structure

The translation system uses a hierarchical key structure:

```
header.home          → Navigation home link
hero.title          → Hero section heading
features.verified    → Verified workers feature card
auth.loginTitle     → Login form title
dashboard.welcome   → Dashboard welcome message
footer.address      → Footer address
```

## Parameters in Translations

Use `{{paramName}}` for dynamic content:

```json
{
  "dashboard": {
    "welcome": "Welcome, {{name}}"
  }
}
```

Usage:
```javascript
i18nInstance.t('dashboard.welcome', { name: 'John' });
// Output: "Welcome, John"
```

## Browser Storage

Language preference is stored in:
- **localStorage** - For persistence across browser sessions
- **Cookie** - Set by backend for server-side awareness
- **Browser cache** - Translation files cached for performance

## Best Practices

### 1. Naming Conventions
- Use lowercase keys with dots: `header.home`, `hero.title`
- Use descriptive names: `auth.forgotPassword` instead of `auth.forgot`
- Group related translations: `auth.*`, `dashboard.*`

### 2. Translation Order
When adding new strings:
1. Add to primary language (English)
2. Translate to French
3. Translate to Kinyarwanda
4. Test in all languages

### 3. String Length
- English is baseline
- French tends to be longer (+10-15%)
- Kinyarwanda varies by word length
- Ensure UI layouts accommodate longer strings

### 4. Special Characters
- French: é, è, ê, ë, à, ü, ç, œ
- Kinyarwanda: includes standard romanized characters
- All supported in JSON with UTF-8 encoding

## Testing

### Test Language Switching
1. Click language selector in header
2. Verify all text updates
3. Check localStorage has correct language
4. Refresh page - language persists

### Test All Languages
- Verify text displays correctly
- Check character encoding
- Ensure buttons and links work
- Test RTL support (if needed in future)

### Test API Responses
```bash
# Get translation
curl "http://localhost:3000/api/language/translations/fr"

# Set language
curl -X POST "http://localhost:3000/api/language" \
  -H "Content-Type: application/json" \
  -d '{"language":"rw"}'
```

## Performance Optimization

- Translation files are loaded once on page load
- Cached in browser memory
- Re-translations only when language changes
- No additional API calls for translations

## Fallback Behavior

- If key not found in selected language → returns the key itself
- If language not supported → defaults to English
- Missing language files → logged as warnings

## Future Enhancements

- [ ] Database storage for translations (admin editing)
- [ ] RTL language support (if needed)
- [ ] Pluralization support
- [ ] Translation management UI
- [ ] Export/import translations
- [ ] Translation memory system

## Troubleshooting

### Translations not updating
1. Check browser console for errors
2. Verify i18n.js is loaded
3. Check localStorage for language key
4. Clear browser cache

### Missing translations
1. Verify key exists in JSON file
2. Check for typos in key name
3. Ensure file is valid JSON
4. Check file permissions

### Language not persisting
1. Check if cookies are enabled
2. Verify localStorage works
3. Check for privacy mode restrictions

## Support

For issues or new language requests:
1. Verify translations are complete
2. Test in all browsers
3. Submit translation files
4. Document any special requirements
