const loginWith = async (page, username, password)  => {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByRole('button', { name: 'login' }).click()
}

const createBlogWith = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'create new blog' }).click()

    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill(author)
    await page.getByTestId('url').fill(url)

    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText(title + ' by ' + author, { exact: true }).waitFor()
}

const likeThisBlog = async (page, n) => {
    const buttons = await page.getByRole('button', { name: 'like this blog' })
    console.log(await buttons.count())

    await page.getByRole('button', { name: 'show more information' }).nth(n).click()
    await page.getByRole('button', { name: 'like this blog' }).nth(n).click()
}
  
export { loginWith, createBlogWith, likeThisBlog }