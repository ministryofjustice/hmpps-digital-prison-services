import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { NextFunction, Request, Response } from 'express'
import { Role } from '../enums/role'
import HomepageController from './homepageController'
import config from '../config'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'
import { whatsNewDataMock } from '../mocks/whatsNewDataMock'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { PrisonUser } from '../interfaces/prisonUser'
import defaultServices from '../utils/defaultServices'
import EstablishmentRollService from '../services/establishmentRollService'
import { prisonEstablishmentRollSummaryMock } from '../mocks/prisonRollCountSummaryMock'
import ServiceData from './ServiceData'
import { WhatsNewData } from '../data/interfaces/whatsNewData'
import HmppsCache from '../middleware/hmppsCache'

describe('Homepage Controller', () => {
  const staffId = 487023
  const activeCaseLoadId = 'LEI'
  let req: Request
  let res: Response
  const next: NextFunction = jest.fn()
  let controller: HomepageController
  let establishmentRollService: EstablishmentRollService
  let contentfulService: ContentfulService
  let serviceData: ServiceData
  let whatsNewCache: HmppsCache<WhatsNewData>
  let outageBannerCache: HmppsCache<string>

  beforeEach(() => {
    req = {
      middleware: { clientToken: 'CLIENT_TOKEN' },
      headers: {
        referer: 'http://referer',
      },
      path: '/',
      flash: jest.fn(),
      body: {},
    } as unknown as Request

    res = {
      locals: {
        user: {
          userRoles: [Role.GlobalSearch],
          staffId,
          caseLoads: [
            { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
          ] as CaseLoad[],
          token: 'USER_TOKEN',
          activeCaseLoadId,
        } as PrisonUser,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    establishmentRollService = new EstablishmentRollService(null)
    serviceData = new ServiceData()
    establishmentRollService.getEstablishmentRollSummary = jest.fn(async () => prisonEstablishmentRollSummaryMock)

    contentfulService = new ContentfulService(
      new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({}),
      }),
    )
    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewDataMock)
    contentfulService.getOutageBanner = jest.fn(async () => 'Banner')
    whatsNewCache = { wrap: jest.fn(async (_, fn) => fn()) } as unknown as HmppsCache<WhatsNewData>
    outageBannerCache = { wrap: jest.fn(async (_, fn) => fn()) } as unknown as HmppsCache<string>

    controller = new HomepageController(
      contentfulService,
      establishmentRollService,
      serviceData,
      whatsNewCache,
      outageBannerCache,
    )
  })

  describe('Display homepage', () => {
    const defaultOutput = {
      errors: undefined as string[],
      globalPreset: false,
      outageBanner: 'Banner',
      userHasPrisonCaseLoad: true,
      searchViewAllUrl: `http://localhost:3001/prisoner-search?keywords=&location=${activeCaseLoadId}`,
      showServicesOutage: true,
      services: defaultServices,
      userHasGlobal: true,
      whatsNewPosts: [
        {
          date: '2023-07-27',
          slug: 'whats-new-one',
          summary: 'Summary',
          title: 'Whats new one',
        },
        {
          date: '2023-07-25',
          slug: 'whats-new-two',
          summary: 'Summary',
          title: 'Whats new two',
        },
        {
          date: '2023-07-21',
          slug: 'whats-new-three',
          summary: 'Summary',
          title: 'Whats new three',
        },
      ],
      todayData: prisonEstablishmentRollSummaryMock,
    }

    describe('With no frontend components shared data', () => {
      it('should get homepage data', async () => {
        await controller.displayHomepage()(req, res, next)

        expect(establishmentRollService.getEstablishmentRollSummary).toHaveBeenCalled()
        expect(contentfulService.getWhatsNewPosts).toHaveBeenCalled()
        expect(contentfulService.getOutageBanner).toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/index', defaultOutput)
      })
    })

    describe('With frontend components shared data', () => {
      it('should get user services from frontend components', async () => {
        const feComponentsServices = [
          {
            id: 'service',
            href: '/href',
            heading: 'Service',
            description: 'What a service',
          },
        ]
        await controller.displayHomepage()(
          req,
          {
            ...res,
            locals: {
              ...res.locals,
              feComponents: {
                sharedData: {
                  services: feComponentsServices,
                },
              },
            },
          } as unknown as Response,
          next,
        )

        expect(establishmentRollService.getEstablishmentRollSummary).toHaveBeenCalled()
        expect(contentfulService.getWhatsNewPosts).toHaveBeenCalled()
        expect(contentfulService.getOutageBanner).toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          ...defaultOutput,
          showServicesOutage: false,
          services: feComponentsServices,
        })
      })
    })

    it('should render errors', async () => {
      req.flash = jest.fn((_key: string) => [{ text: 'error', href: '#name' }]) as unknown as Request['flash']

      await controller.displayHomepage()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/index', {
        errors: [{ text: 'error', href: '#name' }],
        userHasGlobal: true,
        globalPreset: true,
        showServicesOutage: true,
        services: defaultServices,
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        whatsNewPosts: whatsNewPostsMock,
        outageBanner: 'Banner',
        userHasPrisonCaseLoad: true,
        todayData: prisonEstablishmentRollSummaryMock,
      })
    })
  })

  describe('Search', () => {
    it('should default to local search if no search type', async () => {
      const name = 'John Saunders'
      const location = 'LEI'
      req.body = { name, location }

      await controller.search()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`,
      )
    })

    it('should redirect to local search', async () => {
      const name = 'John Saunders'
      const location = 'LEI'
      req.body = { searchType: 'local', name, location }

      await controller.search()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`,
      )
    })

    it('should redirect to global search', async () => {
      const name = 'John Saunders'
      req.body = { searchType: 'global', name }

      await controller.search()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrisons}/global-search/results?searchText=${name}`,
      )
    })

    it('should return to homepage with errors', async () => {
      const name = ''
      req.body = { searchType: 'global', name }

      await controller.search()(req, res, next)

      expect(req.flash).toHaveBeenCalledWith('errors', {
        href: '#name',
        text: 'Enter a prisoner’s name or prison number',
      })
      expect(res.redirect).toHaveBeenCalledWith('/')
    })
  })

  describe('With no prison case load', () => {
    it.each([undefined, '', 'CADM_I'])('Displays the home page (caseload: %j)', async caseLoadId => {
      res.locals = {
        user: {
          userRoles: [Role.GlobalSearch],
          staffId: 487023,
          caseLoads: [] as CaseLoad[],
          token: 'USER_TOKEN',
          activeCaseLoadId: caseLoadId,
        } as PrisonUser,
      }
      await controller.displayHomepage()(req, res, next)
      expect(establishmentRollService.getEstablishmentRollSummary).not.toHaveBeenCalled()
      expect(contentfulService.getWhatsNewPosts).toHaveBeenCalled()
      expect(contentfulService.getOutageBanner).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/index', expect.objectContaining({ userHasPrisonCaseLoad: false }))
    })
  })

  describe('Contentful cache', () => {
    it('Caches the whats new data', async () => {
      await controller.displayHomepage()(req, res, next)
      expect(whatsNewCache.wrap).toHaveBeenCalled()
    })

    it('Caches the outage banner data', async () => {
      await controller.displayHomepage()(req, res, next)
      expect(outageBannerCache.wrap).toHaveBeenCalled()
    })
  })
})
