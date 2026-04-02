import UserService from './userService'
import PrisonApiRestClient from '../data/prisonApiClient'
import { CaseLoad } from '../data/interfaces/caseLoad'
import LocationsInsidePrisonRestApiClient from '../data/locationsInsidePrisonRestApiClient'
import PrisonHierarchyDto from '../data/interfaces/prisonHierarchyDto'
import { LocationViewModel } from './interfaces/LocationViewModel'

jest.mock('../data/prisonApiClient')

const token = 'some token'

describe('User service', () => {
  let prisonApiClient: jest.Mocked<PrisonApiRestClient>
  let locationsApiClient: jest.Mocked<LocationsInsidePrisonRestApiClient>
  let userService: UserService

  beforeEach(() => {
    prisonApiClient = jest.mocked(new PrisonApiRestClient(null))
    locationsApiClient = jest.mocked(new LocationsInsidePrisonRestApiClient(null))
    locationsApiClient.getTopLevelResidentialLocations = jest.fn()
    userService = new UserService(
      () => prisonApiClient,
      () => locationsApiClient,
    )
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
    it('retrieves list of active location text and values for use with search', async () => {
      const locations = [
        {
          localName: 'KMI',
          fullLocationPath: 'KMI',
          subLocations: [
            { localName: 'Wing A', fullLocationPath: 'A', status: 'ACTIVE' } as PrisonHierarchyDto,
            { localName: 'Old Wing', fullLocationPath: 'A', status: 'INACTIVE' } as PrisonHierarchyDto,
            {
              localName: 'Wing B',
              fullLocationPath: 'B',
              status: 'ACTIVE',
              subLocations: [{ localName: undefined, fullLocationPath: 'B-1', status: 'ACTIVE' } as PrisonHierarchyDto],
            },
          ],
        },
      ] as PrisonHierarchyDto[]
      locationsApiClient.getTopLevelResidentialLocations.mockResolvedValue(locations)
      const result = await userService.getUserLocations('KMI', 'TEST_USER')
      expect(result).toEqual([
        { text: 'Wing A', value: 'KMI-A' } as LocationViewModel,
        { text: 'Wing B', value: 'KMI-B-' } as LocationViewModel,
        { text: 'B-1', value: 'KMI-B-1' } as LocationViewModel,
      ])
    })

    it('retrieves empty of active locations for admin caseload', async () => {
      locationsApiClient.getTopLevelResidentialLocations.mockResolvedValue([])
      const result = await userService.getUserLocations('CADM_I', 'TEST_USER')
      expect(locationsApiClient.getTopLevelResidentialLocations).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it('propagates error', async () => {
      locationsApiClient.getTopLevelResidentialLocations.mockRejectedValue(new Error('some error'))

      await expect(userService.getUserLocations('KMI', 'TEST_USER')).rejects.toEqual(new Error('some error'))
    })
  })

  describe('setActiveCaseload', () => {
    it('makes call to set active case load', async () => {
      const caseLoad = { caseLoadId: 'MDI' } as CaseLoad
      await userService.setActiveCaseload(token, caseLoad)

      expect(prisonApiClient.setActiveCaseload).toHaveBeenCalledWith(caseLoad)
    })

    it('propagates error', async () => {
      prisonApiClient.setActiveCaseload.mockRejectedValue(new Error('some error'))

      await expect(userService.setActiveCaseload(token, { caseLoadId: 'MDI' } as CaseLoad)).rejects.toEqual(
        new Error('some error'),
      )
    })
  })
})
