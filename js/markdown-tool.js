document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const input = document.getElementById('markdown-input');
    const preview = document.getElementById('markdown-preview');
    const btnCopyHtml = document.getElementById('copy-html-btn');
    const btnExportPdf = document.getElementById('export-pdf-btn');

    // Configure marked options (optional for security or flavor)
    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: false,
        mangle: false,
        sanitize: false // We trust local user input for this tool
    });

    // Render logic
    const renderMarkdown = () => {
        const markdownText = input.value;
        const htmlContent = marked.parse(markdownText);
        preview.innerHTML = htmlContent;
    };

    // Initial Render
    renderMarkdown();

    // Event Listener for typing
    input.addEventListener('input', renderMarkdown);

    // Sync Scroll (Basic)
    let isScrolling = false;

    const syncScroll = (source, target) => {
        if (!isScrolling) {
            isScrolling = true;
            const percentage = source.scrollTop / (source.scrollHeight - source.clientHeight);
            target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
            setTimeout(() => { isScrolling = false; }, 50);
        }
    };

    input.addEventListener('scroll', () => syncScroll(input, preview));
    preview.addEventListener('scroll', () => syncScroll(preview, input));


    // Copy HTML Logic
    btnCopyHtml.addEventListener('click', () => {
        const html = preview.innerHTML;
        navigator.clipboard.writeText(html).then(() => {
            const originalText = btnCopyHtml.innerHTML;
            btnCopyHtml.innerHTML = `<span class="material-symbols-outlined text-[20px]">check</span><span class="font-bold text-xs tracking-wide uppercase">Copied</span>`;
            setTimeout(() => {
                btnCopyHtml.innerHTML = originalText;
            }, 2000);
        });
    });

    // Export PDF Logic (Simulated with Print as easiest local solution without heavy libraries)
    btnExportPdf.addEventListener('click', () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Markdown Export</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; }
                        h1, h2, h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                        blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; }
                        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    ${preview.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    });
});
