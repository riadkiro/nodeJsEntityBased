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
const DEFAULT_VISION_FALLBACK_MAX_PAGES = clampInt(process.env.OCR_OPENAI_FALLBACK_MAX_PAGES, 2, 0, 20);
const DEFAULT_VISION_FALLBACK_MIN_CHARS = clampInt(process.env.OCR_OPENAI_FALLBACK_MIN_CHARS, 80, 0, 2000);
const DEFAULT_VISION_FALLBACK_MIN_CONFIDENCE = clampFloat(process.env.OCR_OPENAI_FALLBACK_MIN_CONFIDENCE, 60, 0, 100);
const DEFAULT_VISION_FALLBACK_IMAGES = process.env.OCR_OPENAI_FALLBACK_IMAGES !== 'false';
const OCR_CACHE_PATH = process.env.OCR_CACHE_PATH || path.join(__dirname, '..', 'private_uploads', 'ocr-cache');

const PDF_MIME = 'application/pdf';
const IMAGE_MIME_PREFIX = 'image/';
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tif', '.tiff', '.gif']);
const OPENAI_VISION_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

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
    const visionOcrPage = typeof options.visionOcrPage === 'function' ? options.visionOcrPage : null;
    const visionFallback = normalizeVisionFallbackOptions(options.visionFallback, {
        query: options.query,
        enabled: Boolean(visionOcrPage)
    });

    let result;
    if (isPdf(mimeType, originalName)) {
        result = await extractPdfText(filePath, {
            language,
            mode,
            maxPages,
            renderScale,
            originalName,
            visionFallback,
            visionOcrPage
        });
    } else if (isSupportedImage(mimeType, originalName)) {
        result = await extractImageText(filePath, {
            language,
            originalName,
            mimeType,
            visionFallback,
            visionOcrPage
        });
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
            elapsedMs: Date.now() - startedAt,
            visionFallback: buildVisionFallbackSummary(result.pages, visionFallback, Boolean(visionOcrPage))
        }
    };
}

async function extractImageText(filePath, { language, originalName, mimeType, visionFallback, visionOcrPage }) {
    const worker = await createOcrWorker(language);
    try {
        const page = await recognizeWithWorker(worker, filePath, 1, 'ocr');
        await maybeApplyVisionFallback(page, () => fsp.readFile(filePath), {
            sourceType: 'image',
            originalName,
            mimeType: getOpenAIVisionMime(mimeType, originalName),
            visionFallback,
            visionOcrPage,
            state: { attempted: 0 }
        });
        return {
            pageCount: 1,
            truncated: false,
            pages: [page]
        };
    } finally {
        await worker.terminate();
    }
}

