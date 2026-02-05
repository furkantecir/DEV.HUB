document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const sqlInput = document.getElementById('sql-input');
    const sqlOutput = document.getElementById('sql-output');

    const dialectSelect = document.getElementById('sql-dialect');
    const indentSelect = document.getElementById('indent-size');

    const beautifyBtn = document.getElementById('beautify-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const copyBtn = document.getElementById('copy-btn');

    const inputStats = document.getElementById('input-stats');
    const execTimeStat = document.getElementById('exec-time');
    const sizeStat = document.getElementById('size-stat');
    const dialectStat = document.getElementById('dialect-stat');

    // --- Logic ---

    // Initial dummy content
    const initialSQL = `SELECT u.id, u.username, p.title AS post_title, COUNT(c.id) AS comment_count FROM users u LEFT JOIN posts p ON u.id = p.author_id LEFT JOIN comments c ON p.id = c.post_id WHERE u.active = TRUE AND p.created_at > '2023-01-01' GROUP BY u.id, p.id ORDER BY comment_count DESC LIMIT 10;`;

    // Only set if functionality is available via library
    const formatSQL = (shouldMinify = false) => {
        const raw = sqlInput.value;
        if (!raw.trim()) {
            sqlOutput.innerHTML = '<span class="text-gray-600 italic">Waiting for input...</span>';
            return;
        }

        const startTime = performance.now();

        // Check if library loaded
        if (typeof sqlFormatter === 'undefined') {
            sqlOutput.innerText = "Error: SQL Formatter library not loaded. Check internet connection.";
            return;
        }

        try {
            const dialect = dialectSelect.value;
            const indentVal = indentSelect.value === 'tab' ? '\t' : ' '.repeat(parseInt(indentSelect.value));

            let formatted = '';

            if (shouldMinify) {
                // Simple regex based minification for demo purpose as library might only behave one way
                // Or we could try to format with 0 indent? Library usually adds newlines.
                // Let's just strip newlines and excessive spaces for "minify"
                formatted = raw.replace(/\s+/g, ' ').trim();
            } else {
                formatted = sqlFormatter.format(raw, {
                    language: dialect,
                    indent: indentVal,
                    uppercase: true // force uppercase keywords
                });
            }

            // Syntax Highlighting (Simple Implementation)
            const highlighted = highlightSQL(formatted);
            sqlOutput.innerHTML = highlighted;

            const endTime = performance.now();
            updateStats(startTime, endTime, formatted);

        } catch (e) {
            sqlOutput.innerText = "Error formatting SQL: \n" + e.message;
        }
    };

    // Simple RegEx based highlighter for visual effect
    const highlightSQL = (sql) => {
        // Keywords
        const keywords = /\b(SELECT|FROM|WHERE|AND|OR|LEFT|RIGHT|INNER|OUTER|JOIN|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|AS|ASC|DESC|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|IS|NULL|NOT|TRUE|FALSE)\b/gi;

        let html = sql
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escape HTML first

        // Strings
        html = html.replace(/'([^']*)'/g, '<span class="syntax-string">\'$1\'</span>');

        // Keywords
        html = html.replace(keywords, match => `<span class="syntax-keyword">${match.toUpperCase()}</span>`);

        // Functions (basic lookup)
        html = html.replace(/\b(COUNT|SUM|AVG|MAX|MIN|COALESCE|NOW|DATE|CONCAT)\b/gi, match => `<span class="syntax-function">${match.toUpperCase()}</span>`);

        // Comments
        html = html.replace(/(--.*)/g, '<span class="syntax-comment">$1</span>');

        return html;
    };

    // Stats Updater
    const updateStats = (start, end, content) => {
        execTimeStat.innerText = `EXECUTION: ${(end - start).toFixed(3)}ms`;
        const bytes = new Blob([content]).size;
        sizeStat.innerText = `SIZE: ${(bytes / 1024).toFixed(2)} KB`;
        dialectStat.innerText = `DIALECT: ${dialectSelect.options[dialectSelect.selectedIndex].text.toUpperCase()}`;
    };

    // Line/Col tracking
    sqlInput.addEventListener('keyup', () => {
        const val = sqlInput.value;
        const line = val.substr(0, sqlInput.selectionStart).split("\n").length;
        const col = sqlInput.selectionStart - val.lastIndexOf("\n", sqlInput.selectionStart - 1);
        inputStats.innerText = `UTF-8 // LINE ${line}, COL ${col}`;
    });

    // --- Events ---
    beautifyBtn.addEventListener('click', () => formatSQL(false));
    minifyBtn.addEventListener('click', () => formatSQL(true));

    copyBtn.addEventListener('click', () => {
        const textToCopy = sqlOutput.innerText; // Get raw text without HTML tags
        navigator.clipboard.writeText(textToCopy).then(() => {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = `<span class="material-symbols-outlined text-xl">check</span> COPIED!`;
            setTimeout(() => { copyBtn.innerHTML = original; }, 2000);
        });
    });

    // Init
    sqlInput.value = initialSQL;
    formatSQL();
});
