// ============================================
// MAIN APP MODULE - Application Controller
// ============================================

const App = {
    // Current page
    currentPage: 'focustime',

    // Initialize application
    init() {
        console.log('🚀 FocusTime App initializing...');

        // Initialize all modules
        Storage.init();
        Settings.init();
        Tasks.init();
        Timer.init();

        // Setup UI
        this.setupUI();
        this.setupEventListeners();
        this.checkAuth();

        console.log('✅ App initialized successfully');
    },

    // Check authentication
    checkAuth() {
        if (Settings.password.exists()) {
            // Show lock screen if password is set
            // For now, we'll skip this in development
            console.log('🔒 Password protection enabled');
        }
    },

    // Setup UI based on current page
    setupUI() {
        const page = this.detectPage();
        this.currentPage = page;

        switch (page) {
            case 'focustime':
                this.setupFocusTimePage();
                break;
            case 'settings':
                this.setupSettingsPage();
                break;
            case 'password-vault':
                this.setupPasswordVaultPage();
                break;
            case 'utilities':
                this.setupUtilitiesPage();
                break;
            case 'dashboard':
                this.setupDashboardPage();
                break;
            default:
                console.log('Unknown page:', page);
        }
    },

    // Detect current page from URL or body class
    detectPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        if (filename.includes('focustime')) return 'focustime';
        if (filename.includes('settings')) return 'settings';
        if (filename.includes('password-vault')) return 'password-vault';
        if (filename.includes('utilities')) return 'utilities';
        if (filename.includes('index') || filename === '') return 'dashboard';

        return 'dashboard';
    },

    // Setup FocusTime page
    setupFocusTimePage() {
        console.log('📱 Setting up FocusTime page...');

        // Render tasks
        this.renderTasks();

        // Setup timer display
        this.updateTimerDisplay();

        // Setup timer events
        Timer.on('tick', () => this.updateTimerDisplay());
        Timer.on('workComplete', () => this.onWorkComplete());
        Timer.on('breakComplete', () => this.onBreakComplete());

        // Update progress
        this.updateProgress();

        // Setup task tabs
        this.setupTaskTabs();
    },

    // Setup Settings page
    setupSettingsPage() {
        console.log('⚙️ Setting up Settings page...');

        // Load current settings
        const settings = Settings.settings;

        // Set theme toggle
        const themeToggles = document.querySelectorAll('.theme-toggle');
        themeToggles.forEach(toggle => {
            if (toggle.value === settings.theme) {
                toggle.checked = true;
            }
        });

        // Set accent color
        const accentToggles = document.querySelectorAll('.accent-color');
        accentToggles.forEach(toggle => {
            if (toggle.value === settings.accentColor) {
                toggle.checked = true;
            }
        });

        // Set language
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = settings.language;
        }
    },

    // Setup Password Vault page
    setupPasswordVaultPage() {
        console.log('🔐 Setting up Password Vault page...');
        this.renderPasswordVault();
    },

    // Setup Utilities page
    setupUtilitiesPage() {
        console.log('🛠️ Setting up Utilities page...');
        // Utilities page is mostly static
    },

    // Setup Dashboard page
    setupDashboardPage() {
        console.log('📊 Setting up Dashboard page...');
        this.updateDashboardStats();
        this.renderActivityLog();
    },

    // Render tasks
    renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        const filter = Tasks.currentFilter;
        const tasks = filter === 'active' ? Tasks.getActive() : Tasks.getCompleted();

        taskList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');

        // Add new task input
        taskList.innerHTML += `
            <div class="mt-2 pt-2">
                <div class="flex w-full items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-blue-50/30 focus-within:border-primary focus-within:bg-white focus-within:ring-1 focus-within:ring-primary group">
                    <span class="material-symbols-outlined text-slate-400 mr-3 text-[20px] group-focus-within:text-primary transition-colors">add</span>
                    <input id="new-task-input" class="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" placeholder="Add a new task..."/>
                </div>
            </div>
        `;

        // Update current task display
        this.updateCurrentTaskDisplay();
    },

    // Create task HTML
    createTaskHTML(task) {
        const isCurrentTask = Timer.currentTaskId === task.id;
        return `
            <div class="task-card group flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 border ${isCurrentTask
                ? 'border-primary/20 dark:border-primary/30 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.08)] relative overflow-hidden'
                : 'border-slate-100 dark:border-slate-700/50'
            } rounded-xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" data-task-id="${task.id}">
                ${isCurrentTask ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>' : ''}
                <div class="relative flex items-center pt-0.5 ${isCurrentTask ? 'ml-1' : ''}">
                    <input class="task-checkbox peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-primary checked:bg-primary hover:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0" type="checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}"/>
                    <span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none font-bold">check</span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-[15px] ${task.priority === 'high' ? 'font-bold' : 'font-semibold'} text-slate-800 dark:text-slate-200 truncate leading-snug group-hover:text-primary transition-colors">${task.title}</p>
                    <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[11px] font-${task.priority === 'high' ? 'bold' : 'medium'} text-${task.priority === 'high' ? 'primary' : 'slate-400 dark:text-slate-500'} uppercase tracking-wider">${task.category}</span>
                        ${task.dueDate ? `
                            <span class="h-1 w-1 rounded-full bg-slate-300"></span>
                            <span class="text-[11px] font-medium text-slate-500">${task.dueDate}</span>
                        ` : ''}
                    </div>
                </div>
                <button class="task-menu opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity p-1" data-task-id="${task.id}">
                    <span class="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
            </div>
        `;
    },

    // Update timer display
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = Timer.getCurrentTime();
        }

        // Update play/pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            if (Timer.isRunning) {
                playPauseBtn.innerHTML = '<span class="material-symbols-outlined text-[48px] drop-shadow-md">pause</span>';
                document.body.classList.add('timer-running');
            } else {
                playPauseBtn.innerHTML = '<span class="material-symbols-outlined text-[48px] ml-1.5 drop-shadow-md">play_arrow</span>';
                document.body.classList.remove('timer-running');
            }
        }
    },

    // Update current task display
    updateCurrentTaskDisplay() {
        const currentTaskName = document.getElementById('current-task-name');
        if (currentTaskName) {
            const task = Timer.getCurrentTask();
            currentTaskName.textContent = task ? task.title : 'No task selected';
        }
    },

    // Update progress
    updateProgress() {
        const progress = Storage.get(Storage.KEYS.DAILY_PROGRESS);
        if (!progress) return;

        // Update focus time
        const focusTimeEl = document.getElementById('focus-time');
        if (focusTimeEl) {
            const hours = Math.floor(progress.focusMinutes / 60);
            const mins = progress.focusMinutes % 60;
            focusTimeEl.textContent = `${hours}h ${mins}m`;
        }

        // Update tasks done
        const tasksDoneEl = document.getElementById('tasks-done');
        if (tasksDoneEl) {
            tasksDoneEl.textContent = progress.tasksCompleted;
        }

        // Update progress circle
        const dailyGoalMinutes = 6 * 60; // 6 hours
        const percentage = Math.min(Math.round((progress.focusMinutes / dailyGoalMinutes) * 100), 100);

        const percentageEl = document.getElementById('progress-percentage');
        if (percentageEl) {
            percentageEl.textContent = `${percentage}%`;
        }

        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            const circumference = 264;
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    },

    // Update dashboard stats
    updateDashboardStats() {
        const stats = Storage.get(Storage.KEYS.STATS);
        if (!stats) return;

        // Update total entries (for password vault)
        const totalEntriesEl = document.getElementById('total-entries');
        if (totalEntriesEl) {
            const passwords = Storage.get(Storage.KEYS.VAULT_PASSWORDS) || [];
            totalEntriesEl.textContent = passwords.length;
        }
    },

    // Render activity log
    renderActivityLog() {
        const logContainer = document.getElementById('activity-log');
        if (!logContainer) return;

        const log = Storage.get(Storage.KEYS.ACTIVITY_LOG) || [];
        const recentLog = log.slice(0, 10);

        logContainer.innerHTML = recentLog.map(entry => `
            <div class="text-xs font-mono text-slate-400">
                <span class="text-green-400">[${new Date(entry.timestamp).toLocaleTimeString()}]</span>
                <span class="text-primary">${entry.type}</span>: ${entry.message}
            </div>
        `).join('');
    },

    // Render password vault
    renderPasswordVault() {
        const tbody = document.getElementById('password-table-body');
        if (!tbody) return;

        const passwords = Storage.get(Storage.KEYS.VAULT_PASSWORDS) || [];

        tbody.innerHTML = passwords.map(pwd => `
            <tr class="group hover:bg-white/5 transition-colors ${pwd.visible ? 'row-highlighted' : ''}" data-id="${pwd.id}">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="size-8 rounded bg-white flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary text-lg">${this.getServiceIcon(pwd.service)}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-white">${pwd.service}</span>
                            <span class="text-xs text-slate-500 font-mono">${pwd.domain}</span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-slate-300 font-mono">${pwd.identity}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                        ${pwd.visible
                ? `<span class="text-green-400 font-mono bg-green-900/20 px-2 py-0.5 rounded text-xs tracking-wider password-revealed">${pwd.password}</span>`
                : `<span class="text-slate-500 tracking-[3px] text-lg leading-none">${'•'.repeat(pwd.password.length)}</span>`
            }
                    </div>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1 ${pwd.visible ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity">
                        <button class="copy-btn p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors" data-password="${pwd.password}">
                            <span class="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button class="visibility-btn p-2 ${pwd.visible ? 'bg-primary/20 text-primary' : ''} hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors" data-id="${pwd.id}">
                            <span class="material-symbols-outlined text-[18px]">${pwd.visible ? 'visibility_off' : 'visibility'}</span>
                        </button>
                        <button class="delete-pwd-btn p-2 hover:bg-red-900/30 rounded text-slate-300 hover:text-red-400 transition-colors" data-id="${pwd.id}">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Get service icon
    getServiceIcon(service) {
        const icons = {
            'GitHub': 'code',
            'AWS Root': 'cloud',
            'Google Workspace': 'mail',
            'DigitalOcean': 'water_drop',
            'Twitter API': 'chat'
        };
        return icons[service] || 'key';
    },

    // Setup task tabs
    setupTaskTabs() {
        const taskTabs = document.querySelectorAll('.task-tab');
        taskTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                Tasks.currentFilter = tab.dataset.tab;
                taskTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderTasks();
            });
        });
    },

    // Setup event listeners
    setupEventListeners() {
        // Timer controls
        this.setupTimerControls();

        // Task management
        this.setupTaskManagement();

        // Settings
        this.setupSettings();

        // Password vault
        this.setupPasswordVault();

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();
    },

    // Setup timer controls
    setupTimerControls() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (Timer.isRunning) {
                    Timer.pause();
                } else {
                    Timer.start();
                }
            });
        }

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                Timer.reset();
            });
        }
    },

    // Setup task management
    setupTaskManagement() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        // Delegate events
        taskList.addEventListener('click', (e) => {
            // Checkbox toggle
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.dataset.taskId);
                Tasks.toggleComplete(taskId);
                this.renderTasks();
                this.updateProgress();
            }

            // Task card click (set as current)
            const taskCard = e.target.closest('.task-card');
            if (taskCard && !e.target.classList.contains('task-checkbox') && !e.target.classList.contains('task-menu')) {
                const taskId = parseInt(taskCard.dataset.taskId);
                Timer.setCurrentTask(taskId);
                this.renderTasks();
            }

            // Delete task
            if (e.target.closest('.task-menu')) {
                const taskId = parseInt(e.target.closest('.task-menu').dataset.taskId);
                if (confirm('Delete this task?')) {
                    Tasks.delete(taskId);
                    this.renderTasks();
                }
            }
        });

        // New task input
        taskList.addEventListener('keypress', (e) => {
            if (e.target.id === 'new-task-input' && e.key === 'Enter') {
                const title = e.target.value.trim();
                if (title) {
                    Tasks.add({ title });
                    this.renderTasks();
                    e.target.value = '';
                }
            }
        });
    },

    // Setup settings
    setupSettings() {
        // Theme toggle
        const themeToggles = document.querySelectorAll('.theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                Settings.set('theme', e.target.value);
                this.showNotification('Theme updated');
            });
        });

        // Accent color
        const accentToggles = document.querySelectorAll('.accent-color');
        accentToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                Settings.set('accentColor', e.target.value);
                this.showNotification('Accent color updated');
            });
        });

        // Language
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                Settings.set('language', e.target.value);
                this.showNotification('Language updated');
            });
        }

        // Export settings
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = Storage.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `focustime-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                this.showNotification('Settings exported');
            });
        }

        // Reset all data
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    Storage.clearAll();
                    Storage.init();
                    location.reload();
                }
            });
        }
    },

    // Setup password vault
    setupPasswordVault() {
        const tbody = document.getElementById('password-table-body');
        if (!tbody) return;

        tbody.addEventListener('click', (e) => {
            // Copy password
            if (e.target.closest('.copy-btn')) {
                const password = e.target.closest('.copy-btn').dataset.password;
                navigator.clipboard.writeText(password);
                this.showNotification('Password copied!');
            }

            // Toggle visibility
            if (e.target.closest('.visibility-btn')) {
                const id = parseInt(e.target.closest('.visibility-btn').dataset.id);
                const passwords = Storage.get(Storage.KEYS.VAULT_PASSWORDS) || [];
                const pwd = passwords.find(p => p.id === id);
                if (pwd) {
                    pwd.visible = !pwd.visible;
                    Storage.set(Storage.KEYS.VAULT_PASSWORDS, passwords);
                    this.renderPasswordVault();
                }
            }

            // Delete password
            if (e.target.closest('.delete-pwd-btn')) {
                const id = parseInt(e.target.closest('.delete-pwd-btn').dataset.id);
                if (confirm('Delete this password entry?')) {
                    let passwords = Storage.get(Storage.KEYS.VAULT_PASSWORDS) || [];
                    passwords = passwords.filter(p => p.id !== id);
                    Storage.set(Storage.KEYS.VAULT_PASSWORDS, passwords);
                    this.renderPasswordVault();
                    this.showNotification('Password deleted');
                }
            }
        });
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space to play/pause (only on FocusTime page)
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && this.currentPage === 'focustime') {
                e.preventDefault();
                if (Timer.isRunning) {
                    Timer.pause();
                } else {
                    Timer.start();
                }
            }

            // R to reset (only on FocusTime page)
            if (e.code === 'KeyR' && e.target.tagName !== 'INPUT' && this.currentPage === 'focustime') {
                Timer.reset();
            }
        });
    },

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded border text-sm font-medium z-50 ${type === 'success'
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
    },

    // On work session complete
    onWorkComplete() {
        this.showNotification('Work session complete! Time for a break.');
        this.updateProgress();
    },

    // On break complete
    onBreakComplete() {
        this.showNotification('Break complete! Ready for another session?');
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
