document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const regexInput = document.getElementById('regex-input');
    const testStringInput = document.getElementById('test-string');
    const resultsBody = document.getElementById('results-body');
    const matchCountBadge = document.getElementById('match-count');
    const executionTimeEl = document.getElementById('execution-time');
    const groupCountEl = document.getElementById('group-count');
    const flagBtns = {
        g: document.getElementById('flag-g'),
        m: document.getElementById('flag-m'),
        i: document.getElementById('flag-i')
    };
    const flagsDisplay = document.getElementById('flags-display');
    const copyPatternBtn = document.getElementById('copy-pattern-btn');
    const clearBtn = document.getElementById('clear-btn');

    // --- State ---
    let flags = {
        g: true,
        m: true,
        i: false
    };

    // --- Logic ---

    // Toggle Flag Helper
    window.toggleFlag = (flag) => {
        flags[flag] = !flags[flag];
        updateFlagsUI();
        runRegex();
    };

    const updateFlagsUI = () => {
        // Update Buttons
        for (const [key, btn] of Object.entries(flagBtns)) {
            if (flags[key]) {
                btn.classList.add('text-accent-green', 'border-accent-green/30');
                btn.classList.remove('text-gray-500', 'border-border-dark');
            } else {
                btn.classList.remove('text-accent-green', 'border-accent-green/30');
                btn.classList.add('text-gray-500', 'border-border-dark');
            }
        }

        // Update Display Text
        const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
        flagsDisplay.innerText = `/${flagStr}`;
    };

    const runRegex = () => {
        const pattern = regexInput.value;
        const text = testStringInput.value;
        const flagStr = Object.keys(flags).filter(k => flags[k]).join('');

        resultsBody.innerHTML = '';

        if (!pattern) return;

        const startTime = performance.now();
        let regex;
        try {
            regex = new RegExp(pattern, flagStr);
        } catch (e) {
            matchCountBadge.innerText = "ERROR";
            matchCountBadge.classList.replace('bg-primary', 'bg-red-500');
            return;
        }

        matchCountBadge.classList.replace('bg-red-500', 'bg-primary');

        // Logic for finding matches
        let matches = [];
        if (flags.g) {
            matches = [...text.matchAll(regex)];
        } else {
            const match = text.match(regex);
            if (match) matches = [match];
        }
        const endTime = performance.now();

        // Update Stats
        executionTimeEl.innerText = `${(endTime - startTime).toFixed(2)}ms`;
        matchCountBadge.innerText = `${matches.length}_FOUND`;

        // Count capture groups (simple approximation or from first match)
        // A robust way to count groups is checking the length of the match array - 1
        const groupCount = matches.length > 0 ? matches[0].length - 1 : 0;
        groupCountEl.innerText = groupCount;

        // Render Results
        matches.forEach((match, index) => {
            const fullMatch = match[0];
            const groups = match.slice(1); // Array of groups

            // Reconstruct groups HTML
            let groupsHtml = '<div class="flex flex-col gap-1">';

            // Check for named groups if supported/present
            if (match.groups) {
                for (const [name, val] of Object.entries(match.groups)) {
                    groupsHtml += `<span class="text-primary">${name}: ${val}</span>`;
                }
                // Add indexed groups that might not be named? 
                // Usually match.groups covers named ones. 
                // Indexed access covers all. We can just list index if no names.
            }

            if (!match.groups || Object.keys(match.groups).length === 0) {
                groups.forEach((g, i) => {
                    groupsHtml += `<span>${i + 1}: ${g}</span>`;
                });
            }

            if (groups.length === 0) {
                groupsHtml += `<span class="text-gray-600 italic">No groups</span>`;
            }

            groupsHtml += '</div>';

            const row = document.createElement('tr');
            row.className = "bg-surface-dark/40 hover:bg-primary/10 group transition-colors border-b border-border-dark/50";
            row.innerHTML = `
                <td class="p-3 border-r border-border-dark text-gray-500">${index + 1}</td>
                <td class="p-3 border-r border-border-dark text-accent-green font-mono break-all">${fullMatch}</td>
                <td class="p-3 font-mono text-xs text-gray-400 capture-groups">
                    ${groupsHtml}
                </td>
            `;
            resultsBody.appendChild(row);
        });
    };

    // --- Events ---
    regexInput.addEventListener('input', runRegex);
    testStringInput.addEventListener('input', runRegex);

    copyPatternBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(regexInput.value).then(() => {
            const original = copyPatternBtn.innerText;
            copyPatternBtn.innerText = "COPIED!";
            setTimeout(() => { copyPatternBtn.innerText = original; }, 2000);
        });
    });

    clearBtn.addEventListener('click', () => {
        regexInput.value = '';
        testStringInput.value = '';
        runRegex();
    });

    // --- Init ---
    updateFlagsUI(); // Set initial button states
    runRegex(); // Run once on load
});
