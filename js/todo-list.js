// ============================================
// TO-DO LIST MODULE - Kanban Style Task Manager
// FIXED VERSION: Resolves conflicts with Global Storage
// ============================================

// Unique storage key to prevent conflicts
const DB_KEY = 'DEVHUB_TODO_TASKS_V2';

// Priorities Config
const PRIORITIES = {
    low: { label: '[ Low Priority ]', class: 'text-text-muted', color: 'text-muted' },
    medium: { label: '[ Med Priority ]', class: 'text-text-muted', color: 'text-muted' },
    high: { label: '[ High Priority ]', class: 'text-pending font-bold', color: 'pending' }
};

// Safe Local Storage Wrapper
const TaskStorage = {
    get: () => {
        try {
            const data = localStorage.getItem(DB_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('TaskStorage Read Error:', e);
            return [];
        }
    },
    set: (tasks) => {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('TaskStorage Write Error:', e);
        }
    }
};

// Global Tasks Array
let tasks = [];
let taskToDeleteId = null; // Store ID for modal confirmation

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ To-Do Module Initializing...');

    // Load data
    tasks = TaskStorage.get();

    // Setup Listeners
    setupEventListeners();

    // Initial Render
    renderTasks();
});

function setupEventListeners() {
    const addBtn = document.getElementById('add-task-btn');
    const input = document.getElementById('task-input');
    const clearBtn = document.getElementById('clear-completed-btn');
    const exportBtn = document.getElementById('export-data-btn');

    // Modal Buttons
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addTask();
        });
    }

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
        input.focus();
    }

    if (clearBtn) clearBtn.addEventListener('click', clearCompleted);
    if (exportBtn) exportBtn.addEventListener('click', exportTasks);

    // Modal Listeners
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', confirmDelete);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeDeleteModal);
}

function addTask() {
    const input = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');

    if (!input) return;

    const text = input.value.trim();
    const priority = prioritySelect ? prioritySelect.value : 'medium';

    if (!text) {
        showNotification('Description cannot be empty!', 'error');
        input.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: text,
        priority: priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        progress: 0
    };

    tasks.unshift(newTask);
    TaskStorage.set(tasks);
    renderTasks();

    input.value = '';
    input.focus();
    showNotification('Task added to pipeline', 'success');
}

function renderTasks() {
    const pendingList = document.getElementById('pending-list');
    const progressList = document.getElementById('progress-list');
    const completedList = document.getElementById('completed-list');

    if (!pendingList || !progressList || !completedList) return;

    pendingList.innerHTML = '';
    progressList.innerHTML = '';
    completedList.innerHTML = '';

    tasks.forEach(task => {
        const card = createTaskCard(task);

        if (task.status === 'pending') {
            pendingList.appendChild(card);
        } else if (task.status === 'progress') {
            progressList.appendChild(card);
        } else if (task.status === 'completed') {
            completedList.appendChild(card);
        }
    });

    updateStats();
}

