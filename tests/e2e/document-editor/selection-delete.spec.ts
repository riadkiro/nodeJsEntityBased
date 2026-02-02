import { test, expect } from '@playwright/test'

test.describe('Document editor global selection delete behavior', () => {
  test('Ctrl+A then Delete clears all pages to a single empty page', async ({ page }) => {
    // NOTE: adjust the URL to a running dev server route that mounts the editor
    await page.goto('http://localhost:3000/account/000/documents/new/edit-react')

    // Add a second page to validate multi-page behavior
    await page.click('button:has-text("Ajouter une page")')

    const pages = page.locator('[contenteditable="true"]')

    // Fill content on both pages
    await pages.nth(0).click()
    await page.keyboard.type('Page 1 content')

    await pages.nth(1).click()
    await page.keyboard.type('Page 2 content')

    // Ensure both pages contain text
    await expect(pages.nth(0)).toHaveText(/Page 1 content/)
    await expect(pages.nth(1)).toHaveText(/Page 2 content/)

    // Trigger global selection (Ctrl+A)
    await page.keyboard.down('Control')
    await page.keyboard.press('KeyA')
    await page.keyboard.up('Control')

    // Press Delete
    await page.keyboard.press('Delete')

    // Expect only one page remains
    const count = await page.locator('[contenteditable="true"]').count()
    expect(count).toBe(1)

    // Expect the remaining page to be empty
    const remaining = page.locator('[contenteditable="true"]').first()
    await expect(remaining).toHaveText('')
  })
})