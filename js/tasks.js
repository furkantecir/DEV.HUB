// ============================================
// TASKS MODULE - Task Management
// ============================================

const Tasks = {
    tasks: [],
    currentFilter: 'active', // 'active' or 'completed'

    // Initialize tasks
    init() {
        this.loadTasks();
    },

    // Load tasks from storage
    loadTasks() {
        this.tasks = Storage.get(Storage.KEYS.TASKS) || [];
    },

    // Save tasks to storage
    saveTasks() {
        Storage.set(Storage.KEYS.TASKS, this.tasks);
    },

    // Get all tasks
    getAll() {
        return this.tasks;
    },

    // Get active tasks
    getActive() {
        return this.tasks.filter(task => !task.completed);
    },

    // Get completed tasks
    getCompleted() {
        return this.tasks.filter(task => task.completed);
    },

    // Get task by ID
    getById(id) {
        return this.tasks.find(task => task.id === id);
    },

    // Add new task
    add(taskData) {
        const task = {
            id: Date.now(),
            title: taskData.title,
            category: taskData.category || 'General',
            priority: taskData.priority || 'normal',
            dueDate: taskData.dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(task);
        this.saveTasks();

        // Log activity
        this.logActivity('task_added', task.title);

        return task;
    },

    // Update task
    update(id, updates) {
        const task = this.getById(id);
        if (!task) return false;

        Object.assign(task, updates);
        this.saveTasks();

        return task;
    },

    // Toggle task completion
    toggleComplete(id) {
        const task = this.getById(id);
        if (!task) return false;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;

        this.saveTasks();

        // Update daily progress
        if (task.completed) {
            this.incrementCompletedTasks();
            this.logActivity('task_completed', task.title);
        } else {
            this.decrementCompletedTasks();
        }

        return task;
    },

    // Delete task
    delete(id) {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index === -1) return false;

        const task = this.tasks[index];
        this.tasks.splice(index, 1);
        this.saveTasks();

        this.logActivity('task_deleted', task.title);

        return true;
    },

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.getCompleted().length;
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();

        this.logActivity('tasks_cleared', `${completedCount} tasks cleared`);

        return completedCount;
    },

    // Get task count
    getCount() {
        return {
            total: this.tasks.length,
            active: this.getActive().length,
            completed: this.getCompleted().length
        };
    },

    // Increment completed tasks in daily progress
    incrementCompletedTasks() {
        const progress = Storage.get(Storage.KEYS.DAILY_PROGRESS);
        if (progress) {
            progress.tasksCompleted++;
            Storage.set(Storage.KEYS.DAILY_PROGRESS, progress);
        }

        // Update stats
        const stats = Storage.get(Storage.KEYS.STATS);
        if (stats) {
            stats.totalTasksCompleted++;
            Storage.set(Storage.KEYS.STATS, stats);
        }
    },

    // Decrement completed tasks in daily progress
    decrementCompletedTasks() {
        const progress = Storage.get(Storage.KEYS.DAILY_PROGRESS);
        if (progress && progress.tasksCompleted > 0) {
            progress.tasksCompleted--;
            Storage.set(Storage.KEYS.DAILY_PROGRESS, progress);
        }
    },

    // Log activity
    logActivity(type, message) {
        const log = Storage.get(Storage.KEYS.ACTIVITY_LOG) || [];
        log.unshift({
            type,
            message,
            timestamp: new Date().toISOString()
        });

        // Keep only last 50 activities
        if (log.length > 50) {
            log.splice(50);
        }

        Storage.set(Storage.KEYS.ACTIVITY_LOG, log);
    },

    // Search tasks
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.tasks.filter(task =>
            task.title.toLowerCase().includes(lowerQuery) ||
            task.category.toLowerCase().includes(lowerQuery)
        );
    },

    // Filter tasks by category
    filterByCategory(category) {
        return this.tasks.filter(task => task.category === category);
    },

    // Filter tasks by priority
    filterByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    },

    // Get categories
    getCategories() {
        const categories = new Set(this.tasks.map(task => task.category));
        return Array.from(categories);
    }
};

// Initialize on load
Tasks.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tasks;
}
