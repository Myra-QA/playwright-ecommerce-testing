import { type Page, type Locator, expect } from '@playwright/test'

export class Footer {

    readonly footerCopy: Locator
    readonly twitterLink: Locator
    readonly facebookLink: Locator
    readonly linkedinLink: Locator

    constructor(page: Page){

        this.footerCopy = page.getByTestId('footer-copy')
        this.twitterLink = page.getByTestId('social-x')
        this.facebookLink = page.getByTestId('social-facebook')
        this.linkedinLink = page.getByTestId('social-linkedin')

    }

    async expectFooterVisible() {

        await expect(this.footerCopy).toContainText('Sauce Labs')
        await expect(this.twitterLink).toBeVisible()
        await expect(this.facebookLink).toBeVisible()
        await expect(this.linkedinLink).toBeVisible()

    }
}