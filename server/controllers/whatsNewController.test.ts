import { Role } from '../enums/role'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'
import WhatsNewController from './whatsNewController'

let req: any
let res: any
let controller: any

jest.mock('../services/homepageService.ts')

describe('Whats New Controller', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    req = {
      headers: {
        referer: 'http://referer',
      },
      params: {
        slug: 'example-post',
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

    contentfulService = new ContentfulService()
    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewPostsMock)
    contentfulService.getWhatsNewPost = jest.fn(async slug => {
      if (slug) return whatsNewPostsMock[0]
      return whatsNewPostsMock[0]
    })

    controller = new WhatsNewController(contentfulService)
  })

  describe('Display whats new page', () => {
    it('should get whats new list', async () => {
      await controller.displayWhatsNewList()(req, res)

      expect(controller['contentfulService'].getWhatsNewPosts).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/whatsNew', {
        pageTitle: "What's new",
        whatsNewPosts: whatsNewPostsMock,
      })
    })
  })

  describe('Display whats new post', () => {
    it('should get whats new post', async () => {
      await controller.displayWhatsNewPost()(req, res)

      expect(controller['contentfulService'].getWhatsNewPost).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/whatsNewPost', {
        pageTitle: whatsNewPostsMock[0].title,
        whatsNewPost: whatsNewPostsMock[0],
      })
    })
  })
})
