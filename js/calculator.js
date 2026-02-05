// ============================================
// RETRO CALCULATOR ENGINE
// ============================================

const CONFIG = {
    MAX_DIGITS: 16,
    MODES: {
        STANDARD: 'standard',
        PROGRAMMER: 'programmer'
    }
};

const STATE = {
    mode: CONFIG.MODES.PROGRAMMER,
    displayValue: '0',
    expression: '',
    memory: null,
    history: [],

    // Programmer specific
    base: 'DEC', // HEX, DEC, OCT, BIN
    bits: 64, // 64, 32, 16, 8

    // Calculation state
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null
};

// Keypad Layouts
const KEYPADS = {
    [CONFIG.MODES.STANDARD]: [
        { type: 'action', value: 'AC', class: 'text-red-400' },
        { type: 'operator', value: '+/-', label: '+/-' },
        { type: 'operator', value: '%', label: '%' },
        { type: 'operator', value: '/', class: 'bg-primary text-white' },

        { type: 'number', value: '7' },
        { type: 'number', value: '8' },
        { type: 'number', value: '9' },
        { type: 'operator', value: '*', label: '×', class: 'bg-primary text-white' },

        { type: 'number', value: '4' },
        { type: 'number', value: '5' },
        { type: 'number', value: '6' },
        { type: 'operator', value: '-', class: 'bg-primary text-white' },

        { type: 'number', value: '1' },
        { type: 'number', value: '2' },
        { type: 'number', value: '3' },
        { type: 'operator', value: '+', class: 'bg-primary text-white' },

        { type: 'number', value: '0', span: 2 },
        { type: 'number', value: '.' },
        { type: 'action', value: '=', class: 'bg-green-600 text-white' }
    ],

    [CONFIG.MODES.PROGRAMMER]: [
        // Row 1
        { type: 'hex', value: 'A' },
        { type: 'hex', value: 'B' },
        { type: 'action', value: 'AC', class: 'text-red-400' },
        { type: 'action', value: 'DEL' },
        { type: 'operator', value: 'MOD', label: 'MOD' }, // Custom handling logic needed
        { type: 'operator', value: '/', class: 'bg-primary text-white' },

        // Row 2
        { type: 'hex', value: 'C' },
        { type: 'hex', value: 'D' },
        { type: 'number', value: '7' },
        { type: 'number', value: '8' },
        { type: 'number', value: '9' },
        { type: 'operator', value: '*', label: '×', class: 'bg-primary text-white' },

        // Row 3
        { type: 'hex', value: 'E' },
        { type: 'hex', value: 'F' },
        { type: 'number', value: '4' },
        { type: 'number', value: '5' },
        { type: 'number', value: '6' },
        { type: 'operator', value: '-', class: 'bg-primary text-white' },

        // Row 4
        { type: 'spacer' },
        { type: 'spacer' },
        { type: 'number', value: '1' },
        { type: 'number', value: '2' },
        { type: 'number', value: '3' },
        { type: 'operator', value: '+', class: 'bg-primary text-white' },

        // Row 5
        { type: 'spacer', span: 2 },
        { type: 'number', value: '0', span: 2 }, // Actually span 2? No, standard alignment puts 0 under 1-2 usually or just 0.
        // Let's stick to alignment. 1 is col 3. 0 should be col 3.
        // If 0 spans 2, it takes col 3 and 4.
        // Then . is col 5. = is col 6.
        // Wait, user layout row 5: 0 (span 2), ., = (span 3). Total 6.
        // So 0 takes col 1-2? No, typical numpad has 0 under 1/2.
        // User snippet logic: Row 4 keys are 1,2,3,+ (4 keys).
        // Since it's programmer calc, maybe 0 should be under 1/2.
        // I'll put spacers to force alignment.
        // Row 4: Spacer, Spacer, 1, 2, 3, +
        // Row 5: Spacer, Spacer, 0, ., = (span 2)
        { type: 'number', value: '.', disabled: true }, // Hex mode usually integer only
        { type: 'action', value: '=', class: 'bg-green-600 text-white' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🧮 Calculator Loaded');
    initCalculator();
});

function initCalculator() {
    // Buttons
    setupModeButtons();
    setupKeypad();
    setupBitwiseOps();
    setupBaseSwitching();
    setupWordSizeSwitching();

    // Initial Render
    updateUI();
    generateBitVisualizer();
    setupKeyboardSupport(); // Keyboard support added
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        // Prevent default actions for some keys like / (quick find)
        if (e.key === '/') e.preventDefault();

        const key = e.key;

        // Numbers
        if (/[0-9]/.test(key)) {
            handleInput(key, 'number');
            return;
        }

        // Hex letters (a-f) - Only in Programmer Mode + Hex Base
        if (STATE.mode === CONFIG.MODES.PROGRAMMER && STATE.base === 'HEX' && /[a-fA-F]/.test(key)) {
            // Only A-F allowed
            if (/[a-fA-F]/.test(key) && !/[g-zG-Z]/.test(key)) {
                handleInput(key.toUpperCase(), 'hex');
                return;
            }
        }

        // Operators
        if (['+', '-', '*', '/'].includes(key)) {
            handleInput(key, 'operator');
            return;
        }

        // Enter / Equals
        if (key === 'Enter' || key === '=') {
            e.preventDefault();
            handleInput('=', 'action');
            return;
        }

        // Backspace / Delete
        if (key === 'Backspace') {
            handleInput('DEL', 'action');
            return;
        }

        // Escape (AC)
        if (key === 'Escape') {
            handleInput('AC', 'action');
            return;
        }

        // Dot
        if (key === '.' || key === ',') {
            handleInput('.', 'number');
            return;
        }
    });
}