async function extractPdfText(filePath, { language, mode, maxPages, renderScale, originalName, visionFallback, visionOcrPage }) {
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
    const visionState = { attempted: 0 };

    try {
        for (let pageNumber = 1; pageNumber <= pagesToProcess; pageNumber += 1) {
            const page = await document.getPage(pageNumber);
            try {
                const nativeText = mode !== 'ocr' ? await extractNativePdfPageText(page) : '';
                const shouldUseNativeText = mode !== 'ocr' && nativeText.trim().length >= MIN_NATIVE_TEXT_CHARS;
                let imageBuffer = null;
                const getImageBuffer = async () => {
                    imageBuffer = imageBuffer || await renderPdfPageToPng(page, renderScale);
                    return imageBuffer;
                };

                if (shouldUseNativeText || mode === 'text') {
                    const pageResult = {
                        page: pageNumber,
                        text: normalizeExtractedText(nativeText),
                        source: shouldUseNativeText ? 'pdf-text' : 'pdf-text-empty',
                        confidence: null
                    };
                    await maybeApplyVisionFallback(pageResult, getImageBuffer, {
                        sourceType: 'pdf',
                        originalName,
                        mimeType: 'image/png',
                        visionFallback,
                        visionOcrPage,
                        state: visionState
                    });
                    pages.push(pageResult);
                    continue;
                }

                worker = worker || await createOcrWorker(language);
                imageBuffer = await getImageBuffer();
                const pageResult = await recognizeWithWorker(worker, imageBuffer, pageNumber, 'ocr');
                await maybeApplyVisionFallback(pageResult, () => imageBuffer, {
                    sourceType: 'pdf',
                    originalName,
                    mimeType: 'image/png',
                    visionFallback,
                    visionOcrPage,
                    state: visionState
                });
                pages.push(pageResult);
            } finally {
                page.cleanup();
            }
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

async function maybeApplyVisionFallback(page, getImageBuffer, context = {}) {
    const visionFallback = context.visionFallback || {};
    const state = context.state || { attempted: 0 };
    const decision = visionFallbackDecision(page, context);
    if (!decision.run) {
        if (decision.reason && visionFallback.enabled) {
            page.visionFallback = {
                attempted: false,
                skipped: true,
                reason: decision.reason
            };
        }
        return page;
    }

    if (state.attempted >= visionFallback.maxPages) {
        page.visionFallback = {
            attempted: false,
            skipped: true,
            reason: 'limit-reached',
            candidateReason: decision.reason
        };
        return page;
    }

    if (!context.mimeType) {
        page.visionFallback = {
            attempted: false,
            skipped: true,
            reason: 'unsupported-image-type',
            candidateReason: decision.reason
        };
        return page;
    }

    state.attempted += 1;
    try {
        const imageBuffer = await getImageBuffer();
        if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
            page.visionFallback = {
                attempted: false,
                skipped: true,
                reason: 'missing-page-image',
                candidateReason: decision.reason
            };
            return page;
        }

        const vision = await context.visionOcrPage({
            imageBuffer,
            page,
            pageNumber: page.page,
            originalName: context.originalName,
            mimeType: context.mimeType,
            query: visionFallback.query,
            reason: decision.reason,
            localText: page.text,
            structuredText: page.structuredText
        });
        mergeVisionIntoPage(page, vision, decision.reason);
    } catch (error) {
        page.visionFallback = {
            attempted: true,
            success: false,
            reason: decision.reason,
            error: error.message || 'OCR OpenAI Vision impossible'
        };
    }

    return page;
}

function visionFallbackDecision(page = {}, context = {}) {
    const options = context.visionFallback || {};
    if (!options.enabled) return { run: false, reason: 'disabled' };
    if (!context.visionOcrPage) return { run: false, reason: 'callback-missing' };
    if (options.maxPages <= 0) return { run: false, reason: 'limit-disabled' };

    const pageNumber = Number(page.page || 1);
    const text = [page.text, page.structuredText].filter(Boolean).join('\n');
    const charCount = normalizeExtractedText(text).length;
    const confidence = typeof page.confidence === 'number' ? page.confidence : null;

    if (options.mode === 'force') return { run: true, reason: 'force' };
    if (options.requestedPageSet?.has(pageNumber) && options.forceRequestedPages) {
        return { run: true, reason: `page-${pageNumber}-requested` };
    }
    if (context.sourceType === 'image' && options.fallbackImages) {
        return { run: true, reason: 'image-context' };
    }
    if (charCount < options.minChars) {
        return { run: true, reason: 'local-text-too-short' };
    }
    if (confidence !== null && confidence < options.minConfidence) {
        return { run: true, reason: 'local-confidence-low' };
    }
    if (options.fallbackTables && hasAmbiguousTableSignals(text, options.query)) {
        return { run: true, reason: 'table-values-check' };
    }

    return { run: false, reason: '' };
}

function mergeVisionIntoPage(page, vision = {}, reason = '') {
    const visionText = buildVisionFallbackText(vision);
    const localText = String(page.text || '').trim();
    const localStructuredText = String(page.structuredText || '').trim();
    const visionStructuredText = String(vision.structuredText || '').trim();

    if (visionText) {
        const currentNorm = normalizeForComparison([localText, localStructuredText].join('\n'));
        const visionNorm = normalizeForComparison(visionText);
        page.text = currentNorm.includes(visionNorm)
            ? localText
            : [localText, '', '--- OCR OpenAI Vision ---', visionText].filter(Boolean).join('\n');
    }

    if (visionStructuredText) {
        const structuredNorm = normalizeForComparison(localStructuredText);
        const openAiStructuredNorm = normalizeForComparison(visionStructuredText);
        if (!structuredNorm.includes(openAiStructuredNorm)) {
            page.structuredText = [localStructuredText, visionStructuredText].filter(Boolean).join('\n');
        }
    }

    page.source = appendSource(page.source, 'openai-vision');
    page.visionFallback = {
        attempted: true,
        success: Boolean(visionText || visionStructuredText || vision.fields?.length),
        reason,
        provider: 'openai',
        model: vision.model || '',
        confidence: vision.confidence ?? null,
        fieldsCount: Array.isArray(vision.fields) ? vision.fields.length : 0,
        textChars: visionText.length,
        usage: vision.usage || null,
        notes: vision.notes || ''
    };
}

function buildVisionFallbackText(vision = {}) {
    const text = String(vision.text || '').trim();
    const structuredText = String(vision.structuredText || '').trim();
    const fieldLines = Array.isArray(vision.fields)
        ? vision.fields
            .map(field => {
                const label = String(field?.label || '').trim();
                const value = String(field?.value || '').trim();
                if (!label && !value) return '';
                return label && value ? `${label}: ${value}` : (label || value);
            })
            .filter(Boolean)
            .slice(0, 80)
            .join('\n')
        : '';

    const sections = [];
    if (text) sections.push(text);
    if (structuredText && !normalizeForComparison(text).includes(normalizeForComparison(structuredText))) {
        sections.push(['--- Lignes OCR OpenAI Vision ---', structuredText].join('\n'));
    }
    if (fieldLines && !normalizeForComparison([text, structuredText].join('\n')).includes(normalizeForComparison(fieldLines))) {
        sections.push(['--- Champs OCR OpenAI Vision ---', fieldLines].join('\n'));
    }

    return normalizeExtractedText(sections.join('\n\n'));
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
    const result = await worker.recognize(image, {}, { text: true, blocks: true });
    const text = normalizeExtractedText(result?.data?.text || '');
    const structuredText = buildSpatialOcrText(result?.data?.blocks || []);
    return {
        page: pageNumber,
        text,
        structuredText,
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
    const nonEmptyPages = pages.filter(page => (page.text && page.text.trim()) || (page.structuredText && page.structuredText.trim()));
    if (nonEmptyPages.length === 0) return '';
    if (nonEmptyPages.length === 1) return formatPageOcrText(nonEmptyPages[0]);

    return nonEmptyPages
        .map(page => `--- Page ${page.page} ---\n${formatPageOcrText(page)}`)
        .join('\n\n');
}

function formatPageOcrText(page = {}) {
    const text = String(page.text || '').trim();
    const structuredText = String(page.structuredText || '').trim();
    if (!structuredText) return text;

    const normalizedText = normalizeForComparison(text);
    const normalizedStructured = normalizeForComparison(structuredText);
    if (!normalizedStructured || normalizedText.includes(normalizedStructured)) return text;

    return [
        text,
        '',
        '--- Lignes OCR structurées ---',
        structuredText
    ].filter(Boolean).join('\n');
}

function buildSpatialOcrText(blocks = []) {
    const words = extractOcrWords(blocks);
    if (!words.length) return '';

    const lines = groupWordsIntoSpatialLines(words)
        .map(line => formatSpatialLine(line.words))
        .filter(Boolean);

    return [...new Set(lines)].slice(0, 240).join('\n');
}

function extractOcrWords(blocks = []) {
    const words = [];
    const visitWord = word => {
        const text = String(word?.text || '').replace(/\s+/g, ' ').trim();
        const bbox = word?.bbox || {};
        if (!text || !Number.isFinite(Number(bbox.x0)) || !Number.isFinite(Number(bbox.y0)) || !Number.isFinite(Number(bbox.x1)) || !Number.isFinite(Number(bbox.y1))) return;
        const x0 = Number(bbox.x0);
        const y0 = Number(bbox.y0);
        const x1 = Number(bbox.x1);
        const y1 = Number(bbox.y1);
        if (x1 <= x0 || y1 <= y0) return;
        words.push({
            text,
            x0,
            y0,
            x1,
            y1,
            cx: (x0 + x1) / 2,
            cy: (y0 + y1) / 2,
            height: y1 - y0,
            confidence: Number(word.confidence || 0)
        });
    };

    (blocks || []).forEach(block => {
        (block.paragraphs || []).forEach(paragraph => {
            (paragraph.lines || []).forEach(line => {
                (line.words || []).forEach(visitWord);
            });
        });
    });

    return words
        .filter(word => word.confidence >= 25 || /\d/.test(word.text) || word.text.length > 1)
        .sort((a, b) => a.cy - b.cy || a.x0 - b.x0);
}

function groupWordsIntoSpatialLines(words = []) {
    const lines = [];
    words.forEach(word => {
        const tolerance = Math.max(7, Math.min(18, word.height * 0.75));
        let line = lines.find(candidate => Math.abs(candidate.cy - word.cy) <= Math.max(candidate.tolerance, tolerance));
        if (!line) {
            line = { cy: word.cy, tolerance, words: [] };
            lines.push(line);
        }
        line.words.push(word);
        line.cy = line.words.reduce((sum, item) => sum + item.cy, 0) / line.words.length;
        line.tolerance = Math.max(line.tolerance, tolerance);
    });

    return lines
        .map(line => ({
            ...line,
            words: line.words.sort((a, b) => a.x0 - b.x0)
        }))
        .sort((a, b) => a.cy - b.cy);
}

function formatSpatialLine(words = []) {
    if (!words.length) return '';
    const heights = words.map(word => word.height).sort((a, b) => a - b);
    const medianHeight = heights[Math.floor(heights.length / 2)] || 12;
    const columnGap = Math.max(28, medianHeight * 2.2);
    const parts = [];

    words.forEach((word, index) => {
        const previous = words[index - 1];
        if (previous) {
            const gap = word.x0 - previous.x1;
            parts.push(gap > columnGap ? ' | ' : ' ');
        }
        parts.push(word.text);
    });

    return normalizeExtractedText(parts.join(''))
        .replace(/\s+\|\s+/g, ' | ')
        .replace(/\s+([,.;:])/g, '$1')
        .trim();
}

function normalizeForComparison(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
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

function normalizeVisionFallbackOptions(input = {}, defaults = {}) {
    const raw = input && typeof input === 'object' ? input : { enabled: input };
    const query = String(raw.query ?? defaults.query ?? '').trim();
    const requestedPages = normalizePageList(raw.requestedPages || extractRequestedPages(query));
    const requestedPageDefaultMax = requestedPages.length
        ? Math.max(DEFAULT_VISION_FALLBACK_MAX_PAGES, Math.min(20, requestedPages.length))
        : DEFAULT_VISION_FALLBACK_MAX_PAGES;
    const mode = normalizeVisionFallbackMode(raw.mode || raw.visionFallback);
    const enabled = booleanOption(raw.enabled, defaults.enabled ?? true) && mode !== 'off';

    return {
        enabled,
        mode,
        query,
        requestedPages,
        requestedPageSet: new Set(requestedPages),
        forceRequestedPages: booleanOption(raw.forceRequestedPages, requestedPages.length > 0),
        fallbackImages: booleanOption(raw.fallbackImages, DEFAULT_VISION_FALLBACK_IMAGES),
        fallbackTables: booleanOption(raw.fallbackTables, true),
        maxPages: clampInt(raw.maxPages, requestedPageDefaultMax, 0, 20),
        minChars: clampInt(raw.minChars, DEFAULT_VISION_FALLBACK_MIN_CHARS, 0, 2000),
        minConfidence: clampFloat(raw.minConfidence, DEFAULT_VISION_FALLBACK_MIN_CONFIDENCE, 0, 100)
    };
}

function normalizeVisionFallbackMode(value) {
    const normalized = String(value || 'auto').toLowerCase();
    if (['false', '0', 'off', 'none', 'local'].includes(normalized)) return 'off';
    if (['force', 'always'].includes(normalized)) return 'force';
    return 'auto';
}

function booleanOption(value, fallback) {
    if (typeof value === 'boolean') return value;
    if (value === undefined || value === null || value === '') return Boolean(fallback);
    const normalized = String(value).trim().toLowerCase();
    if (['1', 'true', 'yes', 'oui', 'on', 'auto', 'force', 'always'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'non', 'off', 'none', 'local'].includes(normalized)) return false;
    return Boolean(fallback);
}

function normalizePageList(value) {
    const source = Array.isArray(value) ? value : [value];
    const pages = new Set();
    source.forEach(item => {
        if (Array.isArray(item)) {
            normalizePageList(item).forEach(page => pages.add(page));
            return;
        }
        String(item || '').split(/[,\s;]+/).forEach(part => {
            const page = Number.parseInt(part, 10);
            if (Number.isFinite(page) && page >= 1 && page <= 1000) pages.add(page);
        });
    });
    return [...pages].sort((a, b) => a - b).slice(0, 30);
}

function extractRequestedPages(value) {
    const text = String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[–—]/g, '-')
        .replace(/\bp\.\s*/g, 'page ');
    const pages = new Set();
    const pageRefRegex = /\b(?:pages?|p)\s+(?:n[°o]\s*)?([0-9]{1,4}(?:\s*(?:,|;|et|and|&|-|a|à|to)\s*[0-9]{1,4}){0,12})/gi;
    let match;

    while ((match = pageRefRegex.exec(text)) !== null) {
        const sequence = match[1] || '';
        const numberRegex = /([0-9]{1,4})(?:\s*(?:-|a|à|to)\s*([0-9]{1,4}))?/gi;
        let numberMatch;

        while ((numberMatch = numberRegex.exec(sequence)) !== null) {
            const start = Number(numberMatch[1]);
            const end = Number(numberMatch[2] || numberMatch[1]);
            if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

            const low = Math.max(1, Math.min(start, end));
            const high = Math.min(1000, Math.max(start, end));
            for (let page = low; page <= high && pages.size < 30; page += 1) {
                pages.add(page);
            }
        }
    }

    return [...pages].sort((a, b) => a - b);
}

function hasAmbiguousTableSignals(text, query = '') {
    const normalized = normalizeForComparison([text, query].join('\n'));
    if (!normalized) return false;

    const labels = [
        'ram', 'memoire', 'memory', 'disque', 'espace disque', 'storage',
        'cpu', 'coeur', 'core', 'expiration', 'renouvellement', 'ip',
        'adresse ip', 'hostname', 'nom hote', 'hote'
    ];
    const matchedLabels = labels.filter(label => normalized.includes(label)).length;
    if (matchedLabels >= 2) return true;
    if (matchedLabels < 1) return false;

    return /\b\d+(?:[.,]\d+)?\s*(gb|go|tb|to|mb|mo|cpu|v?cores?|coeurs?)\b/i.test(text) ||
        /\b(?:active|activé|oui|non|yes|no|true|false)\b/i.test(text) ||
        /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(text);
}

function buildVisionFallbackSummary(pages = [], options = {}, hasCallback = false) {
    const entries = (pages || []).map(page => page.visionFallback).filter(Boolean);
    const attempted = entries.filter(entry => entry.attempted).length;
    const succeeded = entries.filter(entry => entry.attempted && entry.success).length;
    const failed = entries.filter(entry => entry.attempted && !entry.success).length;
    const skipped = entries.filter(entry => entry.skipped).length;

    return {
        enabled: Boolean(options.enabled && hasCallback),
        mode: options.mode || 'auto',
        maxPages: options.maxPages ?? 0,
        requestedPages: options.requestedPages || [],
        attempted,
        succeeded,
        failed,
        skipped,
        pages: entries.map(entry => ({
            attempted: Boolean(entry.attempted),
            success: Boolean(entry.success),
            skipped: Boolean(entry.skipped),
            reason: entry.reason || '',
            candidateReason: entry.candidateReason || '',
            error: entry.error || '',
            model: entry.model || '',
            fieldsCount: entry.fieldsCount || 0,
            textChars: entry.textChars || 0
        }))
    };
}

function getOpenAIVisionMime(mimeType, filename) {
    const mime = String(mimeType || guessMimeFromExtension(filename || '') || '').toLowerCase();
    if (OPENAI_VISION_IMAGE_MIME_TYPES.has(mime)) return mime;
    return '';
}

function appendSource(source, addition) {
    const parts = String(source || '')
        .split('+')
        .map(part => part.trim())
        .filter(Boolean);
    if (!parts.includes(addition)) parts.push(addition);
    return parts.join('+') || addition;
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
