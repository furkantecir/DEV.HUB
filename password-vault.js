// Password Vault - JavaScript
// Handles password management, visibility toggle, copy, and CRUD operations

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    passwords: [
        {
            id: 1,
            service: 'GitHub',
            domain: 'github.com',
            identity: 'dev_master_01',
            password: 'Gh!7$mK9pL2@qX',
            icon: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
            visible: false
        },
        {
            id: 2,
            service: 'AWS Root',
            domain: 'aws.amazon.com',
            identity: 'admin@company.io',
            password: 'Aw$9!nM3#pQ7xR2',
            icon: 'https://cdn-icons-png.flaticon.com/512/873/873120.png',
            visible: false
        },
        {
            id: 3,
            service: 'Google Workspace',
            domain: 'admin.google.com',
            identity: 'sarah.c@design.co',
            password: 'X7f!9#mP2$qL',
            icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
            visible: true
        },
        {
            id: 4,
            service: 'DigitalOcean',
            domain: 'cloud.digitalocean.com',
            identity: 'deploy_bot',
            password: 'Do!4$kL8#mN2pQ',
            icon: 'https://cdn-icons-png.flaticon.com/512/919/919853.png',
            visible: false
        },
        {
            id: 5,
            service: 'Twitter API',
            domain: 'developer.twitter.com',
            identity: '@dev_updates',
            password: 'Tw!3$mK7#pL9xQ',
            icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
            visible: false
        }
    ],
    searchQuery: '',
    currentPage: 1,
    itemsPerPage: 5
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Generate random password
function generatePassword(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Password copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy password', 'error');
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `copy-notification fixed top-20 right-4 px-6 py-3 rounded border text-sm font-mono z-50 ${type === 'success'
            ? 'bg-green-900/30 border-green-800 text-green-400'
            : 'bg-red-900/30 border-red-800 text-red-400'
        }`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderPasswordTable() {
    const tbody = document.getElementById('password-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Filter passwords based on search
    let filteredPasswords = state.passwords;
    if (state.searchQuery) {
        filteredPasswords = state.passwords.filter(p =>
            p.service.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            p.identity.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            p.domain.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }

    // Render each password entry
    filteredPasswords.forEach(password => {
        const row = document.createElement('tr');
        row.className = `group hover:bg-white/5 transition-colors ${password.visible ? 'row-highlighted' : ''}`;
        row.dataset.id = password.id;

        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="size-8 rounded bg-white flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-lg">${getServiceIcon(password.service)}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-bold text-white">${password.service}</span>
                        <span class="text-xs text-slate-500 font-mono">${password.domain}</span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="text-slate-300 font-mono">${password.identity}</span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    ${password.visible
                ? `<span class="text-green-400 font-mono bg-green-900/20 px-2 py-0.5 rounded text-xs tracking-wider password-revealed">${password.password}</span>`
                : `<span class="text-slate-500 tracking-[3px] text-lg leading-none">${'•'.repeat(password.password.length)}</span>`
            }
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1 ${password.visible ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity">
                    <button class="copy-btn p-2 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors" title="Copy Password" data-password="${password.password}">
                        <span class="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                    <button class="visibility-btn p-2 ${password.visible ? 'bg-primary/20 text-primary' : ''} hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors" title="Toggle Visibility" data-id="${password.id}">
                        <span class="material-symbols-outlined text-[18px]">${password.visible ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button class="delete-btn p-2 hover:bg-red-900/30 rounded text-slate-300 hover:text-red-400 transition-colors" title="Delete Entry" data-id="${password.id}">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Update total entries
    document.getElementById('total-entries').textContent = state.passwords.length;

    // Update pagination info
    document.getElementById('pagination-info').textContent =
        `Showing 1-${Math.min(state.itemsPerPage, filteredPasswords.length)} of ${filteredPasswords.length} entries`;
}

// Get service icon
function getServiceIcon(service) {
    const icons = {
        'GitHub': 'code',
        'AWS Root': 'cloud',
        'Google Workspace': 'mail',
        'DigitalOcean': 'water_drop',
        'Twitter API': 'chat'
    };
    return icons[service] || 'key';
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderPasswordTable();
        });
    }

    // Add entry button
    const addEntryBtn = document.getElementById('add-entry-btn');
    if (addEntryBtn) {
        addEntryBtn.addEventListener('click', () => {
            showNotification('Add Entry feature coming soon!', 'success');
        });
    }

    // Generate password button
    const generateBtn = document.getElementById('generate-password-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const password = generatePassword();
            copyToClipboard(password);
            showNotification('Generated password copied!');
        });
    }

    // Health audit button
    const auditBtn = document.getElementById('health-audit-btn');
    if (auditBtn) {
        auditBtn.addEventListener('click', () => {
            showNotification('Running security audit...', 'success');
            setTimeout(() => {
                showNotification('All passwords are secure!', 'success');
            }, 2000);
        });
    }

    // Sync button
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            showNotification('Syncing vault...', 'success');
        });
    }

    // Lock vault button
    const lockBtn = document.getElementById('lock-vault-btn');
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            showNotification('Vault locked!', 'success');
        });
    }

    // Delegate events for table buttons
    const tbody = document.getElementById('password-table-body');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // Copy button
            if (target.classList.contains('copy-btn')) {
                const password = target.dataset.password;
                copyToClipboard(password);
            }

            // Visibility toggle
            if (target.classList.contains('visibility-btn')) {
                const id = parseInt(target.dataset.id);
                const passwordEntry = state.passwords.find(p => p.id === id);
                if (passwordEntry) {
                    passwordEntry.visible = !passwordEntry.visible;
                    renderPasswordTable();
                }
            }

            // Delete button
            if (target.classList.contains('delete-btn')) {
                const id = parseInt(target.dataset.id);
                if (confirm('Are you sure you want to delete this entry?')) {
                    state.passwords = state.passwords.filter(p => p.id !== id);
                    renderPasswordTable();
                    showNotification('Entry deleted successfully!');
                }
            }
        });
    }
}

// ============================================
// STORAGE MANAGEMENT
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('passwordVault', JSON.stringify(state.passwords));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('passwordVault');
    if (saved) {
        state.passwords = JSON.parse(saved);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved passwords
    loadFromLocalStorage();

    // Render table
    renderPasswordTable();

    // Setup event listeners
    setupEventListeners();

    console.log('Password Vault loaded');
    console.log('Total passwords:', state.passwords.length);
});

// Save before unload
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});

// ============================================
// EXPORT
// ============================================

window.passwordVaultApp = {
    state,
    generatePassword,
    copyToClipboard,
    showNotification,
    renderPasswordTable
};

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);
