
// ==========================================
// CENTRAL SETTINGS LOGIC & TRANSLATIONS
// ==========================================

const TRANSLATIONS = {
    'en': {
        // --- Sidebar ---
        menu_dashboard: 'Dashboard',
        menu_file_tools: 'File Tools',
        menu_image_tools: 'Image Tools',
        menu_code_tools: 'Code Tools',
        menu_converters: 'Converters',
        menu_configuration: 'Configuration',
        menu_settings: 'Settings',
        menu_profile: 'Profile',
        user_status: 'Pro Workspace',

        // --- Settings Page ---
        header_subtitle: 'Configuration',
        header_title: 'System Settings',
        header_desc: 'Customize your workspace environment and manage local data preferences.',
        sect_interface: 'Interface',
        opt_color_mode: 'Color Mode',
        opt_color_mode_desc: 'Toggle application appearance',
        opt_accent: 'Accent Color',
        opt_accent_desc: 'Override primary system color',
        sect_regional: 'Regional',
        opt_lang: 'System Language',
        opt_lang_desc: 'Select your preferred interface language',
        sect_storage: 'Data & Storage',
        danger_zone: 'Danger Zone',
        btn_reset: 'RESET ALL DATA',
        opt_json_export: 'Export JSON',
        opt_json_import: 'Import JSON',
        mode_dark: 'Dark',
        mode_light: 'Light',

        // --- Dashboard (Utilities) ---
        dash_system_online: 'SYSTEM: ONLINE',
        dash_offline_mode: 'Offline Mode',
        dash_title: 'System Utilities',
        dash_subtitle: 'Select a tool to initialize module v2.4.0',
        input_placeholder: 'Execute command or search tool...',

        // Tools
        tool_pomodoro: 'Pomodoro Timer',
        tool_pomodoro_desc: 'Stopped • 25:00',
        tool_notes: 'Quick Notes',
        tool_notes_desc: 'Scratchpad Active',
        tool_todo: 'To-Do List',
        tool_todo_desc: '3 Tasks Pending',
        tool_qr: 'QR Generator',
        tool_qr_desc: 'Ready for Input',
        tool_calc: 'Calculator',
        tool_calc_desc: 'Standard Mode',
        tool_add_widget: 'Add Widget',

        // New Tools
        tool_hash: 'Hash Generator',
        tool_timestamp: 'Timestamp Converter',
        tool_json_fmt: 'JSON Formatter',
        tool_json_val: 'JSON Validator',
        tool_regex: 'Regex Tester',
        tool_base64: 'Base64 Encoder',
        tool_md: 'Markdown Preview',
        tool_sql: 'SQL Formatter',
        tool_case: 'Case Converter',
        tool_lorem: 'Lorem Ipsum',
        tool_img_comp: 'Image Compressor',
        tool_img_conv: 'Image Converter',
        tool_exif: 'EXIF Remover',
        tool_pixel: 'Pixel Crusher',
        tool_svg: 'SVG Optimizer',
        tool_color_pick: 'Color Picker',
        tool_palette: 'Palette Generator',
        tool_library: 'Color Library',
        tool_unit: 'Unit Converter',
        tool_world: 'World Clock',
        tool_net_tools: 'Network Tools',
        tool_net_scan: 'Network Scanner',
        tool_net_map: 'Network Map',
        tool_pass: 'Password Vault',
        tool_cpu: 'CPU Monitor',
        tool_clean: 'Clean Cache',
        tool_diff: 'Diff Checker',
        tool_playground: 'Code Playground',
        tool_cron: 'Cron Generator',

        // Footer
        footer_docs: 'DOCS',
        footer_shortcuts: 'SHORTCUTS',
        footer_source: 'SOURCE',
        footer_storage: 'STORAGE'
    },
    'tr': {
        // --- Sidebar ---
        menu_dashboard: 'Kontrol Paneli',
        menu_file_tools: 'Dosya Araçları',
        menu_image_tools: 'Görsel Araçlar',
        menu_code_tools: 'Kod Araçları',
        menu_converters: 'Dönüştürücüler',
        menu_configuration: 'Yapılandırma',
        menu_settings: 'Ayarlar',
        menu_profile: 'Profil',
        user_status: 'Pro Çalışma Alanı',

        // --- Settings Page ---
        header_subtitle: 'Yapılandırma',
        header_title: 'Sistem Ayarları',
        header_desc: 'Çalışma alanı ortamınızı özelleştirin ve yerel veri tercihlerini yönetin.',
        sect_interface: 'Arayüz',
        opt_color_mode: 'Renk Modu',
        opt_color_mode_desc: 'Uygulama görünümünü değiştir',
        opt_accent: 'Vurgu Rengi',
        opt_accent_desc: 'Ana sistem rengini değiştir',
        sect_regional: 'Bölgesel',
        opt_lang: 'Sistem Dili',
        opt_lang_desc: 'Arayüz dilini değiştir',
        sect_storage: 'Veri ve Depolama',
        danger_zone: 'Tehlike Bölgesi',
        btn_reset: 'TÜM VERİLERİ SIFIRLA',
        opt_json_export: 'JSON Dışa Aktar',
        opt_json_import: 'JSON İçe Aktar',
        mode_dark: 'Koyu',
        mode_light: 'Açık',

        // --- Dashboard (Utilities) ---
        dash_system_online: 'SİSTEM: ÇEVRİMİÇİ',
        dash_offline_mode: 'Çevrimdışı Mod',
        dash_title: 'Sistem Araçları',
        dash_subtitle: 'Modülü başlatmak için bir araç seçin v2.4.0',
        input_placeholder: 'Komut çalıştır veya araç ara...',

        // Tools
        tool_pomodoro: 'Pomodoro Sayacı',
        tool_pomodoro_desc: 'Durduruldu • 25:00',
        tool_notes: 'Hızlı Notlar',
        tool_notes_desc: 'Not Defteri Aktif',
        tool_todo: 'Yapılacaklar',
        tool_todo_desc: '3 Görev Bekliyor',
        tool_qr: 'QR Oluşturucu',
        tool_qr_desc: 'Giriş Bekleniyor',
        tool_calc: 'Hesap Makinesi',
        tool_calc_desc: 'Standart Mod',
        tool_add_widget: 'Araç Ekle',

        // New Tools
        tool_hash: 'Hash Oluşturucu',
        tool_timestamp: 'Zaman Damgası',
        tool_json_fmt: 'JSON Biçimlendirici',
        tool_json_val: 'JSON Doğrulayıcı',
        tool_regex: 'Regex Test',
        tool_base64: 'Base64 Kodlayıcı',
        tool_md: 'Markdown Önizleme',
        tool_sql: 'SQL Biçimlendirici',
        tool_case: 'Büyük/Küçük Harf',
        tool_lorem: 'Lorem Ipsum',
        tool_img_comp: 'Resim Sıkıştırıcı',
        tool_img_conv: 'Resim Dönüştürücü',
        tool_exif: 'EXIF Temizleyici',
        tool_pixel: 'Pixel Crusher',
        tool_svg: 'SVG Optimize',
        tool_color_pick: 'Renk Seçici',
        tool_palette: 'Palet Oluşturucu',
        tool_library: 'Renk Kütüphanesi',
        tool_unit: 'Birim Çevirici',
        tool_world: 'Dünya Saati',
        tool_net_tools: 'Ağ Araçları',
        tool_net_scan: 'Ağ Tarayıcı',
        tool_net_map: 'Ağ Haritası',
        tool_pass: 'Şifre Kasası',
        tool_cpu: 'CPU Monitörü',
        tool_clean: 'Önbellek Temizle',
        tool_diff: 'Metin Karşılaştırıcı',
        tool_playground: 'Kod Alanı',
        tool_cron: 'Cron Oluşturucu',

        // Footer
        footer_docs: 'DOKÜMANLAR',
        footer_shortcuts: 'KISAYOLLAR',
        footer_source: 'KAYNAK',
        footer_storage: 'DEPOLAMA'
    }
};

