// ============================================
// UTILITIES PAGE - Tool Management v3.4
// ============================================

const MODULE_DEFINITIONS = {
    // SYSTEM MODULES
    'pomodoro': { title: 'Pomodoro Timer', icon: 'timer', desc: 'Stopped • 25:00', color: 'text-red-500', dot: 'bg-red-500', url: 'focustime.html' },
    'notes': { title: 'Quick Notes', icon: 'edit_note', desc: 'Scratchpad Active', color: 'text-blue-400', dot: 'bg-blue-400', url: 'quick-notes.html' },
    'todo': { title: 'To-Do List', icon: 'checklist', desc: 'Tasks Pending', color: 'text-yellow-400', dot: 'bg-yellow-400', url: 'todo-list.html' },
    'qr': { title: 'QR Generator', icon: 'qr_code_2', desc: 'Ready for Input', color: 'text-emerald-400', dot: 'bg-emerald-400', url: 'qr-generator.html' },
    'calculator': { title: 'Calculator', icon: 'calculate', desc: 'Standard Mode', color: 'text-gray-400', dot: 'bg-gray-400', url: 'calculator.html' },
    'hash-generator': { title: 'Hash Generator', icon: 'tag', desc: 'Crypto Tools', color: 'text-blue-400', dot: 'bg-blue-400', url: 'hash-generator.html' },
    'timestamp-converter': { title: 'Timestamp Converter', icon: 'schedule', desc: 'Time Utils', color: 'text-cyan-400', dot: 'bg-cyan-400', url: 'timestamp-converter.html' },

    // ADD-ON MODULES
    'cpu-monitor': { title: 'CPU Monitor', icon: 'memory', desc: 'Real-time telemetry', color: 'text-green-500', dot: 'bg-green-500', url: 'cpu-monitor.html' },
    'world-clock': { title: 'World Clock', icon: 'public', desc: 'Multi-timezone tracker', color: 'text-blue-500', dot: 'bg-blue-500', url: 'world-clock.html' },
    'unit-converter': { title: 'Unit Converter', icon: 'swap_horiz', desc: 'Digital conversion tool', color: 'text-purple-500', dot: 'bg-purple-500', url: 'unit-converter.html' },
    'json-validator': { title: 'JSON Validator', icon: 'data_object', desc: 'Schema support active', color: 'text-yellow-500', dot: 'bg-yellow-500', url: 'json-validator.html' },
    'network-map': { title: 'Network Map', icon: 'hub', desc: 'Topology visualizer', color: 'text-indigo-500', dot: 'bg-indigo-500', url: 'network-map.html' },
    'web-terminal': { title: 'Web Terminal', icon: 'terminal', desc: 'Secure sandboxed env', color: 'text-green-400', dot: 'bg-green-400', url: 'web-terminal.html' },
    'pixel-crusher': { title: 'Pixel Crusher', icon: 'image', desc: 'Image compression engine', color: 'text-pink-500', dot: 'bg-pink-500', url: 'pixel-crusher.html' },
    'color-library': { title: 'Color Library', icon: 'palette', desc: 'Brand palette manager', color: 'text-fuchsia-500', dot: 'bg-fuchsia-500', url: 'color-library.html' },

    // NEW MODULES
    'diff-checker': { title: 'Diff Checker', icon: 'difference', desc: 'Compare text differences', color: 'text-orange-500', dot: 'bg-orange-500', url: 'diff-checker.html' },
    'code-playground': { title: 'Code Playground', icon: 'code', desc: 'Live HTML/CSS/JS editor', color: 'text-pink-500', dot: 'bg-pink-500', url: 'code-playground.html' },
    'cron-generator': { title: 'Cron Generator', icon: 'schedule', desc: 'Visual cron expression builder', color: 'text-green-500', dot: 'bg-green-500', url: 'cron-generator.html' }
};

document.addEventListener('DOMContentLoaded', () => {
    loadInstalledModules();
    setupToolHandlers();
    setupSearch();
});

// GLOBALS FOR DELETE MODAL
let moduleToDelete = null;

