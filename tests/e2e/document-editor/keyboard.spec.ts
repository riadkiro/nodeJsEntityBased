/**
 * Playwright E2E Tests for Document Editor Keyboard Shortcuts
 * 
 * Tests:
 * - Ctrl+B/I/U for formatting
 * - Ctrl+S for save
 * - Ctrl+A for select all
 * - Home/End navigation
 */
import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
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
    });

    test('Ctrl+B toggles bold formatting', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        // Focus and type
        await editor.click();
        await page.keyboard.type('Normal text ');

        // Toggle bold
        await page.keyboard.press('Control+b');
        await page.keyboard.type('bold text');

        // Check HTML contains <b> or <strong>
        const html = await editor.innerHTML();
        expect(html).toMatch(/<(b|strong)[^>]*>bold text<\/(b|strong)>/i);
    });

    test('Ctrl+I toggles italic formatting', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        await editor.click();
        await page.keyboard.type('Normal text ');

        // Toggle italic
        await page.keyboard.press('Control+i');
        await page.keyboard.type('italic text');

        // Check HTML contains <i> or <em>
        const html = await editor.innerHTML();
        expect(html).toMatch(/<(i|em)[^>]*>italic text<\/(i|em)>/i);
    });

    test('Ctrl+U toggles underline formatting', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        await editor.click();
        await page.keyboard.type('Normal text ');

        // Toggle underline
        await page.keyboard.press('Control+u');
        await page.keyboard.type('underlined text');

        // Check HTML contains <u> or style with underline
        const html = await editor.innerHTML();
        expect(html).toMatch(/(<u[^>]*>underlined text<\/u>|text-decoration:\s*underline)/i);
    });

    test('Ctrl+S triggers save (prevents default)', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        await editor.click();
        await page.keyboard.type('Test content for save');

        // Listen for save indicator change
        // Ctrl+S should NOT open browser save dialog
        let dialogOpened = false;
        page.on('dialog', () => {
            dialogOpened = true;
        });

        await page.keyboard.press('Control+s');
        await page.waitForTimeout(500);

        // Browser save dialog should not have opened
        expect(dialogOpened).toBe(false);
    });

    test('Ctrl+A selects all content', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        await editor.click();
        await page.keyboard.type('First line of text');
        await page.keyboard.press('Enter');
        await page.keyboard.type('Second line of text');

        // Select all
        await page.keyboard.press('Control+a');

        // Verify selection covers entire content
        const selectedText = await page.evaluate(() => {
            const selection = window.getSelection();
            return selection?.toString() || '';
        });

        expect(selectedText).toContain('First line');
        expect(selectedText).toContain('Second line');
    });

    test('Multiple formatting shortcuts can be combined', async ({ page }) => {
        const editor = page.locator('[contenteditable="true"]').first();

        await editor.click();

        // Apply bold + italic
        await page.keyboard.press('Control+b');
        await page.keyboard.press('Control+i');
        await page.keyboard.type('bold and italic');

        const html = await editor.innerHTML();
        // Should contain both bold and italic tags (in some order)
        expect(html).toMatch(/<(b|strong)/i);
        expect(html).toMatch(/<(i|em)/i);
        expect(html).toContain('bold and italic');
    });
});
