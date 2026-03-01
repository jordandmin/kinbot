import { test, expect, type Page } from '@playwright/test'
import { loginAs, mockProviderModels } from './helpers/auth'

/**
 * Open Settings dialog and navigate to the Webhooks section.
 */
async function openWebhookSettings(page: Page) {
  await page.locator('button:has(.lucide-settings-2)').click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

  await page.getByRole('dialog').getByText('Webhooks', { exact: true }).click()
  await expect(
    page.getByText('Manage incoming webhooks that allow external services to notify your Kins.')
  ).toBeVisible({ timeout: 5_000 })
}

/**
 * Mock webhook API routes to avoid real side effects.
 */
async function mockWebhookApis(page: Page) {
  // Mock regenerate-token endpoint
  await page.route('**/api/webhooks/*/regenerate-token', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ token: 'regenerated-fake-token-1234567890abcdef' }),
      })
    }
    return route.continue()
  })
}

/**
 * Create a webhook via the form dialog.
 * Assumes webhook settings are already open.
 */
async function createWebhook(page: Page, name: string, description?: string) {
  // Click the "Add webhook" button
  const addButton = page.getByRole('button', { name: /add webhook/i })
  await addButton.first().click()

  // Wait for dialog
  await expect(page.getByRole('heading', { name: 'Add webhook' })).toBeVisible({ timeout: 5_000 })

  // Select a Kin (Radix Select)
  const kinSelect = page.locator('[data-slot="select-trigger"]').filter({ hasText: /select a kin/i })
  if (await kinSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await kinSelect.click()
    await page.locator('[data-slot="select-item"]').first().click({ timeout: 5_000 })
  }

  // Fill name
  await page.getByPlaceholder('e.g. Grafana alerts, K8s events...').fill(name)

  // Fill description if provided
  if (description) {
    await page.getByPlaceholder('What will this webhook receive?').fill(description)
  }

  // Save
  await page.getByRole('button', { name: /save/i }).click()

  // After creation, a token reveal dialog appears — close it
  await expect(page.getByText('Webhook created')).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'Close', exact: true }).first().click()

  // Verify webhook appears in the list
  await expect(page.getByText(name).first()).toBeVisible({ timeout: 5_000 })
}

/**
 * Create a Kin via the sidebar "+" button if none exists (needed for webhook creation).
 */
async function ensureKinExists(page: Page) {
  const noKins = page.getByText('No Kins yet')
  if (await noKins.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await page.getByTitle('New Kin').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Create manually' }).click()
    await page.fill('#kinFormName', 'Webhook Test Kin')
    await page.fill('#kinFormRole', 'Test kin for webhook E2E')

    // Select model
    const modelPicker = page.getByRole('combobox').first()
    await modelPicker.click()
    await page.getByRole('option', { name: /GPT-4o/i }).click()
    await page.locator('#kinFormName').click()

    await page.getByRole('button', { name: 'Create Kin' }).click()
    await expect(page.getByText('Webhook Test Kin').first()).toBeVisible({ timeout: 15_000 })
  }
}

