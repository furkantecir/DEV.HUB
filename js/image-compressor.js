document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileInput = document.getElementById('file-input');
    const imgOriginal = document.getElementById('img-original');
    const imgCompressed = document.getElementById('img-compressed');
    const emptyState = document.getElementById('empty-state');

    // Stats Elements
    const infoOriginal = document.getElementById('original-info');
    const infoCompressed = document.getElementById('compressed-info');
    const statReduction = document.getElementById('stat-reduction');
    const statInput = document.getElementById('stat-input-size');
    const statOutput = document.getElementById('stat-output-size');
    const statSavings = document.getElementById('stat-savings');
    const logStatus = document.getElementById('log-status');

    // Controls
    const qualityRange = document.getElementById('quality-range');
    const qualityVal = document.getElementById('quality-val');
    const formatButtons = document.querySelectorAll('#format-buttons button');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    // State
    let originalFile = null;
    let originalImage = new Image();
    let currentFormat = 'image/webp';
    let currentQuality = 0.8;
    let compressedBlob = null;

    // Check for file in sessionStorage (passed from Hub)
    const storedFile = sessionStorage.getItem('wth_temp_image');
    if (storedFile) {
        // Convert base64 back to blob or just use it as src
        // For simplicity, we use it as src to load the image object
        loadImageFromSrc(storedFile, "Imported Image");
        // Clear it so it doesn't persist forever
        // sessionStorage.removeItem('wth_temp_image'); 
    }

    // --- Event Listeners ---

    // File Input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Quality Slider
    qualityRange.addEventListener('input', (e) => {
        currentQuality = parseInt(e.target.value) / 100;
        qualityVal.innerText = `${e.target.value}%`;
        compressImage();
    });

    // Format Buttons
    formatButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;

            // UI Update
            formatButtons.forEach(b => {
                b.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
                b.classList.add('border-border-dark', 'hover:border-primary', 'hover:text-primary');
            });
            btn.classList.remove('border-border-dark', 'hover:border-primary', 'hover:text-primary');
            btn.classList.add('border-primary', 'bg-primary/10', 'text-primary');

            // Set state
            currentFormat = btn.getAttribute('data-format');
            updateQualitySliderState();
            compressImage();
        });
    });

    function updateQualitySliderState() {
        const isLossless = currentFormat === 'image/png';
        qualityRange.disabled = isLossless;

        if (isLossless) {
            qualityRange.parentElement.classList.add('opacity-50');
            qualityRange.classList.add('cursor-not-allowed');
            qualityVal.innerText = "(Lossless)";
            qualityVal.classList.replace('text-primary', 'text-gray-500');
        } else {
            qualityRange.parentElement.classList.remove('opacity-50');
            qualityRange.classList.remove('cursor-not-allowed');
            qualityVal.innerText = `${qualityRange.value}%`;
            qualityVal.classList.replace('text-gray-500', 'text-primary');
        }
    }

    // Download
    downloadBtn.addEventListener('click', () => {
        if (!compressedBlob) return;

        const ext = currentFormat.split('/')[1];
        const url = URL.createObjectURL(compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_image.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logStatus.innerHTML += "<br>> Download initiated.";
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        // Just reload page or clear state
        // simple: click file input
        fileInput.click();
    });

    // --- Functions ---

    function handleFileSelect(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        originalFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            loadImageFromSrc(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    function loadImageFromSrc(src, name) {
        originalImage = new Image();
        originalImage.onload = () => {
            // UI Setup
            emptyState.classList.add('hidden');
            imgOriginal.src = src;

            const originalSizeMB = (src.length * 0.75) / (1024 * 1024); // approx base64 size

            infoOriginal.innerText = `${originalImage.width}x${originalImage.height} • ~${originalSizeMB.toFixed(2)} MB`;
            statInput.innerText = `${originalSizeMB.toFixed(2)} MB`;

            logStatus.innerHTML = `> Loaded: ${name}<br>> Dimensions: ${originalImage.width}x${originalImage.height}`;

            // Initial Compression
            updateQualitySliderState();
            compressImage();
        };
        originalImage.src = src;
    }

    function compressImage() {
        if (!originalImage.src) return;

        // Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        const ctx = canvas.getContext('2d');

        // Draw
        ctx.drawImage(originalImage, 0, 0);

        // Compress
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("Compression failed");
                return;
            }

            compressedBlob = blob;
            const url = URL.createObjectURL(blob);

            // Release old URL to avoid leaks
            if (imgCompressed.src.startsWith('blob:')) {
                URL.revokeObjectURL(imgCompressed.src);
            }

            imgCompressed.src = url;

            // Stats
            updateStats(blob.size);

        }, currentFormat, currentQuality);
    }

    function updateStats(newSize) {
        // Calculate original size
        // If we have originalFile, use that size. Else approx.
        let oldSize = originalFile ? originalFile.size : (originalImage.src.length * 0.75);

        const savings = oldSize - newSize;
        const pct = Math.round((savings / oldSize) * 100);

        statOutput.innerText = formatSize(newSize);
        statSavings.innerText = formatSize(savings);
        statReduction.innerText = `-${pct}%`;

        infoCompressed.innerText = `ESTIMATED: ${formatSize(newSize)}`;

        if (pct < 0) {
            statReduction.classList.replace('text-green-400', 'text-red-400');
            statReduction.innerText = `+${Math.abs(pct)}%`;
        } else {
            statReduction.classList.replace('text-red-400', 'text-green-400');
        }

        downloadBtn.disabled = false;
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
