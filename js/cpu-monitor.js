"use strict";

class CpuMonitor {
    constructor() {
        this.sampleRate = 1000; // ms
        this.historyLength = 40;
        this.history = new Array(this.historyLength).fill(0).map(() => 20 + Math.random() * 30);
        this.utilization = 42.8;
        this.temp = 54;
        
        // Parse initial uptime from DOM or start fresh
        const uptimeText = document.getElementById('uptime').textContent;
        const parts = uptimeText.split(':').map(Number);
        this.uptimeSeconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
        
        this.interval = null;
        this.processes = [
            { name: "chrome.exe", base: 12.0, color: "text-primary" },
            { name: "vscode.exe", base: 8.0, color: "text-primary" },
            { name: "docker-proxy", base: 5.0, color: "text-primary" },
            { name: "node.exe", base: 3.0, color: "text-primary" },
            { name: "system_idle", base: 60.0, color: "text-text-muted" }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.startMonitoring();
        
        // Start uptime counter separately to track real seconds regardless of sample rate
        setInterval(() => this.updateUptime(), 1000);
        
        console.log("CPU Monitor Initialized");
    }

    bindEvents() {
        const rates = [500, 1000, 5000];
        const rateIds = ['rate-500ms', 'rate-1s', 'rate-5s'];
        
        rateIds.forEach((id, index) => {
            const el = document.getElementById(id);
            if(el) {
                el.addEventListener('click', () => {
                    this.setRate(rates[index]);
                });
            }
        });
    }

    setRate(rate) {
        this.sampleRate = rate;
        this.startMonitoring();
        
        // Update UI logic for active button
        const rateIds = {
            500: 'rate-500ms',
            1000: 'rate-1s',
            5000: 'rate-5s'
        };
        
        Object.keys(rateIds).forEach(r => {
            const id = rateIds[r];
            const el = document.getElementById(id);
            const isActive = parseInt(r) === rate;
            
            if (isActive) {
                el.className = "px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-[10px] font-mono cursor-pointer transition-colors";
            } else {
                el.className = "px-2 py-0.5 bg-surface-dark border border-border-dark text-text-muted text-[10px] font-mono hover:text-white cursor-pointer transition-colors";
            }
        });
    }

    startMonitoring() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.tick(), this.sampleRate);
        this.tick(); // Immediate update
    }

    tick() {
        // Update main utilization with some jitter
        const change = (Math.random() - 0.5) * 15;
        this.utilization = Math.max(5, Math.min(100, this.utilization + change));
        
        // Update history
        this.history.push(this.utilization);
        if (this.history.length > this.historyLength) {
            this.history.shift();
        }

        // Update temp based on utilization (lagged correlation)
        const targetTemp = 40 + (this.utilization * 0.5);
        this.temp += (targetTemp - this.temp) * 0.1;
        
        this.updateUI();
    }

    updateUI() {
        // Total Utilization
        const utilEl = document.getElementById('total-util');
        const barEl = document.getElementById('total-util-bar');
        
        if(utilEl) utilEl.textContent = this.utilization.toFixed(1);
        if(barEl) barEl.style.width = `${this.utilization}%`;
        
        // Utilization Change Indicator
        const changeEl = document.getElementById('util-change');
        if(changeEl) {
            const lastUtil = this.history[this.history.length - 2] || this.utilization;
            const  diff = this.utilization - lastUtil;
            changeEl.textContent = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
            changeEl.className = `text-[10px] font-mono ${diff > 0 ? 'text-red-500' : 'text-green-500'}`; // Green is good (lower), Red is bad (higher) - traditionally. But for activity usually green is +, wait. Context: CPU usage. + usage is usually "load increased" -> maybe neutral or warning. User had +2.1% as Green in screenshot. I'll stick to Green for + for now, or follow common logic. Actually in screenshot +2.1% was Green.
            changeEl.className = `text-[10px] font-mono ${diff > 0 ? 'text-green-500' : 'text-text-muted'}`;
        }

        // Package Temp
        const pkgTempEl = document.getElementById('pkg-temp');
        const pkgTempBar = document.getElementById('pkg-temp-bar');
        const pkgTempStatus = document.getElementById('pkg-temp-status');
        
        const tempVal = Math.round(this.temp);
        if(pkgTempEl) pkgTempEl.textContent = tempVal;
        if(pkgTempBar) pkgTempBar.style.width = `${Math.min(100, tempVal)}%`;
        if(pkgTempBar) {
            // Change color based on temp
            if(tempVal > 80) pkgTempBar.className = "h-full bg-red-600";
            else if(tempVal > 65) pkgTempBar.className = "h-full bg-orange-500";
            else pkgTempBar.className = "h-full bg-green-500"; // Cool
        }
        
        if(pkgTempStatus) {
            const status = tempVal > 85 ? 'CRITICAL' : tempVal > 70 ? 'HIGH' : 'NORMAL';
            pkgTempStatus.textContent = status;
            pkgTempStatus.className = `text-[10px] font-mono ${tempVal > 85 ? 'text-red-500 animate-pulse' : tempVal > 70 ? 'text-orange-500' : 'text-text-muted'}`;
        }

        // Charts
        this.drawChart();

        // Individual Cores
        for(let i=0; i<=7; i++) {
            // Vary cores around the average
            const coreVariance = (Math.random() - 0.5) * 40;
            let coreUtil = this.utilization + coreVariance;
            coreUtil = Math.max(0, Math.min(100, coreUtil));
            
            const valEl = document.getElementById(`c${i}-val`);
            const barEl = document.getElementById(`c${i}-bar`);
            
            if(valEl) valEl.textContent = `${Math.round(coreUtil)}%`;
            if(barEl) barEl.style.width = `${coreUtil}%`;
            
            // Color logic for cores
            if(valEl) {
                if(coreUtil > 90) valEl.className = "text-sm font-black text-primary";
                else valEl.className = "text-sm font-black text-white";
            }
        }
        
        // Thermal Zones
        this.updateThermalZone('temp-pkg', this.temp);
        this.updateThermalZone('temp-gfx', this.temp * 0.8 + (Math.random() * 5));
        this.updateThermalZone('temp-vrm', this.temp * 1.1 + (Math.random() * 5));
        
        // Load Average (Approximate based on util)
        const loadAvg = document.getElementById('load-avg');
        if(loadAvg) {
            // Load avg usually 0-number of cores. 
            // 50% util on 16 core machine ~ 8.0 load? Or 1.0 = 100% of 1 core?
            // User screenshot: 2.14. 
            const val = (this.utilization / 100) * 4; // Mock scale
            loadAvg.textContent = val.toFixed(2);
        }

        // Top Consumers Reorder/Update
        this.updateProcesses();
    }
    
    updateThermalZone(idPrefix, val) {
        val = Math.round(val);
        const valEl = document.getElementById(`${idPrefix}-val`);
        const barEl = document.getElementById(`${idPrefix}-bar`);
        
        if(valEl) valEl.textContent = `${val}°C`;
        if(barEl) {
            barEl.style.width = `${Math.min(100, val)}%`;
            if(val > 80) barEl.className = "h-full bg-red-500/50";
            else if(val > 60) barEl.className = "h-full bg-orange-500/50";
            else barEl.className = "h-full bg-green-500/50";
        }
    }

    updateProcesses() {
        const listContainer = document.getElementById('top-consumers');
        if(!listContainer) return;
        
        // Update percentages
        let remaining = 100;
        
        // Jitter percentages
        this.processes.forEach(p => {
            if(p.name !== 'system_idle') {
                const jitter = (Math.random() - 0.5) * 2;
                p.current = Math.max(0.1, p.base * (this.utilization / 40) + jitter);
                remaining -= p.current;
            }
        });
        
        // Adjust idle
        const idleProc = this.processes.find(p => p.name === 'system_idle');
        if(idleProc) {
            idleProc.current = Math.max(0, remaining);
        }
        
        // Sort by usage desc (except idle usually stays at bottom or top, user screenshot showed idle at bottom with high %)
        // Wait, "Top Consumers" usually lists highest usage.
        // Screenshot: chrome 12.4, vscode 8.1 ... system_idle 57.2.
        // It seems purely sorted list? Or idle at end?
        // Usually idle is high when load is low.
        
        // Let's just render them in the fixed order but update values
        listContainer.innerHTML = '';
        
        this.processes.forEach(p => {
            const div = document.createElement('div');
            div.className = "flex items-center justify-between text-[11px] border-b border-border-dark pb-2";
            div.innerHTML = `
                <span class="text-white">${p.name}</span>
                <span class="${p.name === 'system_idle' ? 'text-text-muted' : 'text-primary'}">${p.current.toFixed(1)}%</span>
            `;
            listContainer.appendChild(div);
        });
    }

    updateUptime() {
        this.uptimeSeconds++;
        const h = Math.floor(this.uptimeSeconds / 3600);
        const m = Math.floor((this.uptimeSeconds % 3600) / 60);
        const s = this.uptimeSeconds % 60;
        
        const el = document.getElementById('uptime');
        if(el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    drawChart() {
        const width = 1000;
        const height = 300;
        const chartLine = document.getElementById('chart-line');
        const chartFill = document.getElementById('chart-fill');
        
        if(!chartLine || !chartFill) return;
        
        // Calculate points
        const pts = this.history.map((val, i) => {
            const x = (i / (this.historyLength - 1)) * width;
            const y = height - (val / 100) * height; // 100% is top (0), 0% is bottom (300)
            return `${x},${y}`;
        });
        
        // Update Line
        chartLine.setAttribute('points', pts.join(' '));
        
        // Update Area Fill
        // Start from bottom-left, go to all points, go to bottom-right, close
        let d = `M 0,${height} `; // start bottom left
        pts.forEach(pt => {
             const [x, y] = pt.split(',');
             d += `L ${x},${y} `;
        });
        d += `L ${width},${height} Z`; // end bottom right and close
        
        chartFill.setAttribute('d', d);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.cpuMonitor = new CpuMonitor();
});
