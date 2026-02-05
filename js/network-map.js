// ============================================
// NETWORK MAP INTERACTIVE LOGIC
// ============================================

const DEVICES = {
    gateway: {
        id: 'GATEWAY-X1',
        type: 'ROUTER',
        ip: '192.168.1.1',
        mac: '00:1A:2B:3C:4D:5E',
        latency: '0.2ms',
        uptime: '45d 12h',
        icon: 'router',
        color: 'text-white',
        ports: [1, 1, 1, 1, 0, 0, 2, 0] // 1: Active, 0: Down, 2: Error
    },
    printer: {
        id: 'LAB-PRINTER-04',
        type: 'PRINTER',
        ip: '192.168.1.45',
        mac: '4A:55:6F:11:02',
        latency: '12ms',
        uptime: '42:15:08',
        icon: 'print',
        color: 'text-accent-green',
        ports: [1, 1, 0, 0, 1, 1, 2, 0]
    },
    workstation: {
        id: 'WORKSTATION-01',
        type: 'DESKTOP',
        ip: '192.168.1.101',
        mac: 'B2:44:11:AA:BB:CC',
        latency: '2ms',
        uptime: '8h 22m',
        icon: 'desktop_windows',
        color: 'text-text-muted',
        ports: [1, 0, 0, 0]
    },
    nas: {
        id: 'NAS-STORAGE',
        type: 'SERVER',
        ip: '192.168.1.200',
        mac: '11:22:33:44:55:66',
        latency: '1ms',
        uptime: '120d 4h',
        icon: 'dns',
        color: 'text-text-muted',
        ports: [1, 1, 1, 1]
    },
    laptop: {
        id: 'DEV-MBP',
        type: 'LAPTOP',
        ip: '192.168.1.105',
        mac: 'CC:DD:EE:FF:00:11',
        latency: '24ms (WiFi)',
        uptime: '2d 4h',
        icon: 'laptop',
        color: 'text-text-muted',
        ports: [1, 0]
    },
    iot: {
        id: 'IOT-TEMP-01',
        type: 'SENSOR',
        ip: '192.168.1.55',
        mac: 'AA:BB:CC:11:22:33',
        latency: '120ms',
        uptime: '10d 1h',
        icon: 'nest_eco_leaf',
        color: 'text-text-muted',
        ports: [1]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Select printer by default to match screenshot
    selectDevice('printer');
});

function selectDevice(key) {
    const data = DEVICES[key];
    const panel = document.getElementById('details-panel');

    // Generate Ports HTML
    let portsHTML = '';
    if (data.ports && data.ports.length > 0) {
        portsHTML = '<div class="grid grid-cols-4 gap-2">';
        data.ports.forEach((status, idx) => {
            let bgClass = '';
            let textClass = '';
            let label = `P${idx + 1}`;

            if (status === 1) { // Active
                bgClass = 'bg-accent-green border-white/20';
                textClass = 'text-black';
            } else if (status === 2) { // Error
                bgClass = 'bg-red-500 border-white/20';
                textClass = 'text-white';
                label = 'ERR';
            } else { // Inactive
                bgClass = 'bg-surface-dark border-border-dark';
                textClass = 'text-text-muted';
            }

            portsHTML += `
                <div class="aspect-square ${bgClass} border-2 flex flex-col items-center justify-center transition-all hover:scale-105">
                    <span class="text-[8px] font-black ${textClass}">${label}</span>
                </div>
            `;
        });
        portsHTML += '</div>';
    }

    panel.innerHTML = `
        <div class="pixel-card p-4 animate-fade-in">
            <div class="flex items-center gap-3 mb-4">
                <div class="size-10 bg-accent-green/20 border border-accent-green/50 flex items-center justify-center">
                    <span class="material-symbols-outlined ${data.color}">${data.icon}</span>
                </div>
                <div>
                    <div class="text-xs font-bold text-white uppercase">${data.id}</div>
                    <div class="text-[10px] font-mono text-text-muted">Active Session</div>
                </div>
            </div>
            
            <div class="space-y-2">
                <div class="flex justify-between border-b border-border-dark/50 pb-1">
                    <span class="text-[10px] font-mono text-text-muted uppercase">IP Address</span>
                    <span class="text-[10px] font-mono text-accent-green">${data.ip}</span>
                </div>
                <div class="flex justify-between border-b border-border-dark/50 pb-1">
                    <span class="text-[10px] font-mono text-text-muted uppercase">MAC ID</span>
                    <span class="text-[10px] font-mono text-white">${data.mac}</span>
                </div>
                <div class="flex justify-between border-b border-border-dark/50 pb-1">
                    <span class="text-[10px] font-mono text-text-muted uppercase">Latency</span>
                    <span class="text-[10px] font-mono text-accent-green">${data.latency}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[10px] font-mono text-text-muted uppercase">Uptime</span>
                    <span class="text-[10px] font-mono text-white">${data.uptime}</span>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <span class="text-[10px] font-bold text-primary uppercase tracking-wider block mb-3">Hardware Port Status</span>
            ${portsHTML}
        </div>

        <div class="mt-6">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-3">Recent Logs</span>
            <div class="space-y-2 font-mono text-[9px]">
                <div class="flex gap-2">
                    <span class="text-primary">[12:44]</span>
                    <span class="text-text-muted truncate">Packet forward to ${data.ip}</span>
                </div>
                <div class="flex gap-2 text-accent-green">
                    <span>[12:43]</span>
                    <span class="truncate">Handshake success: ${data.id}</span>
                </div>
                <div class="flex gap-2 text-red-400">
                    <span>[12:41]</span>
                    <span class="truncate">Auth failure on port 22 (SSH)</span>
                </div>
            </div>
        </div>
    `;
}

function resetInterface() {
    selectDevice('gateway');

    // Visual feedback
    const btn = document.querySelector('button[onclick="resetInterface()"]');
    const originalText = btn.innerText;
    btn.innerText = "RESETTING...";
    setTimeout(() => {
        btn.innerText = originalText;
    }, 1000);
}
