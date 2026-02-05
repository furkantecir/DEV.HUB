// ============================================
// GLOBAL SEARCH SYSTEM
// Ctrl+K ile açılan command palette
// ============================================

class GlobalSearch {
    constructor() {
        this.tools = [];
        this.recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
        this.favorites = JSON.parse(localStorage.getItem('favorite_tools') || '[]');
        this.isOpen = false;
        this.selectedIndex = 0;
        this.filteredResults = [];

        this.init();
    }

    init() {
        this.indexTools();
        this.createModal();
        this.attachEventListeners();
    }

    // Tüm araçları index'le
    indexTools() {
        this.tools = [
            // Productivity
            { id: 'pomodoro', name: 'Pomodoro Timer', category: 'Productivity', url: 'focustime.html', icon: 'timer', keywords: ['focus', 'time', 'work', 'break'] },
            { id: 'notes', name: 'Quick Notes', category: 'Productivity', url: 'quick-notes.html', icon: 'edit_note', keywords: ['note', 'text', 'write'] },
            { id: 'todo', name: 'To-Do List', category: 'Productivity', url: 'todo-list.html', icon: 'checklist', keywords: ['task', 'list', 'check'] },

            // Developer Tools
            { id: 'json-formatter', name: 'JSON Formatter', category: 'Developer', url: 'json-formatter.html', icon: 'code', keywords: ['json', 'format', 'pretty'] },
            { id: 'json-validator', name: 'JSON Validator', category: 'Developer', url: 'json-validator.html', icon: 'check_circle', keywords: ['json', 'validate', 'check'] },
            { id: 'regex', name: 'Regex Tester', category: 'Developer', url: 'regex-tester.html', icon: 'search', keywords: ['regex', 'pattern', 'match'] },
            { id: 'base64', name: 'Base64 Encoder', category: 'Developer', url: 'base64-tool.html', icon: 'lock', keywords: ['base64', 'encode', 'decode'] },
            { id: 'markdown', name: 'Markdown Previewer', category: 'Developer', url: 'markdown-previewer.html', icon: 'preview', keywords: ['markdown', 'md', 'preview'] },
            { id: 'sql', name: 'SQL Formatter', category: 'Developer', url: 'sql-formatter.html', icon: 'database', keywords: ['sql', 'format', 'query'] },
            { id: 'hash-generator', name: 'Hash Generator', category: 'Developer', url: 'hash-generator.html', icon: 'tag', keywords: ['hash', 'md5', 'sha', 'crypto', 'checksum'] },
            { id: 'diff-checker', name: 'Diff Checker', category: 'Developer', url: 'diff-checker.html', icon: 'difference', keywords: ['diff', 'compare', 'text', 'difference'] },
            { id: 'code-playground', name: 'Code Playground', category: 'Developer', url: 'code-playground.html', icon: 'code', keywords: ['editor', 'html', 'css', 'js', 'sandbox'] },
            { id: 'cron-generator', name: 'Cron Generator', category: 'Developer', url: 'cron-generator.html', icon: 'schedule', keywords: ['cron', 'schedule', 'time', 'generator'] },

            // Text Tools
            { id: 'case', name: 'Case Converter', category: 'Text', url: 'case-converter.html', icon: 'text_fields', keywords: ['case', 'upper', 'lower', 'camel'] },
            { id: 'lorem', name: 'Lorem Ipsum Generator', category: 'Text', url: 'lorem-ipsum-generator.html', icon: 'article', keywords: ['lorem', 'ipsum', 'placeholder'] },

            // Image Tools
            { id: 'image-compress', name: 'Image Compressor', category: 'Image', url: 'image-compressor.html', icon: 'compress', keywords: ['image', 'compress', 'optimize'] },
            { id: 'image-convert', name: 'Image Converter', category: 'Image', url: 'image-converter.html', icon: 'image', keywords: ['image', 'convert', 'format'] },
            { id: 'exif', name: 'EXIF Remover', category: 'Image', url: 'exif-remover.html', icon: 'delete', keywords: ['exif', 'metadata', 'remove'] },
            { id: 'pixel-crusher', name: 'Pixel Crusher', category: 'Image', url: 'pixel-crusher.html', icon: 'grid_on', keywords: ['pixel', 'crush', 'resize'] },
            { id: 'svg-optimizer', name: 'SVG Optimizer', category: 'Image', url: 'svg-optimizer.html', icon: 'auto_fix_high', keywords: ['svg', 'optimize', 'vector'] },

            // Color Tools
            { id: 'color-picker', name: 'Color Picker', category: 'Color', url: 'color-picker.html', icon: 'palette', keywords: ['color', 'picker', 'rgb', 'hex'] },
            { id: 'color-palette', name: 'Palette Generator', category: 'Color', url: 'color-palette-generator.html', icon: 'gradient', keywords: ['palette', 'color', 'scheme'] },
            { id: 'color-library', name: 'Color Library', category: 'Color', url: 'color-library.html', icon: 'collections', keywords: ['color', 'library', 'collection'] },

            // Utilities
            { id: 'calculator', name: 'Calculator', category: 'Utility', url: 'calculator.html', icon: 'calculate', keywords: ['calc', 'math', 'number'] },
            { id: 'qr', name: 'QR Generator', category: 'Utility', url: 'qr-generator.html', icon: 'qr_code_2', keywords: ['qr', 'code', 'generate'] },
            { id: 'unit-converter', name: 'Unit Converter', category: 'Utility', url: 'unit-converter.html', icon: 'transform', keywords: ['convert', 'unit', 'measure'] },
            { id: 'world-clock', name: 'World Clock', category: 'Utility', url: 'world-clock.html', icon: 'schedule', keywords: ['time', 'clock', 'timezone'] },
            { id: 'timestamp-converter', name: 'Timestamp Converter', category: 'Utility', url: 'timestamp-converter.html', icon: 'schedule', keywords: ['timestamp', 'unix', 'epoch', 'time', 'date'] },

            // Network
            { id: 'network-tools', name: 'Network Tools', category: 'Network', url: 'network-tools.html', icon: 'wifi', keywords: ['network', 'ip', 'dns'] },
            { id: 'network-scan', name: 'Network Scanner', category: 'Network', url: 'network-scan.html', icon: 'radar', keywords: ['scan', 'network', 'port'] },
            { id: 'network-map', name: 'Network Map', category: 'Network', url: 'network-map.html', icon: 'hub', keywords: ['map', 'network', 'topology'] },

            // Security
            { id: 'password-vault', name: 'Password Vault', category: 'Security', url: 'password-vault.html', icon: 'vpn_key', keywords: ['password', 'vault', 'secure'] },

            // System
            { id: 'settings', name: 'Settings', category: 'System', url: 'settings.html', icon: 'settings', keywords: ['settings', 'config', 'preferences'] },
            { id: 'profile', name: 'Profile', category: 'System', url: 'profile.html', icon: 'person', keywords: ['profile', 'user', 'account'] },
            { id: 'cpu-monitor', name: 'CPU Monitor', category: 'System', url: 'cpu-monitor.html', icon: 'memory', keywords: ['cpu', 'monitor', 'performance'] },
            { id: 'clean-cache', name: 'Clean Cache', category: 'System', url: 'clean-cache.html', icon: 'cleaning_services', keywords: ['clean', 'cache', 'clear'] },
        ];
    }

