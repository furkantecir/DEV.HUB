document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileInput = document.getElementById('file-input');
    const addFilesBtn = document.getElementById('add-files-btn');
    const tableBody = document.getElementById('batch-table-body');
    const emptyRow = document.getElementById('empty-row');
    const queueCount = document.getElementById('queue-count');
    const convertAllBtn = document.getElementById('convert-all-btn');
    const sessionLog = document.getElementById('session-log');
    const formatBtns = document.querySelectorAll('.format-btn');
    const downloadAnchor = document.getElementById('download-anchor');

    // State
    let queue = [];
    let targetFormat = 'image/webp';
    let isProcessing = false;

    // --- Inits ---
    log("System initialized. Waiting for input...", true);
    updateQueueUI();

    // --- Events ---

    // 1. Add Files
    addFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
            fileInput.value = ''; // Reset so same file can be selected again
        }
    });

    // 2. Format Selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;

            // UI Update
            formatBtns.forEach(b => {
                b.classList.remove('bg-primary', 'border-white/40', 'shadow-pixel');
                b.classList.add('bg-surface-dark', 'border-border-dark');

                // Text colors
                const title = b.querySelector('.font-retro');
                const sub = b.querySelector('.font-mono');
                title.classList.remove('text-white');
                title.classList.add('text-gray-400', 'group-hover:text-primary');
                sub.classList.remove('text-white/70');
                sub.classList.add('text-gray-500');

                // Check Icon
                const icon = b.querySelector('.check-icon');
                if (icon) icon.classList.add('hidden');
            });

            // Activate Clicked
            btn.classList.remove('bg-surface-dark', 'border-border-dark');
            btn.classList.add('bg-primary', 'border-white/40', 'shadow-pixel');

            const title = btn.querySelector('.font-retro');
            const sub = btn.querySelector('.font-mono');
            title.classList.remove('text-gray-400', 'group-hover:text-primary');
            title.classList.add('text-white');
            sub.classList.remove('text-gray-500');
            sub.classList.add('text-white/70');

            const icon = btn.querySelector('.check-icon');
            if (icon) icon.classList.remove('hidden');

            // Logic
            targetFormat = btn.getAttribute('data-format');
            log(`Target format updated to: ${targetFormat.split('/')[1].toUpperCase()}`);

            // Update table "Target" column
            updateTableTargets();
        });
    });

    // 3. Convert All
    convertAllBtn.addEventListener('click', () => {
        if (queue.length === 0) return;
        if (isProcessing) return;

        processQueue();
    });


    // --- Functions ---

    function log(msg, isSystem = false) {
        const time = new Date().toLocaleTimeString();
        const el = document.createElement('div');
        el.className = "flex gap-2";
        el.innerHTML = `
            <span class="text-gray-600 font-bold">[${time}]</span>
            <span class="${isSystem ? 'text-primary' : 'text-gray-400'}">${msg}</span>
        `;
        sessionLog.appendChild(el);
        sessionLog.scrollTop = sessionLog.scrollHeight;
    }

    function handleFiles(files) {
        let count = 0;
        files.forEach(file => {
            if (file.type.match('image.*')) {
                // Check dupes
                if (!queue.find(item => item.file.name === file.name && item.file.size === file.size)) {
                    queue.push({
                        id: Math.random().toString(36).substring(7),
                        file: file,
                        status: 'waiting', // waiting, processing, done, error
                        outputBlob: null
                    });
                    count++;
                }
            }
        });

        if (count > 0) {
            log(`${count} new files added to queue.`);
            updateQueueUI();
        }
    }

    function updateQueueUI() {
        // Count
        queueCount.innerText = `${queue.length} files queued`;
        convertAllBtn.disabled = queue.length === 0;

        // Table
        if (queue.length === 0) {
            tableBody.innerHTML = '';
            tableBody.appendChild(emptyRow);
            return;
        }

        // Rebuild table (simple approach for now, optimize later if needed)
        // Ideally we update rows rather than rebuild, but rebuild is safer for "remove" logic if implemented.
        let html = '';
        queue.forEach(item => {
            const ext = getExt(item.file.type);
            const targetExt = targetFormat.split('/')[1].toUpperCase();

            let statusBadge = '';
            if (item.status === 'waiting') statusBadge = '<span class="text-gray-500 uppercase text-xs">Waiting...</span>';
            else if (item.status === 'processing') statusBadge = '<span class="text-yellow-400 uppercase text-xs animate-pulse">Processing...</span>';
            else if (item.status === 'done') statusBadge = '<span class="text-green-400 uppercase text-xs font-bold">DONE</span>';
            else if (item.status === 'error') statusBadge = '<span class="text-red-500 uppercase text-xs">ERROR</span>';

            html += `
            <tr class="border-b border-border-dark/50 hover:bg-white/5 transition-colors" id="row-${item.id}">
                <td class="p-4 flex items-center gap-3">
                    <div class="w-10 h-10 bg-background-dark border border-border-dark flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-500">image</span>
                    </div>
                    <span class="text-white break-all max-w-[200px]">${item.file.name}</span>
                </td>
                <td class="p-4 text-gray-400 font-mono text-xs">${formatSize(item.file.size)}</td>
                <td class="p-4 text-center"><span class="bg-gray-800 text-gray-400 px-2 py-1 border border-gray-600 text-xs">${ext}</span></td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-gray-600 text-sm">arrow_forward</span>
                        <span class="bg-primary/20 text-primary px-2 py-1 border border-primary/50 text-xs font-bold target-badge">${targetExt}</span>
                    </div>
                </td>
                <td class="p-4 text-right status-cell">
                    ${statusBadge}
                </td>
            </tr>
            `;
        });
        tableBody.innerHTML = html;
    }

    function updateTableTargets() {
        const targetExt = targetFormat.split('/')[1].toUpperCase();
        const badges = document.querySelectorAll('.target-badge');
        badges.forEach(b => b.innerText = targetExt);
    }

    async function processQueue() {
        isProcessing = true;
        convertAllBtn.disabled = true;
        log("Batch processing started...");

        // Process sequentially
        for (let i = 0; i < queue.length; i++) {
            const item = queue[i];
            if (item.status === 'done') continue; // skip already done

            updateItemStatus(item.id, 'processing');

            try {
                const blob = await convertImage(item.file, targetFormat);
                item.outputBlob = blob;
                item.status = 'done';
                updateItemStatus(item.id, 'done');
                log(`Converted: ${item.file.name} -> ${formatBytesToMB(blob.size)}`);

                // Auto download (simple behavior)
                const newExt = targetFormat.split('/')[1];
                const oldName = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
                downloadFile(blob, `${oldName}.${newExt}`);

            } catch (err) {
                console.error(err);
                item.status = 'error';
                updateItemStatus(item.id, 'error');
                log(`Error converting ${item.file.name}: ${err.message}`);
            }
        }

        isProcessing = false;
        convertAllBtn.disabled = false;
        log("Batch processing complete.");
    }

    function updateItemStatus(id, status) {
        const row = document.getElementById(`row-${id}`);
        if (!row) return;
        const cell = row.querySelector('.status-cell');

        let statusBadge = '';
        if (status === 'waiting') statusBadge = '<span class="text-gray-500 uppercase text-xs">Waiting...</span>';
        else if (status === 'processing') statusBadge = '<span class="text-yellow-400 uppercase text-xs animate-pulse">Processing...</span>';
        else if (status === 'done') statusBadge = '<span class="text-green-400 uppercase text-xs font-bold">DONE</span>';
        else if (status === 'error') statusBadge = '<span class="text-red-500 uppercase text-xs">ERROR</span>';

        cell.innerHTML = statusBadge;
    }

    function convertImage(file, format) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas toBlob failed'));
                }, format, 0.9); // 0.9 quality default
            };
            img.onerror = (e) => reject(new Error('Image load failed'));
            img.src = URL.createObjectURL(file);
        });
    }

    function downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        downloadAnchor.href = url;
        downloadAnchor.download = filename;
        downloadAnchor.click();
        URL.revokeObjectURL(url);
    }

    // Helpers
    function getExt(mime) {
        if (mime === 'image/jpeg') return 'JPG';
        if (mime === 'image/png') return 'PNG';
        if (mime === 'image/webp') return 'WEBP';
        return 'UNK';
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const s = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
    }

    function formatBytesToMB(bytes) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

});
