
// ============================================
// UTILITIES PAGE - Tool Management v2.1
// ============================================

const MODULE_DEFINITIONS = {
    'cpu-monitor': {
        title: 'CPU Monitor',
        icon: 'memory',
        desc: 'Real-time telemetry',
        color: 'text-green-500',
        dot: 'bg-green-500',
        url: 'cpu-monitor.html'
    },
    'world-clock': {
        title: 'World Clock',
        icon: 'public',
        desc: 'Multi-timezone tracker',
        color: 'text-blue-500',
        dot: 'bg-blue-500',
        url: 'world-clock.html'
    },
    'unit-converter': {
        title: 'Unit Converter',
        icon: 'swap_horiz',
        desc: 'Digital conversion tool',
        color: 'text-purple-500',
        dot: 'bg-purple-500',
        url: 'unit-converter.html'
    },
    'json-validator': {
        title: 'JSON Validator',
        icon: 'data_object',
        desc: 'Schema support active',
        color: 'text-yellow-500',
        dot: 'bg-yellow-500',
        url: 'json-validator.html'
    },
    'network-map': {
        title: 'Network Map',
        icon: 'hub',
        desc: 'Topology visualizer',
        color: 'text-indigo-500',
        dot: 'bg-indigo-500',
        url: 'network-map.html'
    },
    'web-terminal': {
        title: 'Web Terminal',
        icon: 'terminal',
        desc: 'Secure sandboxed env',
        color: 'text-green-400',
        dot: 'bg-green-400',
        url: 'web-terminal.html'
    },
    'pixel-crusher': {
        title: 'Pixel Crusher',
        icon: 'image',
        desc: 'Image compression engine',
        color: 'text-pink-500',
        dot: 'bg-pink-500',
        url: 'pixel-crusher.html'
    },
    'color-library': {
        title: 'Color Library',
        icon: 'palette',
        desc: 'Brand palette manager',
        color: 'text-fuchsia-500',
        dot: 'bg-fuchsia-500',
        url: 'color-library.html'
    },
    'diff-checker': {
        title: 'Diff Checker',
        icon: 'difference',
        desc: 'Compare text differences',
        color: 'text-orange-500',
        dot: 'bg-orange-500',
        url: 'diff-checker.html'
    },
    'code-playground': {
        title: 'Code Playground',
        icon: 'code',
        desc: 'Live code editor',
        color: 'text-pink-500',
        dot: 'bg-pink-500',
        url: 'code-playground.html'
    },
    'cron-generator': {
        title: 'Cron Generator',
        icon: 'schedule',
        desc: 'Cron expression builder',
        color: 'text-green-500',
        dot: 'bg-green-500',
        url: 'cron-generator.html'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Modules from Storage
    loadInstalledModules();

    // 2. Setup Handlers
    setupToolHandlers();
    setupSearch();
});

function loadInstalledModules() {
    const installed = JSON.parse(localStorage.getItem('installed_modules') || '[]');
    const grid = document.getElementById('tools-grid');
    const addBtn = document.querySelector('[data-tool="library"]'); // The "+ Add Widget" button

    installed.forEach(modId => {
        // Prevent duplicates if already hardcoded (though we shouldn't have any hardcoded dynamic ones ideally)
        if (document.querySelector(`[data-tool="${modId}"]`)) return;

        const info = MODULE_DEFINITIONS[modId];
        if (!info) return;

        const card = document.createElement('button');
        card.className = 'tool-card group flex flex-col p-5 bg-surface-dark border border-border-dark hover:border-primary/80 hover:bg-[#23182f] rounded transition-all duration-200 text-left relative overflow-hidden';
        card.setAttribute('data-tool', modId);

        card.innerHTML = `
            <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-primary text-sm">arrow_outward</span>
            </div>
            <div class="size-12 rounded bg-background-dark border border-border-dark flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                <span class="material-symbols-outlined text-[28px] ${info.color}">${info.icon}</span>
            </div>
            <div class="flex flex-col gap-1">
                <h3 class="text-white font-bold text-lg">${info.title}</h3>
                <div class="flex items-center gap-2">
                    <span class="size-1.5 rounded-full ${info.dot}"></span>
                    <p class="text-text-muted text-xs font-mono uppercase tracking-wide">${info.desc}</p>
                </div>
            </div>
        `;

        // Insert before "Add Widget" button
        grid.insertBefore(card, addBtn);
    });
}

function setupToolHandlers() {
    // Re-select all because we added new ones dynamically
    const tools = document.querySelectorAll('[data-tool]');
    tools.forEach(tool => {
        // Remove old listener to avoid duplicates if called multiple times (though here called once)
        tool.onclick = () => {
            const toolName = tool.getAttribute('data-tool');
            handleToolClick(toolName);
        };
    });
}

function handleToolClick(toolName) {
    // Dynamic Check first
    if (MODULE_DEFINITIONS[toolName]) {
        window.location.href = MODULE_DEFINITIONS[toolName].url;
        return;
    }

    // Static Hardcoded Checks
    switch (toolName) {
        case 'pomodoro': window.location.href = 'focustime.html'; break;
        case 'notes': window.location.href = 'quick-notes.html'; break;
        case 'todo': window.location.href = 'todo-list.html'; break;
        case 'qr': window.location.href = 'qr-generator.html'; break;
        case 'calculator': window.location.href = 'calculator.html'; break;
        case 'library': window.location.href = 'module-library.html'; break;
        default:
            // Fallback
            showNotification(`${toolName} - Coming Soon!`, 'info');
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const toolCards = document.querySelectorAll('.tool-card'); // Dynamic selection

            toolCards.forEach(card => {
                const title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
                const description = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';

                // Special case for "Add Widget" button which might not have h3/p exactly same structure or should always show? 
                // Let's hide Add Widget if query doesn't match "add" or "widget"
                if (card.getAttribute('data-tool') === 'library') {
                    if ('add widget library'.includes(query)) card.style.display = 'flex';
                    else card.style.display = 'none';
                    return;
                }

                if (title.includes(query) || description.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Keyboard shortcut: Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}

function showNotification(message, type = 'success') {
    // Existing notification logic...
    alert(message); // Temporary simplified fallback if CSS/HTML structure differs, but keeping it robust is better.
}
