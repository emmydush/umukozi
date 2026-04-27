/**
 * Language Selector Controller
 * Handles language dropdown menu and language switching with Event Delegation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only initialize language selector on homepage, not on dashboard
    if (document.getElementById('app') && !document.querySelector('.dashboard')) {
        initLanguageSelector();
    }
});

function initLanguageSelector() {
    // Dropdown toggle using delegation
    document.addEventListener('click', function(e) {
        const langBtn = e.target.closest('#langBtn');
        const langMenu = document.getElementById('langMenu');
        
        if (langBtn && langMenu) {
            e.stopPropagation();
            langMenu.classList.toggle('active');
        } else if (langMenu && !e.target.closest('.language-selector')) {
            // Close if clicking outside
            langMenu.classList.remove('active');
        }
    });

    // Language option selection using delegation
    document.addEventListener('click', function(e) {
        const option = e.target.closest('.lang-option');
        if (option) {
            const langCode = option.getAttribute('data-lang');
            const langMenu = document.getElementById('langMenu');
            
            changeLanguage(langCode);
            if (langMenu) langMenu.classList.remove('active');
        }
    });

    // Update display with current language
    updateLanguageDisplay();
}

function changeLanguage(langCode) {
    console.log('=== LANGUAGE CHANGE ATTEMPT ===', langCode);
    
    try {
        if (typeof i18nInstance !== 'undefined') {
            i18nInstance.setLanguage(langCode);
            updateLanguageDisplay();
            
            // Persist to backend if needed
            fetch('/api/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: langCode })
            }).catch(() => {});
        }
    } catch (error) {
        console.error('Error changing language:', error);
    }
}

function updateLanguageDisplay() {
    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay && typeof i18nInstance !== 'undefined') {
        const currentLang = i18nInstance.getLanguage();
        const langMap = { 'en': 'EN', 'fr': 'FR', 'rw': 'RW' };
        langDisplay.textContent = langMap[currentLang] || 'EN';
        
        // Update active state in menu
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.toggle('active', option.getAttribute('data-lang') === currentLang);
        });
    }
}

// Global helper to refresh display (useful when switching dashboards)
window.refreshLanguageUI = updateLanguageDisplay;

// Listen for custom events
window.addEventListener('languageChanged', () => {
    updateLanguageDisplay();
});
