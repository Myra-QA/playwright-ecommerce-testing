import { test, expect } from '../../fixtures/testfixture'

import { products } from '../../data/products'


test.describe('Inventory', () => {

  test('exactly 6 products are listed', async ({ inventory }) => {
    await expect(inventory.items).toHaveCount(6)
  })


  test('every product has a visible name', async ({ inventory }) => {
    await inventory.expectAllProductNamesVisible()
  })


  test('every product has a visible price', async ({ inventory }) => {
    await inventory.expectAllProductPricesVisible()

  })


  test('every product has an Add to cart button', async ({ inventory }) => {
    await inventory.expectAllProductsHaveAddButton()

  })


  test('sort by Name A to Z orders names ascending', async ({ inventory }) => {
    await inventory.sortBy('az')
    const names = await inventory.productNames()
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })


  test('sort by Name Z to A orders names descending', async ({ inventory }) => {
    await inventory.sortBy('za')
    const names = await inventory.productNames()
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
  })


  test('sort by Price low to high orders prices ascending', async ({ inventory }) => {
    await inventory.sortBy('lohi')
    const prices = await inventory.productPrices()
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })


  test('sort by Price high to low orders prices descending', async ({ inventory }) => {
    await inventory.sortBy('hilo')
    const prices = await inventory.productPrices()
    const sorted = [...prices].sort((a, b) => b - a)
    expect(prices).toEqual(sorted)
  })


  test('add Sauce Labs Backpack updates cart badge to 1', async ({ inventory }) => {
    await inventory.addToCartByName(products.backpack.name)
    await inventory.expectCartCount(1)
  })


  test('add two products updates cart badge to 2', async ({ inventory }) => {
    await inventory.addToCartByName(products.backpack.name)
    await inventory.addToCartByName(products.bikeLight.name)
    await inventory.expectCartCount(2)
  })


  test('add then the button becomes Remove', async ({ inventory }) => {
    await inventory.addToCartByName(products.backpack.name)
    await inventory.expectProductHasRemoveButton(products.backpack.name)
  })


  test('remove a product updates the badge back to empty', async ({ inventory }) => {
    await inventory.addToCartByName(products.backpack.name)
    await inventory.expectCartCount(1)
    await inventory.removeFromCartByName(products.backpack.name)
    await inventory.expectCartCount(0)
  })


  test('add all six products shows badge 6', async ({ inventory }) => {
    const names = await inventory.productNames()
    for (const name of names) {
      await inventory.addToCartByName(name)
    }
    await inventory.expectCartCount(6)
  })


  test('cart link navigates to the cart page', async ({ page, inventory }) => {
    await inventory.cartLink.click()
    await expect(page).toHaveURL(/cart\.html/)
  })

  test('open menu shows sidebar links', async ({ inventory, sideMenu }) => {
    await sideMenu.open()
    await sideMenu.expectLinksVisible()
  })

  test('reset app state clears the cart badge after adding an item', async ({ inventory, sideMenu }) => {
    await inventory.addToCartByName(products.backpack.name)
    await inventory.expectCartCount(1)
    await sideMenu.resetAppState()
    await inventory.expectCartCount(0)
  })

  test('footer shows the Sauce Labs copyright and three social links', async ({ inventory, footer }) => {
    await footer.expectFooterVisible()

  })


})




