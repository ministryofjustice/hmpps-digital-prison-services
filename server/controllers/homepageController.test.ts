import { Role } from '../enums/role'
import HomepageController from './homepageController'
import config from '../config'
import HomepageService from '../services/homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import HmppsCache from '../middleware/hmppsCache'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'

let req: any
let res: any
let controller: any

jest.mock('../services/homepageService.ts')

describe('Homepage Controller', () => {
  let homepageService: HomepageService
  let contentfulService: ContentfulService

  beforeEach(() => {
    req = {
      headers: {
        referer: 'http://referer',
      },
      path: '/',
      flash: jest.fn(),
    }
    res = {
      locals: {
        clientToken: 'CLIENT_TOKEN',
        user: {
          userRoles: [Role.GlobalSearch],
          staffId: 487023,
          caseLoads: [],
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    homepageService = new HomepageService(null, null, null)
    homepageService.getTodaySection = jest.fn(async () => todayDataMock)

    contentfulService = new ContentfulService()
    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewPostsMock)

    controller = new HomepageController(homepageService, new HmppsCache(1), contentfulService)
  })

  describe('Display homepage', () => {
    it('should get homepage data', async () => {
      await controller.displayHomepage()(req, res)

      expect(controller['homepageService'].getTodaySection).toHaveBeenCalled()
      expect(controller['contentfulService'].getWhatsNewPosts).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        errors: undefined,
        userHasGlobal: true,
        globalPreset: false,
        services: [
          {
            description: 'Search for someone in any establishment, or who has been released.',
            heading: 'Global search',
            href: 'http://localhost:3001/global-search',
            id: 'global-search',
          },
        ],
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        ...todayDataMock,
        whatsNewPosts: whatsNewPostsMock,
      })
    })

    it('should render errors', async () => {
      req.flash = jest.fn(() => [{ text: 'error', href: '#name' }])

      await controller.displayHomepage()(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/index', {
        errors: [{ text: 'error', href: '#name' }],
        userHasGlobal: true,
        globalPreset: true,
        services: [
          {
            description: 'Search for someone in any establishment, or who has been released.',
            heading: 'Global search',
            href: 'http://localhost:3001/global-search',
            id: 'global-search',
          },
        ],
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        ...todayDataMock,
        whatsNewPosts: whatsNewPostsMock,
      })
    })
  })

  describe('Search', () => {
    it('should redirect to local search', async () => {
      const name = 'John Saunders'
      const location = 'LEI'
      req.body = { searchType: 'local', name, location }

      await controller.search()(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`,
      )
    })

    it('should redirect to global search', async () => {
      const name = 'John Saunders'
      req.body = { searchType: 'global', name }

      await controller.search()(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        `${config.serviceUrls.digitalPrisons}/global-search/results?searchText=${name}`,
      )
    })

    it('should return to homepage with errors', async () => {
      const name = ''
      req.body = { searchType: 'global', name }

      await controller.search()(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', {
        href: '#name',
        text: 'Enter a prisoner’s name or prison number',
      })
      expect(res.redirect).toHaveBeenCalledWith('/')
    })
  })
})
