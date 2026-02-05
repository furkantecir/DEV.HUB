// ============================================
// LANGUAGE MODULE - Internationalization (i18n)
// ============================================

const Language = {
    currentLang: 'en',

    // Translation dictionary
    translations: {
        en: {
            // Settings Page
            'system_settings': 'SYSTEM SETTINGS',
            'customize_workspace': 'Customize your workspace environment and manage local data preferences.',
            'interface': 'Interface',
            'color_mode': 'Color Mode',
            'toggle_appearance': 'Toggle application appearance',
            'dark': 'Dark',
            'light': 'Light',
            'accent_color': 'Accent Color',
            'override_primary': 'Override primary system color',
            'regional': 'Regional',
            'system_language': 'System Language',
            'select_language': 'Select your preferred interface language',
            'data_storage': 'Data & Storage',
            'export_json': 'Export JSON',
            'backup_settings': 'Backup your settings',
            'import_json': 'Import JSON',
            'restore_from_file': 'Restore from file',
            'danger_zone': 'DANGER ZONE',
            'danger_warning': 'This action cannot be undone. This will permanently delete your current configuration and reset to factory defaults.',
            'reset_all_data': 'Reset All Data',

            // Dashboard
            'dashboard': 'Dashboard',
            'code_tools': 'Code Tools',
            'converters': 'Converters',
            'settings': 'Settings',
            'web_tool_hub': 'WEB TOOL HUB',

            // Common
            'save': 'Save',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'edit': 'Edit',
            'close': 'Close',
        },
        tr: {
            // Settings Page
            'system_settings': 'SİSTEM AYARLARI',
            'customize_workspace': 'Çalışma alanı ortamınızı özelleştirin ve yerel veri tercihlerini yönetin.',
            'interface': 'Arayüz',
            'color_mode': 'Renk Modu',
            'toggle_appearance': 'Uygulama görünümünü değiştir',
            'dark': 'Koyu',
            'light': 'Açık',
            'accent_color': 'Vurgu Rengi',
            'override_primary': 'Birincil sistem rengini geçersiz kıl',
            'regional': 'Bölgesel',
            'system_language': 'Sistem Dili',
            'select_language': 'Tercih ettiğiniz arayüz dilini seçin',
            'data_storage': 'Veri ve Depolama',
            'export_json': 'JSON Dışa Aktar',
            'backup_settings': 'Ayarlarınızı yedekleyin',
            'import_json': 'JSON İçe Aktar',
            'restore_from_file': 'Dosyadan geri yükle',
            'danger_zone': 'TEHLİKE BÖLGESİ',
            'danger_warning': 'Bu işlem geri alınamaz. Mevcut yapılandırmanızı kalıcı olarak siler ve fabrika ayarlarına sıfırlar.',
            'reset_all_data': 'Tüm Verileri Sıfırla',

            // Dashboard
            'dashboard': 'Kontrol Paneli',
            'code_tools': 'Kod Araçları',
            'converters': 'Dönüştürücüler',
            'settings': 'Ayarlar',
            'web_tool_hub': 'WEB ARAÇ MERKEZİ',

            // Common
            'save': 'Kaydet',
            'cancel': 'İptal',
            'delete': 'Sil',
            'edit': 'Düzenle',
            'close': 'Kapat',
        }
    },

    // Initialize language
    init() {
        // Load from settings
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        if (settings && settings.language) {
            this.currentLang = settings.language;
        }
        this.applyLanguage();
    },

    // Get translation
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    // Change language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyLanguage();
            console.log('✅ Language changed to:', lang);
        }
    },

    // Apply language to page
    applyLanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Update text content or placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;

        console.log('✅ Language applied:', this.currentLang);
    }
};

// Initialize on load
if (typeof Storage !== 'undefined') {
    Language.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Language;
}
