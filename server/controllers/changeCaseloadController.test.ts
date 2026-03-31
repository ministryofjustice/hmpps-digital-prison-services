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

  const makeReq = ({
    backUrlInQueryParams,
    backUrlInHeaders,
    body,
  }: {
    backUrlInQueryParams?: string
    backUrlInHeaders?: string
    body?: object
  } = {}) =>
    ({
      method: body ? 'POST' : 'GET',
      body,
      originalUrl: backUrlInQueryParams ? `/change-caseload?backUrl=${backUrlInQueryParams}` : '/change-caseload',
      query: { backUrl: backUrlInQueryParams },
      get(header: string) {
        return header === 'referrer' && backUrlInHeaders
      },
    }) as unknown as Request

  const makeResWithCaseloads = (cc: CaseLoad[]) =>
    ({
      locals: { user: { caseLoads: cc, token: 'token' } },
      redirect: jest.fn(),
      render: jest.fn(),
      status: jest.fn(),
    }) as unknown as Response

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
    it('Renders changeCaseload page with options and no backUrl', async () => {
      const req = makeReq()
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          options: renderedOptions,
          backUrl: undefined,
        }),
      )
    })

    it('Renders changeCaseload page with backUrl from backUrl query parameter', async () => {
      const expectedBackUrl = 'http://localhost/whereTheyCameFrom?queries=values'
      const req = makeReq({ backUrlInQueryParams: expectedBackUrl })
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          backUrl: expectedBackUrl,
        }),
      )
    })

    it('Renders changeCaseload page with backUrl from Referrer header', async () => {
      const expectedBackUrl = 'http://localhost/whereTheyCameFrom?queries=values'
      const req = makeReq({ backUrlInHeaders: expectedBackUrl })
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          backUrl: expectedBackUrl,
        }),
      )
    })

    it('Does not set backUrl if referer is the change-caseload page', async () => {
      const req = makeReq({ backUrlInHeaders: 'http://localhost/change-caseload' })
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          backUrl: undefined,
        }),
      )
    })

    describe('if user has only one caseload', () => {
      it.each([
        { scenario: 'to home page', makeReqParams: {}, expectedRedirect: '/' },
        {
          scenario: 'to provided backUrl',
          makeReqParams: { backUrlInQueryParams: 'https://dps.service.justice.gov.uk/' },
          expectedRedirect: 'https://dps.service.justice.gov.uk/',
        },
        {
          scenario: 'back to referrer',
          makeReqParams: { backUrlInHeaders: 'http://localhost/whereTheyCameFrom' },
          expectedRedirect: 'http://localhost/whereTheyCameFrom',
        },
      ])('Redirects $scenario', async ({ makeReqParams, expectedRedirect }) => {
        const req = makeReq(makeReqParams)
        const res = makeResWithCaseloads([kirkham])

        await controller.get()(req, res, jest.fn())

        expect(res.redirect).toHaveBeenCalledWith(expectedRedirect)
      })
    })
  })

  describe('post', () => {
    it('Sets active caseload and redirects to /', async () => {
      const req = makeReq({
        body: { caseLoadId: moorland.caseLoadId },
      })
      const res = makeResWithCaseloads(caseloads)

      await controller.post()(req, res, jest.fn())

      expect(userService.setActiveCaseload).toHaveBeenCalledWith('token', {
        caseLoadId: moorland.caseLoadId,
        description: moorland.description,
      })
      expect(res.redirect).toHaveBeenCalledWith('/')
    })

    it('Logs error and renders error page if caseLoadId is missing', async () => {
      const req = makeReq({
        body: {},
      })
      const res = makeResWithCaseloads(caseloads)

      await controller.post()(req, res, jest.fn())

      expect(logger.error).toHaveBeenCalledWith(
        '/change-caseload',
        'Caseload ID is missing, not assigned to user, or does not exist',
      )
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.render).toHaveBeenCalledWith('pages/changeCaseload/error.njk', { url: '/change-caseload' })
    })

    it('Logs error and renders error page if user somehow tries to set a caseload they are not assigned to', async () => {
      const req = makeReq({
        body: { caseLoadId: styal.caseLoadId },
      })
      const res = makeResWithCaseloads(caseloads)

      await controller.post()(req, res, jest.fn())

      expect(logger.error).toHaveBeenCalledWith(
        '/change-caseload',
        'Caseload ID is missing, not assigned to user, or does not exist',
      )
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.render).toHaveBeenCalledWith('pages/changeCaseload/error.njk', { url: '/change-caseload' })
    })
  })
})
