import { test, expect, type Page } from '@playwright/test'
import { loginAs, mockProviderModels } from './helpers/auth'

/**
 * Quick Chat (Quick Session) panel tests.
 *
 * The quick chat opens as a side sheet from the main conversation header.
 * It creates an ephemeral session that doesn't pollute the main history.
 *
 * These tests run after 01-onboarding (DB seeded) and create their own kin.
 */

async function loginAndCreateKin(page: Page) {
  await mockProviderModels(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10_000 })
  await loginAs(page)
  await expect(page.getByText('Kins', { exact: true })).toBeVisible({ timeout: 10_000 })

  // Create a kin
  await page.getByTitle('New Kin').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Create manually' }).click()
  await page.fill('#kinFormName', 'Quick Chat Test Kin')
  await page.fill('#kinFormRole', 'Test kin for quick chat')
  const modelPicker = page.getByRole('combobox').first()
  await modelPicker.click()
  await page.getByRole('option', { name: /GPT-4o/i }).click()
  await page.locator('#kinFormName').click()
  await page.getByRole('button', { name: 'Create Kin' }).click()

  // Wait for kin to appear in sidebar then navigate to chat
  await expect(page.getByText('Quick Chat Test Kin').first()).toBeVisible({ timeout: 15_000 })
  await page.getByText('Quick Chat Test Kin').first().click()
  await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10_000 })
}

async function loginAndOpenExistingKin(page: Page) {
  await mockProviderModels(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10_000 })
  await loginAs(page)
  await expect(page.getByText('Kins', { exact: true })).toBeVisible({ timeout: 10_000 })

  // Click existing kin
  await page.getByText('Quick Chat Test Kin').first().click()
  await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10_000 })
}

/** Open the quick chat panel and return the sheet locator */
async function openQuickPanel(page: Page): Promise<void> {
  const quickBtn = page.locator('button:has(.lucide-zap)').first()
  await quickBtn.click()
  await expect(page.getByText('Quick Session')).toBeVisible({ timeout: 5_000 })
}

/**
 * Send a message in the quick chat panel so the session has content.
 * This is needed for the close dialog to show (it skips if empty).
 */
async function sendQuickMessage(page: Page, text: string) {
  const sheet = page.locator('[data-slot="sheet-content"]')
  const textarea = sheet.locator('textarea')
  await textarea.fill(text)
  await textarea.press('Enter')
  // Wait for the user message to appear in the panel
  await expect(sheet.getByText(text)).toBeVisible({ timeout: 5_000 })
}

test.describe.serial('Quick Chat', () => {
  test('create kin and verify quick session button visible', async ({ page }) => {
    await loginAndCreateKin(page)

    const quickBtn = page.locator('button:has(.lucide-zap)').first()
    await expect(quickBtn).toBeVisible({ timeout: 5_000 })
  })

  test('opens quick chat panel on click', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)

    // Verify key elements in the panel
    const sheet = page.locator('[data-slot="sheet-content"]')
    await expect(sheet.getByText(/private conversation/i)).toBeVisible({ timeout: 5_000 })
  })

  test('quick chat panel has message input', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)

    const sheet = page.locator('[data-slot="sheet-content"]')
    await expect(sheet.locator('textarea')).toBeVisible({ timeout: 5_000 })
  })

  test('close quick chat panel with X button', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)

    const sheet = page.locator('[data-slot="sheet-content"]')
    const closeBtn = sheet.locator('button:has(.lucide-x)').first()
    await closeBtn.click()

    await expect(page.getByText('Quick Session')).not.toBeVisible({ timeout: 5_000 })
  })

  test('end empty session closes immediately (no dialog)', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)

    // With no messages, end session closes immediately without dialog
    const sheet = page.locator('[data-slot="sheet-content"]')
    const endBtn = sheet.locator('button:has(.lucide-log-out)')
    await endBtn.click()

    // Panel should close directly — no confirmation dialog
    await expect(page.getByText('Quick Session')).not.toBeVisible({ timeout: 5_000 })
  })

  test('send message in quick chat', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)
    await sendQuickMessage(page, 'Hello from quick chat test')
  })

  test('end session with messages shows close dialog', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)
    await sendQuickMessage(page, 'Test message for dialog')

    const sheet = page.locator('[data-slot="sheet-content"]')
    const endBtn = sheet.locator('button:has(.lucide-log-out)')
    await endBtn.click()

    await expect(page.getByText('Close quick session?')).toBeVisible({ timeout: 5_000 })
    // Default action button says "Close without saving" (changes to "Save & close" when checkbox is checked)
    await expect(page.getByText('Close without saving')).toBeVisible()
    await expect(page.getByText('Save a summary as memory')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('close without saving ends session', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)
    await sendQuickMessage(page, 'Another test message')

    const sheet = page.locator('[data-slot="sheet-content"]')
    const endBtn = sheet.locator('button:has(.lucide-log-out)')
    await endBtn.click()

    await expect(page.getByText('Close quick session?')).toBeVisible({ timeout: 5_000 })
    await page.getByText('Close without saving').click()

    await expect(page.getByText('Quick Session')).not.toBeVisible({ timeout: 5_000 })
  })

  test('history button shows session history', async ({ page }) => {
    await loginAndOpenExistingKin(page)
    await openQuickPanel(page)

    const sheet = page.locator('[data-slot="sheet-content"]')
    const historyBtn = sheet.locator('button:has(.lucide-history)')
    await historyBtn.click()

    await expect(page.getByText('Session History')).toBeVisible({ timeout: 5_000 })
  })
})
