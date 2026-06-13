const fs = require('fs');
const path = require('path');
const { createCanvas, DOMMatrix, ImageData, Path2D } = require('@napi-rs/canvas');

let pdfjsPromise = null;

function isPdfTemplateDocument(doc) {
    const template = doc?.metadata?.pdfTemplate;
    return Boolean(template && (template.sourceAttachmentFilename || template.sourceUrl || template.sourcePath));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeCssValue(value, fallback = '') {
    const str = String(value ?? '').trim();
    if (!str) return fallback;
    return str.replace(/[;"'<>]/g, '');
}

function boundedNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

function isCheckboxChecked(field) {
    return field?.checked === true
        || field?.value === true
        || ['true', 'checked', '1', 'yes', 'on', '✓'].includes(String(field?.value || '').toLowerCase());
}

function deriveAttachmentFilenameFromUrl(sourceUrl) {
    const match = String(sourceUrl || '').match(/\/uploads\/attachments\/(.+?)(?:[?#].*)?$/);
    return match ? decodeURIComponent(match[1]) : '';
}

function encodeAttachmentPath(filename) {
    return String(filename || '')
        .split('/')
        .filter(Boolean)
        .map(segment => encodeURIComponent(segment))
        .join('/');
}

function buildAttachmentSourceUrl(accountNumber, filename) {
    const encodedPath = encodeAttachmentPath(filename);
    if (!accountNumber || !encodedPath) return '';
    return `/account/${encodeURIComponent(String(accountNumber))}/uploads/attachments/${encodedPath}`;
}

function resolveAttachmentPath(accountNumber, filename) {
    if (!filename || filename.includes('..')) {
        throw new Error('Chemin PDF invalide');
    }

    const privatePath = path.join(__dirname, '../private_uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(privatePath)) return privatePath;

    const publicPath = path.join(__dirname, '../public/uploads/attachments', String(accountNumber), filename);
    if (fs.existsSync(publicPath)) return publicPath;

    throw new Error('PDF source introuvable sur le disque');
}

function resolvePdfSourcePath(template, accountNumber) {
    if (template.sourcePath && !String(template.sourcePath).includes('..') && fs.existsSync(template.sourcePath)) {
        return template.sourcePath;
    }

    const filename = template.sourceAttachmentFilename || deriveAttachmentFilenameFromUrl(template.sourceUrl);
    return resolveAttachmentPath(accountNumber, filename);
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

async function renderPdfPageToDataUrl(pdfPage, docDims) {
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const targetWidth = boundedNumber(docDims?.width, Math.round(baseViewport.width * 96 / 72), 200, 3000);
    const renderScale = Math.max(1.4, Math.min(3, targetWidth / baseViewport.width * 1.8));
    const viewport = pdfPage.getViewport({ scale: renderScale });
    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);
    const canvas = createCanvas(width, height);
    const canvasContext = canvas.getContext('2d');

    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(0, 0, width, height);

    await pdfPage.render({
        canvasContext,
        viewport,
        canvas
    }).promise;

    return {
        dataUrl: `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`,
        pdfWidth: baseViewport.width,
        pdfHeight: baseViewport.height,
        cssWidth: Math.round(baseViewport.width * 96 / 72),
        cssHeight: Math.round(baseViewport.height * 96 / 72)
    };
}

function pdfPageCssDimensions(pdfPage) {
    const viewport = pdfPage.getViewport({ scale: 1 });
    return {
        pdfWidth: viewport.width,
        pdfHeight: viewport.height,
        width: Math.round(viewport.width * 96 / 72),
        height: Math.round(viewport.height * 96 / 72)
    };
}

async function inspectPdfTemplateSource(template, accountNumber) {
    const sourcePath = resolvePdfSourcePath(template || {}, accountNumber);
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await fs.promises.readFile(sourcePath));
    const loadingTask = pdfjs.getDocument({
        data,
        disableWorker: true,
        useSystemFonts: true
    });
    const pdfDoc = await loadingTask.promise;
    const pageCount = Math.max(1, pdfDoc.numPages || 1);
    const pageDimensions = {};

    for (let i = 0; i < pageCount; i += 1) {
        const page = await pdfDoc.getPage(i + 1);
        const dims = pdfPageCssDimensions(page);
        pageDimensions[i] = dims;
    }

    const firstPage = pageDimensions[0] || { width: 794, height: 1123 };
    return {
        pageCount,
        pageDimensions,
        firstPage,
        orientation: firstPage.width >= firstPage.height ? 'landscape' : 'portrait'
    };
}

function renderFieldHtml(field) {
    if (!field) return '';

    const type = field.type || 'text';
    const x = boundedNumber(field.x, 72, -5000, 10000);
    const y = boundedNumber(field.y, 72, -5000, 10000);
    const width = boundedNumber(field.width, 180, 8, 5000);
    const height = boundedNumber(field.height, 28, 8, 2000);
    const zIndex = boundedNumber(field.zIndex, 0, 0, 10000);
    const commonStyle = `left:${x}px;top:${y}px;width:${width}px;height:${height}px;z-index:${2 + zIndex};`;

    if (type === 'checkbox') {
        const borderColor = sanitizeCssValue(field.borderColor || field.strokeColor, '#111827');
        const borderWidth = boundedNumber(field.borderWidth || field.strokeWidth, 1.5, 0.5, 12);
        const fillColor = sanitizeCssValue(field.fillColor, 'transparent');
        const checked = isCheckboxChecked(field);
        const checkColor = sanitizeCssValue(field.checkColor || borderColor, borderColor);
        const markSize = Math.max(10, Math.round(Math.min(width, height) * 0.82));
        const mark = checked
            ? `<span style="font-size:${markSize}px;color:${checkColor};font-weight:700;">✓</span>`
            : '';
        return `<div class="pdf-template-field pdf-template-checkbox" style="${commonStyle}border:${borderWidth}px solid ${borderColor};background:${fillColor};">${mark}</div>`;
    }

    if (type === 'check' || type === 'cross') {
        const mark = field.value || (type === 'check' ? '✓' : '×');
        const fontSize = boundedNumber(field.fontSize, type === 'check' ? 20 : 22, 8, 96);
        const fontFamily = sanitizeCssValue(field.fontFamily, 'Arial, sans-serif');
        const color = sanitizeCssValue(field.color, '#111827');
        const weight = field.bold === false ? '400' : '700';
        return `<div class="pdf-template-field pdf-template-mark" style="${commonStyle}font-family:${fontFamily};font-size:${fontSize}px;color:${color};font-weight:${weight};">${escapeHtml(mark)}</div>`;
    }

    if (type === 'line') {
        const strokeColor = sanitizeCssValue(field.strokeColor, '#111827');
        const strokeWidth = boundedNumber(field.strokeWidth, 2, 0.5, 12);
        return `<div class="pdf-template-field pdf-template-line" style="${commonStyle}"><span style="height:${strokeWidth}px;background:${strokeColor};"></span></div>`;
    }

    if (type === 'rectangle') {
        const strokeColor = sanitizeCssValue(field.strokeColor, '#111827');
        const strokeWidth = boundedNumber(field.strokeWidth, 1.5, 0.5, 12);
        const fillColor = sanitizeCssValue(field.fillColor, 'transparent');
        return `<div class="pdf-template-field pdf-template-shape" style="${commonStyle}border:${strokeWidth}px solid ${strokeColor};background:${fillColor};"></div>`;
    }

    const fontSize = boundedNumber(field.fontSize, 14, 6, 96);
    const lineHeight = boundedNumber(field.lineHeight, 1.2, 0.7, 3);
    const letterSpacing = boundedNumber(field.letterSpacing, 0, -2, 20);
    const fontFamily = sanitizeCssValue(field.fontFamily, 'Arial, sans-serif');
    const color = sanitizeCssValue(field.color, '#111827');
    const align = ['left', 'center', 'right'].includes(field.align) ? field.align : 'left';
    const weight = field.bold ? '700' : '400';
    const style = field.italic ? 'italic' : 'normal';
    const decoration = field.underline ? 'underline' : 'none';
    const whiteSpace = field.whiteSpace === 'nowrap' ? 'nowrap' : 'pre-wrap';
    const value = field.resolvedValue ?? field.value ?? field.text ?? '';

    return `<div class="pdf-template-field pdf-template-text" style="${commonStyle}min-height:${height}px;font-family:${fontFamily};font-size:${fontSize}px;line-height:${lineHeight};letter-spacing:${letterSpacing}px;color:${color};font-weight:${weight};font-style:${style};text-decoration:${decoration};text-align:${align};white-space:${whiteSpace};">${escapeHtml(value)}</div>`;
}

async function renderPdfTemplateDocumentHtml(doc, accountNumber, options = {}) {
    const template = doc?.metadata?.pdfTemplate || {};
    const sourcePath = resolvePdfSourcePath(template, accountNumber);
    const pdfjs = await loadPdfJs();
    const data = new Uint8Array(await fs.promises.readFile(sourcePath));
    const loadingTask = pdfjs.getDocument({
        data,
        disableWorker: true,
        useSystemFonts: true
    });
    const pdfDoc = await loadingTask.promise;
    const docDims = doc?.dimensions || { width: 794, height: 1123 };
    const pageCount = Math.max(1, pdfDoc.numPages || Number(template.pageCount || 1));
    const fields = Array.isArray(template.fields) ? template.fields : [];
    const hideBackground = Boolean(template.hideBackground);
    const baseUrl = options.baseUrl || '';

    let pagesHtml = '';
    for (let i = 0; i < pageCount; i += 1) {
        const pdfPage = await pdfDoc.getPage(i + 1);
        const rendered = await renderPdfPageToDataUrl(pdfPage, docDims);
        const savedPageDims = template.pageDimensions?.[i] || template.pageDimensions?.[String(i)];
        const pageWidth = boundedNumber(savedPageDims?.width ?? docDims.width, rendered.cssWidth, 200, 3000);
        const pageHeight = boundedNumber(savedPageDims?.height ?? docDims.height, rendered.cssHeight, 200, 5000);
        const pageFields = fields
            .filter(field => Number(field.pageIndex || 0) === i)
            .sort((a, b) => Number(a.zIndex || 0) - Number(b.zIndex || 0))
            .map(renderFieldHtml)
            .join('');
        const isLast = i === pageCount - 1;

        pagesHtml += `<div class="doc-page pdf-template-page" style="width:${pageWidth}px;height:${pageHeight}px;min-height:${pageHeight}px;max-height:${pageHeight}px;${!isLast ? 'page-break-after:always;' : ''}">`;
        if (!hideBackground) {
            pagesHtml += `<img class="pdf-template-bg" src="${rendered.dataUrl}" alt="">`;
        }
        pagesHtml += pageFields;
        pagesHtml += `</div>`;
    }

    const width = boundedNumber(docDims.width, 794, 200, 3000);
    const height = boundedNumber(docDims.height, 1123, 200, 5000);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${baseUrl ? `<base href="${escapeHtml(baseUrl)}">` : ''}
    <style>
        @page { margin: 0; size: ${width}px ${height}px; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .doc-page {
            position: relative;
            overflow: hidden;
            background: #ffffff;
            page-break-inside: avoid;
        }
        .pdf-template-bg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: fill;
            display: block;
            z-index: 0;
        }
        .pdf-template-field {
            position: absolute;
            overflow: hidden;
            word-break: normal;
            overflow-wrap: anywhere;
            padding: 0;
            box-sizing: border-box;
        }
        .pdf-template-mark {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .pdf-template-checkbox {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .pdf-template-checkbox span {
            display: block;
            line-height: 1;
        }
        .pdf-template-line {
            display: flex;
            align-items: center;
        }
        .pdf-template-line span {
            display: block;
            width: 100%;
        }
    </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;
}

module.exports = {
    buildAttachmentSourceUrl,
    inspectPdfTemplateSource,
    isPdfTemplateDocument,
    renderPdfTemplateDocumentHtml
};
