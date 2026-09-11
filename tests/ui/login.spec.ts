import { test, expect } from '@playwright/test'
import { LoginPage } from '../../page-objects/LoginPage'
import { users, validUsers } from '../../data/users'
import { SideMenu } from '../../page-objects/components/SideMenu'

test.describe('Login', () => {
  let login: LoginPage

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page)
    await login.goto()
  })

  test('login form is visible', async () => {
    await expect(login.username).toBeVisible()
    await expect(login.password).toBeVisible()
    await expect(login.loginButton).toBeVisible()
  })

  for (const user of validUsers) {
    test(`${user.username} logs in successfully`, async () => {
      await login.login(user.username, user.password)
      await login.expectLoggedIn()
    })
  }

  test('locked_out_user is rejected', async () => {
    await login.login(users.lockedOut.username, users.lockedOut.password)
    await login.expectError(/locked out/i)
  })

  test('wrong password is rejected', async () => {
    await login.login(users.standard.username, 'wrong_password')
    await login.expectError(/do not match/i)
  })

  test('unknown user is rejected', async () => {
    await login.login('no_such_user', users.standard.password)
    await login.expectError(/do not match/i)
  })

  test('empty username shows required error', async () => {
    await login.login('', users.standard.password)
    await login.expectError(/Username is required/i)
  })

  test('empty password shows required error', async () => {
    await login.login(users.standard.username, '')
    await login.expectError(/Password is required/i)
  })

  test('empty form shows username required error', async () => {
    await login.loginButton.click()
    await login.expectError(/Username is required/i)
  })

  test('error message can be dismissed', async ({ page }) => {
    await login.login(users.lockedOut.username, users.lockedOut.password)
    await login.expectError(/locked out/i)
    await login.errorButton.click()
    await expect(login.error).toHaveCount(0)
  })

  test('successful login then logout returns to login', async ({ page }) => {
    const menu = new SideMenu(page)
    await login.login(users.standard.username, users.standard.password)
    await login.expectLoggedIn()
    await menu.logout()
    await expect(login.loginButton).toBeVisible()
  })

})
