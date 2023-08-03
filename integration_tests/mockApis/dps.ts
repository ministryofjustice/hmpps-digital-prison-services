import { stubFor } from './wiremock'

export default {
  changeCaseload: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/dps/change-caseload.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: '<html><body><h1>Change caseload</h1></body></html>',
      },
    })
  },
}
