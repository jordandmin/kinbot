import { test, expect } from '@playwright/test'
import { loginAs, mockProviderModels, TEST_USER } from './helpers/auth'

test.describe.serial('Chat flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock provider models so the model picker works
    await mockProviderModels(page)

    // Login first
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({ timeout: 10_000 })
    await loginAs(page)
    await expect(page.getByText('Kins', { exact: true })).toBeVisible({ timeout: 10_000 })
  })

  test('create a kin', async ({ page }) => {
    // Click the "+" button to create a new Kin (title="New Kin")
    await page.getByTitle('New Kin').click()

    // The wizard dialog should open with "Describe your Kin"
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Describe your Kin')).toBeVisible()

    // Skip the AI wizard and go to manual form
    await page.getByRole('button', { name: 'Create manually' }).click()

    // Fill the form
    await page.fill('#kinFormName', 'Test Assistant')
    await page.fill('#kinFormRole', 'General helper for testing')

    // Select a model from the model picker
    const modelPicker = page.getByRole('combobox').first()
    await modelPicker.click()
    // Select the first LLM model option
    await page.getByRole('option', { name: /GPT-4o/i }).click()

    // Close the model picker popover by clicking elsewhere
    await page.locator('#kinFormName').click()

    // Submit the form
    await page.getByRole('button', { name: 'Create Kin' }).click()

    // The new kin should appear in the sidebar after dialog closes
    await expect(page.getByText('Test Assistant').first()).toBeVisible({ timeout: 15_000 })
  })

  test('send a message', async ({ page }) => {
    // The kin created in the previous test should be in the sidebar
    // Click on it to open the chat
    await page.getByText('Test Assistant').first().click()

    // The chat panel should show the message input
    const messageInput = page.getByPlaceholder('Send a message...')
    await expect(messageInput).toBeVisible({ timeout: 10_000 })

    // Type a message
    await messageInput.fill('Hello, this is a test message!')

    // Click the send button (it's an icon button with SendHorizontal)
    await page.locator('button:has(svg.lucide-send-horizontal)').click()

    // The user message should appear in the chat (as a paragraph, not the textarea)
    await expect(page.getByRole('paragraph').filter({ hasText: 'Hello, this is a test message!' }).first()).toBeVisible({ timeout: 10_000 })
  })
})
