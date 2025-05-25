const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Milla Magia',
        username: 'magicadehex',
        password: 'magiaa123'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByText('login')).toBeVisible()
  })

  describe('Login', () => {
    // Test login fail before testing login success
    // After login success the user is logged in
    test('fails with wrong credentials', async ({ page }) => {
        await page.goto('http://localhost:5173')

        await page.getByRole('textbox').first().fill('wrongusername')
        await page.getByRole('textbox').last().fill('wrongpassword')
        await page.getByRole('button', { name: 'login' }).click()

        await expect(page.getByText('wrong username or password')).toBeVisible()
    })

    test('succeeds with correct credentials', async ({ page }) => {
        await page.goto('http://localhost:5173')

        await page.getByRole('textbox').first().fill('magicadehex')
        await page.getByRole('textbox').last().fill('magiaa123')
        await page.getByRole('button', { name: 'login' }).click()
        
        await expect(page.getByText('Welcome, Milla Magia!')).toBeVisible()
    })
  })
})