// ============================================
// WORLD CLOCK MANAGER
// ============================================

const TIMEZONES = [
    { city: "San Francisco", zone: "America/Los_Angeles" },
    { city: "New York", zone: "America/New_York" },
    { city: "London", zone: "Europe/London" },
    { city: "Berlin", zone: "Europe/Berlin" },
    { city: "Istanbul", zone: "Europe/Istanbul" },
    { city: "Dubai", zone: "Asia/Dubai" },
    { city: "Singapore", zone: "Asia/Singapore" },
    { city: "Tokyo", zone: "Asia/Tokyo" },
    { city: "Sydney", zone: "Australia/Sydney" },
    { city: "Moscow", zone: "Europe/Moscow" },
    { city: "Paris", zone: "Europe/Paris" },
    { city: "Seoul", zone: "Asia/Seoul" },
    { city: "Shanghai", zone: "Asia/Shanghai" },
    { city: "Mumbai", zone: "Asia/Kolkata" },
    { city: "Sao Paulo", zone: "America/Sao_Paulo" }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 World Clock Initialized');
    updateClocks();
    setInterval(updateClocks, 1000); // 1-second tick
    populateModalList(TIMEZONES);
});

// Update all clocks on screen
function updateClocks() {
    const now = new Date();

    // Update footer local time
    const footerTime = document.getElementById('local-time-footer');
    if (footerTime) {
        footerTime.textContent = `Local Time: ${now.toLocaleTimeString('en-GB')} Local`;
    }

    // Update all elements with data-timezone attribute
    document.querySelectorAll('[data-timezone]').forEach(el => {
        const zone = el.getAttribute('data-timezone');
        try {
            if (el.classList.contains('clock-time')) {
                // Format: HH:MM
                const timeStr = now.toLocaleTimeString('en-US', { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit' });
                el.innerText = timeStr;
            } else if (el.classList.contains('clock-date')) {
                // Format: Today • Oct 24
                const dateStr = now.toLocaleDateString('en-US', { timeZone: zone, month: 'short', day: 'numeric' });
                // Simple logic for "Today/Tomorrow" relative to UTC or local could be complex, keeping simple date for now
                // Or check relative day difference
                const localDay = now.getDay();
                const zoneDate = new Date(now.toLocaleString('en-US', { timeZone: zone }));
                const zoneDay = zoneDate.getDay();

                let dayLabel = "Today";
                if (zoneDay !== localDay) {
                    // This creates a simple "Yesterday/Tomorrow" logic based on day index difference
                    // Note: This is simplified and might fail on week boundaries (Sat->Sun), keeping it simple:
                    if ((localDay === 0 && zoneDay === 6) || zoneDay < localDay) dayLabel = "Yesterday";
                    else if ((localDay === 6 && zoneDay === 0) || zoneDay > localDay) dayLabel = "Tomorrow";
                }

                el.innerText = `${dayLabel} • ${dateStr}`;
            }
        } catch (e) {
            console.error(`Invalid timezone: ${zone}`);
            el.innerText = "--:--";
        }
    });

    // Update modal live previews too
    document.querySelectorAll('.modal-live-time').forEach(el => {
        const zone = el.getAttribute('data-zone');
        try {
            el.innerText = now.toLocaleTimeString('en-US', { timeZone: zone, hour12: false, hour: '2-digit', minute: '2-digit' });
        } catch (e) { }
    });
}

// Modal Logic
function toggleModal() {
    const modal = document.getElementById('timezone-modal');
    const content = document.getElementById('main-content');

    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        content.classList.add('blur-sm', 'grayscale-[50%]'); // Apply background effect
        document.getElementById('modal-search').focus();
    } else {
        modal.classList.add('hidden');
        content.classList.remove('blur-sm', 'grayscale-[50%]');
    }
}

// Populate Modal List (with Filter)
function populateModalList(list) {
    const container = document.getElementById('timezone-list');
    container.innerHTML = '';

    list.forEach(item => {
        // Only show if not already added generally? For now allow duplicates or filter logic in add
        const row = document.createElement('div');
        row.className = 'pixel-row grid grid-cols-12 items-center py-4 px-4 hover:bg-primary/5 transition-colors group';
        row.innerHTML = `
            <div class="col-span-6 flex flex-col">
                <span class="font-mono text-white text-sm font-bold uppercase">${item.city}</span>
                <span class="text-[10px] font-mono text-text-muted uppercase">${item.zone}</span>
            </div>
            <div class="col-span-3 text-center">
                <span class="font-pixel text-2xl text-white tracking-widest modal-live-time" data-zone="${item.zone}">--:--</span>
            </div>
            <div class="col-span-3 flex justify-end">
                <button onclick="addClock('${item.city}', '${item.zone}')" 
                    class="pixel-button px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white hover:scale-105 transition-transform">
                    ADD
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

// Search Filter
function filterTimezones(query) {
    query = query.toLowerCase();
    const filtered = TIMEZONES.filter(t => t.city.toLowerCase().includes(query) || t.zone.toLowerCase().includes(query));
    populateModalList(filtered);
    updateClocks(); // Update times for new search results immediately
}

// Add New Clock Logic
function addClock(city, zone) {
    // Check if exists
    if (document.getElementById(`clock-card-${zone}`)) {
        alert('This timezone is already pinned!');
        return;
    }

    const grid = document.getElementById('clock-grid');
    // Insert before the last button (Add Node button)
    const addBtnData = grid.lastElementChild;

    const card = document.createElement('div');
    card.className = 'pixel-card p-6 flex flex-col relative group animate-slide-in';
    card.id = `clock-card-${zone}`;

    // Determine Icon based on time (simple logic: 6-18 sun, else moon)
    // We'll let updateClocks handle time updating, but we need initial structure

    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <span class="text-[10px] font-mono text-text-muted uppercase tracking-widest">${zone}</span>
                <h3 class="text-xl font-bold text-white uppercase font-mono tracking-tighter">${city}</h3>
            </div>
            <span class="material-symbols-outlined text-text-muted">schedule</span> 
        </div>
        <div class="flex-1 flex flex-col items-center justify-center py-4">
            <div class="clock-time text-6xl font-pixel text-white tracking-widest" data-timezone="${zone}">--:--</div>
            <div class="clock-date text-xs font-mono text-text-muted mt-1 uppercase" data-timezone="${zone}">...</div>
        </div>
        <div class="mt-4 pt-4 border-t border-border-dark flex justify-between items-center">
            <span class="text-[10px] font-mono text-text-muted uppercase">Added Node</span>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="text-text-muted hover:text-red-400" onclick="removeClock('${zone}')"><span class="material-symbols-outlined text-sm">delete</span></button>
            </div>
        </div>
    `;

    grid.insertBefore(card, addBtnData);
    updateClocks(); // Immediate update
    toggleModal(); // Close modal
}

function removeClock(zone) {
    const card = document.getElementById(`clock-card-${zone}`);
    if (card) {
        card.remove();
    }
}
