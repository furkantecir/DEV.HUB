// FocusTime - Pomodoro Timer
// Handles timer logic, task management, and progress tracking

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    // Timer settings
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    currentTime: 25 * 60,
    isRunning: false,
    isWorkSession: true,
    timerInterval: null,

    // Tasks
    tasks: [
        {
            id: 1,
            title: 'Research Competitors',
            category: 'Marketing',
            dueDate: 'Today',
            priority: 'normal',
            completed: false
        },
        {
            id: 2,
            title: 'Draft UI Proposal',
            category: 'High Priority',
            dueDate: null,
            priority: 'high',
            completed: false
        },
        {
            id: 3,
            title: 'Update Documentation',
            category: 'Dev',
            dueDate: 'Tomorrow',
            priority: 'normal',
            completed: false
        }
    ],
    currentTaskId: 2,
    activeTab: 'active',

    // Progress
    focusTimeToday: 4 * 60 + 12, // 4h 12m in minutes
    tasksCompletedToday: 5,
    dailyGoalMinutes: 6 * 60, // 6 hours
};

// ============================================
// TIMER FUNCTIONS
// ============================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = formatTime(state.currentTime);
    }
}

function startTimer() {
    if (state.isRunning) return;

    state.isRunning = true;
    document.body.classList.add('timer-running');

    // Update play button to pause
    const playBtn = document.getElementById('play-pause-btn');
    if (playBtn) {
        playBtn.innerHTML = '<span class="material-symbols-outlined text-[48px] drop-shadow-md">pause</span>';
    }

    state.timerInterval = setInterval(() => {
        if (state.currentTime > 0) {
            state.currentTime--;
            updateTimerDisplay();
        } else {
            // Timer completed
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    state.isRunning = false;
    document.body.classList.remove('timer-running');

    clearInterval(state.timerInterval);

    // Update pause button to play
    const playBtn = document.getElementById('play-pause-btn');
    if (playBtn) {
        playBtn.innerHTML = '<span class="material-symbols-outlined text-[48px] ml-1.5 drop-shadow-md">play_arrow</span>';
    }
}

function resetTimer() {
    pauseTimer();
    state.currentTime = state.isWorkSession ? state.workDuration : state.breakDuration;
    updateTimerDisplay();
}

function completeSession() {
    pauseTimer();

    if (state.isWorkSession) {
        // Work session completed
        state.focusTimeToday += state.workDuration / 60;
        updateProgress();

        // Switch to break
        state.isWorkSession = false;
        state.currentTime = state.breakDuration;
        showNotification('Work session complete! Time for a break.');
    } else {
        // Break completed
        state.isWorkSession = true;
        state.currentTime = state.workDuration;
        showNotification('Break complete! Ready for another session?');
    }

    updateTimerDisplay();
}

// ============================================
// TASK MANAGEMENT
// ============================================

function renderTasks() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    // Filter tasks based on active tab
    const filteredTasks = state.tasks.filter(task =>
        state.activeTab === 'active' ? !task.completed : task.completed
    );

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-card group flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 border ${task.id === state.currentTaskId
            ? 'border-primary/20 dark:border-primary/30 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.08)] relative overflow-hidden'
            : 'border-slate-100 dark:border-slate-700/50'
        } rounded-xl shadow-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" data-task-id="${task.id}">
            ${task.id === state.currentTaskId ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>' : ''}
            <div class="relative flex items-center pt-0.5 ${task.id === state.currentTaskId ? 'ml-1' : ''}">
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
    `).join('');

    // Add new task input
    taskList.innerHTML += `
        <div class="mt-2 pt-2">
            <div class="flex w-full items-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-blue-50/30 focus-within:border-primary focus-within:bg-white focus-within:ring-1 focus-within:ring-primary group">
                <span class="material-symbols-outlined text-slate-400 mr-3 text-[20px] group-focus-within:text-primary transition-colors">add</span>
                <input id="new-task-input" class="w-full bg-transparent text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" placeholder="Add a new task..."/>
            </div>
        </div>
    `;

    // Update current task name
    const currentTask = state.tasks.find(t => t.id === state.currentTaskId);
    const taskNameEl = document.getElementById('current-task-name');
    if (taskNameEl && currentTask) {
        taskNameEl.textContent = currentTask.title;
    }
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            state.tasksCompletedToday++;
        } else {
            state.tasksCompletedToday--;
        }
        updateProgress();
        renderTasks();
        saveToLocalStorage();
    }
}

function addTask(title) {
    if (!title.trim()) return;

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        category: 'General',
        dueDate: 'Today',
        priority: 'normal',
        completed: false
    };

    state.tasks.unshift(newTask);
    renderTasks();
    saveToLocalStorage();
}

function setCurrentTask(taskId) {
    state.currentTaskId = taskId;
    renderTasks();
    saveToLocalStorage();
}

// ============================================
// PROGRESS TRACKING
// ============================================

function updateProgress() {
    // Update focus time
    const focusTimeEl = document.getElementById('focus-time');
    if (focusTimeEl) {
        const hours = Math.floor(state.focusTimeToday / 60);
        const mins = state.focusTimeToday % 60;
        focusTimeEl.textContent = `${hours}h ${mins}m`;
    }

    // Update tasks done
    const tasksDoneEl = document.getElementById('tasks-done');
    if (tasksDoneEl) {
        tasksDoneEl.textContent = state.tasksCompletedToday;
    }

    // Update progress circle
    const percentage = Math.min(Math.round((state.focusTimeToday / state.dailyGoalMinutes) * 100), 100);
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
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message) {
    // Simple alert for now
    // In production, use a toast notification library
    console.log('Notification:', message);
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (state.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetTimer();
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
    }

    // Task tabs
    const taskTabs = document.querySelectorAll('.task-tab');
    taskTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            state.activeTab = tab.dataset.tab;
            taskTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTasks();
        });
    });

    // Task list delegation
    const taskList = document.getElementById('task-list');
    if (taskList) {
        taskList.addEventListener('click', (e) => {
            // Checkbox toggle
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.dataset.taskId);
                toggleTaskComplete(taskId);
            }

            // Task card click (set as current)
            const taskCard = e.target.closest('.task-card');
            if (taskCard && !e.target.classList.contains('task-checkbox') && !e.target.classList.contains('task-menu')) {
                const taskId = parseInt(taskCard.dataset.taskId);
                setCurrentTask(taskId);
            }
        });

        // New task input
        taskList.addEventListener('keypress', (e) => {
            if (e.target.id === 'new-task-input' && e.key === 'Enter') {
                addTask(e.target.value);
                e.target.value = '';
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to play/pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (state.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }

        // R to reset
        if (e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
            resetTimer();
        }
    });
}

// ============================================
// STORAGE
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('focusTimeState', JSON.stringify({
        tasks: state.tasks,
        currentTaskId: state.currentTaskId,
        focusTimeToday: state.focusTimeToday,
        tasksCompletedToday: state.tasksCompletedToday
    }));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('focusTimeState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.tasks = data.tasks || state.tasks;
            state.currentTaskId = data.currentTaskId || state.currentTaskId;
            state.focusTimeToday = data.focusTimeToday || state.focusTimeToday;
            state.tasksCompletedToday = data.tasksCompletedToday || state.tasksCompletedToday;
        } catch (error) {
            console.error('Failed to load state:', error);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved state
    loadFromLocalStorage();

    // Initialize UI
    updateTimerDisplay();
    renderTasks();
    updateProgress();

    // Setup event listeners
    setupEventListeners();

    console.log('FocusTime loaded');
    console.log('Current task:', state.tasks.find(t => t.id === state.currentTaskId)?.title);
});

// Save before unload
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});

// ============================================
// EXPORT
// ============================================

window.focusTimeApp = {
    state,
    startTimer,
    pauseTimer,
    resetTimer,
    addTask,
    toggleTaskComplete,
    updateProgress
};
