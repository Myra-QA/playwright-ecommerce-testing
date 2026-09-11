import { test, expect } from '../api/apiTestFixture'
import { apiUsers } from './apiUsers'

test.describe('Products API', () => {

  test('GET /products returns 200 and an array', async ({ request }) => {
    const response = await request.get('/products')

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(Array.isArray(body)).toBe(true)
  })

  test('GET /products returns the six SauceDemo products', async ({ request }) => {
    const response = await request.get('/products')

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(body).toHaveLength(6)
  })

  test('GET /products/1 returns the Backpack', async ({ request }) => {

    const response = await request.get('/products/1')

    expect(response.status()).toBe(200)

    const product = await response.json()

    expect(product).toEqual({
      id: 1,
      name: 'Sauce Labs Backpack',
      price: 29.99
    })

  })

  test('GET /products/1 returns a product with required fields', async ({ request }) => {
    const response = await request.get('/products/1')

    expect(response.status()).toBe(200)

    const product = await response.json()

    expect(product).toHaveProperty('id')
    expect(product).toHaveProperty('name')
    expect(product).toHaveProperty('price')

    expect(typeof product.id).toBe('number')
    expect(typeof product.name).toBe('string')
    expect(typeof product.price).toBe('number')

  })

  test('GET /products/999 returns 404 for a missing product', async ({ request }) => {

    const response = await request.get('/products/999')

    expect(response.status()).toBe(404)

    const body = await response.json()

    expect(body.error).toBe('Product not found')

  })

  test('POST /products creates a new product', async ({ request }) => {

    const response = await request.post('/products', {
      data: {
        name: 'Test Product',
        price: 19.99
      }
    })

    expect(response.status()).toBe(201)

    const product = await response.json()

    expect(product).toMatchObject({
      name: 'Test Product',
      price: 19.99
    })

    expect(typeof product.id).toBe('number')

  })

  test('POST /products rejects invalid product data', async ({ request }) => {

    const response = await request.post('/products', {
      data: {
        name: 'Invalid product'
      }

    })

    expect(response.status()).toBe(400)
    const body = await response.json()

    expect(body.error).toBe('name and numeric price are required')
  })

})

test.describe('Authentication API', () => {

  test('POST /login returns 200 and a token for valid credentials', async ({ request }) => {

    const response = await request.post(
      '/login', {
      data: {
        email: 'miray@example.com',
        password: 'password123'
      }
    })

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe('miray@example.com')


  })

  test('POST /login returns 400 when credentials are missing', async ({ request }) => {
    const response = await request.post(
      '/login', {
      data: {
        email: 'miray@example.com',

      },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Email and password are required')



  })

  test('POST /login returns 401 for invalid credentials', async ({ request }) => {

    const response = await request.post(
      '/login', {
      data: {
        email: 'miray@example.com',
        password: 'wrong-password',
      },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid credentials')


  })


})

test.describe('Orders API', () => {

  test('POST /orders rejects a request without authorization', async ({ request }) => {
    const response = await request.post('/orders', {
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
      },
    })

    expect(response.status()).toBe(401)

    const body = await response.json()

    expect(body.error).toBe('Unauthorized')
  })

  test('POST /orders rejects an invalid token', async ({ request }) => {
    const response = await request.post('/orders', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
      },
    })

    expect(response.status()).toBe(401)

    const body = await response.json()

    expect(body.error).toBe('Unauthorized')
  })





  test('POST /orders creates an order and calculates the total', async ({ request,apiToken }) => {
    
    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 2,
          },
          {
            productId: 2,
            quantity: 1,
          },
        ],
      },
    })

    expect(response.status()).toBe(201)

    const order = await response.json()

    expect(order.customerEmail).toBe(apiUsers.standard.email)
    expect(order.items).toHaveLength(2)
    expect(order.total).toBe(69.97)
  })

  test('POST /orders rejects an empty order', async ({ request, apiToken }) => {
    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [],
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()

    expect(body.error).toBe(
      'customerEmail and at least one item are required'
    )
  })

  test('POST /orders rejects an unknown product', async ({ request, apiToken }) => {
    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 999,
            quantity: 1,
          },
        ],
      },
    })

    expect(response.status()).toBe(404)

    const body = await response.json()

    expect(body.error).toBe('Product 999 not found')
  })

  test('POST /orders rejects an invalid quantity', async ({ request,apiToken }) => {
    const response = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 0,
          },
        ],
      },
    })

    expect(response.status()).toBe(400)

    const body = await response.json()

    expect(body.error).toBe(
      'productId and positive integer quantity are required'
    )
  })

  test('GET /orders/:id returns an existing order', async ({ request,apiToken }) => {
    const createResponse = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
      },
    })

    expect(createResponse.status()).toBe(201)

    const createdOrder = await createResponse.json()

    const response = await request.get(`/orders/${createdOrder.id}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })

    expect(response.status()).toBe(200)

    const order = await response.json()

    expect(order).toMatchObject({
      id: createdOrder.id,
      customerEmail: apiUsers.standard.email,
      total: 29.99,
    })
  })

  test('GET /orders/999 returns 404 for a missing order', async ({ request,apiToken }) => {
    const response = await request.get('/orders/999', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    })

    expect(response.status()).toBe(404)

    const body = await response.json()

    expect(body.error).toBe('Order not found')
  })

  test('DELETE /orders/:id removes an existing order', async ({ request,apiToken }) => {
    const createResponse = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 1,
            quantity: 1,
          },
        ],
      },
    })

    expect(createResponse.status()).toBe(201)

    const createdOrder = await createResponse.json()

    const deleteResponse = await request.delete(
      `/orders/${createdOrder.id}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
    )

    expect(deleteResponse.status()).toBe(200)

    const deleteBody = await deleteResponse.json()

    expect(deleteBody.message).toBe('Order deleted')
  })

  test('deleted order can no longer be retrieved', async ({ request,apiToken }) => {
    const createResponse = await request.post('/orders', {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      data: {
        customerEmail: apiUsers.standard.email,
        items: [
          {
            productId: 2,
            quantity: 2,
          },
        ],
      },
    })

    expect(createResponse.status()).toBe(201)

    const createdOrder = await createResponse.json()

    const deleteResponse = await request.delete(
      `/orders/${createdOrder.id}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    )

    expect(deleteResponse.status()).toBe(200)

    const getResponse = await request.get(
      `/orders/${createdOrder.id}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,

      },
    }
    )

    expect(getResponse.status()).toBe(404)
  })

})