// ----------------------------------------------------
// UI SETUP & RENDERING
// ----------------------------------------------------

function setupModeButtons() {
    document.getElementById('mode-standard').addEventListener('click', () => switchMode(CONFIG.MODES.STANDARD));
    document.getElementById('mode-programmer').addEventListener('click', () => switchMode(CONFIG.MODES.PROGRAMMER));
}

function switchMode(newMode) {
    if (STATE.mode === newMode) return;

    STATE.mode = newMode;
    STATE.displayValue = '0';
    STATE.expression = '';
    STATE.firstOperand = null;
    STATE.waitingForSecondOperand = false;
    STATE.operator = null;

    // UI Updates
    document.getElementById('mode-standard').className = newMode === CONFIG.MODES.STANDARD
        ? 'flex-1 py-2 px-3 bg-primary text-white text-[10px] font-mono font-bold border-b-4 border-black/40 shadow-[0_0_10px_rgba(127,19,236,0.3)]'
        : 'flex-1 py-2 px-3 bg-surface-dark text-text-muted text-[10px] font-mono font-bold border-b-4 border-black/40 hover:bg-border-dark transition-all';

    document.getElementById('mode-programmer').className = newMode === CONFIG.MODES.PROGRAMMER
        ? 'flex-1 py-2 px-3 bg-primary text-white text-[10px] font-mono font-bold border-b-4 border-black/40 shadow-[0_0_10px_rgba(127,19,236,0.3)]'
        : 'flex-1 py-2 px-3 bg-surface-dark text-text-muted text-[10px] font-mono font-bold border-b-4 border-black/40 hover:bg-border-dark transition-all';

    // Toggle Visibility
    const els = ['bit-visualizer', 'number-systems', 'word-size-selector', 'bitwise-panel'];
    els.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = newMode === CONFIG.MODES.PROGRAMMER ? (id === 'bitwise-panel' ? 'flex' : 'flex') : 'none'; // bitwise panel is actually in grid, tricky

        // Bitwise panel parent handling
        if (id === 'bitwise-panel') {
            const panel = document.getElementById(id);
            if (newMode === CONFIG.MODES.STANDARD) {
                panel.classList.add('hidden');
            } else {
                panel.classList.remove('hidden');
            }
        }

        // Others
        if (id !== 'bitwise-panel') {
            if (el) el.style.display = newMode === CONFIG.MODES.PROGRAMMER ? (id === 'bit-visualizer' || id === 'number-systems' ? (id === 'number-systems' ? 'grid' : 'block') : 'flex') : 'none';
        }
    });

    // Update labels
    document.getElementById('calc-version-label').textContent = newMode === CONFIG.MODES.STANDARD ? 'STANDARD_CALC_V1' : 'PROGRAMMER_CALC_V3';
    document.getElementById('mode-label').textContent = newMode === CONFIG.MODES.STANDARD ? 'BASIC ARITHMETIC ENGINE' : '64-BIT MULTI-BASE ENGINE + BITWISE_MOD';

    setupKeypad();
    updateUI();
}

