// Network Tools JavaScript
// Handles DNS lookup, header checker, JWT debugger, port scanner, and IP refresh

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Network Tools] Initializing...');

    // === DOM Elements ===
    // Find elements more reliably
    const allButtons = document.querySelectorAll('button');
    const allInputs = document.querySelectorAll('input');

    // IP Refresh
    const refreshBtn = document.querySelector('header button');
    const myIpDisplay = document.querySelector('header span.text-green-400.font-mono');

    // DNS Lookup
    const dnsInput = Array.from(allInputs).find(input => input.placeholder === 'example.com');
    const dnsButton = Array.from(allButtons).find(btn => btn.textContent.trim() === 'DIG');
    const dnsOutput = dnsInput?.parentElement?.nextElementSibling;

    // Header Checker
    const headerMethod = document.querySelector('select');
    const headerUrl = Array.from(allInputs).find(input => input.placeholder === 'https://api.dev');
    const headerButton = headerUrl?.parentElement?.querySelector('button');
    const headerOutput = headerUrl?.parentElement?.nextElementSibling;

    // JWT Debugger
    const jwtEncoded = document.querySelector('textarea');
    const jwtButtons = Array.from(allButtons).filter(btn =>
        btn.textContent.includes('PASTE') || btn.textContent.includes('CLEAR')
    );
    const jwtPasteBtn = jwtButtons.find(btn => btn.textContent.includes('PASTE'));
    const jwtClearBtn = jwtButtons.find(btn => btn.textContent.includes('CLEAR'));
    const jwtDecodedContainer = document.querySelector('.bg-transparent.text-white.font-mono');

    // Port Scanner
    const portScanBtn = Array.from(allButtons).find(btn => btn.textContent.includes('Start Scan'));

    console.log('Elements found:', {
        refreshBtn: !!refreshBtn,
        dnsButton: !!dnsButton,
        headerButton: !!headerButton,
        jwtPasteBtn: !!jwtPasteBtn,
        jwtClearBtn: !!jwtClearBtn,
        portScanBtn: !!portScanBtn
    });

    // === IP Refresh ===
    if (refreshBtn && myIpDisplay) {
        console.log('[Network Tools] IP Refresh button found');
        refreshBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[Network Tools] Refresh clicked');
            refreshBtn.classList.add('animate-spin');

            await new Promise(resolve => setTimeout(resolve, 1000));
            const randomIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            myIpDisplay.textContent = randomIp;
            console.log('[Network Tools] IP updated:', randomIp);

            refreshBtn.classList.remove('animate-spin');
        });
    } else {
        console.warn('[Network Tools] IP Refresh elements not found');
    }

    // === DNS Lookup ===
    if (dnsButton && dnsInput && dnsOutput) {
        console.log('[Network Tools] DNS Lookup button found');
        dnsButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[Network Tools] DNS button clicked');

            const domain = dnsInput.value.trim();
            if (!domain) {
                dnsOutput.innerHTML = '<div class="text-red-400">// Error: Please enter a domain</div>';
                return;
            }

            dnsOutput.innerHTML = '<div class="text-yellow-400">// Resolving...</div>';
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

            dnsOutput.innerHTML = `
                <div class="text-green-400">// DNS Resolution Successful</div>
                <div class="text-gray-400 mt-2">Domain: <span class="text-white">${domain}</span></div>
                <div class="text-gray-400">IPv4: <span class="text-primary">${mockIp}</span></div>
                <div class="text-gray-400">TTL: <span class="text-white">3600</span></div>
                <div class="text-gray-400 mt-2 text-[10px]">// Simulated data for demo purposes</div>
            `;

            console.log('[Network Tools] DNS resolved:', domain, '->', mockIp);
        });

        dnsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dnsButton.click();
            }
        });
    } else {
        console.warn('[Network Tools] DNS elements not found:', { dnsButton, dnsInput, dnsOutput });
    }

    // === Header Checker ===
    if (headerButton && headerUrl && headerOutput && headerMethod) {
        console.log('[Network Tools] Header Checker button found');
        headerButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[Network Tools] Header button clicked');

            const url = headerUrl.value.trim();
            const method = headerMethod.value;

            if (!url) {
                headerOutput.innerHTML = '<div class="text-red-400">// Error: Please enter a URL</div>';
                return;
            }

            headerOutput.innerHTML = '<div class="text-yellow-400">// Sending request...</div>';
            await new Promise(resolve => setTimeout(resolve, 600));

            const statusCodes = [200, 201, 204, 301, 400, 404, 500];
            const randomStatus = statusCodes[Math.floor(Math.random() * statusCodes.length)];
            const responseTime = Math.floor(Math.random() * 500) + 50;
            const statusColor = randomStatus < 300 ? 'text-green-400' : randomStatus < 400 ? 'text-yellow-400' : 'text-red-400';

            headerOutput.innerHTML = `
                <div class="flex justify-between">
                    <span class="${statusColor}">${randomStatus} ${randomStatus === 200 ? 'OK' : randomStatus === 404 ? 'Not Found' : 'Response'}</span>
                    <span class="text-gray-500">${responseTime}ms</span>
                </div>
                <div class="mt-2 text-gray-400">content-type: application/json</div>
                <div class="text-gray-400">server: nginx/1.21.0</div>
                <div class="text-gray-400">cache-control: no-cache</div>
                <div class="text-gray-400">x-powered-by: Express</div>
            `;

            console.log('[Network Tools] Header check:', method, url, '->', randomStatus);
        });

        headerUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                headerButton.click();
            }
        });
    } else {
        console.warn('[Network Tools] Header elements not found');
    }

    // === JWT Debugger ===
    if (jwtEncoded && jwtDecodedContainer) {
        console.log('[Network Tools] JWT Debugger found');

        function decodeJWT(token) {
            try {
                const parts = token.split('.');
                if (parts.length !== 3) throw new Error('Invalid JWT format');
                const payload = JSON.parse(atob(parts[1]));
                return payload;
            } catch (error) {
                return null;
            }
        }

        function updateDecoded() {
            const token = jwtEncoded.value.trim();
            if (!token) {
                jwtDecodedContainer.innerHTML = '<span class="text-gray-500">// Paste a JWT token to decode</span>';
                return;
            }

            const payload = decodeJWT(token);
            if (!payload) {
                jwtDecodedContainer.innerHTML = '<span class="text-red-400">// Invalid JWT format</span>';
                return;
            }

            let html = '<span class="text-purple-400">{</span><br/>';
            const keys = Object.keys(payload);
            keys.forEach((key, index) => {
                const value = payload[key];
                const isLast = index === keys.length - 1;
                const valueColor = typeof value === 'string' ? 'text-green-400' :
                    typeof value === 'number' ? 'text-warning' : 'text-blue-400';
                const formattedValue = typeof value === 'string' ? `"${value}"` : value;

                html += `  <span class="text-blue-400">"${key}"</span>: <span class="${valueColor}">${formattedValue}</span>${isLast ? '' : ','}<br/>`;
            });
            html += '<span class="text-purple-400">}</span>';

            jwtDecodedContainer.innerHTML = html;
            console.log('[Network Tools] JWT decoded');
        }

        jwtEncoded.addEventListener('input', updateDecoded);

        if (jwtPasteBtn) {
            jwtPasteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('[Network Tools] Paste clicked');
                try {
                    const text = await navigator.clipboard.readText();
                    jwtEncoded.value = text;
                    updateDecoded();
                } catch (error) {
                    console.error('[Network Tools] Clipboard error:', error);
                }
            });
        }

        if (jwtClearBtn) {
            jwtClearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('[Network Tools] Clear clicked');
                jwtEncoded.value = '';
                updateDecoded();
            });
        }

        updateDecoded();
    } else {
        console.warn('[Network Tools] JWT elements not found');
    }

    // === Port Scanner ===
    if (portScanBtn) {
        console.log('[Network Tools] Port Scanner button found');
        const portTable = document.querySelector('tbody');
        let isScanning = false;

        portScanBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('[Network Tools] Port scan clicked');

            if (isScanning) return;

            isScanning = true;
            portScanBtn.textContent = 'Scanning...';
            portScanBtn.classList.add('opacity-50', 'cursor-not-allowed');

            const rows = portTable.querySelectorAll('tr');
            for (let i = 0; i < rows.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 300));

                const statusCell = rows[i].querySelector('td:last-child');
                const randomStatus = Math.random() > 0.5 ? 'OPEN' : 'CLOSED';
                const statusColor = randomStatus === 'OPEN' ? 'text-green-400' : 'text-red-400';

                statusCell.textContent = randomStatus;
                statusCell.className = `py-2 text-right ${statusColor}`;
            }

            isScanning = false;
            portScanBtn.textContent = 'Start Scan';
            portScanBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            console.log('[Network Tools] Port scan completed');
        });
    } else {
        console.warn('[Network Tools] Port Scanner button not found');
    }

    console.log('[Network Tools] Initialization complete');
});

