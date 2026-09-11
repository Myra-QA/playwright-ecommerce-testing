import { type Page, type Locator, expect } from '@playwright/test'

export class CartPage {
  readonly page: Page
  readonly items: Locator
  readonly checkoutButton: Locator
  readonly continueShoppingButton: Locator
  readonly cartBadge: Locator
  readonly removeButtons: Locator

  constructor(page: Page) {
    this.page = page
    this.items = page.getByTestId('inventory-item')
    this.checkoutButton = page.getByTestId('checkout')
    this.continueShoppingButton = page.getByTestId('continue-shopping')
    this.cartBadge = page.getByTestId('shopping-cart-badge')
    this.removeButtons = page.getByRole('button', { name: /remove/i })
  }

  async goto() {
    await this.page.goto('/cart.html')
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/)
    await expect(this.checkoutButton).toBeVisible()
  }


  async itemNames(): Promise<string[]> {
    return this.page.getByTestId('inventory-item-name').allInnerTexts()
  }

  async removeByName(name: string) {
    const item = this.items.filter({ hasText: name })
    await item.getByRole('button', { name: /remove/i }).click()
  }

  async expectNoRemoveButtons() {
    await expect(this.removeButtons).toHaveCount(0)
  }

  async expectItemCount(n: number) {
    await expect(this.items).toHaveCount(n)
  }

  async expectProduct(name: string) {
    const item = this.items.filter({ hasText: name })
    await expect(item.getByTestId('inventory-item-name')).toHaveText(name)
  }

  async expectItemPrice(name: string, price: number) {
    const item = this.items.filter({ hasText: name })
    await expect(item.getByTestId('inventory-item-price')).toHaveText(`$${price.toFixed(2)}`)

  }

  async expectAllQuantities(count: number, quantity = '1') {
    const quantities = this.page.getByTestId('item-quantity')

    await expect(quantities).toHaveCount(count)
    await expect(quantities).toHaveText(Array(count).fill(quantity))

  }

  async checkout() {
    await this.checkoutButton.click()
  }

  async continueShopping() {
    await this.continueShoppingButton.click()
  }
}