function setupKeypad() {
    const keypad = document.getElementById('keypad');
    keypad.innerHTML = '';

    // Set grid columns
    keypad.className = STATE.mode === CONFIG.MODES.PROGRAMMER
        ? 'grid grid-cols-6 gap-2'
        : 'grid grid-cols-4 gap-2';

    const keys = KEYPADS[STATE.mode];

    keys.forEach(key => {
        if (key.type === 'spacer') {
            const spacer = document.createElement('div');
            if (key.span) spacer.style.gridColumn = `span ${key.span}`;
            keypad.appendChild(spacer);
            return;
        }

        const btn = document.createElement('button');

        // Base classes
        let classes = 'aspect-square font-pixel text-xl border-b-4 border-black/50 active:border-b-0 active:translate-y-1 rounded-sm transition-colors flex items-center justify-center';

        // Specific styling
        if (key.class) {
            classes += ` ${key.class}`;
        } else if (key.type === 'hex') {
            classes += ' bg-border-dark text-white hover:bg-border-dark/80';
        } else if (key.type === 'number') {
            classes += ' bg-surface-dark text-white hover:bg-surface-dark/80';
        } else {
            classes += ' bg-border-dark text-text-muted hover:bg-border-dark/80';
        }

        // Span
        if (key.span) btn.classList.add(`col-span-${key.span}`);
        if (key.span === 2 && STATE.mode === CONFIG.MODES.STANDARD) btn.classList.replace('aspect-square', 'aspect-[2/1]');

        btn.className = classes;
        btn.textContent = key.label || key.value;

        // Disable dot in hex/prog mode mostly
        if (key.disabled && STATE.mode === CONFIG.MODES.PROGRAMMER) {
            btn.onclick = (e) => e.preventDefault();
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btn.onclick = () => handleInput(key.value, key.type);
        }

        keypad.appendChild(btn);
    });
}

function setupBitwiseOps() {
    const ops = document.querySelectorAll('.calc-btn'); // using custom class I added in HTML
    ops.forEach(btn => {
        btn.addEventListener('click', () => {
            const op = btn.getAttribute('data-op');
            handleInput(op, 'bitwise');
        });
    });
}

function setupBaseSwitching() {
    const bases = document.querySelectorAll('[data-base]');
    bases.forEach(el => {
        el.addEventListener('click', () => {
            const base = el.getAttribute('data-base');
            STATE.base = base;

            // UI Update
            bases.forEach(b => b.classList.remove('active-base'));
            el.classList.add('active-base');

            updateUI();
        });
    });
}

function setupWordSizeSwitching() {
    const btns = document.querySelectorAll('[data-bits]');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            STATE.bits = parseInt(btn.getAttribute('data-bits'));

            // UI Update
            document.querySelectorAll('[data-bits]').forEach(b => {
                b.className = 'flex-1 py-1 px-2 bg-surface-dark text-text-muted text-[9px] font-mono font-bold border-b-2 border-black/40';
            });
            btn.className = 'flex-1 py-1 px-2 bg-primary text-white text-[9px] font-mono font-bold border-b-2 border-black/40';

            updateUI();
            generateBitVisualizer();
        });
    });
}

// ----------------------------------------------------
// LOGIC HANDLER
// ----------------------------------------------------

function handleInput(value, type) {
    if (type === 'number' || type === 'hex') {
        inputDigit(value);
    } else if (type === 'operator') {
        handleOperator(value);
    } else if (type === 'action') {
        if (value === 'AC') resetCalculator();
        if (value === 'DEL') deleteDigit();
        if (value === '=') performCalculation();
    } else if (type === 'bitwise') {
        handleBitwise(value);
    }
    updateUI();
}

