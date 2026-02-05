document.addEventListener('DOMContentLoaded', () => {
    // Select elements
    const dropZone = document.querySelector('section[aria-label="Upload Zone"] > div');
    const fileInput = dropZone.querySelector('input[type="file"]');
    const dropTextHeader = dropZone.querySelector('h3');
    const dropTextDesc = dropZone.querySelector('p');
    const cloudIconContainer = dropZone.querySelector('.w-16.h-16'); // Container of the cloud icon

    // Variables to store state
    let selectedFiles = [];

    // --- Helper Functions ---

    function updateDropZoneState(files) {
        if (!files || files.length === 0) return;

        const count = files.length;
        const firstName = files[0].name;

        // Change Border to active color (permanent while file is there)
        dropZone.classList.add('border-primary', 'bg-surface-dark');
        dropZone.classList.remove('border-border-dark', 'bg-surface-dark/50');

        // Update Text
        if (count === 1) {
            dropTextHeader.innerText = "FILE_READY: " + (firstName.length > 20 ? firstName.substring(0, 17) + '...' : firstName);
            dropTextDesc.innerHTML = `<span class="text-green-400">Image successfully loaded. Select a tool below to process.</span>`;
        } else {
            dropTextHeader.innerText = `${count} FILES_READY`;
            dropTextDesc.innerHTML = `<span class="text-green-400">${count} images loaded. Batch processing ready.</span>`;
        }

        // Change Icon to Checkmark or Image
        cloudIconContainer.innerHTML = '<span class="material-symbols-outlined text-4xl text-green-400">check_circle</span>';
        cloudIconContainer.classList.add('border-green-400');

        // Store files for tools to use
        selectedFiles = Array.from(files);

        // Dispatch custom event so other modules can hear it if needed
        const event = new CustomEvent('imagesSelected', { detail: { files: selectedFiles } });
        document.dispatchEvent(event);
    }

    function resetDropZone() {
        dropZone.classList.remove('border-primary', 'bg-surface-dark');
        dropZone.classList.add('border-border-dark', 'bg-surface-dark/50');

        dropTextHeader.innerText = "DROP_IMAGE_HERE";
        dropTextDesc.innerHTML = `Or click to browse. Supports JPG, PNG, WEBP, SVG. <br />
                                <span class="text-primary text-xs mt-2 block opacity-80">Max file size: 25MB (Local Processing)</span>`;

        cloudIconContainer.innerHTML = '<span class="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>';
        cloudIconContainer.classList.remove('border-green-400');

        selectedFiles = [];
    }

    // --- Event Listeners ---

    // 1. File Input Change
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files && fileInput.files.length > 0) {
            updateDropZoneState(fileInput.files);
        }
    });

    // 2. Drag & Drop Visual Feedback
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('border-primary', 'scale-[1.02]');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('scale-[1.02]');
            if (eventName === 'dragleave') {
                // Only remove border if we haven't selected files yet
                if (selectedFiles.length === 0) {
                    dropZone.classList.remove('border-primary');
                }
            }
        }, false);
    });

    // 3. Handle Drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files && files.length > 0) {
            // Check if they are images
            const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

            if (validFiles.length > 0) {
                fileInput.files = files; // Sync input (mostly works in modern browsers)
                updateDropZoneState(validFiles);
            } else {
                alert("Please drop valid image files (JPG, PNG, WEBP, SVG).");
            }
        }
    });


    // --- Tool Buttons Integration ---
    const toolButtons = document.querySelectorAll('button');

    toolButtons.forEach(btn => {
        // Find if this button is a "LAUNCH_TOOL" button
        if (btn.innerText.includes('LAUNCH_TOOL')) {
            btn.addEventListener('click', (e) => {
                const toolCard = btn.closest('.group');
                const toolName = toolCard.querySelector('h4').innerText;

                if (selectedFiles.length === 0) {
                    // Start shake animation
                    dropZone.classList.add('animate-pulse');
                    dropZone.style.borderColor = '#ef4444'; // Red
                    setTimeout(() => {
                        dropZone.classList.remove('animate-pulse');
                        dropZone.style.borderColor = ''; // Reset
                    }, 500);

                    // Allow navigation if user wants to go to tool empty
                    if (confirm("No file selected. Launch tool anyway?")) {
                        if (toolName.includes('Compressor')) window.location.href = 'image-compressor.html';
                        else if (toolName.includes('Converter')) window.location.href = 'image-converter.html';
                        else if (toolName.includes('SVG')) window.location.href = 'svg-optimizer.html';
                        else if (toolName.includes('EXIF')) window.location.href = 'exif-remover.html';
                        else if (toolName.includes('Color')) window.location.href = 'color-picker.html';
                    }
                } else {
                    // Files selected
                    if (toolName.includes('Compressor')) {
                        const file = selectedFiles[0];
                        const reader = new FileReader();
                        reader.onload = function (evt) {
                            try {
                                sessionStorage.setItem('wth_temp_image', evt.target.result);
                                window.location.href = 'image-compressor.html';
                            } catch (err) {
                                // Fallback
                                window.location.href = 'image-compressor.html';
                            }
                        };
                        reader.readAsDataURL(file);
                    } else if (toolName.includes('Converter')) {
                        window.location.href = 'image-converter.html';
                    } else if (toolName.includes('SVG')) {
                        window.location.href = 'svg-optimizer.html';
                    } else if (toolName.includes('EXIF')) {
                        window.location.href = 'exif-remover.html';
                    } else if (toolName.includes('Color')) {
                        window.location.href = 'color-picker.html';
                    } else {
                        alert(`Tool '${toolName}' is under construction.`);
                    }
                }
            });
        }
    });
});
