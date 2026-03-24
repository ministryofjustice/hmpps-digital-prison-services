import { Request, Response, NextFunction } from 'express'
import populateUserLocations from './populateUserLocations'
import { UserService } from '../services'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/prisonUser'

jest.mock('../../logger')

describe('populateUserLocations middleware', () => {
  let userService: Partial<UserService>
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    userService = {
      getUserLocations: jest.fn(),
    }

    req = {}

    res = {
      locals: {
        user: {
          authSource: 'nomis',
          activeCaseLoadId: 'MDI',
          username: 'TEST_USER',
          token: 'token123',
        } as PrisonUser,
      },
    }

    next = jest.fn()
    jest.clearAllMocks()
  })

  it('should populate user locations when returned from service', async () => {
    const locations = ['LOC1', 'LOC2']
    ;(userService.getUserLocations as jest.Mock).mockResolvedValue(locations)

    const middleware = populateUserLocations(userService as UserService)
    await middleware(req as Request, res as Response, next)

    expect(userService.getUserLocations).toHaveBeenCalledWith('MDI', 'TEST_USER')
    expect(res.locals.user.locations).toEqual(locations)
    expect(next).toHaveBeenCalled()
  })

  it('should log info when no locations are returned', async () => {
    ;(userService.getUserLocations as jest.Mock).mockResolvedValue(null)

    const middleware = populateUserLocations(userService as UserService)
    await middleware(req as Request, res as Response, next)

    expect(logger.info).toHaveBeenCalledWith('No user locations available')
    expect(next).toHaveBeenCalled()
  })

  it("should call next without fetching locations if authSource is not 'nomis'", async () => {
    res.locals.user.authSource = 'external'

    const middleware = populateUserLocations(userService as UserService)
    await middleware(req as Request, res as Response, next)

    expect(userService.getUserLocations).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('should handle errors and call next with error', async () => {
    const error = new Error('Service failed')
    ;(userService.getUserLocations as jest.Mock).mockRejectedValue(error)

    const middleware = populateUserLocations(userService as UserService)
    await middleware(req as Request, res as Response, next)

    expect(logger.error).toHaveBeenCalledWith(error, 'Failed to retrieve locations for: TEST_USER')
    expect(next).toHaveBeenCalledWith(error)
  })
})
