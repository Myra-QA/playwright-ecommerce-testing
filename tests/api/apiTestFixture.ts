import { test as base, expect} from '@playwright/test'
import { ApiClient } from '../api/ApiClient'
import { apiUsers } from '../api/apiUsers'

type ApiFixtures = {
    apiToken: string
}

export const test = base.extend<ApiFixtures>({
    apiToken: async ({request}, use)=>{
        const api = new ApiClient(request)

        const token = await api.login(
            apiUsers.standard.email,
            apiUsers.standard.password
        )

        await use(token)

    }
})

export { expect }