    // Modal HTML oluştur
    createModal() {
        const modalHTML = `
            <div id="global-search-modal" class="fixed inset-0 z-[100] hidden">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="search-backdrop"></div>
                
                <!-- Modal Container -->
                <div class="relative flex items-start justify-center pt-[15vh] px-4">
                    <div class="w-full max-w-2xl bg-[#1e1427] border-2 border-primary/30 rounded-lg shadow-[0_0_30px_rgba(127,19,236,0.3)] overflow-hidden">
                        
                        <!-- Search Input -->
                        <div class="flex items-center gap-3 px-4 py-3 border-b border-primary/20">
                            <span class="material-symbols-outlined text-primary text-xl">search</span>
                            <input 
                                type="text" 
                                id="global-search-input"
                                placeholder="Search tools... (type to search)"
                                class="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                autocomplete="off"
                            />
                            <kbd class="px-2 py-1 text-[10px] bg-primary/10 text-primary rounded border border-primary/30">ESC</kbd>
                        </div>

                        <!-- Results -->
                        <div id="search-results" class="max-h-[400px] overflow-y-auto">
                            <!-- Results will be inserted here -->
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between px-4 py-2 bg-[#191022] border-t border-primary/20 text-[10px] text-slate-500">
                            <div class="flex gap-4">
                                <span><kbd class="kbd-mini">↑↓</kbd> Navigate</span>
                                <span><kbd class="kbd-mini">Enter</kbd> Select</span>
                                <span><kbd class="kbd-mini">ESC</kbd> Close</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="text-primary">★</span>
                                <span>Favorites</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Event listeners
    attachEventListeners() {
        // Toggle Search with Ctrl+K or Ctrl+Space
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K (allow browser default prevention)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault(); // Prevent browser address bar focus
                this.toggle();
            }

            // Ctrl+Space (Alternative)
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                this.toggle();
            }

            // Close on Escape
            if (e.key === 'Escape') {
                const modal = document.getElementById('global-search-modal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.toggle();
                }
            }
        });

        // Input değişimi
        const input = document.getElementById('global-search-input');
        input?.addEventListener('input', (e) => {
            this.search(e.target.value);
        });

        // Keyboard navigation
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateDown();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateUp();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectCurrent();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Backdrop click
        document.getElementById('search-backdrop')?.addEventListener('click', () => {
            this.close();
        });
    }

    // Arama fonksiyonu (Fuzzy search)
    search(query) {
        if (!query.trim()) {
            this.showDefaultResults();
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Fuzzy search
        this.filteredResults = this.tools.filter(tool => {
            const nameMatch = tool.name.toLowerCase().includes(lowerQuery);
            const categoryMatch = tool.category.toLowerCase().includes(lowerQuery);
            const keywordMatch = tool.keywords.some(k => k.includes(lowerQuery));

            return nameMatch || categoryMatch || keywordMatch;
        });

        // Relevance scoring
        this.filteredResults.sort((a, b) => {
            const aScore = this.calculateRelevance(a, lowerQuery);
            const bScore = this.calculateRelevance(b, lowerQuery);
            return bScore - aScore;
        });

        this.selectedIndex = 0;
        this.renderResults();
    }

    calculateRelevance(tool, query) {
        let score = 0;

        // Exact name match
        if (tool.name.toLowerCase() === query) score += 100;

        // Name starts with query
        if (tool.name.toLowerCase().startsWith(query)) score += 50;

        // Name contains query
        if (tool.name.toLowerCase().includes(query)) score += 25;

        // Category match
        if (tool.category.toLowerCase().includes(query)) score += 10;

        // Keyword match
        tool.keywords.forEach(k => {
            if (k.includes(query)) score += 5;
        });

        // Favorite boost
        if (this.favorites.includes(tool.id)) score += 20;

        return score;
    }

    showDefaultResults() {
        // Show recent + favorites
        const recent = this.recentSearches.slice(0, 5);
        const favTools = this.tools.filter(t => this.favorites.includes(t.id));

        this.filteredResults = [...favTools, ...recent.map(id =>
            this.tools.find(t => t.id === id)
        ).filter(Boolean)];

        this.selectedIndex = 0;
        this.renderResults();
    }

    renderResults() {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (this.filteredResults.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-30">search_off</span>
                    <p class="text-sm">No tools found</p>
                </div>
            `;
            return;
        }

