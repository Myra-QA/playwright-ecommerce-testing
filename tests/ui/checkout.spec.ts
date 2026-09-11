import { test, expect } from '../../fixtures/testfixture'

import { products } from '../../data/products'
import { customers } from '../../data/customers'

import { InventoryPage } from '../../page-objects/InventoryPage'
import { CartPage } from '../../page-objects/CartPage'
import { CheckoutPage } from '../../page-objects/CheckoutPage'

//helper for multi-product assertions
async function prepareCheckoutOverview(inventory: InventoryPage, cart: CartPage, checkout: CheckoutPage, items: Array<{ name: string }>) {
  for (const item of items) {
    await inventory.addToCartByName(item.name)
  }
  await cart.goto()
  await cart.checkout()
  await checkout.completeStepOne(customers.standard)

}


test.describe('Checkout', () => {

  test.describe('Step One', () => {

    test('shows the first name field', async ({ checkoutStepOne }) => {
      await expect(checkoutStepOne.firstName).toBeVisible()
    })

    test('shows the last name field', async ({ checkoutStepOne }) => {
      await expect(checkoutStepOne.lastName).toBeVisible()
    })

    test('shows the postal code field', async ({ checkoutStepOne }) => {
      await expect(checkoutStepOne.postalCode).toBeVisible()
    })

    test('empty form shows First Name is required', async ({ checkoutStepOne }) => {
      await checkoutStepOne.continueToOverview()
      await checkoutStepOne.expectErrorMessage('Error: First Name is required')
    })

    test('missing last name shows Last Name is required', async ({ checkoutStepOne }) => {
      await checkoutStepOne.fillInfo(customers.standard.firstName, '', customers.standard.postalCode)
      await checkoutStepOne.continueToOverview()
      await checkoutStepOne.expectErrorMessage('Error: Last Name is required')
    })

    test('missing postal code shows Postal Code is required', async ({ checkoutStepOne }) => {
      await checkoutStepOne.fillInfo(customers.standard.firstName, customers.standard.lastName, '')
      await checkoutStepOne.continueToOverview()
      await checkoutStepOne.expectErrorMessage('Error: Postal Code is required')
    })

    test('valid information opens checkout overview', async ({ checkoutStepOne }) => {
      await checkoutStepOne.completeStepOne(customers.standard)
      await checkoutStepOne.expectOnStepTwo()

    })

    test('cancel returns to the cart page', async ({ checkoutStepOne, cart }) => {
      await checkoutStepOne.cancel()
      await expect(checkoutStepOne.page).toHaveURL(/cart\.html/)
      await expect(cart.checkoutButton).toBeVisible()
    })


    test('first name field accepts typing', async ({ checkoutStepOne }) => {
      await checkoutStepOne.firstName.fill('Grace')
      await expect(checkoutStepOne.firstName).toHaveValue('Grace')
    })

  })

  test.describe('Overview', () => {

    test('shows the selected product', async ({ checkoutOverview }) => {
      await expect(checkoutOverview.page.getByTestId('inventory-item-name'))
        .toHaveText(products.backpack.name)
    })

    test('shows the correct item total', async ({ checkoutOverview }) => {
      expect(await checkoutOverview.itemTotalValue()).toBeCloseTo(products.backpack.price, 2)
    })

    test('shows a tax amount greater than zero', async ({ checkoutOverview }) => {
      expect(await checkoutOverview.taxValue()).toBeGreaterThan(0)
    })


    test('total equals item total plus tax', async ({ checkoutOverview }) => {
      const itemTotal = await checkoutOverview.itemTotalValue()
      const tax = await checkoutOverview.taxValue()
      const total = await checkoutOverview.totalValue()
      expect(total).toBeCloseTo(itemTotal + tax, 2)
    })

    test('finish opens the complete page', async ({ checkoutOverview }) => {
      await checkoutOverview.finish()
      await checkoutOverview.expectOnComplete()
    })


    test('cancel returns to inventory', async ({ checkoutOverview, inventory }) => {
      await checkoutOverview.cancel()
      await expect(checkoutOverview.page).toHaveURL(/inventory\.html/)
      await inventory.expectLoaded()
    })



  })

  test.describe('Complete', () => {


    test('shows the thank you message', async ({ checkoutComplete }) => {
      await checkoutComplete.expectOrderComplete()
    })

    test('shows the Back Home button', async ({ checkoutComplete }) => {
      await expect(checkoutComplete.backHomeButton).toBeVisible()
    })

    test('Back Home returns to inventory', async ({ checkoutComplete, inventory }) => {
      await checkoutComplete.clickBackHome()
      await expect(checkoutComplete.page).toHaveURL(/inventory\.html/)
      await inventory.expectLoaded()
    })

    test('cart badge disappears after completing the order', async ({ checkoutComplete, inventory }) => {
      await checkoutComplete.clickBackHome()
      await inventory.expectCartCount(0)
    })

  })


  test.describe('Overview - Multi-Product Calculations', () => {

    test('correctly calculates total for multiple distinct products', async ({
      inventory,
      cart,
    }) => {
      const checkout = new CheckoutPage(inventory.page) //fresh checkout

      const selectedProducts = [
        products.backpack,
        products.bikeLight,
        products.boltTShirt,
      ]

      await prepareCheckoutOverview(inventory, cart, checkout, selectedProducts)

      const expectedSum = selectedProducts.reduce((sum, p) => sum + p.price, 0)
      const itemTotal = await checkout.itemTotalValue()

      expect(itemTotal).toBeCloseTo(expectedSum, 2)

      const tax = await checkout.taxValue()
      const total = await checkout.totalValue()

      expect(total).toBeCloseTo(expectedSum + tax, 2)
    })

  })


})