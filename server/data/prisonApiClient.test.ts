import nock from 'nock'
import config from '../config'
import PrisonApiClient from './prisonApiClient'
import restClientBuilder from '.'
import { ApplicationInfo } from '../applicationInfo'
import { locationMock } from '../mocks/locationMock'
import { mockStaffRoles } from '../mocks/staffRolesMock'

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

  describe('getStaffRoles', () => {
    it('Should return data from the API', async () => {
      const staffNumber = 12345
      const agencyId = 'Agency'
      mockSuccessfulPrisonApiCall(`/api/staff/${staffNumber}/${agencyId}/roles`, mockStaffRoles)
      const output = await prisonApiClient.getStaffRoles(staffNumber, agencyId)
      expect(output).toEqual(mockStaffRoles)
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
})
