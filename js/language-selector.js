/**
 * Language Selector Controller
 * Handles language dropdown menu and language switching
 */

document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
});

function initLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    const langOptions = document.querySelectorAll('.lang-option');
    const langDisplay = document.getElementById('langDisplay');

    if (!langBtn || !langMenu) return;

    // Toggle language menu
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        langMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.language-selector')) {
            langMenu.classList.remove('active');
        }
    });

    // Language option click handler
    langOptions.forEach(option => {
        option.addEventListener('click', function() {
            const langCode = this.getAttribute('data-lang');
            changeLanguage(langCode);
            langMenu.classList.remove('active');
        });
    });

    // Update display with current language
    updateLanguageDisplay();
}

function changeLanguage(langCode) {
    // Set language in i18n instance
    i18nInstance.setLanguage(langCode);
    
    // Update display
    updateLanguageDisplay();
    
    // Send to backend for session persistence
    fetch('/api/language', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language: langCode })
    }).catch(err => console.log('Language update to backend:', err));
}

function updateLanguageDisplay() {
    const langDisplay = document.getElementById('langDisplay');
    if (langDisplay) {
        const currentLang = i18nInstance.getLanguage();
        const langMap = {
            'en': 'EN',
            'fr': 'FR',
            'rw': 'RW'
        };
        langDisplay.textContent = langMap[currentLang] || 'EN';
    }

    // Highlight active language option
    document.querySelectorAll('.lang-option').forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-lang') === i18nInstance.getLanguage()) {
            option.classList.add('active');
        }
    });
}

// Listen for language change events
window.addEventListener('languageChanged', function(e) {
    console.log('Language changed to:', e.detail.language);
    // You can add additional logic here for language-specific actions
});
