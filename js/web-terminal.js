
// ============================================
// WEB TERMINAL EMULATOR ENGINE v2.0
// ============================================

const FILES = {
    'main.js': 'console.log("System initialized");',
    'tools.json': '{\n  "version": "2.4.0",\n  "status": "secure",\n  "modules": ["terminal", "crusher", "colors"]\n}',
    'readme.txt': 'Welcome to the Secure Web Terminal.\nThis environment is sandboxed. Use "open <tool>" to navigate.',
    'network_scan.py': 'import socket\n# Scanning logic placeholder...\n# Use "open scan" to run GUI.',
    'deploy.sh': '#!/bin/bash\n# Deployment script\n# Use "open deploy" to run GUI.',
    'system.log': '[INFO] Boot sequence completed\n[WARN] Low memory variance detected\n[INFO] User session established'
};

const COMMANDS = {
    help: {
        desc: 'Show available commands',
        run: () => {
            const lines = [
                'AVAILABLE COMMANDS:',
                '  help       - Show this help message',
                '  ls         - List directory contents',
                '  cat [file] - View file content',
                '  clear      - Clear terminal screen',
                '  whoami     - Show current user',
                '  date       - Show system time',
                '  open [app] - Switch to tools (deploy, scan, clean)',
                ' ',
                'TRY THESE:',
                '  > open deploy',
                '  > cat system.log'
            ];
            return { text: lines.join('\n'), color: 'text-text-muted' };
        }
    },
    ls: {
        desc: 'List contents',
        run: () => {
            const files = Object.keys(FILES).map(f => f.includes('.') ? f : `[DIR] ${f}`);
            return { text: files.join('    '), color: 'text-terminal-green font-bold' };
        }
    },
    whoami: {
        desc: 'Current user',
        run: () => ({ text: 'user@webhub (root privileges)', color: 'text-primary' })
    },
    date: {
        desc: 'System time',
        run: () => ({ text: new Date().toString(), color: 'text-text-muted' })
    },
    clear: {
        desc: 'Clear screen',
        run: () => 'CLEAR_SIGNAL'
    },
    open: {
        desc: 'Open tool',
        run: (args) => {
            if (!args[0]) return { text: 'Usage: open [deploy | scan | clean | library]', color: 'text-yellow-400' };

            const tool = args[0].toLowerCase();
            const map = {
                'deploy': 'quick-deploy.html',
                'scan': 'network-scan.html',
                'clean': 'clean-cache.html',
                'library': 'module-library.html'
            };

            if (map[tool]) {
                setTimeout(() => window.location.href = map[tool], 500);
                return { text: `[SYSTEM] Redirecting to ${tool.toUpperCase()} module...`, color: 'text-green-400' };
            } else {
                return { text: `Error: Tool '${tool}' not found.\nAvailable: deploy, scan, clean, library`, color: 'text-red-400' };
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('cmd-input');
    const displayEl = document.getElementById('input-display');
    const historyEl = document.getElementById('command-history');
    const terminalContent = document.getElementById('terminal-content');

    // Force focus
    document.addEventListener('click', () => inputEl.focus());
    inputEl.focus();

    // Boot Sequence
    runBootSequence();

    // Input Handling
    inputEl.addEventListener('input', (e) => {
        displayEl.innerText = inputEl.value;
    });

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = inputEl.value.trim();
            if (cmd) {
                execute(cmd);
            }
            inputEl.value = '';
            displayEl.innerText = '';
        }
    });

    function execute(cmdStr) {
        // Add command to history
        addToHistory(`user@webhub:~$ ${cmdStr}`, 'text-white font-bold');

        const parts = cmdStr.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Process Command
        let result = null;

        if (COMMANDS[cmd]) {
            result = COMMANDS[cmd].run(args);
        }
        else if (cmd === 'echo') {
            result = { text: args.join(' '), color: 'text-text-muted' };
        }
        else if (cmd === 'cat') {
            const file = args[0];
            if (FILES[file]) {
                result = { text: FILES[file], color: 'text-terminal-green' };
            } else {
                result = { text: `cat: ${file}: No such file or directory`, color: 'text-red-400' };
            }
        }
        else if (cmd === 'run') {
            // Alias for open? Or simulate run
            result = { text: `Simulating execution of ${args[0]}...\n[Done]`, color: 'text-yellow-400' };
        }
        else {
            result = { text: `bash: ${cmd}: command not found`, color: 'text-red-400' };
        }

        if (result === 'CLEAR_SIGNAL') {
            historyEl.innerHTML = '';
        } else if (result) {
            addToHistory(result.text, result.color);
        }

        // Scroll to bottom
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    function addToHistory(text, colorClass) {
        const div = document.createElement('div');
        div.className = `${colorClass || 'text-text-muted'} mb-1 whitespace-pre-wrap`;
        div.innerText = text;
        historyEl.appendChild(div);
    }

    function runBootSequence() {
        const msgs = [
            { text: '[SYSTEM] Initializing secure sandbox environment...', delay: 100 },
            { text: '[SYSTEM] Loading local node modules... OK', delay: 400 },
            { text: '[SYSTEM] Establishing offline proxy... OK', delay: 800 },
            { text: '[SYSTEM] Terminal ready.', delay: 1200 },
            { text: 'Type "help" to see available commands.', delay: 1300, color: 'text-primary' },
            { text: '----------------------------------------', delay: 1400 }
        ];

        msgs.forEach(msg => {
            setTimeout(() => {
                addToHistory(msg.text, msg.color || 'text-terminal-violet');
                terminalContent.scrollTop = terminalContent.scrollHeight;
                // Auto-run help at the end
                if (msg.text.includes('---')) {
                    setTimeout(() => execute('help'), 200);
                }
            }, msg.delay);
        });
    }
});
