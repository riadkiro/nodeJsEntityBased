/**
 * Compare the HTML sent by React Editor vs SmartDoc for the same document
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    // Login
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.type('input[type="email"]', 'boukirou6@hotmail.com');
    await page.type('input[type="password"]', 'test');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
        page.click('button[type="submit"]')
    ]);

    // Go to React Editor
    const editorUrl = 'http://localhost:3000/account/5096/documents/6a0b60dc4f1758059dbb4c56/edit-react?contextFree=1&templateId=6a0b4221f1c5ddd28f737c9f&bindings=%5B%7B%22entityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22entityName%22%3A%22Entreprise%22%2C%22entityIcon%22%3A%22solar%3Abuildings-bold-duotone%22%2C%22entitySlug%22%3A%22entreprises%22%2C%22entityColor%22%3A%22%2364748b%22%2C%22relationKey%22%3Anull%2C%22relationLabel%22%3Anull%2C%22primaryEntityId%22%3A%226a0b4221f1c5ddd28f737c83%22%2C%22primaryEntitySlug%22%3A%22entreprises%22%2C%22primaryEntityName%22%3A%22Entreprise%22%2C%22tokens%22%3A%5B%22entreprises.title%22%2C%22entreprises.siret%22%2C%22entreprises.adresse%22%5D%7D%5D';
    await page.goto(editorUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));

    // Extract content from DOM pages
    const pageContents = await page.evaluate(() => {
        const pages = document.querySelectorAll('.bg-white.shadow-2xl');
        const contents = [];
        pages.forEach(pg => {
            const contentDiv = pg.querySelector('[contenteditable="true"]');
            if (contentDiv) contents.push(contentDiv.innerHTML);
        });
        return contents;
    });

    // Build the SAME HTML that handlePdfExport builds
    const docMargins = { top: 60, right: 60, bottom: 60, left: 60 };
    const docDims = { width: 794, height: 1123 };
    let pagesHtml = '';
    for (let i = 0; i < pageContents.length; i++) {
        const isLast = i === pageContents.length - 1;
        pagesHtml += `<div class="doc-page" ${!isLast ? 'style="page-break-after: always;"' : ''}>`;
        pagesHtml += `<div class="doc-content" style="padding: ${docMargins.top}px ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${pageContents[i]}</div>`;
        pagesHtml += '</div>';
    }

    const reactEditorHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 0; size: A4; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6;
            color: #000000;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        p, h1, h2, h3, h4, h5, h6, blockquote, pre, ul, ol, figure, hr { margin: 0; }
        h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; color: #333; }
        ul, ol { list-style: none; padding: 0; }
        img, svg { display: block; max-width: 100%; }
        .doc-page {
            width: 100%;
            min-height: ${docDims.height}px;
            background: #ffffff;
            position: relative;
        }
        .doc-content {
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
    </style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

    fs.writeFileSync(path.join(__dirname, 'react-html-output.html'), reactEditorHtml, 'utf8');

    console.log('\n=== REACT EDITOR HTML ANALYSIS ===');
    console.log('Total HTML size:', reactEditorHtml.length, 'chars');
    console.log('Number of pages:', pageContents.length);
    console.log('Has <html> tag:', reactEditorHtml.includes('<html'));
    console.log('Has .doc-page:', reactEditorHtml.includes('doc-page'));
    console.log('Has .doc-content:', reactEditorHtml.includes('doc-content'));
    console.log('Has @page rule:', reactEditorHtml.includes('@page'));
    console.log('Has Segoe UI:', reactEditorHtml.includes('Segoe UI'));
    console.log('Has preferCSSPageSize hint in CSS:', reactEditorHtml.includes('size: A4'));
    console.log('\n=== NO Tailwind CDN ===');
    console.log('Has cdn.tailwindcss.com:', reactEditorHtml.includes('cdn.tailwindcss.com'));
    console.log('Has Inter font:', reactEditorHtml.includes('Inter'));
    console.log('Has shadow-2xl:', reactEditorHtml.includes('shadow-2xl'));
    console.log('Has contenteditable:', reactEditorHtml.includes('contenteditable'));
    console.log('Has ring-2:', reactEditorHtml.includes('ring-2'));
    console.log('\n=== MATCHES SMARTDOC ===');
    console.log('Uses doc-page class:', reactEditorHtml.includes('class="doc-page"'));
    console.log('Uses doc-content class:', reactEditorHtml.includes('class="doc-content"'));
    console.log('Uses page-break-after:', reactEditorHtml.includes('page-break-after: always'));
    console.log('Last page has NO page-break:', !pagesHtml.endsWith('page-break-after: always;""></div>'));

    await browser.close();
    console.log('\nDone. Saved HTML to react-html-output.html for manual inspection.');
})();
