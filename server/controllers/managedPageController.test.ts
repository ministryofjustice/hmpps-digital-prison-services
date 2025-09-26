import { Request, Response } from 'express'
import { Role } from '../enums/role'
import ContentfulService from '../services/contentfulService'
import { managedPagesMock } from '../mocks/managedPagesMock'
import ManagedPageController from './managedPageController'

describe('Managed Page Controller', () => {
  let contentfulService: ContentfulService
  let req: Request
  let res: Response
  let controller: ManagedPageController

  beforeEach(() => {
    req = {
      middleware: { clientToken: 'CLIENT_TOKEN' },
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
    } as unknown as Request

    res = {
      locals: {
        user: {
          userRoles: [Role.GlobalSearch],
          staffId: 487023,
          caseLoads: [],
          token: 'USER_TOKEN',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    contentfulService = { getManagedPage: jest.fn(async () => managedPagesMock[0]) } as unknown as ContentfulService
    controller = new ManagedPageController(contentfulService)
  })

  describe('Display managed page', () => {
    it('should display managed page by slug', async () => {
      await controller.displayManagedPage('title-one')(req, res, null)

      expect(contentfulService.getManagedPage).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/managedPage', {
        pageTitle: managedPagesMock[0].title,
        managedPage: managedPagesMock[0],
      })
    })
  })
})
