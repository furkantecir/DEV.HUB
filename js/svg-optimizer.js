document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const svgInput = document.getElementById('svg-input');
    const svgPreviewContainer = document.getElementById('svg-preview'); // Container
    const copyBtn = document.getElementById('copy-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');

    // Zoom Buttons
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');

    // Stats
    const statOriginal = document.getElementById('stat-original');
    const statOptimized = document.getElementById('stat-optimized');
    const statusText = document.getElementById('status-text');

    // Options
    const optMinify = document.getElementById('opt-minify');
    const optComments = document.getElementById('opt-comments');
    const optAttrs = document.getElementById('opt-attrs');
    const optIds = document.getElementById('opt-ids');
    const optPrecision = document.getElementById('opt-precision');
    const precisionRange = document.getElementById('precision-range');
    const precisionVal = document.getElementById('precision-val');

    // State
    let optimizedCode = "";
    let currentZoom = 1;

    // --- Init ---

    // Load example if empty
    if (!svgInput.value.trim()) {
        const example = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- This is a comment that will be removed -->
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>`;
        svgInput.value = example;
        processSVG();
    }

    // --- Events ---

    svgInput.addEventListener('input', processSVG);

    [optMinify, optComments, optAttrs, optIds, optPrecision].forEach(el => {
        el.addEventListener('change', processSVG);
    });

    precisionRange.addEventListener('input', (e) => {
        precisionVal.innerText = `${e.target.value}dp`;
        processSVG();
    });

    // Zoom Logic
    if (zoomInBtn && resetZoomBtn) {
        zoomInBtn.addEventListener('click', () => {
            const svgEl = svgPreviewContainer.querySelector('svg');
            if (!svgEl) return;
            currentZoom += 0.2;
            if (currentZoom > 5) currentZoom = 5;
            applyZoom(svgEl);
        });

        resetZoomBtn.addEventListener('click', () => {
            const svgEl = svgPreviewContainer.querySelector('svg');
            if (!svgEl) return;
            currentZoom = 1;
            applyZoom(svgEl);
        });
    }

    function applyZoom(el) {
        if (!el) return;
        el.style.transform = `scale(${currentZoom})`;
        el.style.transition = 'transform 0.2s ease';
        // Ensure it doesn't get clipped weirdly if possible, though overflow hidden on parent handles clean crop
    }


    copyBtn.addEventListener('click', () => {
        if (!optimizedCode) return;
        navigator.clipboard.writeText(optimizedCode).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "COPIED!";
            copyBtn.classList.add('bg-green-500', 'border-green-400');
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.classList.remove('bg-green-500', 'border-green-400');
            }, 2000);
        });
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                svgInput.value = text;
                processSVG();
            }
        } catch (err) {
            alert('Failed to read clipboard contents: ' + err);
        }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            svgInput.value = evt.target.result;
            processSVG();
        };
        reader.readAsText(file);
    });

    // --- Logic ---

    function processSVG() {
        const source = svgInput.value;
        if (!source.trim()) {
            svgPreviewContainer.innerHTML = '<p class="text-gray-600 font-mono text-xs">NO_SVG_DATA</p>';
            statOriginal.innerText = `Original: 0kb`;
            statOptimized.innerText = `Optimized: 0kb (-0%)`;
            optimizedCode = "";
            return;
        }

        // 1. Calculate Original Size
        const originalBytes = new Blob([source]).size;
        statOriginal.innerText = `Original: ${formatSize(originalBytes)}`;

        // 2. Optimize
        let output = source;

        // A. Remove Comments & Metadata
        if (optComments.checked) {
            output = output.replace(/<!--[\s\S]*?-->/g, "");
            output = output.replace(/<metadata[\s\S]*?<\/metadata>/g, "");
            output = output.replace(/<\?xml[\s\S]*?\?>/g, "");
            output = output.replace(/<!DOCTYPE[\s\S]*?>/g, "");
        }

        // B. Remove Useless Attributes (basic regex, not perfect parser)
        if (optAttrs.checked) {
            // Remove empty attributes
            output = output.replace(/\s\w+=""/g, "");
        }

        // C. Precision Limiter
        if (optPrecision.checked) {
            const p = parseInt(precisionRange.value);
            // Look for numbers inside d="", points="", x="", y="", etc.
            // This is complex with Regex. We'll do a simple number finder.
            output = output.replace(/(\d+\.\d+)/g, (match) => {
                const f = parseFloat(match);
                // Avoid replacing IDs or versions if they look like floats by accident, 
                // but this simple regex is a bit aggressive. 
                // Checks if it's likely a coordinate (sequence of numbers)
                return parseFloat(f.toFixed(p));
            });
        }

        // D. Remove Unused IDs (Advanced - skipped for basic regex version, requires parsing)
        // If we want to simulate it, we can remove ids that are not referenced by 'url(#'
        // Keeping it simple for now as reliable ID removal needs DOM parsing.

        // E. Minify (Whitespace)
        if (optMinify.checked) {
            output = output.replace(/>\s+</g, "><"); // remove space between tags
            output = output.replace(/\s{2,}/g, " "); // collapse multiple spaces
            output = output.replace(/[\r\n]/g, ""); // remove newlines
            output = output.trim();
        }

        optimizedCode = output;

        // 3. Render
        // We use the cleaned code, but for preview we need to ensure it's visible.
        // Data URI technique is safer than innerHTML for direct rendering sometimes, 
        // but innerHTML is fine for "preview what I pasted".
        svgPreviewContainer.innerHTML = optimizedCode;

        // Make sure it scales
        const svgEl = svgPreviewContainer.querySelector('svg');
        if (svgEl) {
            // Reset transforms before applying current state
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height'); // Allow CSS to control size
            svgEl.style.width = '100%';
            svgEl.style.height = '100%';
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '100%';

            // Re-apply zoom
            applyZoom(svgEl);
        } else {
            // If invalid SVG
            svgPreviewContainer.innerHTML = '<p class="text-red-500 font-mono text-xs">INVALID_SVG_MARKUP</p>';
        }

        // 4. Calculate Stats
        const optimizedBytes = new Blob([optimizedCode]).size;
        const savings = originalBytes - optimizedBytes;
        const pct = Math.round((savings / originalBytes) * 100);

        statOptimized.innerText = `Optimized: ${formatSize(optimizedBytes)} (-${pct}%)`;
        statusText.innerText = "Status: Optimized";
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

});