// ==========================================
// CORE SYSTEM
// ==========================================

function initSystem() {
    console.log('🔄 System Initializing...');

    // 1. Load & Apply Color
    const savedColor = localStorage.getItem('app_accent_color') || '#7f13ec';
    applyAccentColor(savedColor);

    // 2. Load & Apply Theme
    const savedTheme = localStorage.getItem('app_theme') || 'dark';
    applyTheme(savedTheme);

    // 3. Load & Apply Language
    const savedLang = localStorage.getItem('app_language') || 'en';
    applyLanguage(savedLang);

    // 4. Update UI Controls (Active States)
    updateControls(savedColor, savedTheme, savedLang);
}

// ------------------------------------------
// THEME LOGIC (Dark/Light)
// ------------------------------------------
function setTheme(mode) {
    console.log('🎨 Theme changing to:', mode);
    localStorage.setItem('app_theme', mode);
    applyTheme(mode);
    updateControls(
        localStorage.getItem('app_accent_color'),
        mode,
        localStorage.getItem('app_language')
    );
}

function applyTheme(mode) {
    const html = document.documentElement;
    if (mode === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
    } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
    }
}

// ------------------------------------------
// COLOR LOGIC (Enhanced with more options)
// ------------------------------------------

// Preset color themes
const COLOR_PRESETS = {
    purple: '#7f13ec',      // Original
    blue: '#3b82f6',        // Blue
    cyan: '#06b6d4',        // Cyan
    green: '#10b981',       // Green
    orange: '#f59e0b',      // Orange
    red: '#ef4444',         // Red
    pink: '#ec4899',        // Pink
    indigo: '#6366f1',      // Indigo
};

