document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const filenameTag = document.getElementById('filename-tag');

    // File Info Panel
    const fileSizeEl = document.getElementById('file-size');
    const fileFormatEl = document.getElementById('file-format');
    const fileResEl = document.getElementById('file-resolution');

    // Metadata Table
    const metadataTbody = document.getElementById('metadata-tbody');
    const tagCountBadge = document.getElementById('tag-count-badge');
    const privacyLog = document.getElementById('privacy-log');

    // Buttons
    const stripBtn = document.getElementById('strip-btn');
    const addFakeBtn = document.getElementById('add-fake-btn');

    // State
    let currentFile = null;

    // --- Helpers ---

    function log(msg, type = 'info') {
        const time = new Date().toLocaleTimeString([], { hour12: false });
        const div = document.createElement('div');
        div.className = 'flex gap-2';

        let colorClass = 'text-green-500';
        if (type === 'danger') colorClass = 'text-red-400';
        if (type === 'warning') colorClass = 'text-yellow-400';
        if (type === 'info') colorClass = 'text-gray-400';

        div.innerHTML = `
            <span class="text-gray-600">[${time}]</span>
            <span class="${colorClass}">${msg}</span>
        `;
        privacyLog.appendChild(div);
        privacyLog.scrollTop = privacyLog.scrollHeight;
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- Core Logic ---

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Lütfen geçerli bir resim dosyası yükleyin (JPG, PNG).');
            return;
        }

        currentFile = file;

        // 1. Update UI Basics
        filenameTag.innerText = file.name;
        filenameTag.classList.remove('hidden');
        fileSizeEl.innerText = formatBytes(file.size);
        fileFormatEl.innerText = file.type.split('/')[1].toUpperCase();

        // 2. Preview Image
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');

            // Get Resolutions
            const img = new Image();
            img.onload = () => {
                fileResEl.innerText = `${img.width} x ${img.height}`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        log(`Dosya yüklendi: ${file.name}`);

        // 3. Scan Metadata
        scanMetadata(file);
    }

    function scanMetadata(file) {
        metadataTbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-primary animate-pulse">EXIF verileri taranıyor...</td></tr>';

        // Disable strip button initially
        stripBtn.disabled = true;
        stripBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Use EXIF-JS
        EXIF.getData(file, function () {
            const allTags = EXIF.getAllTags(this);
            const sensitiveTags = ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal', 'Make', 'Model', 'Software', 'Artist', 'Copyright'];
            let rowHtml = '';
            let count = 0;
            let sensitiveCount = 0;

            if (Object.keys(allTags).length === 0) {
                metadataTbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="p-8 text-left">
                            <div class="flex flex-col items-center justify-center gap-3 text-gray-400">
                                <span class="material-symbols-outlined text-4xl text-green-400">gpp_good</span>
                                <p class="text-green-400 font-bold text-lg">HİÇBİR META VERİ TESPİT EDİLMEDİ</p>
                                <p class="text-center text-sm max-w-md">
                                    Bu görüntü zaten temiz. Eğer bu fotoğrafı 
                                    <span class="text-white">WhatsApp, Facebook, Twitter veya Instagram</span> 
                                    üzerinden bilgisayarınıza aktardıysanız, bu platformlar otomatik olarak tüm EXIF verilerini siler.
                                </p>
                                <p class="text-xs text-gray-500 mt-2">Test etmek için "TEST VERİSİ EKLE" butonuna basabilir veya USB ile orijinal bir dosya yükleyebilirsiniz.</p>
                            </div>
                        </td>
                    </tr>`;
                tagCountBadge.innerText = 'TEMİZ';
                log('Tarama tamamlandı. Metadata bulunamadı (WhatsApp vb. temizlemiş olabilir).', 'green');
                return;
            }

            // Enable strip button
            stripBtn.disabled = false;
            stripBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            for (let tag in allTags) {
                if (tag === 'MakerNote' || tag === 'UserComment' || tag === 'ExifVersion' || tag === 'FlashpixVersion') continue;

                let value = allTags[tag];
                if (typeof value === 'object') {
                    if (value instanceof Number) value = value.toString();
                    else try { value = JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : ''); } catch (e) { value = '[Binary Veri]'; }
                }

                let statusBadge = '<span class="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 border border-gray-600">BİLGİ</span>';

                if (sensitiveTags.includes(tag) || tag.includes('GPS')) {
                    statusBadge = '<span class="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 border border-red-500/20">HASSAS</span>';
                    sensitiveCount++;
                } else if (tag === 'Make' || tag === 'Model' || tag === 'LensModel') {
                    statusBadge = '<span class="text-xs bg-yellow-900/30 text-yellow-500 px-2 py-0.5 border border-yellow-500/20">KİMLİK</span>';
                }

                rowHtml += `
                    <tr class="border-b border-border-dark/50 hover:bg-white/5 transition-colors">
                        <td class="p-4 text-primary font-bold font-mono">${tag}</td>
                        <td class="p-4 italic text-gray-300 break-all">${value}</td>
                        <td class="p-4">${statusBadge}</td>
                    </tr>
                `;
                count++;
            }

            metadataTbody.innerHTML = rowHtml;
            tagCountBadge.innerText = `${count} ETİKET BULUNDU`;

            if (sensitiveCount > 0) {
                log(`UYARI: ${sensitiveCount} adet hassas gizlilik etiketi bulundu (GPS/Cihaz).`, 'danger');
            } else {
                log(`Tarama tamamlandı. ${count} standart etiket bulundu.`, 'info');
            }
            log('Temizleme için hazır.', 'warning');
        });
    }

    function stripMetadata() {
        if (!currentFile) return;

        log('Temizleme işlemi başlatılıyor...', 'warning');

        const reader = new FileReader();
        reader.readAsDataURL(currentFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const targetFormat = currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg';

                canvas.toBlob((blob) => {
                    log('Meta veriler başarıyla silindi. Dosya yeniden oluşturuldu.', 'green');

                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    const parts = currentFile.name.split('.');
                    const ext = parts.pop();
                    const name = parts.join('.');
                    link.download = `${name}_CLEAN.${ext}`;

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    log('Temiz dosya otomatik olarak indirildi.', 'info');

                    metadataTbody.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-green-400">İndirilen dosya tamamen temiz! (Doğrulamak için tekrar yükleyebilirsiniz) <br/><span class="text-xs text-gray-500">Not: Bilgisayarınıza kaydedilen dosya temizdir. Buradaki önizleme orijinal halidir.</span></td></tr>';
                    tagCountBadge.innerText = 'TEMİZLENDİ';

                }, targetFormat, 0.95);
            };
        };
    }

    // Fake Data Logic for Testing
    addFakeBtn.addEventListener('click', () => {
        if (!currentFile) {
            alert("Önce bir resim yükleyin!");
            return;
        }

        log('TEST MODU: Sahte EXIF verileri simüle ediliyor...', 'warning');

        // Manually inject rows
        const fakeData = [
            { tag: 'Make', val: 'Apple', type: 'KİMLİK', color: 'yellow' },
            { tag: 'Model', val: 'iPhone 15 Pro Max', type: 'KİMLİK', color: 'yellow' },
            { tag: 'DateTimeOriginal', val: '2024:02:03 20:25:10', type: 'HASSAS', color: 'red' },
            { tag: 'GPSLatitude', val: '41 deg 0\' 54.00" N', type: 'HASSAS', color: 'red' },
            { tag: 'GPSLongitude', val: '28 deg 57\' 18.00" E', type: 'HASSAS', color: 'red' },
            { tag: 'Software', val: 'Adobe Photoshop 2024', type: 'BİLGİ', color: 'gray' }
        ];

        let rowHtml = '';
        fakeData.forEach(item => {
            let badgeClass = '';
            if (item.color === 'red') badgeClass = 'bg-red-900/30 text-red-400 border-red-500/20';
            else if (item.color === 'yellow') badgeClass = 'bg-yellow-900/30 text-yellow-500 border-yellow-500/20';
            else badgeClass = 'bg-gray-700 text-gray-400 border-gray-600';

            rowHtml += `
                <tr class="border-b border-border-dark/50 hover:bg-white/5 transition-colors animate-pulse bg-red-900/10">
                    <td class="p-4 text-primary font-bold font-mono">${item.tag} <span class="text-[10px] text-gray-500">(TEST)</span></td>
                    <td class="p-4 italic text-gray-300 break-all">${item.val}</td>
                    <td class="p-4"><span class="text-xs px-2 py-0.5 border ${badgeClass}">${item.type}</span></td>
                </tr>
            `;
        });

        metadataTbody.innerHTML = rowHtml;
        tagCountBadge.innerText = '6 TEST ETİKETİ';

        // Enable strip button
        stripBtn.disabled = false;
        stripBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        log('UYARI: Sahte hassas veriler eklendi. "SİL" butonunu deneyebilirsiniz.', 'danger');
    });


    // --- Events ---
    previewContainer.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    document.body.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) handleFile(files[0]);
    });

    stripBtn.addEventListener('click', stripMetadata);
});
