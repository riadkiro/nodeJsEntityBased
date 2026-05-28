const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { createWorker, OEM, PSM, setLogging } = require('tesseract.js');
const { createCanvas, DOMMatrix, ImageData, Path2D } = require('@napi-rs/canvas');

setLogging(false);

const DEFAULT_LANGUAGE = process.env.OCR_DEFAULT_LANGUAGE || 'fra+eng';
const DEFAULT_MAX_PAGES = clampInt(process.env.OCR_MAX_PAGES, 20, 1, 250);
const DEFAULT_RENDER_SCALE = clampFloat(process.env.OCR_RENDER_SCALE, 2, 1, 3);
const MIN_NATIVE_TEXT_CHARS = clampInt(process.env.OCR_MIN_NATIVE_TEXT_CHARS, 12, 0, 1000);
const OCR_CACHE_PATH = process.env.OCR_CACHE_PATH || path.join(__dirname, '..', 'private_uploads', 'ocr-cache');

const PDF_MIME = 'application/pdf';
const IMAGE_MIME_PREFIX = 'image/';
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.gif']);

let pdfjsPromise = null;

async function extractTextFromFile(filePath, options = {}) {
    if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('Fichier OCR introuvable.');
    }

    const startedAt = Date.now();
    const mimeType = options.mimeType || guessMimeFromExtension(filePath);
    const originalName = options.originalName || path.basename(filePath);
    const language = normalizeLanguage(options.language || DEFAULT_LANGUAGE);
    const mode = normalizeMode(options.mode);
    const maxPages = clampInt(options.maxPages, DEFAULT_MAX_PAGES, 1, 250);
    const renderScale = clampFloat(options.renderScale, DEFAULT_RENDER_SCALE, 1, 3);

    let result;
    if (isPdf(mimeType, originalName)) {
        result = await extractPdfText(filePath, {
            language,
            mode,
            maxPages,
            renderScale
        });
    } else if (isSupportedImage(mimeType, originalName)) {
        result = await extractImageText(filePath, { language });
    } else {
        throw new Error(`Type de fichier non supporté par l'OCR: ${mimeType || originalName}`);
    }

    const text = buildAiText(result.pages);
    const stat = await fsp.stat(filePath);

    return {
        success: true,
        text,
        pages: result.pages,
        meta: {
            originalName,
            mimeType,
            language,
            mode,
            pageCount: result.pageCount,
            processedPages: result.pages.length,
            truncated: Boolean(result.truncated),
            charCount: text.length,
            wordCount: countWords(text),
            fileSize: stat.size,
            elapsedMs: Date.now() - startedAt
        }
    };
}

async function extractImageText(filePath, { language }) {
    const worker = await createOcrWorker(language);
    try {
        const page = await recognizeWithWorker(worker, filePath, 1, 'ocr');
        return {
            pageCount: 1,
            truncated: false,
            pages: [page]
        };
    } finally {
        await worker.terminate();
    }
}

async function extractPdfText(filePath, { language, mode, maxPages, renderScale }) {
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await fsp.readFile(filePath));
    const loadingTask = pdfjs.getDocument({
        data,
        disableWorker: true,
        useSystemFonts: true
    });
    const document = await loadingTask.promise;
    const pageCount = document.numPages;
    const pagesToProcess = Math.min(pageCount, maxPages);
    const pages = [];
    let worker = null;

    try {
        for (let pageNumber = 1; pageNumber <= pagesToProcess; pageNumber += 1) {
            const page = await document.getPage(pageNumber);
            const nativeText = mode !== 'ocr' ? await extractNativePdfPageText(page) : '';
            const shouldUseNativeText = mode !== 'ocr' && nativeText.trim().length >= MIN_NATIVE_TEXT_CHARS;

            if (shouldUseNativeText || mode === 'text') {
                pages.push({
                    page: pageNumber,
                    text: normalizeExtractedText(nativeText),
                    source: shouldUseNativeText ? 'pdf-text' : 'pdf-text-empty',
                    confidence: null
                });
                page.cleanup();
                continue;
            }

            worker = worker || await createOcrWorker(language);
            const imageBuffer = await renderPdfPageToPng(page, renderScale);
            pages.push(await recognizeWithWorker(worker, imageBuffer, pageNumber, 'ocr'));
            page.cleanup();
        }
    } finally {
        if (worker) await worker.terminate();
        await document.destroy();
    }

    return {
        pageCount,
        truncated: pageCount > pagesToProcess,
        pages
    };
}