function setAccentColor(color, btnElement) {
    console.log('🖍 Accent changing to:', color);
    localStorage.setItem('app_accent_color', color);
    applyAccentColor(color);

    // Track theme changes for stats
    if (window.usageStats) {
        window.usageStats.trackThemeChange();
    }

    // Update local UI selection
    document.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('selected'));
    if (btnElement) btnElement.classList.add('selected');
}

function applyAccentColor(color) {
    document.documentElement.style.setProperty('--color-primary', color);
}

// Custom color picker
function setCustomColor(inputElement) {
    const color = inputElement.value;
    setAccentColor(color);

    // Update custom button to show selected state
    const customBtn = document.querySelector('.custom-color-btn');
    if (customBtn) {
        customBtn.style.background = `linear-gradient(135deg, ${color}, ${color}dd)`;
        customBtn.classList.add('selected');
    }
}

// Get current accent color
function getCurrentAccentColor() {
    return localStorage.getItem('app_accent_color') || COLOR_PRESETS.purple;
}


// ------------------------------------------
// LANGUAGE LOGIC
// ------------------------------------------
function setLanguage(lang) {
    console.log('🌐 Language changing to:', lang);
    localStorage.setItem('app_language', lang);
    applyLanguage(lang);
}

function applyLanguage(lang) {
    const textData = TRANSLATIONS[lang];
    if (!textData) return;

    // Metinleri Değiştir
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (textData[key]) {
            // Eğer input ise placeholder'ı değiştir
            if (el.tagName === 'INPUT') {
                el.placeholder = textData[key];
            } else {
                el.textContent = textData[key];
            }
        }
    });

    // Select kutusunu güncelle (eğer varsa)
    const langSelect = document.getElementById('language-select');
    if (langSelect && langSelect.value !== lang) {
        langSelect.value = lang;
    }
}

// ------------------------------------------
// UI STATE UPDATER
// ------------------------------------------
function updateControls(color, theme, lang) {
    // 1. Color Buttons Selection
    document.querySelectorAll('.accent-btn').forEach(btn => {
        if (btn.dataset.color === color) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    // 2. Theme Buttons (REMOVED)

    // 3. Language Select
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = lang;
}

function resetAllData() {
    if (confirm('RESET ALL DATA? / TÜM VERİLERİ SIFIRLA?')) {
        localStorage.clear();
        location.reload();
    }
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', initSystem);

// Export to Window (Global Access)
window.setTheme = setTheme;
window.setAccentColor = setAccentColor;
window.setCustomColor = setCustomColor;
window.getCurrentAccentColor = getCurrentAccentColor;
window.COLOR_PRESETS = COLOR_PRESETS;
window.setLanguage = setLanguage;
window.resetAllData = resetAllData;
