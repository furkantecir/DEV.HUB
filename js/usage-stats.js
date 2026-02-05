// ============================================
// USAGE STATISTICS & ANALYTICS SYSTEM
// Kullanıcı aktivitelerini takip eder
// ============================================

class UsageStats {
    constructor() {
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackToolUsage();
        this.updateDailyStats();
    }

    // LocalStorage'dan stats yükle
    loadStats() {
        const defaultStats = {
            totalSessions: 0,
            totalToolsUsed: 0,
            totalTimeSpent: 0, // minutes
            firstVisit: Date.now(),
            lastVisit: Date.now(),
            activeDays: [],
            toolUsage: {}, // { toolId: count }
            dailyActivity: {}, // { date: { sessions: 0, tools: 0, time: 0 } }
            favoriteTools: [],
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            themeChanges: 0,
        };

        const saved = localStorage.getItem('usage_stats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    // Stats'ı kaydet
    saveStats() {
        localStorage.setItem('usage_stats', JSON.stringify(this.stats));
    }

    // Sayfa görüntüleme takibi
    trackPageView() {
        const today = this.getToday();

        // Session tracking
        const lastSession = localStorage.getItem('last_session_time');
        const now = Date.now();

        // Yeni session (1 saat sonra)
        if (!lastSession || (now - parseInt(lastSession)) > 3600000) {
            this.stats.totalSessions++;

            // Daily activity
            if (!this.stats.dailyActivity[today]) {
                this.stats.dailyActivity[today] = { sessions: 0, tools: 0, time: 0 };
            }
            this.stats.dailyActivity[today].sessions++;
        }

        localStorage.setItem('last_session_time', now.toString());
        this.stats.lastVisit = now;

        this.saveStats();
    }

    // Araç kullanımı takibi
    trackToolUsage() {
        const currentPage = window.location.pathname;
        const toolId = this.getToolIdFromPath(currentPage);

        if (toolId && toolId !== 'utilities' && toolId !== 'index') {
            this.incrementToolUsage(toolId);
        }
    }

    // Path'ten tool ID çıkar
    getToolIdFromPath(path) {
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'index';
    }

    // Araç kullanım sayısını artır
    incrementToolUsage(toolId) {
        const today = this.getToday();

        // Tool usage count
        if (!this.stats.toolUsage[toolId]) {
            this.stats.toolUsage[toolId] = 0;
        }
        this.stats.toolUsage[toolId]++;
        this.stats.totalToolsUsed++;

        // Daily activity
        if (!this.stats.dailyActivity[today]) {
            this.stats.dailyActivity[today] = { sessions: 0, tools: 0, time: 0 };
        }
        this.stats.dailyActivity[today].tools++;

        this.saveStats();
    }

    // Günlük istatistikleri güncelle
    updateDailyStats() {
        const today = this.getToday();

        // Active days tracking
        if (!this.stats.activeDays.includes(today)) {
            this.stats.activeDays.push(today);
            this.updateStreak();
        }

        this.saveStats();
    }

    // Streak hesapla
    updateStreak() {
        const sortedDays = this.stats.activeDays.sort();
        let currentStreak = 1;
        let longestStreak = 1;
        let tempStreak = 1;

        for (let i = 1; i < sortedDays.length; i++) {
            const prevDate = new Date(sortedDays[i - 1]);
            const currDate = new Date(sortedDays[i]);
            const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        // Check if today continues the streak
        const lastDay = sortedDays[sortedDays.length - 1];
        const yesterday = this.getYesterday();

        if (lastDay === this.getToday() && sortedDays.includes(yesterday)) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 1;
        }

        this.stats.currentStreak = currentStreak;
        this.stats.longestStreak = longestStreak;
    }

    // Bugünün tarihini al (YYYY-MM-DD)
    getToday() {
        return new Date().toISOString().split('T')[0];
    }

    // Dünün tarihini al
    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    // En çok kullanılan araçları al
    getTopTools(limit = 5) {
        const sorted = Object.entries(this.stats.toolUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        return sorted.map(([toolId, count]) => ({
            id: toolId,
            count: count,
            name: this.getToolName(toolId)
        }));
    }

    // Tool ID'den isim al
    getToolName(toolId) {
        const toolNames = {
            'pomodoro': 'Pomodoro Timer',
            'focustime': 'Focus Time',
            'quick-notes': 'Quick Notes',
            'todo-list': 'To-Do List',
            'json-formatter': 'JSON Formatter',
            'json-validator': 'JSON Validator',
            'regex-tester': 'Regex Tester',
            'base64-tool': 'Base64 Encoder',
            'markdown-previewer': 'Markdown Previewer',
            'sql-formatter': 'SQL Formatter',
            'case-converter': 'Case Converter',
            'lorem-ipsum-generator': 'Lorem Ipsum',
            'image-compressor': 'Image Compressor',
            'image-converter': 'Image Converter',
            'exif-remover': 'EXIF Remover',
            'pixel-crusher': 'Pixel Crusher',
            'svg-optimizer': 'SVG Optimizer',
            'color-picker': 'Color Picker',
            'color-palette-generator': 'Palette Generator',
            'color-library': 'Color Library',
            'calculator': 'Calculator',
            'qr-generator': 'QR Generator',
            'unit-converter': 'Unit Converter',
            'world-clock': 'World Clock',
            'hash-generator': 'Hash Generator',
            'timestamp-converter': 'Timestamp Converter',
            'diff-checker': 'Diff Checker',
            'code-playground': 'Code Playground',
            'cron-generator': 'Cron Generator',
            'network-tools': 'Network Tools',
            'network-scan': 'Network Scanner',
            'network-map': 'Network Map',
            'password-vault': 'Password Vault',
            'settings': 'Settings',
            'profile': 'Profile',
            'cpu-monitor': 'CPU Monitor',
            'clean-cache': 'Clean Cache',
        };

        return toolNames[toolId] || toolId;
    }

    // Son 7 günün aktivitesini al
    getLast7DaysActivity() {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const activity = this.stats.dailyActivity[dateStr] || { sessions: 0, tools: 0, time: 0 };

            days.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                ...activity
            });
        }

        return days;
    }

