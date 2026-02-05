// ============================================
// KEYBOARD SHORTCUTS PANEL
// ============================================

class ShortcutsPanel {
    constructor() {
        this.isOpen = false;
        this.shortcuts = [
            { key: 'Ctrl+Space', description: 'Open Global Search', category: 'Navigation' },
            { key: 'Ctrl+K', description: 'Global Search (Alternative)', category: 'Navigation' },
            { key: 'Ctrl+/', description: 'Show Keyboard Shortcuts', category: 'Navigation' },
            { key: 'Ctrl+S', description: 'Save Current Work', category: 'Actions' },
            { key: 'Ctrl+Shift+D', description: 'Toggle Dark Mode', category: 'Settings' },
            { key: 'Ctrl+Shift+C', description: 'Copy Result', category: 'Actions' },
            { key: 'Esc', description: 'Close Modal/Panel', category: 'Navigation' },
            { key: '↑↓', description: 'Navigate Search Results', category: 'Navigation' },
            { key: 'Enter', description: 'Select/Confirm', category: 'Actions' },
            { key: 'Ctrl+H', description: 'Go to Home', category: 'Navigation' },
            { key: 'Ctrl+,', description: 'Open Settings', category: 'Settings' },
        ];

        this.init();
    }

    init() {
        this.createPanel();
        this.attachEventListeners();
    }

    createPanel() {
        const panelHTML = `
            <div id="shortcuts-panel" class="fixed inset-0 z-[200] hidden">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="shortcuts-backdrop"></div>
                
                <!-- Panel Container -->
                <div class="relative flex items-center justify-center p-4 min-h-screen">
                    <div class="w-full max-w-2xl bg-[#1e1427] border-2 border-primary/30 rounded-lg shadow-[0_0_30px_rgba(127,19,236,0.3)] overflow-hidden">
                        
                        <!-- Header -->
                        <div class="flex items-center justify-between px-6 py-4 border-b border-primary/20">
                            <div class="flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary text-2xl">keyboard</span>
                                <div>
                                    <h2 class="text-white font-bold text-lg">Keyboard Shortcuts</h2>
                                    <p class="text-xs text-slate-500">Quick reference guide</p>
                                </div>
                            </div>
                            <button onclick="window.shortcutsPanel.close()" 
                                class="flex items-center justify-center size-8 rounded hover:bg-primary/10 text-slate-400 hover:text-white transition-colors">
                                <span class="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        <!-- Shortcuts List -->
                        <div class="p-6 max-h-[60vh] overflow-y-auto">
                            ${this.renderShortcutsByCategory()}
                        </div>

                        <!-- Footer -->
                        <div class="px-6 py-3 bg-[#191022] border-t border-primary/20 text-xs text-slate-500 text-center">
                            Press <kbd class="kbd-mini">Ctrl+/</kbd> or <kbd class="kbd-mini">?</kbd> to toggle this panel
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
    }

    renderShortcutsByCategory() {
        const categories = {};

        // Group by category
        this.shortcuts.forEach(shortcut => {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push(shortcut);
        });

        // Render
        return Object.entries(categories).map(([category, shortcuts]) => `
            <div class="mb-6 last:mb-0">
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">${category}</h3>
                <div class="space-y-2">
                    ${shortcuts.map(s => `
                        <div class="flex items-center justify-between p-3 bg-[#0f0a15] rounded border border-primary/10 hover:border-primary/30 transition-colors">
                            <span class="text-sm text-white">${s.description}</span>
                            <kbd class="px-2 py-1 text-xs bg-primary/10 text-primary rounded border border-primary/30 font-mono">${s.key}</kbd>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Ctrl+/ or ? to toggle
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === '/') || (e.shiftKey && e.key === '?')) {
                e.preventDefault();
                this.toggle();
            }
        });

        // Backdrop click
        document.getElementById('shortcuts-backdrop')?.addEventListener('click', () => {
            this.close();
        });

        // Esc to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const panel = document.getElementById('shortcuts-panel');
        if (panel) {
            panel.classList.remove('hidden');
            this.isOpen = true;
        }
    }

    close() {
        const panel = document.getElementById('shortcuts-panel');
        if (panel) {
            panel.classList.add('hidden');
            this.isOpen = false;
        }
    }
}

// Initialize
if (typeof window !== 'undefined') {
    window.shortcutsPanel = new ShortcutsPanel();
}
