import nock from 'nock'
import config from '../config'
import PermissionsApiRestClient, {
  type HighProfilePrisonerRequest,
  type HighProfilePrisonerResponse,
} from './permissionsRestApiClient'
import type { PermissionsApiClient } from './interfaces/permissionsApiClient'

const token = 'token-1'
const highProfilePrisonerNumber = 'G6123VU'
const anotherPrisonerNumber = 'A1234AA'

describe('permissionsApiClient', () => {
  let fakePermissionsApi: nock.Scope
  let permissionsApiRestClient: PermissionsApiClient

  beforeEach(() => {
    fakePermissionsApi = nock(config.apis.permissionsApi.url)
    permissionsApiRestClient = new PermissionsApiRestClient(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  afterAll(() => {
    nock.restore()
  })

  describe('checkHighProfilePrisonerStatus', () => {
    it('should return true when prisoner is found in list', () => {
      fakePermissionsApi
        .post('/api/high-profile-prisoners', {
          prisonerNumbersToCheck: [highProfilePrisonerNumber, anotherPrisonerNumber],
        } satisfies HighProfilePrisonerRequest)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { highProfilePrisoners: [highProfilePrisonerNumber] } satisfies HighProfilePrisonerResponse)

      return expect(
        permissionsApiRestClient.checkHighProfilePrisonerStatuses([highProfilePrisonerNumber, anotherPrisonerNumber]),
      ).resolves.toEqual(new Set([highProfilePrisonerNumber]))
    })

    it('should return false when prisoner is not found in list', () => {
      fakePermissionsApi
        .post('/api/high-profile-prisoners', {
          prisonerNumbersToCheck: [highProfilePrisonerNumber, anotherPrisonerNumber],
        } satisfies HighProfilePrisonerRequest)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { highProfilePrisoners: [] } satisfies HighProfilePrisonerResponse)

      return expect(
        permissionsApiRestClient.checkHighProfilePrisonerStatuses([highProfilePrisonerNumber, anotherPrisonerNumber]),
      ).resolves.toEqual(new Set())
    })

    it('should propagate error from api', () => {
      fakePermissionsApi.post('/api/high-profile-prisoners').reply(500)

      return expect(
        permissionsApiRestClient.checkHighProfilePrisonerStatuses([highProfilePrisonerNumber, anotherPrisonerNumber]),
      ).rejects.toThrow('Internal Server Error')
    })
  })
})
