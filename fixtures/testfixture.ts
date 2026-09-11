import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../page-objects/LoginPage'
import { InventoryPage } from '../page-objects/InventoryPage'
import { CartPage } from '../page-objects/CartPage'
import { CheckoutPage } from '../page-objects/CheckoutPage'
import { users } from '../data/users'
import { products } from '../data/products'
import { customers } from '../data/customers'
import { ProductDetailPage } from '../page-objects/ProductDetailPage'
import { SideMenu } from '../page-objects/components/SideMenu'
import { Footer } from '../page-objects/components/Footer'

type Fixtures = {

    login: LoginPage
    inventory: InventoryPage
    cart: CartPage
    checkoutStepOne: CheckoutPage
    checkoutOverview: CheckoutPage
    checkoutComplete: CheckoutPage
    productDetail: ProductDetailPage
    sideMenu: SideMenu
    footer: Footer

}

async function reachCheckoutStepOne(inventory: InventoryPage, cart:CartPage):Promise<CheckoutPage>{
    await inventory.addToCartByName(products.backpack.name)
    await cart.goto()
    await cart.checkout()

    const checkout = new CheckoutPage(inventory.page)
    await checkout.expectOnStepOne()

    return checkout

}


export const test = base.extend<Fixtures>({

    login: async ({ page }, use) => {
        const login = new LoginPage(page)
        await use(login)
    },

    inventory: async ({ page, login }, use) => {
        await login.goto()
        await login.login(users.standard.username, users.standard.password)

        const inventory = new InventoryPage(page)
        await inventory.expectLoaded()

        await use(inventory)

    },

    productDetail: async ({ page, inventory }, use) => {

        await inventory.openProductByName(products.backpack.name)
        const detail = new ProductDetailPage(page)
        await detail.expectLoaded()
        await use(detail)

    },

    cart: async ({ page, inventory }, use) => {
        const cart = new CartPage(page)

        await use(cart)
    },

   
    checkoutStepOne: async ({ inventory, cart }, use) => {

        const checkout = await reachCheckoutStepOne(inventory, cart)
        await use(checkout)

    },

    checkoutOverview: async ({ inventory, cart }, use) => {

        const checkout = await reachCheckoutStepOne(inventory, cart)
        
        await checkout.completeStepOne(customers.standard)
        await checkout.expectOnStepTwo()

        await use(checkout)

    },

    checkoutComplete: async ({ checkoutOverview }, use) => {
        await checkoutOverview.finish()
        await checkoutOverview.expectOnComplete()

        await use(checkoutOverview)
    },

    sideMenu: async ({page}, use) =>{
        const sideMenu = new SideMenu(page)
        await use(sideMenu)
    },

    footer: async({page}, use) =>{
        const footer = new Footer(page)
        await use(footer)
    }

})

export { expect }

