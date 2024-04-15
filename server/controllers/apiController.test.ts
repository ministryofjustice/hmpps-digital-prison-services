import { Role } from '../enums/role'
import HomepageService from '../services/homepageService'
import ApiController from './apiController'
import { dpsServicesDataStoreMockB } from '../mocks/dpsServicesDataStoreMock'

let res: any
let controller: any

jest.mock('../services/homepageService.ts')

describe('API Controller', () => {
  let homePageService: HomepageService

  beforeEach(() => {
    res = {
      locals: {
        user: {
          userRoles: [Role.GlobalSearch],
          staffId: 123,
          caseLoads: ['LEI'],
          token: 'USER_TOKEN',
          activeCaseLoadId: 'LEI',
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    }

    homePageService = new HomepageService(null, null, null)
    controller = new ApiController(homePageService)
  })

  describe.skip('Get DPS Services', () => {
    it('should get a list of all DPS services', async () => {
      const dpsServices = await controller.getDpsServices(res)
      expect(dpsServices).toContain(dpsServicesDataStoreMockB)
    })
  })
})
