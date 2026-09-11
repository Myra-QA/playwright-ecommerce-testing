import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page
    readonly username: Locator
    readonly password: Locator
    readonly loginButton: Locator
    readonly errorButton: Locator
    readonly error: Locator
    
    constructor(page: Page) {
        this.page = page
        this.username = page.getByTestId('username')
        this.password = page.getByTestId('password')
        this.loginButton = page.getByTestId('login-button')
        this.errorButton = page.getByTestId('error-button')
        this.error = page.getByTestId('error')

    }

    async goto() {
        await this.page.goto('/')
    }

    async login(username: string, password: string) {
        await this.username.fill(username)
        await this.password.fill(password)
        await this.loginButton.click()
    }

    async expectLoggedIn() {
        await expect(this.page).toHaveURL(/inventory\.html/)
    }

    async expectError(message: string | RegExp) {
        await expect(this.error).toContainText(message)
    }

}