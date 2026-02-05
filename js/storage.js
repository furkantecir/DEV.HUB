// ============================================
// STORAGE MODULE - LocalStorage Management
// ============================================

const Storage = {
    // Keys
    KEYS: {
        TASKS: 'focusapp_tasks',
        TIMER_STATE: 'focusapp_timer_state',
        DAILY_PROGRESS: 'focusapp_daily_progress',
        SETTINGS: 'focusapp_settings',
        PASSWORD: 'focusapp_password',
        VAULT_PASSWORDS: 'focusapp_vault_passwords',
        ACTIVITY_LOG: 'focusapp_activity_log',
        STATS: 'focusapp_stats'
    },

    // Get item from localStorage
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            return false;
        }
    },

    // Clear all app data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },

    // Get storage usage
    getUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            bytes: total,
            kb: (total / 1024).toFixed(2),
            mb: (total / 1024 / 1024).toFixed(2)
        };
    },

    // Initialize default data
    init() {
        // Initialize settings if not exists
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, {
                theme: 'dark',
                accentColor: '#7f13ec',
                language: 'en',
                pomodoroMinutes: 25,
                breakMinutes: 5,
                soundEnabled: true,
                notificationsEnabled: true
            });
        }

        // Initialize tasks if not exists
        if (!this.get(this.KEYS.TASKS)) {
            this.set(this.KEYS.TASKS, []);
        }

        // Initialize daily progress if not exists
        if (!this.get(this.KEYS.DAILY_PROGRESS)) {
            this.set(this.KEYS.DAILY_PROGRESS, {
                date: new Date().toDateString(),
                focusMinutes: 0,
                tasksCompleted: 0,
                sessions: []
            });
        }

        // Initialize stats if not exists
        if (!this.get(this.KEYS.STATS)) {
            this.set(this.KEYS.STATS, {
                totalFocusMinutes: 0,
                totalTasksCompleted: 0,
                totalSessions: 0,
                streak: 0
            });
        }

        // Initialize activity log if not exists
        if (!this.get(this.KEYS.ACTIVITY_LOG)) {
            this.set(this.KEYS.ACTIVITY_LOG, []);
        }

        // Initialize vault passwords if not exists
        if (!this.get(this.KEYS.VAULT_PASSWORDS)) {
            this.set(this.KEYS.VAULT_PASSWORDS, []);
        }
    },

    // Export all data as JSON
    exportData() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            data[name] = this.get(key);
        });
        return data;
    },

    // Import data from JSON
    importData(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                const key = this.KEYS[name];
                if (key) {
                    this.set(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

// Initialize storage on load
Storage.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
