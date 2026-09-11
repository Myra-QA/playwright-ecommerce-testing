import { test, expect } from '../../fixtures/testfixture'
import { ProductDetailPage } from '../../page-objects/ProductDetailPage'
import { products, allProducts } from '../../data/products'


test.describe('Cart', () => {

    //cart basics
    test('cart is empty right after login', async ({ cart }) => {
        await cart.goto()
        await cart.expectLoaded() //to prevent false positive
        await cart.expectItemCount(0)
    })

    test('checkout button is visible in the cart', async ({ cart }) => {
        await cart.goto()
        await expect(cart.checkoutButton).toBeVisible()
    })

    test('an empty cart has no remove buttons', async ({ cart }) => {
        await cart.goto()
        await cart.expectLoaded()
        await cart.expectItemCount(0)
        await cart.expectNoRemoveButtons()

    })

    //adding
    test('each distinct product appears exactly once in the cart', async ({ inventory, cart }) => {
        for (const product of allProducts) {
            await inventory.addToCartByName(product.name)
        }
        await cart.goto()
        const names = await cart.itemNames()
        const expectedNames = allProducts.map(product => product.name)
        expect([...names].sort()).toEqual([...expectedNames].sort())

        expect(new Set(names).size).toBe(names.length)
    })
    test('cart accepts multiple different products', async ({ inventory, cart }) => {
        const selectedProducts = [
            products.backpack,
            products.bikeLight,
            products.boltTShirt
        ]

        for (const product of selectedProducts) {
            await inventory.addToCartByName(product.name)
        }

        await cart.goto()
        await cart.expectItemCount(selectedProducts.length)
    })

    test('the cart badge equals the number of items added', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await inventory.addToCartByName(products.bikeLight.name)
        await inventory.addToCartByName(products.boltTShirt.name)
        await cart.goto()
        await expect(cart.cartBadge).toHaveText('3')
    })

    //product information
    test('the cart item has the expected name', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await cart.goto()
        await cart.expectProduct(products.backpack.name)
    })

    test('the cart item shows the correct price', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await cart.goto()
        await cart.expectItemPrice(products.backpack.name, products.backpack.price)
    })

    test('the cart shows a quantity for each line', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await inventory.addToCartByName(products.bikeLight.name)
        await cart.goto()
        await cart.expectAllQuantities(2)
    })


    //removing
    test('remove the only item empties the cart', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await cart.goto()
        await cart.expectItemCount(1)
        await cart.removeByName(products.backpack.name)
        await cart.expectItemCount(0)
    })

    test('removing one of two items leaves one', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await inventory.addToCartByName(products.bikeLight.name)
        await cart.goto()
        await cart.expectItemCount(2)
        await cart.removeByName(products.backpack.name)
        await cart.expectItemCount(1)
        await expect(cart.items.getByTestId('inventory-item-name')).toHaveText(products.bikeLight.name)
    })

    test('removing an item in the cart updates the badge', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await inventory.addToCartByName(products.bikeLight.name)
        await cart.goto()
        await expect(cart.cartBadge).toHaveText('2')
        await cart.removeByName(products.backpack.name)
        await expect(cart.cartBadge).toHaveText('1')
    })

    test('removing all items makes the cart badge disappear', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await inventory.addToCartByName(products.bikeLight.name)
        await cart.goto()
        await expect(cart.cartBadge).toHaveText('2')
        await cart.removeByName(products.backpack.name)
        await cart.removeByName(products.bikeLight.name)
        await cart.expectItemCount(0)
        await expect(cart.cartBadge).toHaveCount(0)
    })

    //navigation
    test('the inventory cart link opens the cart page', async ({ page, inventory, cart }) => {
        await inventory.cartLink.click()
        await expect(page).toHaveURL(/cart\.html/)
        await expect(cart.checkoutButton).toBeVisible()
    })

    test('checkout navigates to checkout step one', async ({ page, inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await cart.goto()
        await cart.checkout()
        await expect(page).toHaveURL(/checkout-step-one\.html/)
    })

    test('continue shopping returns to the inventory page', async ({ page, inventory, cart }) => {
        await cart.goto()
        await cart.continueShopping()
        await expect(page).toHaveURL(/inventory\.html/)
        await expect(inventory.title).toBeVisible()
    })

    //cross-page
    test('the product added from product detail page appears in the cart', async ({ page, inventory, cart }) => {
        await inventory.openProductByName(products.backpack.name)
        const detail = new ProductDetailPage(page)
        await detail.addToCart()
        await cart.goto()
        await cart.expectItemCount(1)
        await cart.expectProduct(products.backpack.name)
    })
    test('continue shopping keeps previously added items', async ({ inventory, cart }) => {
        await inventory.addToCartByName(products.backpack.name)
        await cart.goto()
        await cart.continueShopping()
        await inventory.expectLoaded()
        await inventory.addToCartByName(products.bikeLight.name)
        await cart.goto()
        await cart.expectItemCount(2)
    })


})
