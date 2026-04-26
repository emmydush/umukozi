/**
 * Internationalization Middleware for Node.js/Express
 * Supports: English, French, Kinyarwanda
 */

class I18nBackend {
    constructor() {
        this.translations = {};
        this.defaultLanguage = 'en';
        this.supportedLanguages = ['en', 'fr', 'rw'];
    }

    /**
     * Load translations from files
     */
    loadTranslations() {
        const fs = require('fs');
        const path = require('path');

        this.supportedLanguages.forEach(lang => {
            try {
                const filePath = path.join(__dirname, `../locales/${lang}.json`);
                this.translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.warn(`Failed to load translations for ${lang}:`, error.message);
            }
        });
    }

    /**
     * Express middleware to detect language
     */
    middleware() {
        return (req, res, next) => {
            // Get language from query, header, or cookie (in order of priority)
            const lang = 
                req.query.lang ||
                req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
                req.cookies?.language ||
                this.defaultLanguage;

            // Validate language
            req.language = this.supportedLanguages.includes(lang) ? lang : this.defaultLanguage;

            // Add translation method to request
            req.t = (key, params = {}) => this.translate(req.language, key, params);

            // Add locale info to response locals for views
            res.locals.language = req.language;
            res.locals.languages = this.supportedLanguages;
            res.locals.t = req.t;

            next();
        };
    }

    /**
     * Translate a key to the specified language
     */
    translate(lang, key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[lang];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if not found
            }
        }

        // Replace parameters
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                value = value.replace(`{{${param}}}`, params[param]);
            });
        }

        return typeof value === 'string' ? value : key;
    }

    /**
     * Get all supported languages with their names
     */
    getLanguages() {
        return {
            en: 'English',
            fr: 'Français',
            rw: 'Kinyarwanda'
        };
    }

    /**
     * Get language direction (for RTL support in future)
     */
    getDirection(lang) {
        // All these languages are LTR
        return 'ltr';
    }
}

module.exports = I18nBackend;
