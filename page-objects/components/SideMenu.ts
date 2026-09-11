import { type Page, type Locator, expect } from '@playwright/test'

export class SideMenu {

    readonly page: Page
    readonly menuButton: Locator
    readonly allItemsButton: Locator
    readonly aboutButton: Locator
    readonly logoutButton: Locator
    readonly resetAppStateButton: Locator

    constructor (page: Page){

        this.page = page
        this.menuButton = page.getByRole('button', { name: 'Open Menu' })
        this.allItemsButton = page.getByTestId('inventory-sidebar-link')
        this.aboutButton = page.getByTestId('about-sidebar-link')
        this.logoutButton = page.getByTestId('logout-sidebar-link')
        this.resetAppStateButton = page.getByTestId('reset-sidebar-link')
    }

    async open() {
        await this.menuButton.click()
        await expect(this.resetAppStateButton).toBeVisible()

    }

    async resetAppState() {
    await this.open()
    await this.resetAppStateButton.click()
  }

  async expectLinksVisible() {
    await expect(this.allItemsButton).toBeVisible()
    await expect(this.aboutButton).toBeVisible()
    await expect(this.logoutButton).toBeVisible()
    await expect(this.resetAppStateButton).toBeVisible()
  }

    async logout() {
        await this.menuButton.click()
        await this.logoutButton.click()
    }

}