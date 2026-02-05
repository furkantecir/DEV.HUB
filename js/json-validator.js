// ============================================
// JSON VALIDATOR & FORMATTER ENGINE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Hooks
    const inputEl = document.getElementById('json-input');
    const outputEl = document.getElementById('json-output');
    const errorOverlay = document.getElementById('error-overlay');
    const errorMsg = document.getElementById('error-message');
    const statusValid = document.getElementById('status-valid');
    const statusError = document.getElementById('status-error');
    const statsLines = document.getElementById('line-count');
    const statsSize = document.getElementById('byte-size');
    const processTimeEl = document.getElementById('process-time');

    // Buttons
    document.getElementById('prettify-btn').addEventListener('click', () => processJSON(true));
    document.getElementById('minify-btn').addEventListener('click', () => processJSON(false));
    document.getElementById('clear-btn').addEventListener('click', () => {
        inputEl.value = '';
        processJSON();
    });
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);

    // Live Validation (Debounced)
    let debounceTimer;
    inputEl.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            processJSON(null); // null means "don't reformat input, just validate"
        }, 500);
    });

    // Initial run
    processJSON(true);

    // ============================================
    // CORE LOGIC
    // ============================================
    function processJSON(prettify = null) {
        const start = performance.now();
        const raw = inputEl.value.trim();

        if (!raw) {
            outputEl.innerHTML = '';
            hideError();
            statusValid.classList.add('hidden');
            statusError.classList.add('hidden');
            updateStats('', 0);
            return;
        }

        try {
            const parsed = JSON.parse(raw);

            // If we got here, it's valid!
            hideError();
            statusValid.classList.remove('hidden');
            statusError.classList.add('hidden');

            let formatted = '';

            if (prettify === true) {
                formatted = JSON.stringify(parsed, null, 2);
                inputEl.value = formatted; // Update input too if button clicked
            } else if (prettify === false) {
                formatted = JSON.stringify(parsed);
                inputEl.value = formatted;
            } else {
                // Just validating, usually we display formatted in output anyway for readability
                // Or display input as is but highlighted? Let's display formatted for better reading in output
                formatted = JSON.stringify(parsed, null, 2);
            }

            // Syntax Highlight
            outputEl.innerHTML = syntaxHighlight(formatted);

            updateStats(formatted, formatted.split('\n').length);

        } catch (e) {
            // Invalid!
            statusValid.classList.add('hidden');
            statusError.classList.remove('hidden');
            showError(e.message);

            // In output, maybe show plain text or partial?
            outputEl.innerText = raw; // Just raw text
            outputEl.style.color = '#ef4444'; // Red usage for invalid
        }

        const end = performance.now();
        processTimeEl.innerText = `${(end - start).toFixed(2)}ms`;
    }

    function showError(msg) {
        errorOverlay.classList.remove('translate-y-full');
        // Try to extract line info if possible logic is complex across browsers, 
        // usually 'Unexpected token ... at position X'
        errorMsg.innerText = msg;
    }

    function hideError() {
        errorOverlay.classList.add('translate-y-full');
        outputEl.style.color = ''; // Reset color
    }

    function updateStats(text, lines) {
        statsLines.innerText = `Lines: ${lines}`;
        const blob = new Blob([text]);
        statsSize.innerText = `Size: ${formatBytes(blob.size)}`;
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function copyToClipboard() {
        const content = outputEl.innerText;
        navigator.clipboard.writeText(content).then(() => {
            // Simple visual feedback
            const btn = document.getElementById('copy-btn');
            const original = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined text-sm text-green-500">check</span>';
            setTimeout(() => btn.innerHTML = original, 1500);
        });
    }

    // Syntax Highlighting HTML Generator
    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'text-purple-400'; // number default (purple in my theme mapping logic here or tweak)

            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-purple-400'; // key
                } else {
                    cls = 'text-green-400'; // string
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-yellow-400'; // boolean
            } else if (/null/.test(match)) {
                cls = 'text-red-400'; // null
            } else {
                cls = 'text-blue-400'; // number
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
});
