// ============================================
// DASHBOARD PAGE - Widget Management
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard page loaded');

    // Widget click handlers
    setupWidgetHandlers();

    // Update stats
    updateDashboardStats();
});

// Setup widget click handlers
function setupWidgetHandlers() {
    // Pomodoro Timer
    const pomodoroWidget = document.querySelector('[data-widget="pomodoro"]');
    if (pomodoroWidget) {
        pomodoroWidget.addEventListener('click', () => {
            window.location.href = 'focustime.html';
        });
    }

    // Quick Notes
    const notesWidget = document.querySelector('[data-widget="notes"]');
    if (notesWidget) {
        notesWidget.addEventListener('click', () => {
            showNotification('Quick Notes - Coming Soon!', 'info');
        });
    }

    // To-Do List
    const todoWidget = document.querySelector('[data-widget="todo"]');
    if (todoWidget) {
        todoWidget.addEventListener('click', () => {
            showNotification('To-Do List - Coming Soon!', 'info');
        });
    }

    // Calculator
    const calculatorWidget = document.querySelector('[data-widget="calculator"]');
    if (calculatorWidget) {
        calculatorWidget.addEventListener('click', () => {
            showNotification('Calculator - Coming Soon!', 'info');
        });
    }

    // QR Generator
    const qrWidget = document.querySelector('[data-widget="qr"]');
    if (qrWidget) {
        qrWidget.addEventListener('click', () => {
            showNotification('QR Generator - Coming Soon!', 'info');
        });
    }

    // Add Widget button
    const addWidgetBtn = document.querySelector('[data-action="add-widget"]');
    if (addWidgetBtn) {
        addWidgetBtn.addEventListener('click', () => {
            showNotification('Add Widget - Coming Soon!', 'info');
        });
    }
}

// Update dashboard stats
function updateDashboardStats() {
    const stats = Storage.get(Storage.KEYS.STATS);
    const progress = Storage.get(Storage.KEYS.DAILY_PROGRESS);

    if (stats) {
        // Update total focus time
        const totalFocusEl = document.querySelector('[data-stat="total-focus"]');
        if (totalFocusEl) {
            const hours = Math.floor(stats.totalFocusMinutes / 60);
            const mins = stats.totalFocusMinutes % 60;
            totalFocusEl.textContent = `${hours}h ${mins}m`;
        }

        // Update total tasks
        const totalTasksEl = document.querySelector('[data-stat="total-tasks"]');
        if (totalTasksEl) {
            totalTasksEl.textContent = stats.totalTasksCompleted;
        }

        // Update total sessions
        const totalSessionsEl = document.querySelector('[data-stat="total-sessions"]');
        if (totalSessionsEl) {
            totalSessionsEl.textContent = stats.totalSessions;
        }
    }

    if (progress) {
        // Update today's focus time
        const todayFocusEl = document.querySelector('[data-stat="today-focus"]');
        if (todayFocusEl) {
            const hours = Math.floor(progress.focusMinutes / 60);
            const mins = progress.focusMinutes % 60;
            todayFocusEl.textContent = `${hours}h ${mins}m`;
        }

        // Update today's tasks
        const todayTasksEl = document.querySelector('[data-stat="today-tasks"]');
        if (todayTasksEl) {
            todayTasksEl.textContent = progress.tasksCompleted;
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded border text-sm font-medium z-50 shadow-lg animate-slide-in ${type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : type === 'info'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">${type === 'success' ? 'check_circle' : type === 'info' ? 'info' : 'error'
        }</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
