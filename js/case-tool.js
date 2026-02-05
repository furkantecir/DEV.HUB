document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputText = document.getElementById('input-text');
    const charCount = document.getElementById('charCount');
    const btnRecent = document.getElementById('btn-recent');
    const btnCopy = document.getElementById('btn-copy');
    const btnClear = document.getElementById('btn-clear');
    const btnDownload = document.getElementById('btn-download');
    const caseButtons = document.querySelectorAll('.case-btn');

    // State
    let originalText = "";

    // --- Input Listener ---
    inputText.addEventListener('input', () => {
        charCount.innerText = inputText.value.length;
        if (!originalText && inputText.value) {
            originalText = inputText.value;
        }
    });

    // --- Case Conversion Logic ---
    caseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.case;
            const current = inputText.value;
            if (!current) return;

            // Save original if not saved or if clear was hit
            if (!originalText) originalText = current;

            // Highlight active button
            caseButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            inputText.value = convertCase(current, type);
            // Flash input to show change
            inputText.animate([
                { opacity: 0.5 },
                { opacity: 1 }
            ], { duration: 200 });
        });
    });

    function convertCase(str, type) {
        switch (type) {
            case 'upper':
                return str.toUpperCase();
            case 'lower':
                return str.toLowerCase();
            case 'title':
                return str.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase());
            case 'camel':
                return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                    return index === 0 ? word.toLowerCase() : word.toUpperCase();
                }).replace(/\s+/g, '');
            case 'snake':
                return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                    .map(x => x.toLowerCase())
                    .join('_');
            default:
                return str;
        }
    }

    // --- Restore Original ---
    btnRecent.addEventListener('click', () => {
        if (originalText) {
            inputText.value = originalText;
            charCount.innerText = originalText.length;
            caseButtons.forEach(b => b.classList.remove('active'));
        }
    });

    // --- Copy Logic ---
    btnCopy.addEventListener('click', () => {
        if (!inputText.value) return;
        navigator.clipboard.writeText(inputText.value).then(() => {
            const label = btnCopy.querySelector('span:last-child');
            const originalLabel = label.innerText;
            label.innerText = "COPIED!";
            setTimeout(() => label.innerText = originalLabel, 2000);
        });
    });

    // --- Clear Logic ---
    btnClear.addEventListener('click', () => {
        inputText.value = "";
        charCount.innerText = "0";
        originalText = "";
        caseButtons.forEach(b => b.classList.remove('active'));
    });

    // --- Download Logic ---
    btnDownload.addEventListener('click', () => {
        if (!inputText.value) return;
        const blob = new Blob([inputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted_text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
