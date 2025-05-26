const { test, expect, beforeEach, describe } = require('@playwright/test')
import { loginWith, createBlogWith } from './helper'

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
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByText('login')).toBeVisible()
  })

  test.describe('Login', () => {
    test('fails with wrong credentials', async ({ page }) => {
        await page.goto('http://localhost:5173')

        await loginWith(page, 'wrongusername', 'wrongpassword')

        //await page.getByTestId('username').fill('wrongusername')
        //await page.getByTestId('password').fill('wrongpassword')
        //await page.getByRole('button', { name: 'login' }).click()

        await expect(page.getByText('wrong username or password')).toBeVisible()
    })

    test('succeeds with correct credentials', async ({ page }) => {
        await page.goto('http://localhost:5173')

        await loginWith(page, 'magicadehex', 'magiaa123')

        //await page.getByTestId('username').fill('magicadehex')
        //await page.getByTestId('password').fill('magiaa123')
        //await page.getByRole('button', { name: 'login' }).click()
        
        await expect(page.getByText('Welcome, Milla Magia!')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173')

      await loginWith(page, 'magicadehex', 'magiaa123')

      //await page.getByTestId('username').fill('magicadehex')
      //await page.getByTestId('password').fill('magiaa123')
      //await page.getByRole('button', { name: 'login' }).click()
    })
  
    test('a new blog can be created', async ({ page }) => {
      await expect(page.getByText('create new blog')).toBeVisible()
      //await page.getByRole('button', { name: 'create new blog' }).click()

      await createBlogWith(page, 'all about magic potions', 'Milla Magia', 'magicpotions.com')

      //await page.getByTestId('title').fill('all about magic potions')
      //await page.getByTestId('author').fill('Milla Magia')
      //await page.getByTestId('url').fill('magicpotions.com')

      //await page.getByRole('button', { name: 'create' }).click()
      await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).toBeVisible()
    })

    describe('and when there are a couple of blogs', () => {
      beforeEach(async ({ page }) => {
        // Create a blog post
        await createBlogWith(page, 'all about magic potions', 'Milla Magia', 'magicpotions.com')
        await createBlogWith(page, 'life at Vesuvius mountain', 'Milla Magia', 'vesuviuslife.com')
        //await page.getByRole('button', { name: 'create new blog' }).click()
        //await page.getByTestId('title').fill('all about magic potions')
        //await page.getByTestId('author').fill('Milla Magia')
        //await page.getByTestId('url').fill('magicpotions.com')
        //await page.getByRole('button', { name: 'create' }).click()
      })

      test('a blog can be liked', async ({ page }) => {
        await expect(page.getByText('show more information').first()).toBeVisible()
        await page.getByRole('button', { name: 'show more information' }).first().click()
  
        await expect(page.getByText('like this blog').first()).toBeVisible()
        await expect(page.getByText('Likes: 0').first()).toBeVisible()
        await page.getByRole('button', { name: 'like this blog' }).first().click()
  
        await expect(page.getByText('Likes: 1').first()).toBeVisible()      
      })

      test('a blog can be deleted', async ({ page }) => {
        await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).toBeVisible()
        await expect(page.getByText('life at Vesuvius mountain by Milla Magia', { exact: true })).toBeVisible()

        await expect(page.getByText('delete this blog').first()).toBeVisible()

        page.on('dialog', async (dialog) => {
          expect(dialog.message()).toContain('Delete the blog')
          await dialog.accept()
        })

        await page.getByRole('button', { name: 'delete this blog' }).first().click()

        await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).not.toBeVisible()
        await expect(page.getByText('life at Vesuvius mountain by Milla Magia', { exact: true })).toBeVisible()
      })
    })
  })
})