import { test, expect } from '../../fixtures/testfixture'

import { products } from '../../data/products'

test.describe('Product Detail', () => {



  test('shows the correct product name', async ({ productDetail }) => {
    await productDetail.expectName(products.backpack.name)
  })

  test('shows a valid price', async ({ productDetail }) => {
    await productDetail.expectValidPrice()
  })

  test('back button returns to inventory', async ({ productDetail, inventory }) => {
    await productDetail.goBack()
    await expect(productDetail.page).toHaveURL(/inventory\.html/)
    await inventory.expectLoaded()
  })

  test('cart badge persists from inventory to detail page', async ({ productDetail, inventory }) => {
    await productDetail.goBack()

    await inventory.addToCartByName(products.backpack.name)
    await inventory.expectCartCount(1)

    await inventory.openProductByName(products.backpack.name)

    await productDetail.expectLoaded()

    await productDetail.expectCartCount(1)
  })



})