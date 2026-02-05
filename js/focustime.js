
// ============================================
// FOCUS TIME LOGIC v2.0 - With Live Stats
// ============================================

let timeLeft = 25 * 60; // default 25 mins
let dailyGoalSeconds = 4 * 60 * 60; // 4 Hours Goal
let timerId = null;
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    // Load persisted settings
    const savedDuration = localStorage.getItem('focus_duration');
    if (savedDuration) {
        timeLeft = parseInt(savedDuration) * 60;
    }

    // Timer Controls
    const playBtn = document.getElementById('btn-play');
    const resetBtn = document.getElementById('btn-reset');

    if (playBtn) playBtn.addEventListener('click', toggleTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    // Task Input
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(e.target.value);
                e.target.value = '';
            }
        });
    }

    updateDisplay();
    updateDailyStats(); // Initial stats load
});

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    const icon = document.getElementById('play-icon');
    if (icon) {
        icon.textContent = 'pause';
        icon.parentElement.classList.replace('bg-green-500', 'bg-yellow-500');
    }

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            incrementDailyStats(); // Track real usage
            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerId);

    const icon = document.getElementById('play-icon');
    if (icon) {
        icon.textContent = 'play_arrow';
        icon.parentElement.classList.replace('bg-yellow-500', 'bg-green-500');
    }
}

function resetTimer() {
    pauseTimer();
    const savedDuration = localStorage.getItem('focus_duration') || 25;
    timeLeft = parseInt(savedDuration) * 60;
    updateDisplay();
}

function completeSession() {
    pauseTimer();
    alert("SESSION COMPLETE! TAKE A BREAK.");
    // Reset to default
    const savedDuration = localStorage.getItem('focus_duration') || 25;
    timeLeft = parseInt(savedDuration) * 60;
    updateDisplay();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const display = document.getElementById('timer-display');
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (display) display.textContent = timeString;
    document.title = `${timeString} - FocusTime`;
}

// ============================================
// STATS LOGIC
// ============================================

function incrementDailyStats() {
    // Get current total
    let totalSeconds = parseInt(localStorage.getItem('daily_focus_total') || '0');
    totalSeconds++;
    localStorage.setItem('daily_focus_total', totalSeconds);

    updateDailyStats();
}

function updateDailyStats() {
    const totalSeconds = parseInt(localStorage.getItem('daily_focus_total') || '0');

    // Update Time Text
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    const timeDisplay = document.getElementById('daily-time-display');
    if (timeDisplay) timeDisplay.textContent = timeString;

    // Update Percentage
    const percent = Math.min(100, Math.floor((totalSeconds / dailyGoalSeconds) * 100));
    const percentDisplay = document.getElementById('daily-percentage');
    if (percentDisplay) percentDisplay.textContent = `${percent}%`;

    // Optional: Animate border color or some visual based on progress
    const border = document.getElementById('progress-border');
    if (border) {
        if (percent >= 100) border.classList.add('border-green-500');
    }
}

// ============================================
// TASK LOGIC
// ============================================
function addTask(text) {
    if (!text.trim()) return;

    const list = document.getElementById('task-list');
    const inputContainer = document.querySelector('.mt-4');

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item pixel-border bg-purple-900/50 p-4 border-2 hover:bg-purple-800/50 transition-colors group cursor-pointer relative mb-4';

    taskDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="mt-1">
                <input class="w-5 h-5 bg-black border-2 border-purple-500 checked:bg-pink-500 rounded-none cursor-pointer focus:ring-0" 
                       type="checkbox" onchange="toggleTask(this)"/>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-mono text-sm font-bold text-white truncate mb-1 task-text">${text}</p>
                <div class="flex items-center gap-2">
                    <span class="bg-indigo-600 px-1 text-[9px] font-retro text-white">TASK</span>
                    <span class="font-pixel text-lg text-purple-400">NOW</span>
                </div>
            </div>
            <button onclick="this.closest('.task-item').remove()" class="text-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `;

    // Also update current focus text
    const focusText = document.getElementById('current-focus-text');
    if (focusText) focusText.textContent = text.toUpperCase();

    if (list && inputContainer) {
        list.insertBefore(taskDiv, list.firstChild); // Add to top
    }
}

function toggleTask(checkbox) {
    const text = checkbox.closest('.flex').querySelector('.task-text');
    let count = parseInt(localStorage.getItem('tasks_completed_count') || '0');

    if (checkbox.checked) {
        text.classList.add('line-through', 'text-gray-500');
        count++;
    } else {
        text.classList.remove('line-through', 'text-gray-500');
        count = Math.max(0, count - 1);
    }

    localStorage.setItem('tasks_completed_count', count);
}
