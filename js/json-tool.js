document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('json-input');
    const lineNumbers = document.getElementById('line-numbers');
    const lnCount = document.getElementById('ln-count');
    const charCount = document.getElementById('char-count');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.getElementById('status-icon');

    // Buttons
    const btnPrettify = document.getElementById('prettify-btn');
    const btnMinify = document.getElementById('minify-btn');
    const btnValidate = document.getElementById('validate-btn');
    const btnCopy = document.getElementById('copy-btn');
    const btnClear = document.getElementById('clear-btn');
    const btnSave = document.getElementById('save-file-btn');

    // Line Number Logic
    const updateLineNumbers = () => {
        const lines = jsonInput.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<span>${i + 1}</span>`).join('');
        lnCount.textContent = lines;
        charCount.textContent = jsonInput.value.length;
    };

    // Sync scroll
    jsonInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = jsonInput.scrollTop;
    });

    jsonInput.addEventListener('input', () => {
        updateLineNumbers();
        hideStatus();
    });

    // Formatting Logic
    btnPrettify.addEventListener('click', () => {
        try {
            if (!jsonInput.value) return;
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed, null, 2); // 2-space indentation
            updateLineNumbers();
            showStatus(true, "VALID & FORMATTED");
        } catch (e) {
            showStatus(false, "INVALID JSON");
        }
    });

    btnMinify.addEventListener('click', () => {
        try {
            if (!jsonInput.value) return;
            const parsed = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(parsed);
            updateLineNumbers();
            showStatus(true, "VALID & MINIFIED");
        } catch (e) {
            showStatus(false, "INVALID JSON");
        }
    });

    // Validation Logic
    btnValidate.addEventListener('click', () => {
        if (!jsonInput.value) {
            showStatus(false, "EMPTY");
            return;
        }
        try {
            JSON.parse(jsonInput.value);
            showStatus(true, "VALID JSON");
        } catch (e) {
            showStatus(false, "INVALID JSON");
            console.error(e);
            // Optional: could highlight error position here
        }
    });

    // Copy Logic
    btnCopy.addEventListener('click', () => {
        if (!jsonInput.value) return;
        navigator.clipboard.writeText(jsonInput.value).then(() => {
            const originalText = statusText.textContent;
            showStatus(true, "COPIED!");
            setTimeout(() => hideStatus(), 2000);
        });
    });

    // Clear Logic
    btnClear.addEventListener('click', () => {
        jsonInput.value = '';
        updateLineNumbers();
        hideStatus();
    });

    // Save Logic
    btnSave.addEventListener('click', () => {
        if (!jsonInput.value) return;
        const blob = new Blob([jsonInput.value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Status Helper
    function showStatus(isValid, text) {
        statusIndicator.classList.remove('hidden', 'bg-neon-green', 'border-green-800', 'text-background-dark', 'bg-red-600', 'border-red-900', 'text-white');

        if (isValid) {
            statusIndicator.classList.add('bg-neon-green', 'border-green-800', 'text-background-dark');
            statusIcon.textContent = 'check_circle';
        } else {
            statusIndicator.classList.add('bg-red-600', 'border-red-900', 'text-white');
            statusIcon.textContent = 'error';
        }

        statusText.textContent = text;
        statusIndicator.classList.remove('hidden');
    }

    function hideStatus() {
        statusIndicator.classList.add('hidden');
    }

    // Init
    updateLineNumbers();
});
