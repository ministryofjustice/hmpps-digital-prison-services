import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import PrisonApiClient from './prisonApiClient'
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
  let mockAuthenticationClient: AuthenticationClient
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue(token.access_token),
    } as unknown as jest.Mocked<AuthenticationClient>

    prisonApiClient = new PrisonApiClient(mockAuthenticationClient)
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

      const output = await prisonApiClient.getUserCaseLoads(token.access_token)
      expect(output).toEqual(caseloadMock)
    })
  })

  describe('getLocations', () => {
    it('should return data from api', async () => {
      mockSuccessfulPrisonApiCall('/api/users/me/locations', locationMock)

      const output = await prisonApiClient.getUserLocations(token.access_token)
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
      const output = await prisonApiClient.setActiveCaseload(token.access_token, caseLoadMock)
      expect(output).toEqual({ body: 'RESPONSE' })
    })
  })

  describe('getLatestArrivalDates', () => {
    it('Should return data from the API', async () => {
      fakePrisonApi
        .post('/api/movements/offenders/latest-arrival-date')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })
      const output = await prisonApiClient.getLatestArrivalDates(token.access_token, ['A1234AA', 'A2345BB'])
      expect(output).toEqual({ body: 'RESPONSE' })
    })
  })
})
