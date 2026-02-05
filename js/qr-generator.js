// ============================================
// QR CODE GENERATOR - QR Code Management
// ============================================

let qrCode = null;
let currentQRData = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔲 QR Generator loaded');

    // Setup event listeners
    setupEventListeners();

    // Generate initial QR code
    generateQRCode('https://github.com');
});

// Setup event listeners
function setupEventListeners() {
    const generateBtn = document.getElementById('generate-btn');
    const qrInput = document.getElementById('qr-input');
    const pixelSize = document.getElementById('pixel-size');
    const pixelSizeValue = document.getElementById('pixel-size-value');
    const errorCorrection = document.getElementById('error-correction');
    const exportPng = document.getElementById('export-png');
    const exportSvg = document.getElementById('export-svg');
    const copyBtn = document.getElementById('copy-btn');

    // Generate button
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const text = qrInput.value.trim();
            if (text) {
                generateQRCode(text);
                showNotification('QR Code generated!', 'success');
            } else {
                showNotification('Please enter some text or URL', 'error');
            }
        });
    }

    // Input change
    if (qrInput) {
        qrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateBtn.click();
            }
        });
    }

    // Pixel size slider
    if (pixelSize && pixelSizeValue) {
        pixelSize.addEventListener('input', (e) => {
            pixelSizeValue.textContent = `${e.target.value}px`;
        });

        pixelSize.addEventListener('change', () => {
            if (currentQRData) {
                generateQRCode(currentQRData);
            }
        });
    }

    // Error correction change
    if (errorCorrection) {
        errorCorrection.addEventListener('change', () => {
            if (currentQRData) {
                generateQRCode(currentQRData);
            }
        });
    }

    // Export PNG
    if (exportPng) {
        exportPng.addEventListener('click', () => {
            exportAsPNG();
        });
    }

    // Export SVG
    if (exportSvg) {
        exportSvg.addEventListener('click', () => {
            exportAsSVG();
        });
    }

    // Copy to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard();
        });
    }
}

// Generate QR Code
function generateQRCode(text) {
    const canvas = document.getElementById('qr-canvas');
    const pixelSize = document.getElementById('pixel-size').value;
    const errorCorrection = document.getElementById('error-correction').value;
    const previewStatus = document.getElementById('preview-status');

    if (!canvas) return;

    // Clear previous QR code
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Remove old QR code instance
    const qrPreview = document.getElementById('qr-preview');
    const oldQR = qrPreview.querySelector('#qr-code-container');
    if (oldQR) oldQR.remove();

    // Create container for QR code
    const container = document.createElement('div');
    container.id = 'qr-code-container';
    container.style.display = 'none';
    qrPreview.appendChild(container);

    try {
        // Generate QR code using QRCode.js
        qrCode = new QRCode(container, {
            text: text,
            width: 256,
            height: 256,
            colorDark: "#191022",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel[errorCorrection]
        });

        // Wait for QR code to be generated
        setTimeout(() => {
            const img = container.querySelector('img');
            if (img) {
                // Draw QR code on canvas
                ctx.drawImage(img, 0, 0, 256, 256);
                currentQRData = text;

                // Update status
                if (previewStatus) {
                    previewStatus.textContent = 'QR_Code_Ready';
                    previewStatus.classList.add('text-primary');
                }

                // Save to history
                saveToHistory(text);
            }
        }, 100);

    } catch (error) {
        console.error('QR generation error:', error);
        showNotification('Failed to generate QR code', 'error');
    }
}

// Export as PNG
function exportAsPNG() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas || !currentQRData) {
        showNotification('No QR code to export', 'error');
        return;
    }

    try {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-code-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('QR code exported as PNG!', 'success');
        });
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export PNG', 'error');
    }
}

// Export as SVG
function exportAsSVG() {
    if (!currentQRData) {
        showNotification('No QR code to export', 'error');
        return;
    }

    // Create SVG from canvas
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Convert to SVG (simplified version)
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">`;
    svg += `<rect width="256" height="256" fill="#ffffff"/>`;

    // Sample pixels and create rectangles
    const pixelSize = 8;
    for (let y = 0; y < 256; y += pixelSize) {
        for (let x = 0; x < 256; x += pixelSize) {
            const i = (y * 256 + x) * 4;
            const r = imageData.data[i];

            if (r < 128) { // Dark pixel
                svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="#191022"/>`;
            }
        }
    }

    svg += `</svg>`;

    // Download SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('QR code exported as SVG!', 'success');
}

// Copy to clipboard
function copyToClipboard() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas || !currentQRData) {
        showNotification('No QR code to copy', 'error');
        return;
    }

    try {
        canvas.toBlob((blob) => {
            navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]).then(() => {
                showNotification('QR code copied to clipboard!', 'success');
            }).catch((err) => {
                console.error('Clipboard error:', err);
                // Fallback: copy text instead
                navigator.clipboard.writeText(currentQRData).then(() => {
                    showNotification('QR data copied to clipboard!', 'success');
                });
            });
        });
    } catch (error) {
        console.error('Copy error:', error);
        showNotification('Failed to copy', 'error');
    }
}

// Save to history
function saveToHistory(text) {
    let history = Storage.get('QR_HISTORY') || [];

    // Add to history (max 10 items)
    history.unshift({
        text: text,
        timestamp: new Date().toISOString()
    });

    // Keep only last 10
    history = history.slice(0, 10);

    Storage.set('QR_HISTORY', history);
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
