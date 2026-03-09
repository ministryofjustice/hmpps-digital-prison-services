import type { Request, Response } from 'express'
import logger from '../../logger'
import ChangeCaseloadController from './changeCaseloadController'
import { UserService } from '../services'
import { CaseLoad } from '../data/interfaces/caseLoad'

jest.mock('../../logger')

describe('ChangeCaseloadController', () => {
  let controller: ChangeCaseloadController
  let userService: UserService

  const kirkham = { caseLoadId: 'KMI', description: 'Kirkham' } as CaseLoad
  const moorland = { caseLoadId: 'MDI', description: 'Moorland' } as CaseLoad
  const styal = { caseLoadId: 'STI', description: 'Styal' } as CaseLoad
  const caseloads = [kirkham, moorland]

  const renderedOptions = caseloads.map(caseload => ({
    value: caseload.caseLoadId,
    text: caseload.description,
  }))

  beforeEach(() => {
    userService = {
      setActiveCaseload: jest.fn(),
    } as unknown as UserService

    controller = new ChangeCaseloadController(userService)
  })

  describe('get', () => {
    it('Renders changeCaseload page with options and backUrl', async () => {
      const expectedBackUrl = 'http://localhost/whereTheyCameFrom?queries=values'
      const req = { headers: { referer: expectedBackUrl } } as unknown as Request
      const res = {
        locals: {
          user: {
            caseLoads: caseloads,
          },
        },
        render: jest.fn(),
      } as unknown as Response

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          title: 'Change your location',
          options: renderedOptions,
          backUrl: expectedBackUrl,
        }),
      )
    })

    it('Does not set backUrl if referer is the change-caseload page', async () => {
      const req = { headers: { referer: 'http://localhost/change-caseload' } } as unknown as Request
      const res = {
        locals: {
          user: {
            caseLoads: caseloads,
          },
        },
        render: jest.fn(),
      } as unknown as Response

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          backUrl: undefined,
        }),
      )
    })

    it('Redirects to / if user has only one caseload', async () => {
      const req = {} as unknown as Request
      const res = {
        locals: { user: { caseLoads: [kirkham] } },
        redirect: jest.fn(),
      } as unknown as Response

      await controller.get()(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/')
    })
  })

  describe('post', () => {
    it('Sets active caseload and redirects to /', async () => {
      const req = { body: { caseLoadId: moorland.caseLoadId }, originalUrl: '/change-caseload' } as unknown as Request
      const res = {
        locals: { user: { token: 'token', caseLoads: caseloads } },
        redirect: jest.fn(),
      } as unknown as Response

      await controller.post()(req, res, jest.fn())

      expect(userService.setActiveCaseload).toHaveBeenCalledWith('token', {
        caseLoadId: moorland.caseLoadId,
        description: moorland.description,
      })
      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    it('Logs error and renders error page if caseLoadId is missing', async () => {
      const req = { body: {}, originalUrl: 'http://localhost/whereTheyCameFrom' } as unknown as Request
      const res = {
        locals: { user: { token: 'token', caseLoads: caseloads } },
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as unknown as Response

      await controller.post()(req, res, jest.fn())

      expect(logger.error).toHaveBeenCalledWith(
        'http://localhost/whereTheyCameFrom',
        'Caseload ID is missing, not assigned to user, or does not exist',
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/change-caseload' })
    })

    it('Logs error and renders error page if user somehow tries to set a caseload they are not assigned to', async () => {
      const req = {
        body: { caseLoadId: styal.caseLoadId },
        originalUrl: 'http://localhost/whereTheyCameFrom',
      } as unknown as Request
      const res = {
        locals: { user: { token: 'token', caseLoads: caseloads } },
        status: jest.fn().mockReturnThis(),
        render: jest.fn(),
      } as unknown as Response

      await controller.post()(req, res, jest.fn())

      expect(logger.error).toHaveBeenCalledWith(
        'http://localhost/whereTheyCameFrom',
        'Caseload ID is missing, not assigned to user, or does not exist',
      )
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/change-caseload' })
    })
  })
})