test.describe.serial('Webhook management', () => {
  test.beforeEach(async ({ page }) => {
    await mockProviderModels(page)
    await mockWebhookApis(page)

    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10_000 })
    await loginAs(page)
    await expect(page.getByText('Kins', { exact: true })).toBeVisible({ timeout: 10_000 })
  })

  test('should ensure a Kin exists for webhook tests', async ({ page }) => {
    await ensureKinExists(page)
  })

  test('should open settings and see Webhooks section', async ({ page }) => {
    await openWebhookSettings(page)

    // Should show the description text
    await expect(
      page.getByText('Manage incoming webhooks that allow external services to notify your Kins.')
    ).toBeVisible()
  })

  test('should see empty state when no webhooks exist', async ({ page }) => {
    await openWebhookSettings(page)

    await expect(page.getByText('No webhooks configured')).toBeVisible({ timeout: 5_000 })
  })

  test('should create a webhook with name and description', async ({ page }) => {
    await openWebhookSettings(page)
    await createWebhook(page, 'CI Pipeline Alerts', 'GitHub Actions failure notifications')

    // Verify description is visible on the card
    await expect(page.getByText('GitHub Actions failure notifications')).toBeVisible()
  })

  test('should show token reveal dialog after creation with URL and token', async ({ page }) => {
    await openWebhookSettings(page)

    // Create another webhook but inspect the reveal dialog
    const addButton = page.getByRole('button', { name: /add webhook/i })
    await addButton.first().click()

    await expect(page.getByRole('heading', { name: 'Add webhook' })).toBeVisible({ timeout: 5_000 })

    const kinSelect = page.locator('[data-slot="select-trigger"]').filter({ hasText: /select a kin/i })
    if (await kinSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await kinSelect.click()
      await page.locator('[data-slot="select-item"]').first().click({ timeout: 5_000 })
    }

    await page.getByPlaceholder('e.g. Grafana alerts, K8s events...').fill('Monitoring Webhook')
    await page.getByRole('button', { name: /save/i }).click()

    // Token reveal dialog should appear
    await expect(page.getByText('Webhook created')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Save this token now - it will not be shown again.')).toBeVisible()

    // Should show URL and Token labels
    await expect(page.getByText('URL', { exact: true })).toBeVisible()
    await expect(page.getByText('Token', { exact: true })).toBeVisible()

    // Close the dialog
    await page.getByRole('button', { name: 'Close', exact: true }).first().click()
  })

  test('should edit a webhook name', async ({ page }) => {
    await openWebhookSettings(page)
    await expect(page.getByText('CI Pipeline Alerts')).toBeVisible({ timeout: 10_000 })

    // Click pencil edit button on the webhook card
    const webhookCard = page.locator('.surface-card', { hasText: 'CI Pipeline Alerts' })
    await webhookCard.locator('button:has(.lucide-pencil)').click()

    // Wait for edit dialog
    await expect(page.getByRole('heading', { name: 'Edit webhook' })).toBeVisible({ timeout: 5_000 })

    // Change name
    const nameInput = page.getByPlaceholder('e.g. Grafana alerts, K8s events...')
    await nameInput.clear()
    await nameInput.fill('Renamed Pipeline Alerts')

    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText('Renamed Pipeline Alerts')).toBeVisible({ timeout: 10_000 })
  })

  test('should toggle webhook active/inactive', async ({ page }) => {
    await openWebhookSettings(page)
    await expect(page.getByText('Renamed Pipeline Alerts')).toBeVisible({ timeout: 10_000 })

    // Find the switch on the webhook card
    const webhookCard = page.locator('.surface-card', { hasText: 'Renamed Pipeline Alerts' })
    const toggle = webhookCard.locator('button[role="switch"]')

    // Toggle off
    await toggle.click()
    // Wait for the update to process
    await page.waitForTimeout(1_000)

    // Toggle back on
    await toggle.click()
    await page.waitForTimeout(1_000)
  })

  test('should delete a webhook with confirmation', async ({ page }) => {
    await openWebhookSettings(page)
    await expect(page.getByText('Renamed Pipeline Alerts')).toBeVisible({ timeout: 10_000 })

    const webhookCard = page.locator('.surface-card', { hasText: 'Renamed Pipeline Alerts' })
    const deleteBtn = webhookCard.locator('button:has(.lucide-trash-2), button:has(.lucide-trash)')
    await deleteBtn.click()

    // ConfirmDeleteButton uses AlertDialog
    const confirmBtn = page.locator('[role="alertdialog"] button').filter({ hasText: /delete/i })
    await expect(confirmBtn).toBeVisible({ timeout: 2_000 })
    await confirmBtn.click()

    await expect(page.getByText('Renamed Pipeline Alerts')).not.toBeVisible({ timeout: 10_000 })
  })

  test('should clean up: delete remaining webhook', async ({ page }) => {
    await openWebhookSettings(page)
    await expect(page.getByText('Monitoring Webhook')).toBeVisible({ timeout: 10_000 })

    const webhookCard = page.locator('.surface-card', { hasText: 'Monitoring Webhook' })
    const deleteBtn = webhookCard.locator('button:has(.lucide-trash-2), button:has(.lucide-trash)')
    await deleteBtn.click()

    const confirmBtn = page.locator('[role="alertdialog"] button').filter({ hasText: /delete/i })
    await expect(confirmBtn).toBeVisible({ timeout: 2_000 })
    await confirmBtn.click()

    await expect(page.getByText('Monitoring Webhook')).not.toBeVisible({ timeout: 10_000 })

    // Should show empty state again
    await expect(page.getByText('No webhooks configured')).toBeVisible({ timeout: 5_000 })
  })
})
