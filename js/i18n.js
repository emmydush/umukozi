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
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.applyLanguage(lang);
            document.documentElement.lang = lang;
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
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder === '' || element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else if (element.tagName === 'BUTTON') {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Dispatch event for custom language change handling
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
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
    document.addEventListener('DOMContentLoaded', () => i18nInstance.init());
} else {
    i18nInstance.init();
}
