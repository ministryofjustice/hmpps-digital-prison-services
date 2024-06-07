import { stubFor } from './wiremock'

export default {
  stubFeComponents: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/frontend-components/components\\?.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          header: { html: '', css: [], javascript: [] },
          footer: { html: '', css: [], javascript: [] },
          meta: {
            services: [
              {
                id: 'check-my-diary',
                heading: 'Check my diary',
                description: 'View your prison staff detail (staff rota) from home.',
                href: 'http://localhost:3001',
                navEnabled: true,
              },
              {
                id: 'key-worker-allocations',
                heading: 'My key worker allocation',
                description: 'View your key worker cases.',
                href: 'http://localhost:3001/key-worker/111111',
                navEnabled: true,
              },
            ],
          },
        },
      },
    })
  },
}
