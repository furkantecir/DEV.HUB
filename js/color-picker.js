document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const MAX_HISTORY = 8;

    // --- Elements ---
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const exportBtn = document.getElementById('export-btn');
    const fileNameDisplay = document.getElementById('file-name-display');

    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('image-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const placeholderText = document.getElementById('placeholder-text');

    const magnifier = document.getElementById('magnifier');
    const magnifierHex = document.getElementById('magnifier-hex');
    const hoverColorHex = document.getElementById('hover-color-hex');
    const hoverCoords = document.getElementById('hover-coords');

    const paletteContainer = document.getElementById('palette-container');
    const addAllBtn = document.getElementById('add-all-btn');
    const pickedHistoryContainer = document.getElementById('picked-history');
    const logContainer = document.getElementById('log-container');

    // --- State ---
    let currentImage = null;
    let canvasRect = null;
    let pickedColors = [];
    let dominantColors = [];

    // Using ColorThief from CDN
    const colorThief = new ColorThief();

    // --- Helpers ---
    function log(msg) {
        const time = (performance.now() / 1000).toFixed(2);
        const div = document.createElement('div');
        div.className = 'flex gap-2';
        div.innerHTML = `
            <span class="text-gray-600">[${time}s]</span>
            <span>${msg}</span>
        `;
        logContainer.appendChild(div);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            log(`Copied to clipboard: ${text}`);
        });
    }

    // --- Core Functions ---

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            log('Error: Please upload a valid image file (JPEG, PNG, WebP).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                setupCanvas(img);
                extractPalette(img);
                log(`Image loaded: ${file.name} (${img.width}x${img.height})`);
                fileNameDisplay.textContent = `> Source: ${file.name}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function setupCanvas(image) {
        placeholderText.style.display = 'none';
        canvas.classList.remove('hidden');

        // Resize canvas to fit container while maintaining aspect ratio, but keep resolution
        // Actually, for a color picker, we want to draw at relatively native resolution if possible, 
        // to avoid blurring. However, large images need to be scaled down for display.
        // We will draw it to fit slightly smaller than container.

        const containerWidth = canvasContainer.clientWidth - 40; // padding
        const containerHeight = canvasContainer.clientHeight - 40;

        const scale = Math.min(containerWidth / image.width, containerHeight / image.height, 1);

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvasRect = canvas.getBoundingClientRect();
    }

    function extractPalette(image) {
        try {
            // Get extracted colors (array of [r,g,b])
            const colors = colorThief.getPalette(image, 5); // 5 dominant colors

            dominantColors = colors.map(c => ({
                r: c[0], g: c[1], b: c[2],
                hex: rgbToHex(c[0], c[1], c[2])
            }));

            renderPalette();
            log(`Extracted ${colors.length} dominant colors.`);
        } catch (e) {
            console.error(e);
            log('Error extracting palette (CORS or format issue).');
        }
    }

    function renderPalette() {
        paletteContainer.innerHTML = '';

        dominantColors.forEach((color, index) => {
            const el = document.createElement('div');
            el.className = 'bg-surface-dark border-2 border-border-dark p-3 flex items-center gap-4 hover:border-primary transition-colors group';
            el.innerHTML = `
                <div class="w-16 h-16 border-2 border-white/10 shadow-pixel-sm shrink-0" style="background-color: ${color.hex}"></div>
                <div class="flex-1">
                    <div class="text-white font-mono text-sm font-bold">${color.hex}</div>
                    <div class="text-gray-500 font-mono text-[10px]">RGB(${color.r}, ${color.g}, ${color.b})</div>
                    <div class="text-gray-500 font-mono text-[10px]">RANK: #${index + 1}</div>
                </div>
                <button type="button" class="w-10 h-10 border border-border-dark bg-background-dark text-gray-400 hover:text-white hover:bg-primary transition-all flex items-center justify-center group-hover:border-primary add-to-history-btn" data-hex="${color.hex}">
                    <span class="material-symbols-outlined text-xl">add_box</span>
                </button>
            `;
            paletteContainer.appendChild(el);
        });

        // Add click handlers for add-to-history buttons
        document.querySelectorAll('.add-to-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const hex = btn.getAttribute('data-hex');
                addToHistory(hex);
                copyToClipboard(hex);
            });
        });

        // Enable the ADD_ALL_TO_LIBRARY button
        if (dominantColors.length > 0) {
            addAllBtn.disabled = false;
            addAllBtn.className = 'w-full py-3 border-2 border-primary text-primary font-retro text-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer';

            // Enable export button
            exportBtn.disabled = false;
            exportBtn.className = 'flex items-center gap-2 bg-primary text-white border-2 border-white/20 px-5 py-2 shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-primary-dark';
        }
    }

    function addToHistory(hex) {
        if (pickedColors.includes(hex)) return;
        pickedColors.unshift(hex);
        if (pickedColors.length > MAX_HISTORY) pickedColors.pop();
        renderHistory();
    }

    function renderHistory() {
        pickedHistoryContainer.innerHTML = '';
        pickedColors.forEach(hex => {
            const el = document.createElement('div');
            el.className = 'w-8 h-8 border border-white/20 cursor-pointer hover:scale-110 transition-transform';
            el.style.backgroundColor = hex;
            el.title = hex;
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(hex);
            });
            pickedHistoryContainer.appendChild(el);
        });
    }

    // --- Interaction ---

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Canvas Mouse Interaction (Picking & Magnifier)
    canvas.addEventListener('mousemove', (e) => {
        if (!currentImage) return;

        const rect = canvas.getBoundingClientRect();

        // Calculate mouse position relative to canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate the scale between display size and actual canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get the actual pixel coordinates on the canvas
        const x = Math.floor(mouseX * scaleX);
        const y = Math.floor(mouseY * scaleY);

        // Safety check boundaries
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            magnifier.style.display = 'none';
            return;
        }

        // Get pixel color
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

        // Update Info
        hoverColorHex.textContent = hex;
        hoverColorHex.style.color = hex;

        hoverCoords.textContent = `XY: ${x}, ${y}`;

        // Update Magnifier
        magnifier.style.display = 'block';
        magnifierHex.textContent = hex;

        // Position magnifier near cursor but not covering it
        // Use clientX/clientY for fixed positioning (viewport-relative)
        const offsetX = 20; // Offset to the right of cursor
        const offsetY = -50; // Offset above cursor
        magnifier.style.left = (e.clientX + offsetX) + 'px';
        magnifier.style.top = (e.clientY + offsetY) + 'px';

        // Draw into magnifier (zoom effect)
        magnifier.style.backgroundImage = `url(${canvas.toDataURL()})`;
        // Calculate percentage position
        const percX = (x / canvas.width) * 100;
        const percY = (y / canvas.height) * 100;
        magnifier.style.backgroundPosition = `${percX}% ${percY}%`;
        magnifier.style.backgroundSize = `${canvas.width * 4}px ${canvas.height * 4}px`; // 4x Zoom
    });

    canvas.addEventListener('mouseleave', () => {
        magnifier.style.display = 'none';
    });

    canvas.addEventListener('click', (e) => {
        if (!currentImage) return;
        const rect = canvas.getBoundingClientRect();

        // Calculate mouse position relative to canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate the scale between display size and actual canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Get the actual pixel coordinates on the canvas
        const x = Math.floor(mouseX * scaleX);
        const y = Math.floor(mouseY * scaleY);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

        addToHistory(hex);
        copyToClipboard(hex);
        log(`Picked color: ${hex} at ${x},${y}`);
    });

    // Export
    exportBtn.addEventListener('click', () => {
        if (dominantColors.length === 0 && pickedColors.length === 0) {
            log('Error: No colors extracted or picked yet. Please upload an image first.');
            return;
        }

        const palette = {
            dominant: dominantColors,
            picked: pickedColors,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'palette-export.json';
        a.click();
        URL.revokeObjectURL(url);
        log('Palette exported (JSON).');
    });

    // Add All to Library
    addAllBtn.addEventListener('click', () => {
        if (dominantColors.length === 0) {
            log('Error: No palette colors available. Please upload an image first.');
            return;
        }

        dominantColors.forEach(color => {
            addToHistory(color.hex);
        });

        log(`Added ${dominantColors.length} colors to history.`);
    });

    log('System initialized.');
});
