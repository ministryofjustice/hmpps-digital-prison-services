import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { Role } from '../enums/role'
import ContentfulService from '../services/contentfulService'
import { managedPagesMock } from '../mocks/managedPagesMock'
import ManagedPageController from './managedPageController'

let req: any
let res: any
let controller: any

jest.mock('../services/homepageService.ts')

describe('Managed Page Controller', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    req = {
      headers: {
        referer: 'http://referer',
      },
      params: {
        slug: 'example-post',
      },
      query: {
        page: '1',
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

    contentfulService = new ContentfulService(new ApolloClient({ cache: new InMemoryCache() }))
    contentfulService.getManagedPage = jest.fn(async () => managedPagesMock[0])

    controller = new ManagedPageController(contentfulService)
  })

  describe('Display managed page', () => {
    it('should display managed page by slug', async () => {
      await controller.displayManagedPage('title-one')(req, res)

      expect(controller['contentfulService'].getManagedPage).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/managedPage', {
        pageTitle: managedPagesMock[0].title,
        managedPage: managedPagesMock[0],
      })
    })
  })
})