function loadInstalledModules() {
    const installed = JSON.parse(localStorage.getItem('installed_modules') || '[]');
    const grid = document.getElementById('tools-grid');
    const addBtn = document.querySelector('button[data-tool="library"]') || document.querySelector('[onclick*="module-library.html"]');

    if (!grid) return;

    installed.forEach(modId => {
        if (document.querySelector(`[data-tool="${modId}"]`)) return;

        const info = MODULE_DEFINITIONS[modId];
        if (!info) return;

        const card = document.createElement('button');
        card.className = 'tool-card group flex flex-col p-5 bg-surface-dark border border-border-dark hover:border-primary/80 hover:bg-[#23182f] rounded transition-all duration-200 text-left relative overflow-hidden';
        card.setAttribute('data-tool', modId);

        // Updated innerHTML with better delete button visibility and styling
        card.innerHTML = `
            <div class="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 z-20">
                <div onclick="event.stopPropagation(); removeModule('${modId}', event)" class="p-1.5 bg-background-dark/80 hover:bg-red-500/20 border border-transparent hover:border-red-500 rounded cursor-pointer text-text-muted hover:text-red-500 transition-all shadow-sm" title="Uninstall Module">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </div>
                <div class="p-1.5 rounded text-primary">
                     <span class="material-symbols-outlined text-[18px]">arrow_outward</span>
                </div>
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

        if (addBtn && addBtn.parentNode === grid) {
            grid.insertBefore(card, addBtn);
        } else {
            grid.appendChild(card);
        }
    });

    setupToolHandlers();
}

// 1. OPEN MODAL
function removeModule(modId, event) {
    if (event) event.stopPropagation();

    // Set global variable
    moduleToDelete = modId;

    // Update Modal Text
    const textEl = document.getElementById('delete-modal-text');
    if (textEl) textEl.textContent = `REMOVE [${modId.toUpperCase()}] FROM DASHBOARD?`;

    // Show Modal
    const modal = document.getElementById('custom-delete-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// 2. CANCEL / CLOSE
function cancelDelete() {
    moduleToDelete = null;
    const modal = document.getElementById('custom-delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// 3. CONFIRM ACTION
function confirmDeleteAction() {
    if (!moduleToDelete) return;

    const modId = moduleToDelete;

    // Logic to remove
    let installed = JSON.parse(localStorage.getItem('installed_modules') || '[]');
    installed = installed.filter(id => id !== modId);
    localStorage.setItem('installed_modules', JSON.stringify(installed));

    // Remove from DOM
    const card = document.querySelector(`[data-tool="${modId}"]`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => card.remove(), 300); // Animation delay
    }

    // Close Modal
    cancelDelete();
}


function setupToolHandlers() {
    const tools = document.querySelectorAll('[data-tool]');
    tools.forEach(tool => {
        tool.onclick = (e) => {
            const toolName = tool.getAttribute('data-tool');
            if (toolName === 'library') {
                window.location.href = 'module-library.html';
                return;
            }
            handleToolClick(toolName);
        };
    });
}

function handleToolClick(toolName) {
    if (MODULE_DEFINITIONS[toolName]) {
        window.location.href = MODULE_DEFINITIONS[toolName].url;
        return;
    }

    switch (toolName) {
        case 'pomodoro': window.location.href = 'focustime.html'; break;
        case 'notes': window.location.href = 'quick-notes.html'; break;
        case 'todo': window.location.href = 'todo-list.html'; break;
        case 'qr': window.location.href = 'qr-generator.html'; break;
        case 'calculator': window.location.href = 'calculator.html'; break;
        case 'library': window.location.href = 'module-library.html'; break;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        const tools = document.querySelectorAll('.tool-card');

        tools.forEach(tool => {
            const title = tool.querySelector('h3')?.textContent.toLowerCase() || '';
            const desc = tool.querySelector('p')?.textContent.toLowerCase() || '';
            const toolId = tool.getAttribute('data-tool') || '';

            if (title.includes(query) || desc.includes(query) || toolId.includes(query)) {
                tool.style.display = 'flex';
            } else {
                tool.style.display = 'none';
            }
        });
    };
}