    // Toplam aktif gün sayısı
    getTotalActiveDays() {
        return this.stats.activeDays.length;
    }

    // İlk ziyaretten bu yana geçen gün
    getDaysSinceFirstVisit() {
        const first = new Date(this.stats.firstVisit);
        const now = new Date();
        return Math.floor((now - first) / (1000 * 60 * 60 * 24));
    }

    // Ortalama günlük kullanım
    getAverageDailyUsage() {
        const days = this.getTotalActiveDays();
        if (days === 0) return 0;

        return Math.round(this.stats.totalToolsUsed / days);
    }

    // Tema değişikliği kaydet
    trackThemeChange() {
        this.stats.themeChanges++;
        this.saveStats();
    }

    // Tüm istatistikleri al
    getAllStats() {
        return {
            ...this.stats,
            topTools: this.getTopTools(5),
            last7Days: this.getLast7DaysActivity(),
            totalActiveDays: this.getTotalActiveDays(),
            daysSinceFirstVisit: this.getDaysSinceFirstVisit(),
            averageDailyUsage: this.getAverageDailyUsage(),
        };
    }

    // İstatistikleri sıfırla
    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            localStorage.removeItem('usage_stats');
            this.stats = this.loadStats();
            window.location.reload();
        }
    }

    // Export stats as JSON
    exportStats() {
        const dataStr = JSON.stringify(this.getAllStats(), null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `usage-stats-${this.getToday()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.usageStats = new UsageStats();

    // Track time spent (every minute)
    let timeSpentInterval;
    let currentPageTime = 0;

    const startTimeTracking = () => {
        timeSpentInterval = setInterval(() => {
            currentPageTime++;
            const today = window.usageStats.getToday();

            if (!window.usageStats.stats.dailyActivity[today]) {
                window.usageStats.stats.dailyActivity[today] = { sessions: 0, tools: 0, time: 0 };
            }

            window.usageStats.stats.dailyActivity[today].time++;
            window.usageStats.stats.totalTimeSpent++;
            window.usageStats.saveStats();
        }, 60000); // Every minute
    };

    const stopTimeTracking = () => {
        if (timeSpentInterval) {
            clearInterval(timeSpentInterval);
        }
    };

    // Start tracking when page loads
    startTimeTracking();

    // Stop tracking when page unloads
    window.addEventListener('beforeunload', stopTimeTracking);
}
