import UserService from './userService'
import PrisonApiRestClient from '../data/prisonApiClient'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { Location } from '../data/interfaces/location'

jest.mock('../data/prisonApiClient')

const token = 'token'

describe('User service', () => {
  let prisonApiClient: jest.Mocked<PrisonApiRestClient>
  let userService: UserService

  beforeEach(() => {
    prisonApiClient = new PrisonApiRestClient(null) as jest.Mocked<PrisonApiRestClient>
    userService = new UserService(prisonApiClient)
  })

  describe('getUserCaseLoads', () => {
    it('retrieves list of user case loads', async () => {
      const caseLoads = [{ caseLoadId: 'MDI' }] as CaseLoad[]
      prisonApiClient.getUserCaseLoads.mockResolvedValue(caseLoads)

      const result = await userService.getUserCaseLoads(token)

      expect(result).toEqual(caseLoads)
    })

    it('propagates error', async () => {
      prisonApiClient.getUserCaseLoads.mockRejectedValue(new Error('some error'))

      await expect(userService.getUserCaseLoads(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getUserLocations', () => {
    it('retrieves list of user locations', async () => {
      const locations = [{ locationId: 12345 }] as Location[]
      prisonApiClient.getUserLocations.mockResolvedValue(locations)

      const result = await userService.getUserLocations(token)

      expect(result).toEqual(locations)
    })

    it('propagates error', async () => {
      prisonApiClient.getUserLocations.mockRejectedValue(new Error('some error'))

      await expect(userService.getUserLocations(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('setActiveCaseload', () => {
    it('makes call to set active case load', async () => {
      const caseLoad = { caseLoadId: 'MDI' } as CaseLoad
      await userService.setActiveCaseload(token, caseLoad)

      expect(prisonApiClient.setActiveCaseload).toHaveBeenCalledWith(token, caseLoad)
    })

    it('propagates error', async () => {
      prisonApiClient.setActiveCaseload.mockRejectedValue(new Error('some error'))

      await expect(userService.setActiveCaseload(token, { caseLoadId: 'MDI' } as CaseLoad)).rejects.toEqual(
        new Error('some error'),
      )
    })
  })
})