function createTaskCard(task) {
    const div = document.createElement('div');
    const priorityConfig = PRIORITIES[task.priority] || PRIORITIES.medium;

    let classes = 'p-4 group animate-slide-in relative mb-4 rounded-sm shadow-sm ';

    if (task.status === 'pending') {
        classes += 'bg-surface-dark border-2 border-border-dark hover:border-pending/50 transition-colors';
    } else if (task.status === 'progress') {
        classes += 'bg-surface-dark border-2 border-progress/50';
    } else {
        classes += 'bg-surface-dark border-2 border-border-dark opacity-60 grayscale-[0.5] line-through decoration-completed/40';
    }

    div.className = classes;

    const isCompleted = task.status === 'completed';
    const isProgress = task.status === 'progress';

    div.innerHTML = `
        ${isProgress ? '<div class="absolute top-0 right-0 p-2"><span class="size-2 rounded-full bg-progress animate-pulse block"></span></div>' : ''}
        <div class="flex items-start gap-4">
            <input 
                class="pixel-checkbox mt-1" 
                type="checkbox" 
                ${isCompleted ? 'checked' : ''}
                onchange="window.toggleTaskStatus('${task.id}')"
            />
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-mono ${priorityConfig.class} uppercase tracking-tighter font-bold">${priorityConfig.label}</span>
                    <span class="text-[10px] font-mono text-text-muted">ID: #${task.id.slice(-3)}</span>
                </div>
                <p class="${task.status === 'completed' ? 'text-text-muted' : 'text-white'} text-sm leading-relaxed mb-3 break-words">${task.text}</p>
                
                ${isProgress ? `
                    <div class="w-full bg-background-dark h-1.5 border border-border-dark mb-3">
                        <div class="bg-progress h-full transition-all duration-300" style="width: ${task.progress || 10}%"></div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-text-muted text-[10px] font-mono uppercase tracking-widest">Running... ${task.progress || 10}%</span>
                        <div class="flex gap-2">
                            <button onclick="window.updateProgress('${task.id}', 100)" class="text-[10px] font-mono text-completed hover:underline font-bold">FINISH</button>
                        </div>
                    </div>
                ` : ''}

                ${!isProgress && !isCompleted ? `
                    <div class="flex items-center gap-3 justify-between">
                         <span class="text-text-muted text-[10px] font-mono">EST: 2H</span>
                         <button onclick="window.moveToProgress('${task.id}')" class="text-[10px] font-mono text-primary hover:text-white uppercase hover:underline font-bold">Start &gt;</button>
                    </div>
                ` : ''}
                
                <button 
                    onclick="window.deleteTask('${task.id}')"
                    class="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-900/20 rounded">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    `;

    return div;
}

// ==========================================
// WINDOW EXPORTS & MODAL LOGIC
// ==========================================

window.toggleTaskStatus = function (id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.status === 'completed') {
        task.status = 'pending';
        task.progress = 0;
    } else {
        task.status = 'completed';
        task.progress = 100;
        showNotification('Task completed!', 'success');
    }

    TaskStorage.set(tasks);
    renderTasks();
};

window.moveToProgress = function (id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.status = 'progress';
    task.progress = 10;
    TaskStorage.set(tasks);
    renderTasks();
};

window.updateProgress = function (id, value) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.progress = value;
    if (value >= 100) {
        task.status = 'completed';
        showNotification('Task finished!', 'success');
    }
    TaskStorage.set(tasks);
    renderTasks();
};

// --- CUSTOM MODAL LOGIC ---

window.deleteTask = function (id) {
    taskToDeleteId = id;
    const modal = document.getElementById('delete-modal');
    const idLabel = document.getElementById('modal-task-id');

    if (modal && idLabel) {
        idLabel.textContent = id.slice(-3); // Show last 3 digits
        modal.classList.remove('hidden');
    }
};

window.closeDeleteModal = function () {
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    taskToDeleteId = null;
};

window.confirmDelete = function () {
    if (!taskToDeleteId) return;

    tasks = tasks.filter(t => t.id !== taskToDeleteId);
    TaskStorage.set(tasks);
    renderTasks();

    showNotification('Task permanently deleted', 'info');
    closeDeleteModal();
};

function clearCompleted() {
    // For clear completed, we can use standard confirm or make another modal.
    // Let's stick to standard for now or just do it.
    if (!confirm('Remove ALL completed tasks?')) return;

    const initialCount = tasks.length;
    tasks = tasks.filter(t => t.status !== 'completed');

    if (tasks.length < initialCount) {
        TaskStorage.set(tasks);
        renderTasks();
        showNotification('Cleaned up completed tasks', 'success');
    }
}

function exportTasks() {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Tasks exported!', 'success');
}

function updateStats() {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const progress = tasks.filter(t => t.status === 'progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    const pCount = document.getElementById('pending-count');
    const prCount = document.getElementById('progress-count');
    const cCount = document.getElementById('completed-count');

    if (pCount) pCount.textContent = String(pending).padStart(2, '0');
    if (prCount) prCount.textContent = String(progress).padStart(2, '0');
    if (cCount) cCount.textContent = String(completed).padStart(2, '0');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded border text-sm font-medium z-[150] shadow-lg animate-slide-in ${type === 'success'
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
