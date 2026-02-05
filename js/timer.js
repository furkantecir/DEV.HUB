// ============================================
// TIMER MODULE - Pomodoro Timer
// ============================================

const Timer = {
    // Timer state
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    currentTime: 25 * 60,
    isRunning: false,
    isWorkSession: true,
    interval: null,
    currentTaskId: null,

    // Initialize timer
    init() {
        this.loadState();
        this.loadSettings();
    },

    // Load timer state from storage
    loadState() {
        const state = Storage.get(Storage.KEYS.TIMER_STATE);
        if (state) {
            this.currentTime = state.currentTime || this.workDuration;
            this.isWorkSession = state.isWorkSession !== undefined ? state.isWorkSession : true;
            this.currentTaskId = state.currentTaskId || null;
        }
    },

    // Save timer state to storage
    saveState() {
        Storage.set(Storage.KEYS.TIMER_STATE, {
            currentTime: this.currentTime,
            isWorkSession: this.isWorkSession,
            currentTaskId: this.currentTaskId,
            lastUpdated: new Date().toISOString()
        });
    },

    // Load settings
    loadSettings() {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        if (settings) {
            this.workDuration = (settings.pomodoroMinutes || 25) * 60;
            this.breakDuration = (settings.breakMinutes || 5) * 60;

            // Reset current time if it's a fresh session
            if (!this.isRunning) {
                this.currentTime = this.isWorkSession ? this.workDuration : this.breakDuration;
            }
        }
    },

    // Format time as MM:SS
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Get current time formatted
    getCurrentTime() {
        return this.formatTime(this.currentTime);
    },

    // Start timer
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.saveState();

        this.interval = setInterval(() => {
            this.tick();
        }, 1000);

        // Trigger event
        this.triggerEvent('start');
    },

    // Pause timer
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.interval);
        this.interval = null;
        this.saveState();

        // Trigger event
        this.triggerEvent('pause');
    },

    // Reset timer
    reset() {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workDuration : this.breakDuration;
        this.saveState();

        // Trigger event
        this.triggerEvent('reset');
    },

    // Timer tick (called every second)
    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            this.saveState();

            // Trigger tick event
            this.triggerEvent('tick', { time: this.currentTime });
        } else {
            // Timer completed
            this.complete();
        }
    },

    // Complete session
    complete() {
        this.pause();

        if (this.isWorkSession) {
            // Work session completed
            this.addFocusTime(this.workDuration / 60);

            // Switch to break
            this.isWorkSession = false;
            this.currentTime = this.breakDuration;

            // Play sound
            this.playSound();

            // Trigger event
            this.triggerEvent('workComplete');
        } else {
            // Break completed
            this.isWorkSession = true;
            this.currentTime = this.workDuration;

            // Play sound
            this.playSound();

            // Trigger event
            this.triggerEvent('breakComplete');
        }

        this.saveState();
    },

    // Add focus time to daily progress
    addFocusTime(minutes) {
        const progress = Storage.get(Storage.KEYS.DAILY_PROGRESS);
        if (progress) {
            // Check if it's a new day
            const today = new Date().toDateString();
            if (progress.date !== today) {
                // Reset for new day
                progress.date = today;
                progress.focusMinutes = 0;
                progress.tasksCompleted = 0;
                progress.sessions = [];
            }

            progress.focusMinutes += minutes;
            progress.sessions.push({
                duration: minutes,
                timestamp: new Date().toISOString(),
                taskId: this.currentTaskId
            });

            Storage.set(Storage.KEYS.DAILY_PROGRESS, progress);
        }

        // Update total stats
        const stats = Storage.get(Storage.KEYS.STATS);
        if (stats) {
            stats.totalFocusMinutes += minutes;
            stats.totalSessions++;
            Storage.set(Storage.KEYS.STATS, stats);
        }
    },

    // Set current task
    setCurrentTask(taskId) {
        this.currentTaskId = taskId;
        this.saveState();
    },

    // Get current task
    getCurrentTask() {
        if (!this.currentTaskId) return null;
        return Tasks.getById(this.currentTaskId);
    },

    // Play sound
    playSound() {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        if (settings && settings.soundEnabled) {
            // Create audio context for beep sound
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        }
    },

    // Event listeners
    listeners: {},

    // Add event listener
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    // Trigger event
    triggerEvent(event, data = {}) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // Get progress percentage
    getProgress() {
        const total = this.isWorkSession ? this.workDuration : this.breakDuration;
        const elapsed = total - this.currentTime;
        return Math.round((elapsed / total) * 100);
    },

    // Get session type
    getSessionType() {
        return this.isWorkSession ? 'work' : 'break';
    }
};

// Initialize on load
Timer.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
}
