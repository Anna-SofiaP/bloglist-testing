const { test, expect } = require('@playwright/test')

test('front page can be opened', async ({ page }) => {
  await page.goto('http://localhost:5173')

  const locator = await page.getByText('blogs')
  await expect(locator).toBeVisible()
  await expect(page.getByText('Log in to view your blogs')).toBeVisible()
})