import { Request, Response } from 'express'
import { Role } from '../enums/role'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'
import WhatsNewController from './whatsNewController'
import { whatsNewDataMock } from '../mocks/whatsNewDataMock'
import { paginationMock } from '../mocks/paginationMock'

describe('Whats New Controller', () => {
  let contentfulService: ContentfulService
  let req: Request
  let res: Response
  let controller: WhatsNewController

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

    contentfulService = {
      getWhatsNewPosts: jest.fn(),
      getWhatsNewPost: jest.fn(),
    } as unknown as ContentfulService

    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewDataMock)
    contentfulService.getWhatsNewPost = jest.fn(async slug => {
      if (slug) return whatsNewPostsMock[0]
      return whatsNewPostsMock[0]
    })

    controller = new WhatsNewController(contentfulService)
  })

  describe('Display whats new page', () => {
    it('should get whats new list', async () => {
      await controller.displayWhatsNewList()(req, res, null)

      expect(contentfulService.getWhatsNewPosts).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/whatsNew', {
        pageTitle: "What's new",
        whatsNewPosts: whatsNewPostsMock,
        pagination: paginationMock,
      })
    })
  })

  describe('Display whats new post', () => {
    it('should get whats new post', async () => {
      await controller.displayWhatsNewPost()(req, res, null)

      expect(contentfulService.getWhatsNewPost).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/whatsNewPost', {
        pageTitle: whatsNewPostsMock[0].title,
        whatsNewPost: whatsNewPostsMock[0],
      })
    })
  })
})
