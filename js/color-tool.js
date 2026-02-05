document.addEventListener('DOMContentLoaded', () => {

    const colorInput = document.getElementById('color-input');
    const hexInput = document.getElementById('hex-input');
    const seedPreview = document.getElementById('seed-preview');
    const harmonySelect = document.getElementById('harmony-select');
    const paletteGrid = document.getElementById('palette-grid');
    const randomizeBtn = document.getElementById('randomize-btn');
    const copySeedBtn = document.getElementById('copy-seed-btn');

    // Modal Elements
    const modal = document.getElementById('success-modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Stats
    const statLum = document.getElementById('stat-lum');
    const statHue = document.getElementById('stat-hue');
    const statSat = document.getElementById('stat-sat');
    const statTime = document.getElementById('stat-time');

    let currentPalette = [];

    // Chroma.js check
    if (typeof chroma === 'undefined') {
        console.error("Chroma.js not loaded!");
        paletteGrid.innerHTML = '<div class="col-span-full text-red-500 font-mono">Error: Color Engine (Chroma.js) failed to load. Check internet connection.</div>';
        return;
    }

    function generatePalette() {
        const seed = colorInput.value;
        const mode = harmonySelect.value;
        const baseColor = chroma(seed);

        // Update Inputs/Preview
        hexInput.value = seed.toUpperCase();
        seedPreview.style.backgroundColor = seed;

        // Update Stats
        statLum.innerText = `Luminance: ${(baseColor.luminance() * 100).toFixed(1)}%`;
        statHue.innerText = `Hue: ${Math.round(baseColor.get('hsl.h') || 0)}°`;
        statSat.innerText = `Sat: ${(baseColor.get('hsl.s') * 100).toFixed(0)}%`;
        const now = new Date();
        statTime.innerText = `Last Saved: ${now.toLocaleTimeString()}`;

        // Logic for harmonies
        let colors = [];

        switch (mode) {
            case 'analogous':
                // spread hues slightly
                colors = [
                    baseColor.set('hsl.h', '-30'),
                    baseColor.set('hsl.h', '-15'),
                    baseColor,
                    baseColor.set('hsl.h', '+15'),
                    baseColor.set('hsl.h', '+30')
                ];
                break;
            case 'monochromatic':
                colors = chroma.scale([baseColor.darken(2), baseColor, baseColor.brighten(2)]).mode('lch').colors(5).map(c => chroma(c));
                break;
            case 'triadic':
                // 3 main colors, plus 2 shades
                const trip = [baseColor, baseColor.set('hsl.h', '+120'), baseColor.set('hsl.h', '+240')];
                colors = [trip[1].brighten(), trip[0].brighten(), trip[0], trip[2].brighten(), trip[2]];
                break;
            case 'complementary':
                const comp = baseColor.set('hsl.h', '+180');
                colors = [
                    baseColor.brighten(),
                    baseColor,
                    baseColor.darken(),
                    comp.brighten(),
                    comp
                ];
                break;
            case 'split-complementary':
                colors = [
                    baseColor,
                    baseColor.set('hsl.h', '+150'),
                    baseColor.set('hsl.h', '+210'),
                    baseColor.set('hsl.h', '+150').darken(),
                    baseColor.set('hsl.h', '+210').darken()
                ];
                break;
            default:
                colors = [baseColor, baseColor, baseColor, baseColor, baseColor];
        }

        // Normalize
        currentPalette = colors.map(c => c.hex());
        renderPalette(colors);
    }

    function renderPalette(colors) {
        paletteGrid.innerHTML = '';

        colors.forEach(rawColor => {
            const color = chroma(rawColor);
            const hex = color.hex().toUpperCase();
            const rgb = color.rgb();
            const bgContrast = chroma.contrast(color, '#191022'); // vs background

            // Check WCAG
            let passLevel = "FAIL";
            let passColor = "bg-red-500";
            if (bgContrast >= 7) { passLevel = "AAA PASS"; passColor = "bg-green-500"; }
            else if (bgContrast >= 4.5) { passLevel = "AA PASS"; passColor = "bg-green-500"; }
            else if (bgContrast >= 3) { passLevel = "AA LG_ONLY"; passColor = "bg-yellow-500"; }

            const el = document.createElement('div');
            el.className = 'group';
            el.innerHTML = `
                <div class="color-block w-full border-4 border-border-dark group-hover:border-primary transition-all p-1 shadow-pixel-white relative"
                     style="background-color: ${hex};">
                    <div class="w-full h-full flex flex-col justify-end p-4 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span class="font-retro text-2xl text-white drop-shadow-md">${hex}</span>
                        <span class="font-mono text-[10px] text-white/80 drop-shadow-md">RGB(${rgb.join(', ')})</span>
                        <button class="absolute top-2 right-2 bg-black/50 p-2 hover:bg-white/20 text-white rounded-none transition-colors" onclick="navigator.clipboard.writeText('${hex}')">
                            <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                    </div>
                </div>
                <div class="mt-3 flex items-center justify-between px-1">
                    <div class="flex items-center gap-1.5">
                        <div class="w-3 h-3 ${passColor}"></div>
                        <span class="font-mono text-[10px] text-gray-400">${passLevel}</span>
                    </div>
                    <span class="material-symbols-outlined text-sm text-gray-500 cursor-pointer hover:text-primary">lock_open</span>
                </div>
            `;
            paletteGrid.appendChild(el);
        });
    }

    // --- MODAL LOGIC ---
    function showModal(type) {
        if (!modal || !modalIcon || !modalTitle) return;

        modal.classList.remove('hidden');

        if (type === 'css') {
            modalIcon.innerText = 'content_paste';
            modalTitle.innerHTML = 'SUCCESS:<br/>CSS VARIABLES<br/>COPIED!';
            modalIcon.parentElement.classList.replace('bg-primary', 'bg-primary');
        } else if (type === 'scss') {
            modalIcon.innerText = 'code';
            modalTitle.innerHTML = 'SUCCESS:<br/>SCSS VARIABLES<br/>COPIED!';
        } else if (type === 'svg') {
            modalIcon.innerText = 'download';
            modalTitle.innerHTML = 'SUCCESS:<br/>SVG PALETTE<br/>EXPORTED!';
        }
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Handlers
    colorInput.addEventListener('input', generatePalette);

    hexInput.addEventListener('change', () => {
        let val = hexInput.value;
        if (!val.startsWith('#')) val = '#' + val;
        if (chroma.valid(val)) {
            colorInput.value = chroma(val).hex();
            generatePalette();
        }
    });

    harmonySelect.addEventListener('change', generatePalette);

    randomizeBtn.addEventListener('click', () => {
        colorInput.value = chroma.random().hex();
        generatePalette();
    });

    copySeedBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(hexInput.value);
        // You could show a small toast here if desired
    });

    // Exports
    window.exportCSS = () => {
        const rootVars = currentPalette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n');
        const css = `:root {\n${rootVars}\n}`;
        navigator.clipboard.writeText(css).then(() => showModal('css'));
    };

    window.exportSCSS = () => {
        const scssVars = currentPalette.map((c, i) => `$color-${i + 1}: ${c};`).join('\n');
        navigator.clipboard.writeText(scssVars).then(() => showModal('scss'));
    };

    window.exportSVG = () => {
        if (!currentPalette || currentPalette.length === 0) return;

        // 1. Generate SVG Content
        const width = 500;
        const height = 150;
        const swatchWidth = width / currentPalette.length;

        const rects = currentPalette.map((color, index) => {
            return `<rect x="${index * swatchWidth}" y="0" width="${swatchWidth}" height="${height}" fill="${color}" />
                    <text x="${index * swatchWidth + 10}" y="${height - 20}" font-family="monospace" font-size="12" fill="white" style="text-shadow: 1px 1px 1px black;">${color}</text>`;
        }).join('');

        const svgContent = `<?xml version="1.0" standalone="no"?>
            <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
            ${rects}
            </svg>`;

        // 2. Trigger Download
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette-${new Date().getTime()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 3. Show Success Modal
        showModal('svg');
    };

    // Init
    generatePalette();
});
