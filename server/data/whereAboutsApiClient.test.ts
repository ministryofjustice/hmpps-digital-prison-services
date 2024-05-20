import nock from 'nock'
import config from '../config'
import restClientBuilder from '.'
import { ApplicationInfo } from '../applicationInfo'
import { WhereAboutsApiClient } from './interfaces/whereAboutsApiClient'
import WhereAboutsApiRestClient from './whereAboutsApiClient'

jest.mock('../applicationInfo.ts', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return {
        applicationName: 'test',
        buildNumber: '1',
        gitRef: 'long ref',
        gitShortHash: 'short ref',
      } as ApplicationInfo
    }),
  }
})

const token = { access_token: 'token-1', expires_in: 300 }

describe.skip('whereAboutsApiClient', () => {
  let fakeWhereAboutsApi: nock.Scope
  let whereAboutsApiClient: WhereAboutsApiClient

  beforeEach(() => {
    fakeWhereAboutsApi = nock(config.apis.whereabouts.url)
    whereAboutsApiClient = restClientBuilder(
      'WhereAbouts API',
      config.apis.whereabouts,
      WhereAboutsApiRestClient,
    )(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulWhereAboutsApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeWhereAboutsApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getWhereaboutsConfig', () => {
    it('should return data from api', async () => {
      mockSuccessfulWhereAboutsApiCall('/agencies/LEI/locations/whereabouts', { enabled: true })
      const output = await whereAboutsApiClient.getWhereaboutsConfig('MDI')
      expect(output).toEqual({ enabled: true })
    })
  })
})
