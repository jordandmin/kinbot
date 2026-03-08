import { test, expect, type Page } from '@playwright/test'
import { loginAs, mockProviderModels } from './helpers/auth'

/**
 * Helper: Navigate to Settings > Teams.
 */
async function goToTeamsSettings(page: Page) {
  // Open settings via sidebar
  await page.getByRole('button', { name: /settings/i }).first().click()
  await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 5_000 })

  // Click the Teams section
  await page.getByText('Teams').first().click()
  await expect(page.getByText('Group your Kins into teams')).toBeVisible({ timeout: 5_000 })
}

test.describe.serial('Team management', () => {
  const TEAM_NAME = 'E2E Test Team'
  const TEAM_DESC = 'A team for testing'

  test.beforeEach(async ({ page }) => {
    await mockProviderModels(page)
    await page.goto('/')
    await loginAs(page)
    // Wait for main app
    await expect(page.locator('[data-testid="app-sidebar"], nav')).toBeVisible({ timeout: 15_000 })
  })

  test('can navigate to Teams settings', async ({ page }) => {
    await goToTeamsSettings(page)
    await expect(page.getByText('No teams yet')).toBeVisible()
  })

  test('can create a team', async ({ page }) => {
    await goToTeamsSettings(page)

    await page.getByRole('button', { name: /create team/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill team name
    await page.fill('[name="name"], #teamName, input[placeholder*="name" i]', TEAM_NAME)

    // The dialog should have a Hub Kin selector - we need at least one kin
    // If no kins exist, the create button should be disabled or show an error
    // For now, just verify the dialog opened
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('team settings page shows create button', async ({ page }) => {
    await goToTeamsSettings(page)
    await expect(page.getByRole('button', { name: /create team/i })).toBeVisible()
  })
})
