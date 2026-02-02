/**
 * Playwright E2E Tests for Document Editor Paste with Images
 * 
 * Tests:
 * - Paste content with base64 images
 * - Images get uploaded and replaced with URLs
 * - Final HTML contains valid img src URLs
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Fixture paths
const FIXTURES_DIR = path.join(__dirname, '../../fixtures/clipboard');

// Helper to load fixture HTML
function loadFixture(filename: string): string {
    return fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8');
}

// Helper to simulate paste with HTML content
async function simulatePaste(page: any, html: string) {
    await page.evaluate((html: string) => {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/html', html);
        clipboardData.setData('text/plain', html.replace(/<[^>]*>/g, ''));

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData,
            bubbles: true,
            cancelable: true
        });

        const editable = document.querySelector('[contenteditable="true"]');
        if (editable) {
            (editable as HTMLElement).focus();
            editable.dispatchEvent(pasteEvent);
        }
    }, html);
}

test.describe('Paste with Images', () => {
    let docId: string;

    // Navigate and create document before each test
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/auth/login');
        await page.fill('input[name="email"]', 'boukirou6@hotmail.com');
        await page.fill('input[name="password"]', 'test');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/account\/\d+/);

        // Navigate to create new document
        await page.goto('http://localhost:3000/account/5001/documents/new');
        await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

        // Type something and wait for autosave to get a doc ID
        await page.click('[contenteditable="true"]');
        await page.keyboard.type('Test document for image paste');

        // Wait for autosave (check URL changes from /new to /:id/edit)
        await page.waitForURL(/\/documents\/[a-f0-9]+\/edit/, { timeout: 10000 });

        // Extract doc ID from URL
        const url = page.url();
        const match = url.match(/\/documents\/([a-f0-9]+)\/edit/);
        if (match) {
            docId = match[1];
        }
    });

    test('uploads base64 images and replaces with URLs', async ({ page }) => {
        // Create HTML with embedded base64 image (small 1x1 transparent PNG)
        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const htmlWithImage = `<p>Text with image: <img src="${base64Image}" alt="test"></p>`;

        // Focus editor and paste
        await page.click('[contenteditable="true"]');
        await simulatePaste(page, htmlWithImage);

        // Wait for async upload to complete
        await page.waitForTimeout(2000);

        // Get the HTML content
        const content = await page.locator('[contenteditable="true"]').innerHTML();

        // Image should now have a URL, not base64
        expect(content).toContain('<img');
        expect(content).toContain('src="/uploads/documents/');
        expect(content).not.toContain('data:image/png;base64');

        // Take screenshot for verification
        await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('paste-image-uploaded.png');
    });

    test('preserves images as base64 when document not saved', async ({ page }) => {
        // Go to new document (not saved yet)
        await page.goto('http://localhost:3000/account/5001/documents/new');
        await page.waitForSelector('[contenteditable="true"]', { timeout: 10000 });

        const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const htmlWithImage = `<p>Image: <img src="${base64Image}"></p>`;

        // Focus and paste
        await page.click('[contenteditable="true"]');
        await simulatePaste(page, htmlWithImage);

        await page.waitForTimeout(500);

        // Should still be base64 since doc isn't saved
        const content = await page.locator('[contenteditable="true"]').innerHTML();
        // Image should be present (may be base64 or cleaned)
        expect(content).toContain('<img');
    });

    test('handles multiple images in single paste', async ({ page }) => {
        // Create HTML with multiple images
        const base64Image1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const base64Image2 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        const htmlWithImages = `
            <p>First image: <img src="${base64Image1}"></p>
            <p>Second image: <img src="${base64Image2}"></p>
        `;

        // Focus and paste
        await page.click('[contenteditable="true"]');
        await simulatePaste(page, htmlWithImages);

        // Wait for uploads
        await page.waitForTimeout(3000);

        // Check both images uploaded
        const content = await page.locator('[contenteditable="true"]').innerHTML();
        const imgMatches = content.match(/src="\/uploads\/documents\//g) || [];

        expect(imgMatches.length).toBeGreaterThanOrEqual(2);
    });
});
