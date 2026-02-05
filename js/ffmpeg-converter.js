// FFmpeg.wasm Converter - Vanilla JavaScript
// Converted from TypeScript for browser use

let ffmpegInstance = null;
let isLoading = false;
let isLoaded = false;

/**
 * Get or initialize FFmpeg instance
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} FFmpeg instance
 */
export const getFFmpeg = async (onProgress) => {
    if (ffmpegInstance && isLoaded) {
        return ffmpegInstance;
    }

    if (isLoading) {
        // Wait for the current loading to finish
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return ffmpegInstance;
    }

    isLoading = true;

    try {
        if (onProgress) onProgress('Loading FFmpeg core...');

        // Import FFmpeg dynamically
        const { FFmpeg } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
        const { fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');

        ffmpegInstance = new FFmpeg();

        // Set up event listeners
        ffmpegInstance.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
            if (onProgress) {
                onProgress(message);
            }
        });

        ffmpegInstance.on('progress', ({ progress, time }) => {
            const percent = Math.round(progress * 100);
            const message = `Progress: ${percent}% (time: ${(time / 1000000).toFixed(2)}s)`;
            console.log('[FFmpeg]', message);
            if (onProgress) {
                onProgress(message);
            }
        });

        // Try multiple CDN sources as fallback
        const cdnSources = [
            'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd',
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.12.6/dist/umd',
            'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        ];

        let loaded = false;
        let lastError = null;

        for (const baseURL of cdnSources) {
            try {
                const cdnName = baseURL.split('/')[2];
                if (onProgress) onProgress(`Trying CDN: ${cdnName}...`);

                await ffmpegInstance.load({
                    coreURL: `${baseURL}/ffmpeg-core.js`,
                    wasmURL: `${baseURL}/ffmpeg-core.wasm`,
                });

                loaded = true;
                break;
            } catch (error) {
                lastError = error;
                console.warn(`Failed to load from ${baseURL}:`, error);
                continue;
            }
        }

        if (!loaded) {
            throw lastError || new Error('Failed to load FFmpeg from all CDN sources');
        }

        isLoaded = true;
        if (onProgress) onProgress('FFmpeg loaded successfully!');
    } catch (error) {
        isLoading = false;
        isLoaded = false;
        if (onProgress) onProgress(`Failed to load FFmpeg: ${error.message}`);
        throw new Error(`FFmpeg initialization failed: ${error.message}`);
    }

    isLoading = false;
    return ffmpegInstance;
};

/**
 * Convert file using FFmpeg
 * @param {File} file - Input file
 * @param {string} outputFormat - Output format (mp3, wav, mp4, etc.)
 * @param {string} codec - Optional codec
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob>} Converted file as Blob
 */
export const convertFile = async (file, outputFormat, codec, onProgress) => {
    const { fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/dist/esm/index.js');
    const ffmpeg = await getFFmpeg(onProgress);

    const inputFileName = `input.${file.name.split('.').pop()}`;
    const outputFileName = `output.${outputFormat}`;

    try {
        if (onProgress) onProgress(`Reading file: ${file.name}`);

        // Write input file to FFmpeg's virtual file system
        const fileData = await fetchFile(file);
        await ffmpeg.writeFile(inputFileName, fileData);

        if (onProgress) onProgress(`Converting to ${outputFormat.toUpperCase()}...`);

        // Build FFmpeg command
        const args = ['-i', inputFileName];

        // Audio formats
        const audioFormats = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'];

        if (codec) {
            if (audioFormats.includes(outputFormat)) {
                args.push('-acodec', codec);
            } else {
                // For video files
                args.push('-c:v', codec);
                args.push('-c:a', 'aac'); // Use AAC for audio in video files
            }
        }

        args.push(outputFileName);

        console.log('[FFmpeg] Command:', args.join(' '));

        // Execute conversion
        await ffmpeg.exec(args);

        if (onProgress) onProgress('Reading converted file...');

        // Read the output file
        const data = await ffmpeg.readFile(outputFileName);

        // Clean up
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        if (onProgress) onProgress('Conversion complete!');

        // Determine MIME type
        const mimeTypes = {
            // Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'm4a': 'audio/mp4',
            // Video
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'mkv': 'video/x-matroska'
        };

        const mimeType = mimeTypes[outputFormat] || 'application/octet-stream';

        // Return as Blob
        const buffer = data instanceof Uint8Array ? data.buffer : data;
        return new Blob([buffer], { type: mimeType });
    } catch (error) {
        if (onProgress) onProgress(`Error: ${error.message}`);
        throw error;
    }
};

/**
 * Check if FFmpeg is loaded
 * @returns {boolean}
 */
export const isFFmpegLoaded = () => {
    return isLoaded;
};
