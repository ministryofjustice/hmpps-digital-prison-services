import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { Role } from '../enums/role'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'
import WhatsNewController from './whatsNewController'
import { whatsNewDataMock } from '../mocks/whatsNewDataMock'
import { paginationMock } from '../mocks/paginationMock'

let req: any
let res: any
let controller: any

describe('Whats New Controller', () => {
  let contentfulService: ContentfulService

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
    }
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
    }

    contentfulService = new ContentfulService(new ApolloClient({ cache: new InMemoryCache() }))
    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewDataMock)
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
        pagination: paginationMock,
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