async function extractNativePdfPageText(page) {
    const content = await page.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false
    });
    return textItemsToLines(content.items || []);
}

function textItemsToLines(items) {
    const lines = [];
    let currentLine = [];
    let previousY = null;

    for (const item of items) {
        const value = String(item.str || '').trim();
        if (!value) continue;

        const y = Array.isArray(item.transform) ? Math.round(item.transform[5]) : null;
        if (previousY !== null && y !== null && Math.abs(y - previousY) > 4 && currentLine.length) {
            lines.push(currentLine.join(' '));
            currentLine = [];
        }
        currentLine.push(value);
        previousY = y;
    }

    if (currentLine.length) lines.push(currentLine.join(' '));
    return normalizeExtractedText(lines.join('\n'));
}

async function renderPdfPageToPng(page, scale) {
    const viewport = page.getViewport({ scale });
    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);
    const canvas = createCanvas(width, height);
    const canvasContext = canvas.getContext('2d');

    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(0, 0, width, height);

    await page.render({
        canvasContext,
        viewport,
        canvas
    }).promise;

    return canvas.toBuffer('image/png');
}

async function recognizeWithWorker(worker, image, pageNumber, source) {
    const result = await worker.recognize(image);
    return {
        page: pageNumber,
        text: normalizeExtractedText(result?.data?.text || ''),
        source,
        confidence: typeof result?.data?.confidence === 'number' ? result.data.confidence : null
    };
}

async function createOcrWorker(language) {
    await fsp.mkdir(OCR_CACHE_PATH, { recursive: true });
    const worker = await createWorker(language, OEM.DEFAULT, {
        cachePath: OCR_CACHE_PATH,
        logger: () => {}
    });

    await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300'
    });

    return worker;
}

async function loadPdfJs() {
    if (!globalThis.DOMMatrix) globalThis.DOMMatrix = DOMMatrix;
    if (!globalThis.ImageData) globalThis.ImageData = ImageData;
    if (!globalThis.Path2D) globalThis.Path2D = Path2D;

    if (!pdfjsPromise) {
        pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
    }
    return pdfjsPromise;
}

function buildAiText(pages) {
    const nonEmptyPages = pages.filter(page => page.text && page.text.trim());
    if (nonEmptyPages.length === 0) return '';
    if (nonEmptyPages.length === 1) return nonEmptyPages[0].text.trim();

    return nonEmptyPages
        .map(page => `--- Page ${page.page} ---\n${page.text.trim()}`)
        .join('\n\n');
}

function normalizeExtractedText(value) {
    return String(value || '')
        .replace(/\r/g, '')
        .split('\n')
        .map(line => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function countWords(text) {
    const words = String(text || '').trim().match(/\S+/g);
    return words ? words.length : 0;
}

function normalizeLanguage(language) {
    const parts = String(language || DEFAULT_LANGUAGE)
        .split('+')
        .map(part => part.trim().toLowerCase())
        .filter(part => /^[a-z]{3}(?:_[a-z]{3})?$/.test(part));

    return parts.length ? parts.join('+') : DEFAULT_LANGUAGE;
}

function normalizeMode(mode) {
    const normalized = String(mode || 'auto').toLowerCase();
    return ['auto', 'ocr', 'text'].includes(normalized) ? normalized : 'auto';
}

function isPdf(mimeType, filename) {
    return mimeType === PDF_MIME || path.extname(filename || '').toLowerCase() === '.pdf';
}

function isSupportedImage(mimeType, filename) {
    if (mimeType && mimeType.startsWith(IMAGE_MIME_PREFIX)) return true;
    return SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(filename || '').toLowerCase());
}

function guessMimeFromExtension(filePath) {
    const ext = path.extname(filePath || '').toLowerCase();
    if (ext === '.pdf') return PDF_MIME;
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.bmp') return 'image/bmp';
    if (ext === '.tif' || ext === '.tiff') return 'image/tiff';
    if (ext === '.gif') return 'image/gif';
    return null;
}

function clampInt(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function clampFloat(value, fallback, min, max) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

module.exports = {
    extractTextFromFile,
    normalizeLanguage,
    normalizeExtractedText,
    isPdf,
    isSupportedImage
};
