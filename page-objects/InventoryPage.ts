import { type Page, type Locator, expect } from '@playwright/test'

export class InventoryPage {

    readonly page: Page
    readonly title: Locator
    readonly cartLink: Locator
    readonly cartBadge: Locator
    readonly items: Locator
    readonly sortDropdown: Locator
  

    constructor(page: Page) {

        this.page = page
        this.title = page.getByTestId('title')
        this.cartLink = page.getByTestId('shopping-cart-link')
        this.cartBadge = page.getByTestId('shopping-cart-badge')
        this.items = page.getByTestId('inventory-item')
        this.sortDropdown = page.getByTestId('product-sort-container')
    

    }

    async expectLoaded() {
        await expect(this.title).toBeVisible()
        await expect(this.title).toHaveText('Products')
    }

    async addToCartByName(name: string) {
        const item = this.items.filter({ hasText: name })
        await item.getByRole('button', { name: /add to cart/i }).click()
    }

    async removeFromCartByName(name: string) {
        const item = this.items.filter({ hasText: name })
        await item.getByRole('button', { name: /remove/i }).click()
    }

    async expectCartCount(count: number) {
        if (count === 0) {
            await expect(this.cartBadge).toHaveCount(0)
        } else {
            await expect(this.cartBadge).toHaveText(String(count))
        }
    }

    async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo') {
        await this.sortDropdown.selectOption(value)

    }

    async productNames(): Promise<string[]> {
        return this.page.getByTestId('inventory-item-name').allInnerTexts()

    }

    async productPrices(): Promise<number[]> {
        const texts = await this.page.getByTestId('inventory-item-price').allInnerTexts()
        return texts.map((text) => Number(text.replace(/^\$/, '')))

    }

    async openProductByName(name: string) {
        const item = this.items.filter({ hasText: name })
        await item.getByTestId('inventory-item-name').click()

    }

    async expectAllProductNamesVisible() {
        const names = this.page.getByTestId('inventory-item-name')
        const count = await names.count()

        for (let i = 0; i < count; i++) {
            await expect(names.nth(i)).toBeVisible()
        }
    }

    async expectAllProductPricesVisible() {
        const prices = this.page.getByTestId('inventory-item-price')
        const count = await prices.count()

        for (let i = 0; i < count; i++) {
            await expect(prices.nth(i)).toBeVisible()
        }
    }

    async expectAllProductsHaveAddButton() {  
        const addButtons = this.items.getByRole('button', { name: /add to cart/i }); 
        await expect(addButtons).toHaveCount(await this.items.count())
        

    }

    async expectProductHasRemoveButton(name: string) {
        const item = this.items.filter({ hasText: name })
        await expect(item.getByRole('button', { name: /remove/i })).toBeVisible()

    }


    async itemCount(): Promise<number> {
        return this.items.count()
    }

}