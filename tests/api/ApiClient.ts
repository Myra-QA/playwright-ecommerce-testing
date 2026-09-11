import { type APIRequestContext } from '@playwright/test'

export class ApiClient {

  private request : APIRequestContext

  constructor(request: APIRequestContext) {
    this.request = request
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post('/login', {
      data: {
        email,
        password,
      },
    })

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`)
    }

    const body = await response.json()

    return body.token
  }
}