import nock from 'nock'
import config from '../config'
import restClientBuilder from '.'
import { ApplicationInfo } from '../applicationInfo'
import { KeyWorkerApiClient } from './interfaces/keyWorkerApiClient'
import KeyWorkerApiRestClient from './keyWorkerApiClient'

jest.mock('./tokenStore')
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

describe.skip('keyWorkerApiClient', () => {
  let fakeKeyWorkerApi: nock.Scope
  let keyWorkerApiClient: KeyWorkerApiClient

  beforeEach(() => {
    fakeKeyWorkerApi = nock(config.apis.keyworker.url)
    keyWorkerApiClient = restClientBuilder(
      'Key Worker API',
      config.apis.keyworker,
      KeyWorkerApiRestClient,
    )(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulKeyWorkerApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeKeyWorkerApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getPrisonMigrationStatus', () => {
    it('should return data from api', async () => {
      mockSuccessfulKeyWorkerApiCall(`/key-worker/prison/MDI`, { migrated: true })
      const output = await keyWorkerApiClient.getPrisonMigrationStatus('MDI')
      expect(output).toEqual({ migrated: true })
    })
  })
})
