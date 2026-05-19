/**
 * Diagnostic: Trace the entire PDF generation pipeline
 * - Check what content generate-draft puts in the DB
 * - Check if finalize-draft reads it correctly
 * - Check if Puppeteer can generate a non-empty PDF from it
 */
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'saas_app_rb_5001';
const ACCOUNT_NUMBER = '5096';

async function run() {
    const conn = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${DB_NAME}`).asPromise();
    console.log('Connected to', DB_NAME);

    // 1. Find the most recent draft documents (or any recent documents)
    const docCol = conn.db.collection('documents');
    
    // Find recent documents to see what content looks like
    const recentDocs = await docCol.find({}).sort({ createdAt: -1 }).limit(5).toArray();
    
    console.log('\n=== RECENT DOCUMENTS ===');
    for (const doc of recentDocs) {
        console.log(`\nDoc: ${doc._id} | Name: "${doc.name}" | isDraft: ${doc.isDraft} | isTemplate: ${doc.isTemplate}`);
        console.log(`  Pages count: ${(doc.pages || []).length}`);
        console.log(`  Status: ${doc.status} | Format: ${doc.format}`);
        console.log(`  draftRecordId: ${doc.draftRecordId || 'N/A'}`);
        console.log(`  headerHtml length: ${(doc.headerHtml || '').length}`);
        console.log(`  footerHtml length: ${(doc.footerHtml || '').length}`);
        
        if (doc.pages && doc.pages.length > 0) {
            for (let i = 0; i < doc.pages.length; i++) {
                const page = doc.pages[i];
                const content = page.content || '';
                console.log(`  Page ${i}: content length=${content.length}, mode=${page.mode}`);
                if (content.length > 0) {
                    // Show first 300 chars
                    console.log(`    Preview: ${content.substring(0, 300).replace(/\n/g, ' ')}`);
                } else {
                    console.log(`    ⚠ EMPTY CONTENT`);
                }
            }
        }
    }

    // 2. Find the most recent records with attachments that are "isGenerated"
    const recordCol = conn.db.collection('records');
    const recordsWithGenerated = await recordCol.find({
        'attachments.isGenerated': true
    }).sort({ 'attachments.uploadedAt': -1 }).limit(3).toArray();

    console.log('\n=== RECORDS WITH GENERATED ATTACHMENTS ===');
    for (const rec of recordsWithGenerated) {
        const genAttachments = (rec.attachments || []).filter(a => a.isGenerated);
        console.log(`\nRecord: ${rec._id} | Title: "${rec.computedTitle || rec.title}"`);
        for (const att of genAttachments.slice(-3)) {
            console.log(`  Attachment: ${att.filename} | size: ${att.size} | name: "${att.originalName}" | date: ${att.uploadedAt}`);
            
            // Check if file exists
            const filePath = path.join(__dirname, `../private_uploads/attachments/${ACCOUNT_NUMBER}/${att.filename}`);
            if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                console.log(`    File EXISTS: ${stat.size} bytes`);
            } else {
                console.log(`    ⚠ FILE NOT FOUND at: ${filePath}`);
            }
        }
    }

    // 3. Test Puppeteer with a simple HTML to verify it works
    console.log('\n=== PUPPETEER TEST ===');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1123 });
        
        const testHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
    @page { margin: 0; size: A4; }
    body { font-family: Arial, sans-serif; font-size: 12pt; margin: 0; padding: 40px; }
</style>
</head><body>
<h1>PDF Test - ${new Date().toISOString()}</h1>
<p>If you can read this, Puppeteer works correctly.</p>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</body></html>`;

        await page.setContent(testHtml, { waitUntil: ['networkidle0', 'load'], timeout: 30000 });
        
        const testPdfPath = path.join(__dirname, 'test-puppeteer-diag.pdf');
        await page.pdf({
            path: testPdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            preferCSSPageSize: true
        });
        
        const pdfSize = fs.statSync(testPdfPath).size;
        console.log(`✓ Puppeteer test PDF generated: ${pdfSize} bytes at ${testPdfPath}`);
        
        if (pdfSize < 1000) {
            console.log('⚠ WARNING: PDF is suspiciously small - may be blank');
        }
    } catch (e) {
        console.error('✗ Puppeteer test FAILED:', e.message);
    } finally {
        if (browser) await browser.close();
    }

    // 4. If there's a recent template doc, simulate what finalize-draft would produce
    const templateDoc = recentDocs.find(d => d.isTemplate && !d.isDraft);
    if (templateDoc) {
        console.log('\n=== TEMPLATE HTML SIMULATION ===');
        console.log(`Template: "${templateDoc.name}"`);
        
        const docMargins = templateDoc.margins || { top: 40, right: 40, bottom: 40, left: 40 };
        let pagesHtml = '';
        
        for (let i = 0; i < (templateDoc.pages || []).length; i++) {
            const page = templateDoc.pages[i];
            const pageContent = page.content || '';
            const isLast = i === (templateDoc.pages || []).length - 1;
            
            pagesHtml += `<div class="doc-page" ${!isLast ? 'style="page-break-after: always;"' : ''}>`;
            if (templateDoc.headerHtml) {
                pagesHtml += `<div class="doc-header" style="padding: ${docMargins.top}px ${docMargins.right}px 0 ${docMargins.left}px;">${templateDoc.headerHtml}</div>`;
            }
            pagesHtml += `<div class="doc-content" style="padding: ${docMargins.top}px ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${pageContent}</div>`;
            if (templateDoc.footerHtml) {
                pagesHtml += `<div class="doc-footer" style="padding: 0 ${docMargins.right}px ${docMargins.bottom}px ${docMargins.left}px;">${templateDoc.footerHtml}</div>`;
            }
            pagesHtml += `</div>`;
        }
        
        console.log(`Full pagesHtml length: ${pagesHtml.length}`);
        console.log(`First 500 chars: ${pagesHtml.substring(0, 500)}`);
    }

    await conn.close();
    console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
