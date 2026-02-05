// ============================================
// PWA REGISTRATION & INSTALL PROMPT
// ============================================

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();

    // Save the event for later
    deferredPrompt = e;

    // Show install button
    showInstallButton();
});

// Show install button
function showInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
}

// Install app
async function installPWA() {
    if (!deferredPrompt) {
        console.log('Install prompt not available');
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    if (outcome === 'accepted') {
        showNotification('App installed successfully!', 'success');
    }

    // Clear the deferredPrompt
    deferredPrompt = null;

    // Hide install button
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// Check if already installed
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed');
    showNotification('Web Tool Hub installed!', 'success');
    deferredPrompt = null;
});

// Update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-primary text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3';
    notification.innerHTML = `
        <span class="material-symbols-outlined">update</span>
        <div>
            <p class="font-medium">Update Available</p>
            <p class="text-xs opacity-80">Refresh to get the latest version</p>
        </div>
        <button onclick="window.location.reload()" class="ml-4 px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm">
            Refresh
        </button>
    `;
    document.body.appendChild(notification);
}

// Notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-primary'
        } text-white font-medium`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export for global use
window.installPWA = installPWA;
