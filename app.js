// Dashboard Application - Main JavaScript
// Handles navigation, activity logging, and localStorage management

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `[${hours}:${minutes}]`;
}

// Add activity log entry
function addActivityLog(message) {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;

    // Remove the "Waiting for input" line
    const waitingLine = activityLog.querySelector('.animate-pulse');
    if (waitingLine) {
        waitingLine.remove();
    }

    // Create new log entry
    const logEntry = document.createElement('div');
    logEntry.className = 'flex gap-2 text-gray-300';
    logEntry.innerHTML = `
        <span class="text-primary">${getCurrentTime()}</span>
        <span>${message}</span>
    `;

    // Add to log
    activityLog.appendChild(logEntry);

    // Re-add waiting line
    const newWaitingLine = document.createElement('div');
    newWaitingLine.className = 'mt-auto border-t border-white/10 pt-2 animate-pulse text-primary font-bold';
    newWaitingLine.textContent = '_ Waiting for input...';
    activityLog.appendChild(newWaitingLine);

    // Keep only last 10 entries (plus waiting line)
    const entries = activityLog.querySelectorAll('.flex.gap-2');
    if (entries.length > 10) {
        entries[0].remove();
    }

    // Save to localStorage
    saveActivityLogs();
}

// ============================================
// LOCALSTORAGE MANAGEMENT
// ============================================

// Save activity logs to localStorage
function saveActivityLogs() {
    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;

    const entries = Array.from(activityLog.querySelectorAll('.flex.gap-2')).map(entry => {
        const time = entry.querySelector('.text-primary').textContent;
        const message = entry.querySelector('span:last-child').innerHTML;
        return { time, message };
    });

    localStorage.setItem('activityLogs', JSON.stringify(entries));
}

// Load activity logs from localStorage
function loadActivityLogs() {
    const saved = localStorage.getItem('activityLogs');
    if (!saved) return;

    const activityLog = document.getElementById('activity-log');
    if (!activityLog) return;

    // Clear current logs except waiting line
    const entries = activityLog.querySelectorAll('.flex.gap-2');
    entries.forEach(entry => entry.remove());

    // Load saved logs
    const logs = JSON.parse(saved);
    const waitingLine = activityLog.querySelector('.animate-pulse');

    logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'flex gap-2 text-gray-300';
        logEntry.innerHTML = `
            <span class="text-primary">${log.time}</span>
            <span>${log.message}</span>
        `;
        activityLog.insertBefore(logEntry, waitingLine);
    });
}

// Load stats from localStorage
function loadStats() {
    const stats = {
        files: localStorage.getItem('stat-files') || '1,337',
        pomo: localStorage.getItem('stat-pomo') || '42',
        keys: localStorage.getItem('stat-keys') || '08'
    };

    document.getElementById('stat-files').textContent = stats.files;
    document.getElementById('stat-pomo').textContent = stats.pomo;
    document.getElementById('stat-keys').textContent = stats.keys;
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('stat-files', document.getElementById('stat-files').textContent);
    localStorage.setItem('stat-pomo', document.getElementById('stat-pomo').textContent);
    localStorage.setItem('stat-keys', document.getElementById('stat-keys').textContent);
}

// ============================================
// NAVIGATION
// ============================================

// Handle sidebar navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-page]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active state from all links
            navLinks.forEach(l => {
                l.classList.remove('bg-primary', 'text-white', 'border-white/10', 'shadow-pixel-sm');
                l.classList.add('text-gray-300', 'border-transparent');
            });
            
            // Add active state to clicked link
            link.classList.add('bg-primary', 'text-white', 'border-white/10', 'shadow-pixel-sm');
            link.classList.remove('text-gray-300', 'border-transparent');
            
            // Get page name
            const pageName = link.querySelector('.font-retro').textContent;
            
            // Log navigation
            addActivityLog(`&gt; Navigated to ${pageName}`);
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadStats();
    loadActivityLogs();
    
    // Setup navigation
    setupNavigation();
    
    // Log system start
    console.log('Web Tool Hub Dashboard initialized');
    
    // Add initial log if no logs exist
    const activityLog = document.getElementById('activity-log');
    const entries = activityLog.querySelectorAll('.flex.gap-2');
    if (entries.length === 0) {
        addActivityLog('System initialized...');
        addActivityLog('&gt; Navigated to Dashboard');
    }
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    saveStats();
    saveActivityLogs();
});

// ============================================
// EXPORT FOR OTHER MODULES
// ============================================

// Make functions available globally for other modules
window.dashboardApp = {
    addActivityLog,
    getCurrentTime,
    saveStats,
    loadStats
};
