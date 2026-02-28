import { test, expect } from '@playwright/test'
import { loginAs, TEST_USER } from './helpers/auth'

test.describe.serial('Login flow', () => {
  test('successful login', async ({ page }) => {
    // Onboarding already completed by 01-onboarding, so we should see login page
    // First, clear any existing session by visiting a clean page
    await page.goto('/')

    // Should see the login form (admin exists, user is not authenticated)
    await expect(page.getByText('Sign in to your KinBot workspace')).toBeVisible({ timeout: 10_000 })

    // Fill login form
    await loginAs(page)

    // Should redirect to main app after login
    await expect(page.getByText('Kins', { exact: true })).toBeVisible({ timeout: 10_000 })
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    // Clear cookies to ensure we're logged out
    await page.context().clearCookies()
    await page.goto('/')

    await expect(page.getByText('Sign in to your KinBot workspace')).toBeVisible({ timeout: 10_000 })

    // Fill with wrong password
    await loginAs(page, TEST_USER.email, 'WrongPassword123!')

    // Should show error message
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5_000 })

    // Should still be on login page
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('login with non-existent email shows error', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/')

    await expect(page.getByText('Sign in to your KinBot workspace')).toBeVisible({ timeout: 10_000 })

    await loginAs(page, 'nobody@kinbot.local', 'SomePassword123!')

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5_000 })
  })
})
