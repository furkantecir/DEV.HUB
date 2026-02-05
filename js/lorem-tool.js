document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const typeButtons = document.querySelectorAll('.type-btn');
    const quantityInput = document.getElementById('quantity');
    const increaseBtn = document.getElementById('increase-btn');
    const decreaseBtn = document.getElementById('decrease-btn');
    const generateBtn = document.getElementById('generate-btn');
    const outputContent = document.getElementById('output-content');
    const copyBtn = document.getElementById('copy-btn');
    const statsText = document.getElementById('stats');
    const startWithLoremCheckbox = document.getElementById('lorem-start');
    const statusText = document.getElementById('status-text');

    // --- State ---
    let currentType = 'paragraphs'; // paragraphs, sentences, words

    // --- Dictionary ---
    const words = [
        "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
        "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
        "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
        "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
        "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
        "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
        "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
        "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
        "est", "laborum", "curabitur", "pretium", "tincidunt", "lacus", "nulla", "gravida",
        "orci", "a", "odio", "nullam", "varius", "turpis", "et", "commodo", "pharetra",
        "est", "eros", "bibendum", "elit", "nec", "luctus", "magna", "felis", "sollicitudin",
        "mauris", "integer", "in", "mauris", "eu", "nibh", "euismod", "gravida", "duis",
        "ac", "tellus", "et", "risus", "vulputate", "vehicula", "donec", "lobortis",
        "risus", "a", "elit", "etiam", "tempor", "ut", "ullamcorper", "ligula", "eu",
        "tempor", "congue", "eros", "est", "euismod", "turpis", "id", "tincidunt",
        "sapien", "risus", "a", "quam", "maecenas", "fermentum", "consequat", "mi",
        "donec", "elementum", "nulla", "quis", "varius", "sit", "amet", "feugiat",
        "eu", "elementum", "id", "enim", "sed", "id", "eros", "non", "velit", "adipiscing"
    ];

    // --- Helpers ---
    const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const generateSentence = (minLength = 8, maxLength = 15) => {
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let sentence = [];
        for (let i = 0; i < length; i++) {
            sentence.push(getRandomWord());
        }
        return capitalize(sentence.join(" ")) + ".";
    };

    const generateParagraph = (minSentences = 5, maxSentences = 8) => {
        const length = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
        let paragraph = [];
        for (let i = 0; i < length; i++) {
            paragraph.push(generateSentence());
        }
        return paragraph.join(" ");
    };

    // --- Generation Logic ---
    const generate = () => {
        const qty = parseInt(quantityInput.value) || 5;
        let output = "";
        let rawText = "";

        if (currentType === 'paragraphs') {
            let paragraphs = [];
            for (let i = 0; i < qty; i++) {
                paragraphs.push(generateParagraph());
            }

            // Handle Start With Lorem logic
            if (startWithLoremCheckbox.checked && paragraphs.length > 0) {
                const prefix = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
                paragraphs[0] = prefix + paragraphs[0].charAt(0).toLowerCase() + paragraphs[0].slice(1);
            }

            output = paragraphs.map(p => `<p>${p}</p>`).join("");
            rawText = paragraphs.join("\n\n");

        } else if (currentType === 'sentences') {
            let sentences = [];
            for (let i = 0; i < qty; i++) {
                sentences.push(generateSentence());
            }

            if (startWithLoremCheckbox.checked && sentences.length > 0) {
                const prefix = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
                sentences[0] = prefix;
            }

            output = `<p>${sentences.join(" ")}</p>`;
            rawText = sentences.join(" ");

        } else if (currentType === 'words') {
            let w = [];
            for (let i = 0; i < qty; i++) {
                w.push(getRandomWord());
            }

            if (startWithLoremCheckbox.checked) {
                const start = ["lorem", "ipsum", "dolor", "sit", "amet"];
                if (qty >= 5) {
                    for (let i = 0; i < 5; i++) w[i] = start[i];
                } else {
                    w = start.slice(0, qty);
                }
            }

            output = `<p>${w.join(" ")}</p>`;
            rawText = w.join(" ");
        }

        outputContent.innerHTML = output;

        // Update stats
        const wordCount = rawText.split(/\s+/).filter(x => x).length;
        statsText.innerText = `Stats: ${qty} ${currentType} | ${wordCount} Words`;

        statusText.innerText = "RENDER_COMPLETE";
        setTimeout(() => { statusText.innerText = "READY_TO_RENDER"; }, 2000);
    };

    // --- UI Logic ---

    // Type Selection
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State UI
            typeButtons.forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white', 'border-white/20');
                b.classList.add('bg-background-dark', 'text-gray-400', 'border-border-dark');
                b.querySelector('span').innerText = 'radio_button_unchecked';
            });
            btn.classList.add('active', 'bg-primary', 'text-white', 'border-white/20');
            btn.classList.remove('bg-background-dark', 'text-gray-400', 'border-border-dark');
            btn.querySelector('span').innerText = 'radio_button_checked';

            currentType = btn.dataset.type;

            // Auto generate when type changes for immediate feedback
            generate();
        });
    });

    // Quantity Logic
    increaseBtn.addEventListener('click', () => {
        let val = parseInt(quantityInput.value) || 0;
        if (val < 99) {
            quantityInput.value = val + 1;
            // Optional: Auto generate on quantity change too
            // generate(); 
        }
    });

    decreaseBtn.addEventListener('click', () => {
        let val = parseInt(quantityInput.value) || 0;
        if (val > 1) {
            quantityInput.value = val - 1;
            // Optional: Auto generate on quantity change too
            // generate();
        }
    });

    generateBtn.addEventListener('click', generate);

    // Initial Generate
    generate();

    // Copy Logic
    copyBtn.addEventListener('click', () => {
        const textToCopy = outputContent.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalContent = copyBtn.innerHTML;
            copyBtn.innerHTML = `<span class="material-symbols-outlined text-base">check</span> COPIED`;
            statusText.innerText = "COPIED_TO_CLIPBOARD";

            setTimeout(() => {
                copyBtn.innerHTML = originalContent;
                statusText.innerText = "READY_TO_RENDER";
            }, 2000);
        });
    });

});
