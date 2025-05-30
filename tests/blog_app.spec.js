const { test, expect, beforeEach, describe } = require('@playwright/test')
import { loginWith, createBlogWith, likeThisBlog } from './helper'

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
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Mansikka Marja',
        username: 'marjaa12',
        password: 'mansikka43'
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

        await expect(page.getByText('wrong username or password')).toBeVisible()
    })

    test('succeeds with correct credentials', async ({ page }) => {
        await page.goto('http://localhost:5173')

        await loginWith(page, 'magicadehex', 'magiaa123')
        
        await expect(page.getByText('Welcome, Milla Magia!')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173')

      await loginWith(page, 'magicadehex', 'magiaa123')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await expect(page.getByText('create new blog')).toBeVisible()

      await createBlogWith(page, 'all about magic potions', 'Milla Magia', 'magicpotions.com')

      await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).toBeVisible()
    })

    describe('and when there are a couple of blogs', () => {
      beforeEach(async ({ page }) => {
        // Create a blog post
        await createBlogWith(page, 'all about magic potions', 'Milla Magia', 'magicpotions.com')
        await createBlogWith(page, 'life at Vesuvius mountain', 'Milla Magia', 'vesuviuslife.com')
        await createBlogWith(page, 'magical girl', 'Milla Magia', 'magicalgirl.com')
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

      test('delete blog button for specific blog is visible only for the user who added the blog', async ({ page }) => {
        // Milla Magia is logged in: show Milla Magia's blogs
        await expect(page.getByText('Welcome, Milla Magia!')).toBeVisible()
        await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).toBeVisible()
        await expect(page.getByText('life at Vesuvius mountain by Milla Magia', { exact: true })).toBeVisible()

        // Delete buttons are visible
        await expect(page.getByText('delete this blog').first()).toBeVisible()
        await expect(page.getByText('delete this blog').last()).toBeVisible()

        // Log Milla Magia out
        await page.getByRole('button', { name: 'Log Out'}).click()
        // ...and log in as Mansikka Marja
        await loginWith(page, 'marjaa12', 'mansikka43')

        // Show list of blogs
        await expect(page.getByText('Welcome, Mansikka Marja!')).toBeVisible()
        await expect(page.getByText('all about magic potions by Milla Magia', { exact: true })).toBeVisible()
        await expect(page.getByText('life at Vesuvius mountain by Milla Magia', { exact: true })).toBeVisible()

        // This time, delete buttons are NOT visible
        await expect(page.getByText('delete this blog').first()).not.toBeVisible()
        await expect(page.getByText('delete this blog').last()).not.toBeVisible()
      })

      test.only('blogs are listed in order: blog with most likes is at the top', async ({ page }) => {
        //await expect(page.getByText('magical girl by Milla Magia', { exact: true })).toBeVisible()
        //await expect(page.getByRole('button', { name: 'show more information' }).nth(2)).toBeVisible()

        const blogs = page.locator('.blog') //div elements, gets the blogs' all information
        const blogCount = await blogs.count()
        console.log('Number of blogs:', blogCount)
        //await page.screenshot({ path: 'screenshot0.png' })

        const firstBlog = blogs.nth(0) // Select the first blog
        const firstBlogInfoButton = firstBlog.locator('button:has-text("show more information")')
        await expect(firstBlogInfoButton).toBeVisible()

        const secondBlog = blogs.nth(1); // Select the second blog
        const secondBlogInfoButton = secondBlog.locator('button:has-text("show more information")')
        await expect(secondBlogInfoButton).toBeVisible();

        const thirdBlog = blogs.nth(2) // Select the third blog
        const thirdBlogInfoButton = thirdBlog.locator('button:has-text("show more information")')
        await expect(thirdBlogInfoButton).toBeVisible()

        await firstBlogInfoButton.click();
        await expect(page.getByText('Likes: 0').nth(0)).toBeVisible()
        await page.getByRole('button', { name: 'like this blog' }).nth(0).click()
        await page.getByText('Likes: 1').waitFor()  // Wait for the likes text to be rendered
        await page.screenshot({ path: 'screenshot1.png' })
        await page.getByRole('button', { name: 'hide information' }).click()
        await page.screenshot({ path: 'screenshot1b.png' })

        await secondBlogInfoButton.click()
        await page.screenshot({ path: 'screenshot2.png' })
        await expect(page.getByText('Likes: 0')).toBeVisible()
        await page.getByRole('button', { name: 'like this blog' }).click()
        await page.getByText('Likes: 1').waitFor()  // Wait for the likes text to be rendered
        //await page.screenshot({ path: 'screenshot2b.png' })
        await page.getByRole('button', { name: 'like this blog' }).click()
        await page.getByText('Likes: 2').waitFor()  // Wait for the likes text to be rendered
        //await page.screenshot({ path: 'screenshot2c.png' })
        await page.getByRole('button', { name: 'hide information' }).click()
        await page.screenshot({ path: 'screenshot2d.png' })

        await thirdBlogInfoButton.click()
        await page.screenshot({ path: 'screenshot3.png' })
        await expect(page.getByText('Likes: 0')).toBeVisible()
        await page.getByRole('button', { name: 'like this blog' }).click()
        await page.getByText('Likes: 1').waitFor()  // Wait for the likes text to be rendered
        await page.getByRole('button', { name: 'like this blog' }).click()
        await page.getByText('Likes: 2').waitFor()  // Wait for the likes text to be rendered
        await page.getByRole('button', { name: 'like this blog' }).click()
        await page.getByText('Likes: 3').waitFor()  // Wait for the likes text to be rendered
        await page.screenshot({ path: 'screenshot3a.png' })
        await page.getByRole('button', { name: 'hide information' }).click()
        await page.screenshot({ path: 'screenshot3b.png' })

        await page.screenshot({ path: 'screenshot4.png' })

        const titles = page.locator('.title') // p elements, gets the blogs only by their titles
        await expect(titles.nth(0)).toHaveText('magical girl by Milla Magia')
        await expect(titles.nth(1)).toHaveText('life at Vesuvius mountain by Milla Magia')
        await expect(titles.nth(2)).toHaveText('all about magic potions by Milla Magia')
      })
    })
  })
})