
// ============================================
// FOCUS TIME REPORTS LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setReportDate();
});

function loadStats() {
    // 1. Get Total Focus Time
    const totalSeconds = parseInt(localStorage.getItem('daily_focus_total') || '0');
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    // Format: "5h 12m" or "05:12"
    const timeStringShort = `${h}h ${m}m`;
    const timeStringColon = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    // Update "Total_Focus_Time" (Big Display) - Using formatting like 05:42
    const avgDisplay = document.getElementById('avg-focus-display');
    if (avgDisplay) avgDisplay.textContent = timeStringColon;

    // Update "TOTAL_FOCUS" (Small Bottom Card)
    const totalDisplay = document.getElementById('total-focus-display');
    if (totalDisplay) totalDisplay.textContent = timeStringShort;

    // 2. Get Tasks Done
    const tasksCount = localStorage.getItem('tasks_completed_count') || '0';
    const tasksDisplay = document.getElementById('total-tasks-display');
    if (tasksDisplay) tasksDisplay.textContent = tasksCount;
}

function setReportDate() {
    const dateSpan = document.getElementById('report-period');
    if (dateSpan) {
        const today = new Date();
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        dateSpan.textContent = `TODAY (${today.toLocaleDateString('en-US', options).toUpperCase()})`;
    }
}
