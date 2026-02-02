/**
 * Playwright E2E Tests for Document Editor Paste Special
 * 
 * Tests 3 paste modes:
 * - keep: Preserve source formatting (fonts, colors, borders)
 * - match: Clean and beautify for destination
 * - plain: Strip all HTML, text only
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Fixture paths
const FIXTURES_DIR = path.join(__dirname, '../../fixtures/clipboard/word-samples');

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

        const activeElement = document.activeElement;
        if (activeElement && activeElement.hasAttribute('contenteditable')) {
            activeElement.dispatchEvent(pasteEvent);
        } else {
            // Find contenteditable and focus it
            const editable = document.querySelector('[contenteditable="true"]');
            if (editable) {
                (editable as HTMLElement).focus();
                editable.dispatchEvent(pasteEvent);
            }
        }
    }, html);
}

// Helper to select paste mode
async function selectPasteMode(page: any, mode: 'keep' | 'match' | 'plain') {
    // Hover over paste mode button to show dropdown
    await page.locator('[title="Mode de collage"]').hover();

    // Wait for dropdown to appear
    await page.waitForSelector('.group-hover\\:block', { state: 'visible', timeout: 2000 }).catch(() => { });

    // Click the appropriate mode option
    const modeLabels: Record<string, string> = {
        keep: 'Coller source',
        match: 'Adapter style',
        plain: 'Texte brut'
    };

    await page.getByText(modeLabels[mode]).click();
}

test.describe('Paste Special Feature', () => {
    // Navigate to document editor before each test
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
    });

    test.describe('Keep Source Mode', () => {
        test('preserves fonts and colors from simple text', async ({ page }) => {
            const fixture = loadFixture('simple-text.html');

            // Select "Keep Source" mode
            await selectPasteMode(page, 'keep');

            // Click in the contenteditable area
            await page.click('[contenteditable="true"]');

            // Simulate paste
            await simulatePaste(page, fixture);

            // Wait for content to be processed
            await page.waitForTimeout(500);

            // Take screenshot for visual comparison
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('keep-source-simple-text.png');

            // Verify specific styles are preserved
            const content = await page.locator('[contenteditable="true"]').innerHTML();

            // Should preserve font-family
            expect(content).toMatch(/font-family/i);

            // Should preserve color
            expect(content).toMatch(/color/i);
        });

        test('preserves table borders and cell colors', async ({ page }) => {
            const fixture = loadFixture('table-with-borders.html');

            await selectPasteMode(page, 'keep');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, fixture);

            await page.waitForTimeout(500);

            // Take screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('keep-source-table.png');

            // Verify table exists
            const tableExists = await page.locator('[contenteditable="true"] table').count();
            expect(tableExists).toBeGreaterThan(0);

            // Verify border styles are preserved
            const content = await page.locator('[contenteditable="true"]').innerHTML();
            expect(content).toMatch(/border/i);
        });
    });

    test.describe('Match Destination Mode', () => {
        test('beautifies table with consistent styles', async ({ page }) => {
            const fixture = loadFixture('table-with-borders.html');

            await selectPasteMode(page, 'match');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, fixture);

            await page.waitForTimeout(500);

            // Take screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('match-destination-table.png');

            // Verify table has beautified styles (border-collapse: collapse)
            const tableStyle = await page.locator('[contenteditable="true"] table').getAttribute('style');
            expect(tableStyle).toContain('border-collapse');
            expect(tableStyle).toContain('collapse');
        });

        test('cleans complex Word formatting', async ({ page }) => {
            const fixture = loadFixture('complex-formatting.html');

            await selectPasteMode(page, 'match');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, fixture);

            await page.waitForTimeout(500);

            // Take screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('match-destination-complex.png');

            // Verify MSO styles are removed
            const content = await page.locator('[contenteditable="true"]').innerHTML();
            expect(content).not.toMatch(/mso-/i);
            expect(content).not.toMatch(/<o:p>/i);
        });
    });

    test.describe('Plain Text Mode', () => {
        test('strips all HTML from simple text', async ({ page }) => {
            const fixture = loadFixture('simple-text.html');

            await selectPasteMode(page, 'plain');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, fixture);

            await page.waitForTimeout(500);

            // Take screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('plain-text-simple.png');

            // Verify no styling elements remain
            const content = await page.locator('[contenteditable="true"]').innerHTML();

            // Should not contain style attributes or span/div with styles
            expect(content).not.toMatch(/<span[^>]*style=/i);
            expect(content).not.toMatch(/<table/i);
        });

        test('converts table to plain text', async ({ page }) => {
            const fixture = loadFixture('table-with-borders.html');

            await selectPasteMode(page, 'plain');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, fixture);

            await page.waitForTimeout(500);

            // Take screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('plain-text-table.png');

            // Verify table is gone
            const tableExists = await page.locator('[contenteditable="true"] table').count();
            expect(tableExists).toBe(0);

            // Verify text content is preserved
            const textContent = await page.locator('[contenteditable="true"]').textContent();
            expect(textContent).toContain('Column A');
            expect(textContent).toContain('Cell 1');
        });
    });

    test.describe('Mode Switching', () => {
        test('can switch between modes and paste different content', async ({ page }) => {
            const simpleFixture = loadFixture('simple-text.html');
            const tableFixture = loadFixture('table-with-borders.html');

            // First paste with Keep Source
            await selectPasteMode(page, 'keep');
            await page.click('[contenteditable="true"]');
            await simulatePaste(page, simpleFixture);
            await page.waitForTimeout(300);

            // Then paste with Plain Text
            await selectPasteMode(page, 'plain');
            await simulatePaste(page, tableFixture);
            await page.waitForTimeout(300);

            // Finally paste with Match Destination
            await selectPasteMode(page, 'match');
            await simulatePaste(page, tableFixture);
            await page.waitForTimeout(300);

            // Take final screenshot
            await expect(page.locator('[contenteditable="true"]')).toHaveScreenshot('mode-switching-combined.png');
        });
    });
});
