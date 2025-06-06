import nock from 'nock'
import config from '../config'
import PrisonApiClient from './prisonApiClient'
import restClientBuilder from '.'
import { ApplicationInfo } from '../applicationInfo'
import { locationMock } from '../mocks/locationMock'

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

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonApiClient = restClientBuilder('Prison API', config.apis.prisonApi, PrisonApiClient)(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulPrisonApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakePrisonApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getCaseLoads', () => {
    const caseloadMock = [
      {
        caseLoadId: 'LEI',
        description: 'Leeds (HMP)',
        type: 'INST',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
      },
    ]
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/caseLoads?allCaseloads=true', caseloadMock)

      const output = await prisonApiClient.getUserCaseLoads()
      expect(output).toEqual(caseloadMock)
    })
  })

  describe('getLocations', () => {
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/locations', locationMock)

      const output = await prisonApiClient.getUserLocations()
      expect(output).toEqual(locationMock)
    })
  })

  describe('setActiveCaseLoad', () => {
    it('Should return data from the API', async () => {
      const caseLoadMock = {
        caseloadFunction: '',
        caseLoadId: '',
        currentlyActive: false,
        description: 'Moorland',
        type: '',
      }
      fakePrisonApi
        .put('/api/users/me/activeCaseLoad')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })
      const output = await prisonApiClient.setActiveCaseload(caseLoadMock)
      expect(output).toEqual({ body: 'RESPONSE' })
    })
  })

  describe('getLatestArrivalDates', () => {
    it('Should return data from the API', async () => {
      fakePrisonApi
        .post('/api/movements/offenders/latest-arrival-date')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })
      const output = await prisonApiClient.getLatestArrivalDates(['A1234AA', 'A2345BB'])
      expect(output).toEqual({ body: 'RESPONSE' })
    })
  })
})
