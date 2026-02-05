document.addEventListener('DOMContentLoaded', () => {

    // --- Tab Handling ---
    const tabs = {
        'tab-px-rem': 'panel-px-rem',
        'tab-hex-rgb': 'panel-hex-rgb',
        'tab-bytes-gb': 'panel-bytes-gb',
        'tab-timestamp': 'panel-timestamp'
    };

    const tabButtons = Object.keys(tabs);

    function switchTab(clickedTabId) {
        // 1. Update Buttons
        tabButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btnId === clickedTabId) {
                // Active State checks
                if (btn) {
                    btn.classList.add('bg-primary', 'border-primary', 'text-white', 'shadow-pixel');
                    btn.classList.remove('bg-surface-dark', 'border-border-dark', 'text-gray-400');
                }
            } else {
                // Inactive State checks
                if (btn) {
                    btn.classList.remove('bg-primary', 'border-primary', 'text-white', 'shadow-pixel');
                    btn.classList.add('bg-surface-dark', 'border-border-dark', 'text-gray-400');
                }
            }
        });

        // 2. toggle Panels (Show only active)
        const activePanelId = tabs[clickedTabId];
        // Hide all tool-panels first
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.add('hidden'));
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('grid')); // remove grid if it was there

        // Show active if exists
        const activePanel = document.getElementById(activePanelId);
        if (activePanel) {
            activePanel.classList.remove('hidden');
            activePanel.classList.add('grid');
        } else {
            // If panel doesn't exist (not implemented yet), show alert/placeholder where appropriate
            // We won't block the UI, just show nothing for now
        }
    }

    // Attach listeners
    tabButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => switchTab(btnId));
        }
    });


    // --- PX to REM Logic ---
    const inputPx = document.getElementById('input-px');
    const inputStep = document.getElementById('input-step');
    const outputRem = document.getElementById('output-rem');

    // Snippet elements
    const snipStd = document.getElementById('snip-std');
    const snipTw = document.getElementById('snip-tw');
    const snipScss = document.getElementById('snip-scss');
    const snipCss = document.getElementById('snip-css');

    // Config
    const BASE_FONT_SIZE = 16;

    function updateCalculations() {
        if (!inputPx) return;

        const px = parseFloat(inputPx.value) || 0;
        const rem = px / BASE_FONT_SIZE;

        // Update big display
        if (outputRem) outputRem.innerText = rem.toFixed(3);

        // Update snippets
        if (snipStd) snipStd.innerText = `font-size: ${rem.toFixed(3)}rem;`;

        // Tailwind logic (approximate)
        let twClass = `text-[${rem.toFixed(3)}rem]`; // Arbitrary value
        if (px === 16) twClass = 'text-base';
        if (px === 14) twClass = 'text-sm';
        if (px === 12) twClass = 'text-xs';
        if (px === 18) twClass = 'text-lg';
        if (px === 20) twClass = 'text-xl';
        if (px === 24) twClass = 'text-2xl';
        if (snipTw) snipTw.innerText = twClass;

        if (snipScss) snipScss.innerText = `$font-size-root: ${rem.toFixed(3)}rem;`;
        if (snipCss) snipCss.innerText = `--size-rem: ${rem.toFixed(3)}rem;`;
    }

    // Copy Helper
    window.copyText = (elementId) => {
        const el = document.getElementById(elementId);
        navigator.clipboard.writeText(el.innerText).then(() => {
            // Visual feedback could go here
            console.log('Copied!');
        });
    }

    // Interactive Input Arrow Keys
    if (inputPx) {
        inputPx.addEventListener('keydown', (e) => {
            const step = parseFloat(inputStep.value) || 1;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                inputPx.value = (parseFloat(inputPx.value) || 0) + step;
                updateCalculations();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                inputPx.value = (parseFloat(inputPx.value) || 0) - step;
                updateCalculations();
            }
        });

        inputPx.addEventListener('input', updateCalculations);
    }

    // Initial Run & Set Default Tab
    updateCalculations();
});
