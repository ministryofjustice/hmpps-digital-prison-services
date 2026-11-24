import type { Request, Response } from 'express'
import logger from '../../logger'
import ChangeCaseloadController from './changeCaseloadController'
import { UserService } from '../services'
import { CaseLoad } from '../data/interfaces/caseLoad'
import config from '../config'

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
    caseloadChanged,
  }: {
    backUrlInQueryParams?: string
    backUrlInHeaders?: string
    body?: object
    caseloadChanged?: string
  } = {}) =>
    ({
      method: body ? 'POST' : 'GET',
      body,
      originalUrl: backUrlInQueryParams ? `/change-caseload?backUrl=${backUrlInQueryParams}` : '/change-caseload',
      query: { backUrl: backUrlInQueryParams, caseloadChanged },
      get(header: string) {
        return header === 'referrer' && backUrlInHeaders
      },
    }) as unknown as Request

  const makeResWithCaseloads = (cc: CaseLoad[], activeCaseLoad?: CaseLoad) =>
    ({
      locals: { user: { caseLoads: cc, token: 'token', activeCaseLoad } },
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

    const safeBackUrl = 'http://localhost:3000/whereTheyCameFrom?queries=values'
    it.each([
      {
        scenario: 'from backUrl query parameter',
        req: makeReq({ backUrlInQueryParams: safeBackUrl }),
        expectedBackUrl: safeBackUrl,
      },
      {
        scenario: 'from Referrer header',
        req: makeReq({ backUrlInHeaders: safeBackUrl }),
        expectedBackUrl: safeBackUrl,
      },
      {
        scenario: 'ignored since it was unsafe',
        req: makeReq({ backUrlInQueryParams: 'https://gov.uk/' }),
        expectedBackUrl: undefined,
      },
    ])('Renders changeCaseload page with backUrl $scenario', async ({ req, expectedBackUrl }) => {
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
      const req = makeReq({ backUrlInHeaders: 'http://localhost:3000/change-caseload' })
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          backUrl: undefined,
        }),
      )
    })

    it.each([
      { scenario: 'is set when caseloadChanged is true', caseloadChanged: 'true', expectedSwitchNotice: true },
      {
        scenario: 'is not set when caseloadChanged is absent',
        caseloadChanged: undefined,
        expectedSwitchNotice: false,
      },
    ])('switchNotice $scenario', async ({ caseloadChanged, expectedSwitchNotice }) => {
      const req = makeReq({ caseloadChanged })
      const res = makeResWithCaseloads(caseloads)

      await controller.get()(req, res, jest.fn())

      expect(res.render).toHaveBeenCalledWith(
        'pages/changeCaseload/changeCaseload',
        expect.objectContaining({
          switchNotice: expectedSwitchNotice,
        }),
      )
    })

    describe('if user has only one caseload', () => {
      it.each([
        { scenario: 'to home page by default', makeReqParams: {}, expectedRedirect: '/' },
        {
          scenario: 'to provided backUrl',
          makeReqParams: { backUrlInQueryParams: 'https://dps.service.justice.gov.uk/' },
          expectedRedirect: 'https://dps.service.justice.gov.uk/',
        },
        {
          scenario: 'back to referrer',
          makeReqParams: { backUrlInHeaders: 'http://localhost:3000/whereTheyCameFrom' },
          expectedRedirect: 'http://localhost:3000/whereTheyCameFrom',
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
    it.each([
      {
        scenario: '/ by default',
        req: makeReq({
          body: { caseLoadId: moorland.caseLoadId },
        }),
        expectedRedirect: '/',
      },
      {
        scenario: '/ if back url is unsafe',
        req: makeReq({
          body: { caseLoadId: moorland.caseLoadId, backUrl: '/page=1' },
        }),
        expectedRedirect: '/',
      },
      {
        scenario: 'where they came from',
        req: makeReq({
          body: { caseLoadId: moorland.caseLoadId, backUrl: 'http://localhost:3000/whereTheyCameFrom' },
        }),
        expectedRedirect: 'http://localhost:3000/whereTheyCameFrom',
      },
    ])('Sets active caseload and redirects to $scenario', async ({ req, expectedRedirect }) => {
      const res = makeResWithCaseloads(caseloads)

      await controller.post()(req, res, jest.fn())

      expect(userService.setActiveCaseload).toHaveBeenCalledWith('token', {
        caseLoadId: moorland.caseLoadId,
        description: moorland.description,
      })
      expect(res.redirect).toHaveBeenCalledWith(expectedRedirect)
    })

    describe('when the caseload change notice is requested', () => {
      const safeBackUrl = 'http://localhost:3000/whereTheyCameFrom?queries=values'

      it.each([
        {
          scenario: 'does not append params when the flag is not sent',
          body: { caseLoadId: moorland.caseLoadId, backUrl: safeBackUrl },
          expectedRedirect: safeBackUrl,
        },
        {
          scenario: 'appends both params to the existing query when the caseload switches',
          body: { caseLoadId: moorland.caseLoadId, backUrl: safeBackUrl, caseloadChanged: 'true' },
          expectedRedirect: `${safeBackUrl}&caseload-switched-from=KMI&caseload-switched-to=MDI`,
        },
        {
          scenario: 'keeps the host of an absolute backUrl on another trusted host',
          body: {
            caseLoadId: moorland.caseLoadId,
            backUrl: 'https://dps.service.justice.gov.uk/whereTheyCameFrom',
            caseloadChanged: 'true',
          },
          expectedRedirect:
            'https://dps.service.justice.gov.uk/whereTheyCameFrom?caseload-switched-from=KMI&caseload-switched-to=MDI',
        },
        {
          scenario: 'does not append params when the same caseload is selected',
          body: { caseLoadId: kirkham.caseLoadId, backUrl: safeBackUrl, caseloadChanged: 'true' },
          expectedRedirect: safeBackUrl,
        },
        {
          scenario: 'redirects to home with params when backUrl is missing',
          body: { caseLoadId: moorland.caseLoadId, caseloadChanged: 'true' },
          expectedRedirect: `${new URL('/', config.domain).toString()}?caseload-switched-from=KMI&caseload-switched-to=MDI`,
        },
      ])('$scenario', async ({ body, expectedRedirect }) => {
        const req = makeReq({ body })
        const res = makeResWithCaseloads(caseloads, kirkham)

        await controller.post()(req, res, jest.fn())

        expect(res.redirect).toHaveBeenCalledWith(expectedRedirect)
      })
    })

    it.each([
      { scenario: 'caseLoadId is missing', req: makeReq({ body: {} }) },
      {
        scenario: 'user somehow tries to set a caseload they are not assigned to',
        req: makeReq({ body: { caseLoadId: styal.caseLoadId } }),
      },
    ])('Logs error and renders error page if $scenario', async ({ req }) => {
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