function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = STATE;

    // Validate Input for current base
    if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
        if (STATE.base === 'BIN' && !['0', '1'].includes(digit)) return;
        if (STATE.base === 'OCT' && !['0', '1', '2', '3', '4', '5', '6', '7'].includes(digit)) return;
        if (STATE.base === 'DEC' && !/[0-9]/.test(digit)) return;
    }

    if (waitingForSecondOperand) {
        STATE.displayValue = digit;
        STATE.waitingForSecondOperand = false;
    } else {
        STATE.displayValue = displayValue === '0' ? digit : displayValue + digit;
    }

    // Max constraints
    if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
        // Cap at 64 bit unsigned max effectively
        // Could parse and check
    }
}

function handleOperator(nextOperator) {
    const inputValue = STATE.mode === CONFIG.MODES.PROGRAMMER
        ? BigInt(parseCurrentValue())
        : parseFloat(STATE.displayValue);

    if (STATE.operator && STATE.waitingForSecondOperand) {
        STATE.operator = nextOperator;
        return;
    }

    if (STATE.firstOperand == null && !isNaN(inputValue)) { // loosely check
        STATE.firstOperand = inputValue;
    } else if (STATE.operator) {
        const result = performMath(STATE.firstOperand, inputValue, STATE.operator);
        STATE.displayValue = String(result);
        STATE.firstOperand = result;
    }

    STATE.waitingForSecondOperand = true;
    STATE.operator = nextOperator;
    STATE.expression = `${STATE.firstOperand} ${nextOperator}`; // Simplified expression
}

function performMath(first, second, op) {
    if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
        // BigInt Ops
        const a = BigInt(first);
        const b = BigInt(second);
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b === 0n ? 0n : a / b;
            case 'MOD': return a % b;
            default: return b;
        }
    } else {
        // Standard
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return first / second;
            default: return second;
        }
    }
}

function handleBitwise(op) {
    if (STATE.mode !== CONFIG.MODES.PROGRAMMER) return;

    // Bitwise usually acts immediately on current val or waits?
    // Standards: AND/OR/XOR are binary operators (require 2 operands).
    // NOT is unary. LSH/RSH are binary usually (val << shift).

    const val = BigInt(parseCurrentValue());

    if (op === 'NOT') {
        // Unary
        const mask = (1n << BigInt(STATE.bits)) - 1n;
        const res = (~val) & mask;
        STATE.displayValue = res.toString(getBaseRadix());
        STATE.waitingForSecondOperand = true; // reset next input
        return;
    }

    // Binary bitwise
    handleOperator(op); // Treat as standard operator logic but with custom eval
}

function performCalculation() {
    if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
        // Special handle for bitwise in the performMath function if I extended it?
        // Actually performMath needs to handle the bitwise string operators or I need a new function.
        // Let's patch handleOperator to store them, and here we eval.

        let displayVal = STATE.displayValue;
        let second = BigInt(parseCurrentValue());

        if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'LSH', 'RSH'].includes(STATE.operator)) {
            const first = STATE.firstOperand;
            let res = 0n;
            const mask = (1n << BigInt(STATE.bits)) - 1n;

            switch (STATE.operator) {
                case 'AND': res = first & second; break;
                case 'OR': res = first | second; break;
                case 'XOR': res = first ^ second; break;
                case 'NAND': res = ~(first & second); break;
                case 'NOR': res = ~(first | second); break;
                case 'LSH': res = first << second; break;
                case 'RSH': res = first >> second; break;
            }
            res = res & mask; // constrain to bits

            STATE.displayValue = res.toString(getBaseRadix()).toUpperCase();
            STATE.firstOperand = res;
            STATE.operator = null;
            STATE.waitingForSecondOperand = true;
            STATE.expression = '';
            updateUI();
            return;
        }
    }

    // Fallback to standard math logic which is already partially hooked in operator
    handleOperator('='); // triggers calc in the handleOperator logic
}


function resetCalculator() {
    STATE.displayValue = '0';
    STATE.firstOperand = null;
    STATE.waitingForSecondOperand = false;
    STATE.operator = null;
    STATE.expression = '';
    updateUI();
}

