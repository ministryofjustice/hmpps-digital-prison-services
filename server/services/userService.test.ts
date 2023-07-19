import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiRestClient from '../data/prisonApiClient'

jest.mock('../data/hmppsAuthClient')

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let prisonApiClient: jest.Mocked<PrisonApiRestClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      prisonApiClient = new PrisonApiRestClient(null) as jest.Mocked<PrisonApiRestClient>
      userService = new UserService(
        () => hmppsAuthClient,
        () => prisonApiClient,
      )
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
