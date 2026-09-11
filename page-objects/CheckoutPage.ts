import { type Page, type Locator, expect } from '@playwright/test'
import { type Customer } from '../data/customers'

export class CheckoutPage {
  readonly page: Page
  readonly firstName: Locator
  readonly lastName: Locator
  readonly postalCode: Locator
  readonly continueButton: Locator
  readonly cancelButton: Locator
  readonly finishButton: Locator
  readonly errorMessage: Locator
  readonly itemTotalLabel: Locator
  readonly taxLabel: Locator
  readonly totalLabel: Locator
  readonly completeHeader: Locator
  readonly backHomeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.firstName = page.getByTestId('firstName')
    this.lastName = page.getByTestId('lastName')
    this.postalCode = page.getByTestId('postalCode')
    this.continueButton = page.getByTestId('continue')
    this.cancelButton = page.getByTestId('cancel')
    this.finishButton = page.getByTestId('finish')
    this.errorMessage = page.getByTestId('error')
    this.itemTotalLabel = page.getByTestId('subtotal-label')
    this.taxLabel = page.getByTestId('tax-label')
    this.totalLabel = page.getByTestId('total-label')
    this.completeHeader = page.getByTestId('complete-header')
    this.backHomeButton = page.getByTestId('back-to-products')
  }

  async fillInfo(first: string, last: string, zip: string) {
    await this.firstName.fill(first)
    await this.lastName.fill(last)
    await this.postalCode.fill(zip)
  }

  async continueToOverview() {
    await this.continueButton.click()
  }

  async completeStepOne(customer: Customer) {
    await this.fillInfo(customer.firstName, customer.lastName, customer.postalCode)
    await this.continueToOverview()
    
  }

  async expectErrorMessage(text:string){
    await expect(this.errorMessage).toHaveText(text)
  }

  async finish() {
    await this.finishButton.click()
  }

  async clickBackHome() {
  await this.backHomeButton.click()
}

  async cancel() {
    await this.cancelButton.click()
  }

  async itemTotalValue(): Promise<number> {
    const text = await this.itemTotalLabel.innerText()
    return Number(text.replace('Item total: $', '').trim())
  }

  async taxValue(): Promise<number> {
    const text = await this.taxLabel.innerText()
    return Number(text.replace('Tax: $', '').trim())
  }

  async totalValue(): Promise<number> {
    const text = await this.totalLabel.innerText()
    return Number(text.replace('Total: $', '').trim())
  }

  async expectOnStepOne() {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/)
    await expect(this.firstName).toBeVisible()
  }

  async expectOnStepTwo() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/)
    await expect(this.finishButton).toBeVisible()
  }

  async expectOnComplete() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/)
    await expect(this.completeHeader).toBeVisible()
  }

  async expectOrderComplete(){
    await expect(this.completeHeader).toHaveText('Thank you for your order!')
  }
 
}
