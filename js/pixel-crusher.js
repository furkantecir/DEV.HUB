
// ============================================
// PIXEL CRUSHER ENGINE v2.4 (CLIENT-SIDE)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    // Sliders
    const qualitySlider = document.getElementById('quality-slider');
    const qualityVal = document.getElementById('quality-val');
    const depthSlider = document.getElementById('depth-slider');
    const depthVal = document.getElementById('depth-val');

    // Format Buttons
    const btnWebp = document.getElementById('fmt-webp');
    const btnPng = document.getElementById('fmt-png');
    const btnJpeg = document.getElementById('fmt-jpeg');
    const formatBtns = [btnWebp, btnPng, btnJpeg];

    // Preview Elements
    const originalImg = document.getElementById('original-img');
    const compressedImg = document.getElementById('compressed-img');

    // Download Button
    const downloadBtn = document.getElementById('download-btn');

    // Stats Elements
    const originalSizeEl = document.getElementById('original-size');
    const compressedSizeEl = document.getElementById('compressed-size');
    const savingsEl = document.getElementById('savings-percent');
    const dimsEl = document.getElementById('original-dims');

    // State
    let currentFile = null;
    let currentFormat = 'image/webp'; // Default
    let timer = null; // Debounce timer

    // --- Event Listeners ---

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // File Input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Quality Slider (Debounced)
    qualitySlider.addEventListener('input', (e) => {
        qualityVal.textContent = `${e.target.value}%`;
        triggerProcess();
    });

    // Depth Slider (Debounced)
    depthSlider.addEventListener('input', (e) => {
        depthVal.textContent = `${e.target.value}-bit`;
        // In client-side JS, true bit-depth reduction is complex. 
        // We will simulate it by slightly lowering quality further to reflect "data loss".
        triggerProcess();
    });

    // Format Selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Updated UI
            formatBtns.forEach(b => {
                b.className = 'py-2 bg-background-dark text-[10px] font-mono text-text-muted border border-border-dark hover:text-white transition-colors';
            });
            btn.className = 'py-2 bg-primary text-[10px] font-mono font-bold text-white border border-primary/50 transition-colors';

            // Set Format
            if (btn.id === 'fmt-webp') currentFormat = 'image/webp';
            if (btn.id === 'fmt-png') currentFormat = 'image/png'; // PNG ignores quality param in some browsers
            if (btn.id === 'fmt-jpeg') currentFormat = 'image/jpeg';

            triggerProcess();
        });
    });

    // --- Core Logic ---

    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file (PNG, JPG, WEBP).');
            return;
        }

        currentFile = file;

        // Display Original Info
        originalSizeEl.textContent = formatBytes(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImg.src = e.target.result;
            originalImg.classList.remove('opacity-50', 'grayscale', 'brightness-50');

            // Get Dimensions
            const img = new Image();
            img.onload = () => {
                dimsEl.textContent = `${img.width} x ${img.height} PX`;
                dimsEl.classList.remove('hidden');
            };
            img.src = e.target.result;

            // Immediate process
            processImage();
        };
        reader.readAsDataURL(file);
    }

    function triggerProcess() {
        if (!currentFile) return;

        // Debounce to prevent lag
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            processImage();
        }, 100);
    }

    function processImage() {
        if (!currentFile) return;

        let quality = parseInt(qualitySlider.value) / 100;

        // Simulate bit-depth effect on quality if not maxed
        // (Just a visual simulation for the user experience, as canvas API doesn't support direct bit-depth control easily)
        const depth = parseInt(depthSlider.value);
        if (depth < 24) {
            quality = quality * (0.5 + (depth / 48)); // Reduce quality factor based on "depth"
        }

        const reader = new FileReader();
        reader.readAsDataURL(currentFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // For PNG, quality parameter might be ignored by standards, but we pass it anyway.
                // WEBP and JPEG support quality.
                const dataUrl = canvas.toDataURL(currentFormat, quality);

                // Update Preview immediately
                compressedImg.src = dataUrl;
                compressedImg.classList.remove('opacity-50');

                // Calculate New Size (Approximate from Base64)
                const head = `data:${currentFormat};base64,`;
                const size = Math.round((dataUrl.length - head.length) * 3 / 4);

                compressedSizeEl.textContent = formatBytes(size);

                // Calculate Savings
                const savings = ((currentFile.size - size) / currentFile.size) * 100;
                // If savings is negative (file got bigger), show +
                const sign = savings > 0 ? '-' : '+';
                const absSavings = Math.abs(savings).toFixed(0);

                savingsEl.textContent = `${sign}${absSavings}%`;

                if (savings > 0) {
                    savingsEl.className = 'text-[10px] font-mono text-green-500 font-bold';
                } else {
                    savingsEl.className = 'text-[10px] font-mono text-red-500 font-bold';
                }

                // Update Download Link
                let ext = 'webp';
                if (currentFormat === 'image/png') ext = 'png';
                if (currentFormat === 'image/jpeg') ext = 'jpg';

                downloadBtn.href = dataUrl;
                downloadBtn.download = `crushed-image.${ext}`;
                downloadBtn.classList.remove('opacity-50', 'pointer-events-none');
                downloadBtn.textContent = `DOWNLOAD .${ext.toUpperCase()}`;
            };
        };
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