        const html = this.filteredResults.map((tool, index) => {
            const isFavorite = this.favorites.includes(tool.id);
            const isSelected = index === this.selectedIndex;

            return `
                <div class="search-result-item ${isSelected ? 'selected' : ''}" data-index="${index}" data-tool-id="${tool.id}">
                    <div class="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors ${isSelected ? 'bg-primary/20' : ''}">
                        <span class="material-symbols-outlined text-primary text-xl">${tool.icon}</span>
                        <div class="flex-1">
                            <div class="text-white text-sm font-medium">${tool.name}</div>
                            <div class="text-slate-500 text-xs">${tool.category}</div>
                        </div>
                        ${isFavorite ? '<span class="material-symbols-outlined text-yellow-400 text-sm">star</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // Click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const toolId = item.dataset.toolId;
                this.selectTool(toolId);
            });
        });
    }

    navigateDown() {
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredResults.length - 1);
        this.renderResults();
        this.scrollToSelected();
    }

    navigateUp() {
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderResults();
        this.scrollToSelected();
    }

    scrollToSelected() {
        const container = document.getElementById('search-results');
        const selected = container?.querySelector('.selected');
        selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    selectCurrent() {
        if (this.filteredResults.length > 0) {
            const tool = this.filteredResults[this.selectedIndex];
            this.selectTool(tool.id);
        }
    }

    selectTool(toolId) {
        const tool = this.tools.find(t => t.id === toolId);
        if (!tool) return;

        // Add to recent searches
        this.addToRecent(toolId);

        // Navigate
        window.location.href = tool.url;
    }

    addToRecent(toolId) {
        // Remove if exists
        this.recentSearches = this.recentSearches.filter(id => id !== toolId);

        // Add to front
        this.recentSearches.unshift(toolId);

        // Keep only last 10
        this.recentSearches = this.recentSearches.slice(0, 10);

        // Save
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const modal = document.getElementById('global-search-modal');
        const input = document.getElementById('global-search-input');

        if (modal) {
            modal.classList.remove('hidden');
            this.isOpen = true;

            // Focus input
            setTimeout(() => {
                input?.focus();
                this.showDefaultResults();
            }, 50);
        }
    }

    close() {
        const modal = document.getElementById('global-search-modal');
        const input = document.getElementById('global-search-input');

        if (modal) {
            modal.classList.add('hidden');
            this.isOpen = false;

            // Clear input
            if (input) input.value = '';
        }
    }

    // Public methods for favorites
    toggleFavorite(toolId) {
        if (this.favorites.includes(toolId)) {
            this.favorites = this.favorites.filter(id => id !== toolId);
        } else {
            this.favorites.push(toolId);
        }

        localStorage.setItem('favorite_tools', JSON.stringify(this.favorites));
        this.renderResults();
    }
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.globalSearch = new GlobalSearch();
}
