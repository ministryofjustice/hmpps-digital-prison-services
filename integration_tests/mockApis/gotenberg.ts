import { stubFor } from './wiremock'

export default {
  stubGotenbergHealth: (httpStatus = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/gotenberg/health',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
}
