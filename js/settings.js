// ============================================
// SETTINGS MODULE - App Settings Management
// ============================================

const Settings = {
    settings: null,

    // Default settings
    defaults: {
        theme: 'dark',
        accentColor: '#7f13ec',
        language: 'en',
        pomodoroMinutes: 25,
        breakMinutes: 5,
        soundEnabled: true,
        notificationsEnabled: true,
        autoStartBreak: false,
        autoStartPomodoro: false
    },

    // Initialize settings
    init() {
        this.loadSettings();
    },

    // Load settings from storage
    loadSettings() {
        this.settings = Storage.get(Storage.KEYS.SETTINGS);
        if (!this.settings) {
            this.settings = { ...this.defaults };
            this.saveSettings();
        }
        this.applySettings();
    },

    // Save settings to storage
    saveSettings() {
        Storage.set(Storage.KEYS.SETTINGS, this.settings);
    },

    // Get setting value
    get(key) {
        return this.settings[key];
    },

    // Set setting value
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    },

    // Update multiple settings
    update(updates) {
        Object.assign(this.settings, updates);
        this.saveSettings();
        this.applySettings();
    },

    // Reset to defaults
    reset() {
        this.settings = { ...this.defaults };
        this.saveSettings();
        this.applySettings();
    },

    // Apply settings to UI
    applySettings() {
        // Apply theme
        this.applyTheme();

        // Apply accent color
        this.applyAccentColor();

        // Update timer durations
        if (typeof Timer !== 'undefined') {
            Timer.loadSettings();
        }
    },

    // Apply theme
    applyTheme() {
        const theme = this.settings.theme;
        const html = document.documentElement;

        if (theme === 'dark') {
            html.classList.add('dark');
            html.classList.remove('light');
        } else {
            html.classList.remove('dark');
            html.classList.add('light');
        }

        console.log('✅ Theme applied:', theme);
    },

    // Apply accent color
    applyAccentColor() {
        const color = this.settings.accentColor;

        // Set CSS variable
        document.documentElement.style.setProperty('--color-primary', color);

        // Update all elements with primary color classes
        const style = document.createElement('style');
        style.id = 'dynamic-accent-color';

        // Remove old style if exists
        const oldStyle = document.getElementById('dynamic-accent-color');
        if (oldStyle) oldStyle.remove();

        style.textContent = `
            :root {
                --color-primary: ${color};
            }
            .text-primary { color: ${color} !important; }
            .bg-primary { background-color: ${color} !important; }
            .border-primary { border-color: ${color} !important; }
            .ring-primary { --tw-ring-color: ${color} !important; }
            .hover\\:text-primary:hover { color: ${color} !important; }
            .hover\\:bg-primary:hover { background-color: ${color} !important; }
            .hover\\:border-primary:hover { border-color: ${color} !important; }
            .focus\\:border-primary:focus { border-color: ${color} !important; }
            .focus\\:ring-primary:focus { --tw-ring-color: ${color} !important; }
            .peer-checked\\:bg-primary:checked { background-color: ${color} !important; }
            .peer-checked\\:border-primary:checked { border-color: ${color} !important; }
            .peer-checked\\:ring-primary:checked { --tw-ring-color: ${color} !important; }
            .dark .dark\\:text-primary { color: ${color} !important; }
            .dark .dark\\:bg-primary { background-color: ${color} !important; }
            .dark .dark\\:border-primary { border-color: ${color} !important; }
        `;

        document.head.appendChild(style);

        console.log('✅ Accent color applied:', color);
    },

    // Toggle theme
    toggleTheme() {
        const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.set('theme', newTheme);
        return newTheme;
    },

    // Export settings
    export() {
        return { ...this.settings };
    },

    // Import settings
    import(settings) {
        this.settings = { ...this.defaults, ...settings };
        this.saveSettings();
        this.applySettings();
    },

    // Password management
    password: {
        // Hash password using simple SHA-256 (for demo purposes)
        async hash(password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

        // Set password
        async set(password) {
            const hashed = await this.hash(password);
            Storage.set(Storage.KEYS.PASSWORD, {
                hash: hashed,
                createdAt: new Date().toISOString()
            });
            return true;
        },

        // Verify password
        async verify(password) {
            const stored = Storage.get(Storage.KEYS.PASSWORD);
            if (!stored) return false;

            const hashed = await this.hash(password);
            return hashed === stored.hash;
        },

        // Check if password exists
        exists() {
            return Storage.get(Storage.KEYS.PASSWORD) !== null;
        },

        // Remove password
        remove() {
            Storage.remove(Storage.KEYS.PASSWORD);
        }
    }
};

// Initialize on load
Settings.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Settings;
}
