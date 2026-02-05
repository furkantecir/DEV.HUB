// ============================================
// SETTINGS PAGE - Event Handlers
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚙️ Settings page loaded');

    // Load current settings and update UI
    loadCurrentSettings();

    // Theme toggle
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const theme = e.target.value;
            console.log('🎨 Theme changing to:', theme);
            Settings.set('theme', theme);
            showNotification(`Theme changed to ${theme} mode`);
        });
    });

    // Accent color
    const accentColors = document.querySelectorAll('.accent-color');
    accentColors.forEach(color => {
        color.addEventListener('change', (e) => {
            const accentColor = e.target.value;
            console.log('🎨 Accent color changing to:', accentColor);
            Settings.set('accentColor', accentColor);
            showNotification('Accent color updated');
        });
    });

    // Language select
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const language = e.target.value;
            console.log('🌍 Language changing to:', language);
            Settings.set('language', language);

            // Apply language immediately
            if (typeof Language !== 'undefined') {
                Language.setLanguage(language);
            }

            showNotification(`Language changed to ${language === 'en' ? 'English' : 'Türkçe'}`);
        });
    }

    // Export JSON
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = Storage.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `webtoolhub-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('Settings exported successfully!', 'success');
        });
    }

    // Import JSON
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file-input');

    if (importBtn && importFileInput) {
        importBtn.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    Storage.importData(data);
                    showNotification('Settings imported successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } catch (error) {
                    console.error('Import error:', error);
                    showNotification('Failed to import settings. Invalid JSON file.', 'error');
                }
            };
            reader.readAsText(file);

            // Reset input
            importFileInput.value = '';
        });
    }

    // Reset all data
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('⚠️ Are you sure you want to reset ALL data?\n\nThis will permanently delete:\n• All tasks\n• All settings\n• All passwords\n• All progress\n\nThis action CANNOT be undone!')) {
                Storage.clearAll();
                Storage.init();
                showNotification('All data has been reset!', 'success');
                setTimeout(() => location.reload(), 1500);
            }
        });
    }
});

// Load current settings and update UI
function loadCurrentSettings() {
    const settings = Settings.settings;

    // Set theme
    const themeToggles = document.querySelectorAll('.theme-toggle');
    themeToggles.forEach(toggle => {
        if (toggle.value === settings.theme) {
            toggle.checked = true;
        }
    });

    // Set accent color
    const accentColors = document.querySelectorAll('.accent-color');
    accentColors.forEach(color => {
        if (color.value === settings.accentColor) {
            color.checked = true;
        }
    });

    // Set language
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = settings.language || 'en';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded border text-sm font-medium z-50 shadow-lg animate-slide-in ${type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