function deleteDigit() {
    STATE.displayValue = STATE.displayValue.slice(0, -1);
    if (STATE.displayValue === '') STATE.displayValue = '0';
    updateUI();
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------

function parseCurrentValue() {
    // Parser based on base
    const radix = getBaseRadix();
    try {
        if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
            // For hex, remove 0x if present? Display value usually raw
            return parseInt(STATE.displayValue, radix); // Standard JS limits.
            // Wait, for 64-bit we need BigInt parsing.
            // BigInt doesn't take radix!!!
            // We must add '0x' for hex, '0o' for oct, '0b' for bin.
            let val = STATE.displayValue;
            if (STATE.base === 'HEX') return BigInt('0x' + val);
            if (STATE.base === 'OCT') return BigInt('0o' + val);
            if (STATE.base === 'BIN') return BigInt('0b' + val);
            return BigInt(val);
        }
        return parseFloat(STATE.displayValue);
    } catch (e) {
        return 0;
    }
}

function getBaseRadix() {
    if (STATE.base === 'HEX') return 16;
    if (STATE.base === 'OCT') return 8;
    if (STATE.base === 'BIN') return 2;
    return 10;
}

function formatDisplay(value) {
    // Add commas or spacing
    return value;
}

function updateUI() {
    const display = document.getElementById('calc-display');
    const expression = document.getElementById('calc-expression');

    display.textContent = STATE.displayValue;
    expression.textContent = STATE.expression || (STATE.mode === CONFIG.MODES.PROGRAMMER ? 'READY' : '');

    // Programmer specific updates
    if (STATE.mode === CONFIG.MODES.PROGRAMMER) {
        updateBaseRefDisplays();
        generateBitVisualizer(); // Update bits based on value
    }
}

function updateBaseRefDisplays() {
    let val = 0n;
    try {
        val = BigInt(parseCurrentValue());
    } catch (e) { }

    // Mask value to bit size
    const mask = (1n << BigInt(STATE.bits)) - 1n;
    val = val & mask;

    document.getElementById('hex-display').textContent = val.toString(16).toUpperCase();
    document.getElementById('dec-display').textContent = val.toString(10);
    document.getElementById('oct-display').textContent = val.toString(8);

    // Bin formatting with spaces
    let bin = val.toString(2);
    // Pad
    const totalBits = STATE.bits;
    bin = bin.padStart(totalBits, '0');
    // Add spaces every 8 bits?
    document.getElementById('bin-display').textContent = bin.match(/.{1,8}/g)?.join(' ') || bin;
}

function generateBitVisualizer() {
    const container = document.getElementById('bit-grid');
    if (!container || STATE.mode !== CONFIG.MODES.PROGRAMMER) return;

    container.innerHTML = '';

    let val = 0n;
    try {
        val = BigInt(parseCurrentValue());
    } catch (e) { }

    const totalBits = STATE.bits; // 64, 32...

    // We want to show rows of bits. 
    // Usually 32 bits is fine. 64 bits might be too large for UI.
    // Let's show max 32 bits or just scroll? 
    // The user visualizer showed ~32 bits.
    // If 64, we might need smaller blocks.

    // Render in groups of 4 or 8
    for (let i = totalBits - 1; i >= 0; i--) {
        const bitVal = (val >> BigInt(i)) & 1n;
        const btn = document.createElement('button');

        // Styling matches user snippet
        if (bitVal === 1n) {
            btn.className = 'size-7 bg-lcd-purple/30 border border-lcd-purple bit-glow flex items-center justify-center font-pixel text-lg text-white mb-1 mr-0.5';
        } else {
            btn.className = 'size-7 bg-surface-dark border border-border-dark flex items-center justify-center font-pixel text-lg text-text-muted hover:border-primary/50 mb-1 mr-0.5';
        }

        btn.textContent = bitVal.toString();

        // Interactive Toggle
        btn.onclick = () => {
            toggleBit(i);
        };

        container.appendChild(btn);

        // Spacer every 4 or 8 bits
        if (i % 8 === 0 && i !== 0) {
            const spacer = document.createElement('div');
            spacer.className = 'w-2';
            container.appendChild(spacer);
        }
    }
}

function toggleBit(index) {
    let val = 0n;
    try {
        val = BigInt(parseCurrentValue());
    } catch (e) { }

    // Toggle
    const bitMask = 1n << BigInt(index);
    val = val ^ bitMask;

    // Update State
    STATE.displayValue = val.toString(getBaseRadix()).toUpperCase();
    updateUI();
}

// Global exposure for debugging
window.CALC = STATE;
