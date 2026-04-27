/**
 * i18n - Internationalization Module
 * Supports: English, French, Kinyarwanda
 */

class i18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.isLoading = false;
    }

    /**
     * Initialize i18n with translations
     */
    async init() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // Load all language files
            const languages = ['en', 'fr', 'rw'];
            for (const lang of languages) {
                const response = await fetch(`/locales/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                }
            }
            this.isLoading = false;
            this.applyLanguage(this.currentLanguage);
        } catch (error) {
            console.error('Failed to load translations:', error);
            this.isLoading = false;
        }
    }

    /**
     * Get translated string
     * @param {string} key - Translation key (e.g., 'header.home')
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        // Replace parameters in the translation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                value = value.replace(`{{${param}}}`, params[param]);
            });
        }

        return typeof value === 'string' ? value : key;
    }

    /**
     * Set current language
     */
    setLanguage(lang) {
        console.log('=== SET LANGUAGE CALLED ===');
        console.log('Requested language:', lang);
        console.log('Available translations:', Object.keys(this.translations));
        console.log('Translation for requested language exists:', !!this.translations[lang]);
        
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            console.log('Language set to:', lang);
            this.applyLanguage(lang);
            document.documentElement.lang = lang;
            console.log('Language applied and document lang updated');
        } else {
            console.warn('Translation not available for language:', lang);
            console.log('Available languages:', Object.keys(this.translations));
        }
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get all available languages
     */
    getLanguages() {
        return {
            en: 'English',
            fr: 'Français',
            rw: 'Kinyarwanda'
        };
    }

    /**
     * Apply language to DOM
     */
    applyLanguage(lang) {
        console.log('=== APPLY LANGUAGE CALLED ===');
        console.log('Applying language:', lang);
        
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('Found elements with data-i18n:', elements.length);
        
        // Update all elements with data-i18n attribute
        elements.forEach((element, index) => {
            const key = element.getAttribute('data-i18n');
            const paramsAttr = element.getAttribute('data-i18n-params');
            let params = {};
            
            if (paramsAttr) {
                try {
                    params = JSON.parse(paramsAttr);
                } catch (e) {
                    console.error('Error parsing i18n params:', e);
                }
            }

            const translation = this.t(key, params);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder === '' || element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else if (key.startsWith('[placeholder]')) {
                    element.placeholder = this.t(key.replace('[placeholder]', ''), params);
                } else {
                    element.value = translation;
                }
            } else if (element.tagName === 'BUTTON') {
                element.innerHTML = translation;
            } else {
                element.innerHTML = translation;
            }
        });

        console.log('Language applied to DOM elements');

        // Dispatch event for custom language change handling
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        console.log('Language changed event dispatched');
    }

    /**
     * Format a number according to locale
     */
    formatNumber(number) {
        return new Intl.NumberFormat(this.currentLanguage).format(number);
    }

    /**
     * Format a date according to locale
     */
    formatDate(date, options = {}) {
        return new Intl.DateTimeFormat(this.currentLanguage, options).format(new Date(date));
    }

    /**
     * Format a currency according to locale
     */
    formatCurrency(amount, currency = 'RWF') {
        return new Intl.NumberFormat(this.currentLanguage, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

// Create global instance
const i18nInstance = new i18n();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing i18n...');
        i18nInstance.init().then(() => {
            console.log('i18n initialized successfully');
        });
    });
} else {
    console.log('DOM already loaded, initializing i18n...');
    i18nInstance.init().then(() => {
        console.log('i18n initialized successfully');
    });
}
