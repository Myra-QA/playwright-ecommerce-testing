import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_API_PORT) || 3100

const products = [
  {
    id: 1,
    name: 'Sauce Labs Backpack',
    price: 29.99,
  },
  {
    id: 2,
    name: 'Sauce Labs Bike Light',
    price: 9.99,
  },
  {
    id: 3,
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
  },
  {
    id: 4,
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
  },
  {
    id: 5,
    name: 'Sauce Labs Onesie',
    price: 7.99,
  },
  {
    id: 6,
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
  },
]
let nextProductId = 7

const users = [
  {
    id: 1,
    email: 'miray@example.com',
    password: 'password123',
    name: 'Miray'
  },

  {
    id: 2,
    email: 'john@example.com',
    password: 'password456',
    name: 'John',

  }
]

const orders = []
let nextOrderId = 1


function send(res, status, body) {
  const payload = JSON.stringify(body)

  res.writeHead(status, {
    'Content-Type': 'application/json',
  })

  res.end(payload)
}

async function readJson(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function isAuthorized(req) {
  const authHeader = req.headers.authorization

  return authHeader === 'Bearer mock-token-abc123'
}


const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method || 'GET'


  // Infrastructure endpoint
  if (path === '/health' && method === 'GET') {
    return send(res, 200, { status: 'ok' })
  }

  // GET all products
  if (path === '/products' && method === 'GET') {
    return send(res, 200, products)
  }

  // POST a new product
  if (path === '/products' && method === 'POST') {
    const body = await readJson(req)

    if (!body.name || typeof body.price !== 'number') {
      return send(res, 400, {
        error: 'name and numeric price are required',
      })
    }

    const product = {
      id: nextProductId++,
      name: body.name,
      price: body.price,
    }

    products.push(product)

    return send(res, 201, product)
  }

  // GET one product
  const productMatch = path.match(/^\/products\/(\d+)$/)

  if (productMatch && method === 'GET') {
    const id = Number(productMatch[1])

    const product = products.find((product) => product.id === id)

    if (!product) {
      return send(res, 404, {
        error: 'Product not found',
      })
    }

    return send(res, 200, product)
  }

  //login endpoint
  if (path === '/login' && method === 'POST') {

    const body = await readJson(req)

    if (!body.email || !body.password) {
      return send(res, 400, {
        error: 'Email and password are required'
      })

    }

    const user = users.find(
      (user) =>
        user.email === body.email &&
        user.password === body.password

    )

    if (!user) {
      return send(res, 401, {
        error: 'Invalid credentials'
      })

    }

    return send(res, 200, {
      token: 'mock-token-abc123',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  }


  //order endpoint

  if (path === '/orders' && method === 'POST') {

    if (!isAuthorized(req)) {
      return send(res, 401, {
        error: 'Unauthorized',
      })
    }

    const body = await readJson(req)

    if (
      !body.customerEmail ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return send(res, 400, {
        error: 'customerEmail and at least one item are required',
      })
    }

    let total = 0
    const orderItems = []

    for (const item of body.items) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return send(res, 400, {
          error: 'productId and positive integer quantity are required',
        })
      }

      const product = products.find(
        (product) => product.id === item.productId
      )

      if (!product) {
        return send(res, 404, {
          error: `Product ${item.productId} not found`,
        })
      }

      const lineTotal = product.price * item.quantity

      total += lineTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        lineTotal,
      })
    }

    const order = {
      id: nextOrderId++,
      customerEmail: body.customerEmail,
      items: orderItems,
      total: Number(total.toFixed(2)),
    }

    orders.push(order)

    return send(res, 201, order)
  }


  const orderMatch = path.match(/^\/orders\/(\d+)$/)

  if (orderMatch && method === 'GET') {
    if (!isAuthorized(req)) {
      return send(res, 401, {
        error: 'Unauthorized',
      })

    }

    const id = Number(orderMatch[1])

    const order = orders.find((order) => order.id === id)

    if (!order) {
      return send(res, 404, {
        error: 'Order not found',
      })
    }

    return send(res, 200, order)
  }

  if (orderMatch && method === 'DELETE') {

    if (!isAuthorized(req)) {
      return send(res, 401, {
        error: 'Unauthorized',
      })

    }
    const id = Number(orderMatch[1])

    const index = orders.findIndex((order) => order.id === id)

    if (index === -1) {
      return send(res, 404, {
        error: 'Order not found',
      })
    }

    orders.splice(index, 1)

    return send(res, 200, {
      message: 'Order deleted',
    })
  }


  return send(res, 404, { error: 'Not found' })

})

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`)
})