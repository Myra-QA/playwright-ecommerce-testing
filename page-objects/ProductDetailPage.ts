import { type Page, type Locator, expect } from '@playwright/test'

export class ProductDetailPage {
  readonly page: Page
  readonly name: Locator
  readonly price: Locator
  readonly cartBadge: Locator
  readonly addButton: Locator
  readonly removeButton: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    this.name = page.getByTestId('inventory-item-name')
    this.price = page.getByTestId('inventory-item-price')
    this.cartBadge = page.getByTestId('shopping-cart-badge')
    this.addButton = page.getByRole('button', { name: /add to cart/i })
    this.removeButton = page.getByRole('button', { name: /remove/i })
    this.backButton = page.getByTestId('back-to-products')
  }

  async expectLoaded(){
    await expect(this.backButton).toBeVisible()
    await expect(this.name).toBeVisible()
  }

  async expectName(text: string) {
    await expect(this.name).toHaveText(text)
  }

  async expectValidPrice(){
         await expect(this.price).toHaveText(/\$\d+\.\d{2}/)
  }

  async expectCartCount(count: number) {
        if (count === 0) {
            await expect(this.cartBadge).toHaveCount(0)
        } else {
            await expect(this.cartBadge).toHaveText(String(count))
        }
    }

  async addToCart() {
    await this.addButton.click()
  }

  async removeFromCart(){
    await this.removeButton.click()
  }

  async goBack() {
    await this.backButton.click()
  }
}
