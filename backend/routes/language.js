const express = require('express');
const router = express.Router();

/**
 * Language preference endpoints
 */

/**
 * POST /api/language
 * Store user language preference
 */
router.post('/', (req, res) => {
    const { language } = req.body;
    
    if (!language || !['en', 'fr', 'rw'].includes(language)) {
        return res.status(400).json({
            error: 'Invalid language',
            message: 'Language must be one of: en, fr, rw'
        });
    }

    // Set language cookie
    res.cookie('language', language, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // If user is authenticated, also store in database
    if (req.user) {
        // TODO: Update user language preference in database
        // await User.update({ language }, { where: { id: req.user.id } });
    }

    res.json({
        success: true,
        message: `Language set to ${language}`,
        language: language
    });
});

/**
 * GET /api/language
 * Get current language setting
 */
router.get('/', (req, res) => {
    const currentLanguage = req.language || 'en';
    
    res.json({
        currentLanguage: currentLanguage,
        availableLanguages: {
            en: 'English',
            fr: 'Français',
            rw: 'Kinyarwanda'
        }
    });
});

/**
 * GET /api/language/translations/:lang
 * Get translations for a specific language
 */
router.get('/translations/:lang', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const lang = req.params.lang;

    if (!['en', 'fr', 'rw'].includes(lang)) {
        return res.status(400).json({
            error: 'Invalid language',
            message: 'Language must be one of: en, fr, rw'
        });
    }

    try {
        const filePath = path.join(__dirname, `../../locales/${lang}.json`);
        const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        res.json({
            language: lang,
            translations: translations
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to load translations',
            message: error.message
        });
    }
});

module.exports = router;
