// ============================================
// QUICK NOTES - Note Management System
// ============================================

let currentNoteId = null;
let notes = [];
let autosaveInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 Quick Notes loaded');

    // Load notes from storage
    loadNotes();

    // Setup event listeners
    setupEventListeners();

    // Start autosave
    startAutosave();

    // Load last active note or create new one
    if (notes.length > 0) {
        loadNote(notes[0].id);
    } else {
        createNewNote();
    }
});

// Load notes from LocalStorage
function loadNotes() {
    const stored = Storage.get('QUICK_NOTES');
    notes = stored || [];
    renderNotesList();
    updateNotesCount();
}

// Save notes to LocalStorage
function saveNotes() {
    Storage.set('QUICK_NOTES', notes);
    updateNotesCount();
}

// Create new note
function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: `Note_${notes.length + 1}`,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    notes.unshift(newNote);
    saveNotes();
    loadNote(newNote.id);
    renderNotesList();

    showNotification('New note created!', 'success');
}

// Load note into editor
function loadNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    currentNoteId = noteId;
    const editor = document.getElementById('editor');
    const noteTitle = document.getElementById('note-title');

    editor.value = note.content;
    noteTitle.textContent = `${note.title}.md`;

    updateStats();
    highlightActiveNote(noteId);
}

// Save current note
function saveCurrentNote() {
    if (!currentNoteId) return;

    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    const editor = document.getElementById('editor');
    note.content = editor.value;
    note.updatedAt = new Date().toISOString();

    // Auto-generate title from first line
    const firstLine = editor.value.split('\n')[0].trim();
    if (firstLine) {
        note.title = firstLine.replace(/^#+\s*/, '').substring(0, 30);
    }

    saveNotes();
    renderNotesList();
    highlightActiveNote(currentNoteId);

    // Flash autosave indicator
    flashAutosaveIndicator();
}

// Render notes list
function renderNotesList() {
    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="text-center py-8 text-text-muted text-xs font-mono">
                <span class="material-symbols-outlined text-2xl mb-2 opacity-30">note</span>
                <p>No notes yet</p>
            </div>
        `;
        return;
    }

    notesList.innerHTML = notes.map(note => {
        const timeAgo = getTimeAgo(note.updatedAt);
        const preview = note.content.substring(0, 100).replace(/\n/g, ' ');
        const isActive = note.id === currentNoteId;

        return `
            <div class="relative group">
                <button 
                    class="w-full text-left p-3 pr-10 ${isActive ? 'bg-primary/10 border border-primary/50' : 'hover:bg-surface-dark border border-border-dark'} transition-colors relative"
                    data-note-id="${note.id}"
                    onclick="loadNoteById('${note.id}')">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-xs font-bold ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'} font-mono truncate pr-2">${note.title}</span>
                        <span class="text-[10px] ${isActive ? 'text-primary' : 'text-text-muted'} font-mono">${timeAgo}</span>
                    </div>
                    <p class="text-[10px] text-text-muted/60 font-mono line-clamp-2">${preview || 'Empty note'}</p>
                    ${isActive ? '<div class="absolute right-0 top-0 bottom-0 w-1 bg-primary"></div>' : ''}
                </button>
                <button 
                    onclick="deleteNote('${note.id}', event)"
                    class="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500 rounded opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Delete note">
                    <span class="material-symbols-outlined text-sm text-red-400">delete</span>
                </button>
            </div>
        `;
    }).join('');
}

// Load note by ID (global function for onclick)
window.loadNoteById = function (noteId) {
    loadNote(noteId);
};

// Highlight active note
function highlightActiveNote(noteId) {
    const buttons = document.querySelectorAll('[data-note-id]');
    buttons.forEach(btn => {
        if (btn.getAttribute('data-note-id') === noteId) {
            btn.classList.add('bg-primary/10', 'border-primary/50');
            btn.classList.remove('border-border-dark');
        } else {
            btn.classList.remove('bg-primary/10', 'border-primary/50');
            btn.classList.add('border-border-dark');
        }
    });
}

// Update stats (lines, chars)
function updateStats() {
    const editor = document.getElementById('editor');
    const content = editor.value;

    const lines = content.split('\n').length;
    const chars = content.length;

    document.getElementById('line-count').textContent = lines;
    document.getElementById('char-count').textContent = chars.toLocaleString();
}

// Update notes count
function updateNotesCount() {
    const notesCount = document.getElementById('notes-count');
    if (notesCount) {
        notesCount.textContent = `${notes.length.toString().padStart(2, '0')} Total`;
    }
}

// Get time ago string
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

// Delete note (global function for onclick)
window.deleteNote = function (noteId, event) {
    event.stopPropagation(); // Prevent note from being loaded

    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const deletedNote = notes[noteIndex];
    notes.splice(noteIndex, 1);
    saveNotes();
    renderNotesList();

    // If deleted note was active, load another note or create new one
    if (currentNoteId === noteId) {
        if (notes.length > 0) {
            loadNote(notes[0].id);
        } else {
            createNewNote();
        }
    }

    showNotification(`"${deletedNote.title}" deleted`, 'success');
};

// Delete all notes
function deleteAllNotes() {
    if (!confirm(`Are you sure you want to delete ALL ${notes.length} notes? This cannot be undone!`)) {
        return;
    }

    notes = [];
    currentNoteId = null;
    saveNotes();
    renderNotesList();
    createNewNote();

    showNotification('All notes deleted', 'success');
}

// Setup event listeners
function setupEventListeners() {
    const editor = document.getElementById('editor');
    const newBtn = document.getElementById('new-btn');
    const newNoteBtn = document.getElementById('new-note-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const saveBtn = document.getElementById('save-btn');
    const copyBtn = document.getElementById('copy-btn');
    const exportBtn = document.getElementById('export-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const notesSearch = document.getElementById('notes-search');

    // Editor input
    if (editor) {
        editor.addEventListener('input', () => {
            updateStats();
        });
    }

    // New note buttons
    if (newBtn) newBtn.addEventListener('click', createNewNote);
    if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);

    // Delete all button
    if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllNotes);

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveCurrentNote();
            showNotification('Note saved!', 'success');
        });
    }

    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const editor = document.getElementById('editor');
            navigator.clipboard.writeText(editor.value).then(() => {
                showNotification('Copied to clipboard!', 'success');
            });
        });
    }

    // Export button
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const note = notes.find(n => n.id === currentNoteId);
            if (!note) return;

            const blob = new Blob([note.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${note.title}.txt`;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('Note exported!', 'success');
        });
    }

    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    // Search notes
    if (notesSearch) {
        notesSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const noteButtons = document.querySelectorAll('[data-note-id]');

            noteButtons.forEach(btn => {
                const title = btn.querySelector('.text-xs').textContent.toLowerCase();
                const preview = btn.querySelector('.text-\\[10px\\]').textContent.toLowerCase();

                if (title.includes(query) || preview.includes(query)) {
                    btn.style.display = 'block';
                } else {
                    btn.style.display = 'none';
                }
            });
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+S: Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentNote();
            showNotification('Note saved!', 'success');
        }

        // Ctrl+N: New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewNote();
        }
    });
}

// Start autosave
function startAutosave() {
    autosaveInterval = setInterval(() => {
        if (currentNoteId) {
            saveCurrentNote();
        }
    }, 5000); // Autosave every 5 seconds
}

// Flash autosave indicator
function flashAutosaveIndicator() {
    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
        indicator.classList.add('animate-pulse');
        setTimeout(() => {
            indicator.classList.remove('animate-pulse');
        }, 1000);
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
