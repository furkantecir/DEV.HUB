document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputArea = document.getElementById('input-text');
    const outputArea = document.getElementById('output-text');
    const modeToggle = document.getElementById('mode-toggle');
    const labelEncode = document.getElementById('label-encode');
    const labelDecode = document.getElementById('label-decode');
    const indicatorInput = document.getElementById('indicator-input');
    const indicatorOutput = document.getElementById('indicator-output');

    // Buttons
    const btnProcess = document.getElementById('process-btn');
    const btnClear = document.getElementById('clear-btn');
    const btnClearAll = document.getElementById('btn-clear-all');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');
    const fileInput = document.getElementById('file-upload');

    // Status
    const statusText = document.getElementById('status-text');
    const charCount = document.getElementById('char-count');

    // State
    let isDecodeMode = false;

    // --- Mode Toggling ---
    modeToggle.addEventListener('click', () => {
        isDecodeMode = !isDecodeMode;
        updateModeUI();
        processText();
    });

    labelEncode.addEventListener('click', () => {
        if (isDecodeMode) {
            isDecodeMode = false;
            updateModeUI();
            processText();
        }
    });

    labelDecode.addEventListener('click', () => {
        if (!isDecodeMode) {
            isDecodeMode = true;
            updateModeUI();
            processText();
        }
    });

    function updateModeUI() {
        if (isDecodeMode) {
            modeToggle.classList.add('mode-active');
            labelDecode.classList.replace('text-gray-400', 'text-primary');
            labelEncode.classList.replace('text-primary', 'text-gray-400');

            // Update color indicators (Green for Decode active)
            indicatorInput.classList.replace('bg-primary', 'bg-green-500');
            indicatorOutput.classList.replace('bg-primary', 'bg-green-500');

            outputArea.classList.replace('text-primary', 'text-green-500');
        } else {
            modeToggle.classList.remove('mode-active');
            labelEncode.classList.replace('text-gray-400', 'text-primary');
            labelDecode.classList.replace('text-primary', 'text-gray-400');

            // Revert indicators
            indicatorInput.classList.replace('bg-green-500', 'bg-primary');
            indicatorOutput.classList.replace('bg-green-500', 'bg-primary');

            outputArea.classList.replace('text-green-500', 'text-primary');
        }
    }

    // --- Processing Logic ---
    function processText() {
        const input = inputArea.value;
        charCount.textContent = `${input.length} chars`;

        if (!input) {
            outputArea.value = "";
            statusText.textContent = "Awaiting_Input";
            statusText.classList.replace('text-red-400', 'text-green-400'); // Reset error color if any
            return;
        }

        statusText.textContent = "Processing...";

        try {
            let result = "";
            if (isDecodeMode) {
                // Decode: Base64 -> UTF-8
                result = decodeURIComponent(escape(window.atob(input.trim())));
            } else {
                // Encode: UTF-8 -> Base64
                result = window.btoa(unescape(encodeURIComponent(input)));
            }
            outputArea.value = result;
            statusText.textContent = "Success";
            statusText.classList.replace('text-red-400', 'text-green-400');
        } catch (error) {
            outputArea.value = "Error: Invalid input for operation.";
            statusText.textContent = "Error";
            statusText.classList.replace('text-green-400', 'text-red-400');
            console.error(error);
        }
    }

    // Event Listeners for Input
    inputArea.addEventListener('input', processText);
    btnProcess.addEventListener('click', processText);

    // --- Clear Functions ---
    const clearLogic = () => {
        inputArea.value = "";
        outputArea.value = "";
        charCount.textContent = "0 chars";
        statusText.textContent = "Awaiting_Input";
        statusText.classList.replace('text-red-400', 'text-green-400');
        inputArea.focus();
    };

    btnClear.addEventListener('click', clearLogic);
    btnClearAll.addEventListener('click', clearLogic);

    // --- Copy Functionality ---
    btnCopy.addEventListener('click', () => {
        if (!outputArea.value) return;

        navigator.clipboard.writeText(outputArea.value).then(() => {
            const originalText = btnCopy.innerHTML;
            btnCopy.innerHTML = `<span class="material-symbols-outlined text-xl">check</span> Copied!`;

            setTimeout(() => {
                btnCopy.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            statusText.textContent = "Copy_Failed";
        });
    });

    // --- Download Functionality ---
    btnDownload.addEventListener('click', () => {
        if (!outputArea.value) return;

        const blob = new Blob([outputArea.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isDecodeMode ? 'decoded_output.txt' : 'encoded_base64.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // --- File Upload ---
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            inputArea.value = e.target.result;
            processText();
        };
        reader.readAsText(file);
        // Reset file input so same file can be selected again if needed
        fileInput.value = '';
    });
});
