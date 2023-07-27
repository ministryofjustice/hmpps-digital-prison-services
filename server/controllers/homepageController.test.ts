import { Role } from '../enums/role'
import HomepageController from './homepageController'
import config from '../config'
import HomepageService from '../services/homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import HmppsCache from '../middleware/hmppsCache'

let req: any
let res: any
let controller: any

jest.mock('../services/homepageService.ts')

describe('Homepage Controller', () => {
  let homepageService: HomepageService

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

    controller = new HomepageController(homepageService, new HmppsCache(1))
  })

  describe('Display homepage', () => {
    it('should get homepage data', async () => {
      await controller.displayHomepage()(req, res)

      expect(controller['homepageService'].getTodaySection).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        errors: undefined,
        userHasGlobal: true,
        globalPreset: false,
        services: [
          {
            description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
            enabled: '',
            heading: 'Adjudications',
            href: '',
            id: 'manage-adjudications',
          },
          {
            description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
            enabled: undefined,
            heading: 'Allocate people to activities',
            href: undefined,
            id: 'activities',
          },
          {
            description:
              'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
            enabled: false,
            heading: 'Book a secure move',
            href: 'https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk',
            id: 'secure-move',
          },
          {
            description:
              'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
            enabled: false,
            heading: 'Categorisation',
            href: 'http://localhost:3003/',
            id: 'categorisation',
          },
          {
            description:
              'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
            enabled: false,
            heading: 'Change someone’s cell',
            href: 'http://localhost:3001/change-someones-cell',
            id: 'change-someones-cell',
          },
          {
            description: 'View your prison staff detail (staff rota) from home.',
            enabled: undefined,
            heading: 'Check My Diary',
            href: undefined,
            id: 'check-my-diary',
            roles: [],
          },
          {
            description: 'Scan barcodes on mail from law firms and other approved senders.',
            enabled: undefined,
            heading: 'Check Rule 39 mail',
            href: undefined,
            id: 'check-rule39-mail',
          },
          {
            description: 'Create and vary standard determinate licences and post sentence supervision orders.',
            enabled: undefined,
            heading: 'Create and vary a licence',
            href: undefined,
            id: 'create-and-vary-a-licence',
          },
          {
            description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
            enabled: false,
            heading: 'Establishment roll check',
            href: 'http://localhost:3001/establishment-roll',
            id: 'establishment-roll',
            roles: [],
          },
          {
            description:
              'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
            enabled: false,
            heading: 'Get someone ready to work',
            href: 'http://localhost:3002?sort=releaseDate&order=descending',
            id: 'get-someone-ready-to-work',
          },
          {
            description: 'Search for someone in any establishment, or who has been released.',
            enabled: true,
            heading: 'Global search',
            href: 'http://localhost:3001/global-search',
            id: 'global-search',
          },
          {
            description: 'This service allows users to view historical prisoner information.',
            enabled: '',
            heading: 'Historical Prisoner Application',
            href: '',
            id: 'historical-prisoner-application',
          },
          {
            description: 'Create and manage Home Detention Curfew.',
            enabled: false,
            heading: 'Home Detention Curfew',
            href: 'http://localhost:3003/',
            id: 'hdc-licences',
          },
          {
            description: 'Manage your Serious and Organised Crime (SOC) caseload.',
            enabled: '',
            heading: 'Manage SOC cases',
            href: '',
            id: 'soc',
          },
          {
            description:
              'See prisoner incentive information by residential location and view incentive data visualisations.',
            enabled: undefined,
            heading: 'Manage incentives',
            href: undefined,
            id: 'incentives',
            roles: [],
          },
          {
            description: 'Add and remove key workers from prisoners and manage individuals.',
            enabled: false,
            heading: 'Manage key workers',
            href: 'http://localhost:3001',
            id: 'manage-key-workers',
          },
          {
            description: 'This service allows you to maintain offence reference data.',
            enabled: false,
            heading: 'Manage offences',
            href: undefined,
            id: 'manage-offences',
          },
          {
            description: 'Book, view and cancel a prisoner’s social visits.',
            enabled: '',
            heading: 'Manage prison visits',
            href: '',
            id: 'book-a-prison-visit',
          },
          {
            description:
              'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
            enabled: undefined,
            heading: 'Manage prisoner whereabouts',
            href: 'http://localhost:3001/manage-prisoner-whereabouts',
            id: 'manage-prisoner-whereabouts',
            roles: [],
          },
          {
            description:
              'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
            enabled: '',
            heading: 'Manage restricted patients',
            href: '',
            id: 'manage-restricted-patients',
          },
          {
            description:
              'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
            enabled: false,
            heading: 'Manage user accounts',
            href: 'http://localhost:3004/',
            id: 'manage-users',
          },
          {
            description: 'View your key worker cases.',
            enabled: false,
            heading: 'My key worker allocation',
            href: 'http://localhost:3001/key-worker/487023',
            id: 'key-worker-allocations',
          },
          {
            description: 'Respond to online social visit requests.',
            enabled: '',
            heading: 'Online visit requests',
            href: '',
            id: 'legacy-prison-visit',
          },
          {
            description: 'Manage your Pathfinder caseloads.',
            enabled: undefined,
            heading: 'Pathfinder',
            href: undefined,
            id: 'pathfinder',
          },
          {
            description:
              'View people due to leave this establishment for court appearances, transfers or being released.',
            enabled: false,
            heading: 'People due to leave',
            href: 'http://localhost:3001/manage-prisoner-whereabouts/scheduled-moves',
            id: 'view-people-due-to-leave',
          },
          {
            description: 'Access to the Prisoner communication monitoring service.',
            enabled: false,
            heading: 'Prisoner communication monitoring service',
            href: 'http://localhost:3000/',
            id: 'pin-phones',
          },
          {
            description:
              'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
            enabled: undefined,
            heading: 'Schedule and edit appointments',
            href: undefined,
            id: 'appointments',
          },
          {
            description:
              'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
            enabled: '',
            heading: 'Secure social video calls',
            href: '',
            id: 'secure-social-video-calls',
          },
          {
            description:
              'Access to the new Mercury submission form for those establishments enrolled in the private beta',
            enabled: undefined,
            heading: 'Submit an Intelligence Report (Private Beta)',
            href: undefined,
            id: 'submit-an-intelligence-report-private-beta',
            roles: [],
          },
          {
            description: 'Manage and view incident reports and statements.',
            enabled: undefined,
            heading: 'Use of force incidents',
            href: undefined,
            id: 'use-of-force',
            roles: [],
          },
          {
            description: 'View who is in each COVID unit in your establishment.',
            enabled: false,
            heading: 'View COVID units',
            href: 'http://localhost:3001/current-covid-units',
            id: 'view-covid-units',
          },
          {
            description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
            enabled: undefined,
            heading: 'View POM cases',
            href: undefined,
            id: 'pom',
          },
          {
            description: 'View all prisoners not marked as attended or not attended.',
            enabled: false,
            heading: 'View prisoners unaccounted for',
            href: 'http://localhost:3001/manage-prisoner-whereabouts/prisoners-unaccounted-for',
            id: 'view-unaccounted-for',
          },
          {
            description:
              'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
            enabled: undefined,
            heading: 'Welcome people into prison',
            href: undefined,
            id: 'welcome-people-into-prison',
            roles: [],
          },
        ],
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        ...todayDataMock,
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
            description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
            enabled: '',
            heading: 'Adjudications',
            href: '',
            id: 'manage-adjudications',
          },
          {
            description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
            enabled: undefined,
            heading: 'Allocate people to activities',
            href: undefined,
            id: 'activities',
          },
          {
            description:
              'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
            enabled: false,
            heading: 'Book a secure move',
            href: 'https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk',
            id: 'secure-move',
          },
          {
            description:
              'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
            enabled: false,
            heading: 'Categorisation',
            href: 'http://localhost:3003/',
            id: 'categorisation',
          },
          {
            description:
              'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
            enabled: false,
            heading: 'Change someone’s cell',
            href: 'http://localhost:3001/change-someones-cell',
            id: 'change-someones-cell',
          },
          {
            description: 'View your prison staff detail (staff rota) from home.',
            enabled: undefined,
            heading: 'Check My Diary',
            href: undefined,
            id: 'check-my-diary',
            roles: [],
          },
          {
            description: 'Scan barcodes on mail from law firms and other approved senders.',
            enabled: undefined,
            heading: 'Check Rule 39 mail',
            href: undefined,
            id: 'check-rule39-mail',
          },
          {
            description: 'Create and vary standard determinate licences and post sentence supervision orders.',
            enabled: undefined,
            heading: 'Create and vary a licence',
            href: undefined,
            id: 'create-and-vary-a-licence',
          },
          {
            description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
            enabled: false,
            heading: 'Establishment roll check',
            href: 'http://localhost:3001/establishment-roll',
            id: 'establishment-roll',
            roles: [],
          },
          {
            description:
              'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
            enabled: false,
            heading: 'Get someone ready to work',
            href: 'http://localhost:3002?sort=releaseDate&order=descending',
            id: 'get-someone-ready-to-work',
          },
          {
            description: 'Search for someone in any establishment, or who has been released.',
            enabled: true,
            heading: 'Global search',
            href: 'http://localhost:3001/global-search',
            id: 'global-search',
          },
          {
            description: 'This service allows users to view historical prisoner information.',
            enabled: '',
            heading: 'Historical Prisoner Application',
            href: '',
            id: 'historical-prisoner-application',
          },
          {
            description: 'Create and manage Home Detention Curfew.',
            enabled: false,
            heading: 'Home Detention Curfew',
            href: 'http://localhost:3003/',
            id: 'hdc-licences',
          },
          {
            description: 'Manage your Serious and Organised Crime (SOC) caseload.',
            enabled: '',
            heading: 'Manage SOC cases',
            href: '',
            id: 'soc',
          },
          {
            description:
              'See prisoner incentive information by residential location and view incentive data visualisations.',
            enabled: undefined,
            heading: 'Manage incentives',
            href: undefined,
            id: 'incentives',
            roles: [],
          },
          {
            description: 'Add and remove key workers from prisoners and manage individuals.',
            enabled: false,
            heading: 'Manage key workers',
            href: 'http://localhost:3001',
            id: 'manage-key-workers',
          },
          {
            description: 'This service allows you to maintain offence reference data.',
            enabled: false,
            heading: 'Manage offences',
            href: undefined,
            id: 'manage-offences',
          },
          {
            description: 'Book, view and cancel a prisoner’s social visits.',
            enabled: '',
            heading: 'Manage prison visits',
            href: '',
            id: 'book-a-prison-visit',
          },
          {
            description:
              'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
            enabled: undefined,
            heading: 'Manage prisoner whereabouts',
            href: 'http://localhost:3001/manage-prisoner-whereabouts',
            id: 'manage-prisoner-whereabouts',
            roles: [],
          },
          {
            description:
              'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
            enabled: '',
            heading: 'Manage restricted patients',
            href: '',
            id: 'manage-restricted-patients',
          },
          {
            description:
              'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
            enabled: false,
            heading: 'Manage user accounts',
            href: 'http://localhost:3004/',
            id: 'manage-users',
          },
          {
            description: 'View your key worker cases.',
            enabled: false,
            heading: 'My key worker allocation',
            href: 'http://localhost:3001/key-worker/487023',
            id: 'key-worker-allocations',
          },
          {
            description: 'Respond to online social visit requests.',
            enabled: '',
            heading: 'Online visit requests',
            href: '',
            id: 'legacy-prison-visit',
          },
          {
            description: 'Manage your Pathfinder caseloads.',
            enabled: undefined,
            heading: 'Pathfinder',
            href: undefined,
            id: 'pathfinder',
          },
          {
            description:
              'View people due to leave this establishment for court appearances, transfers or being released.',
            enabled: false,
            heading: 'People due to leave',
            href: 'http://localhost:3001/manage-prisoner-whereabouts/scheduled-moves',
            id: 'view-people-due-to-leave',
          },
          {
            description: 'Access to the Prisoner communication monitoring service.',
            enabled: false,
            heading: 'Prisoner communication monitoring service',
            href: 'http://localhost:3000/',
            id: 'pin-phones',
          },
          {
            description:
              'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
            enabled: undefined,
            heading: 'Schedule and edit appointments',
            href: undefined,
            id: 'appointments',
          },
          {
            description:
              'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
            enabled: '',
            heading: 'Secure social video calls',
            href: '',
            id: 'secure-social-video-calls',
          },
          {
            description:
              'Access to the new Mercury submission form for those establishments enrolled in the private beta',
            enabled: undefined,
            heading: 'Submit an Intelligence Report (Private Beta)',
            href: undefined,
            id: 'submit-an-intelligence-report-private-beta',
            roles: [],
          },
          {
            description: 'Manage and view incident reports and statements.',
            enabled: undefined,
            heading: 'Use of force incidents',
            href: undefined,
            id: 'use-of-force',
            roles: [],
          },
          {
            description: 'View who is in each COVID unit in your establishment.',
            enabled: false,
            heading: 'View COVID units',
            href: 'http://localhost:3001/current-covid-units',
            id: 'view-covid-units',
          },
          {
            description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
            enabled: undefined,
            heading: 'View POM cases',
            href: undefined,
            id: 'pom',
          },
          {
            description: 'View all prisoners not marked as attended or not attended.',
            enabled: false,
            heading: 'View prisoners unaccounted for',
            href: 'http://localhost:3001/manage-prisoner-whereabouts/prisoners-unaccounted-for',
            id: 'view-unaccounted-for',
          },
          {
            description:
              'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
            enabled: undefined,
            heading: 'Welcome people into prison',
            href: undefined,
            id: 'welcome-people-into-prison',
            roles: [],
          },
        ],
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        ...todayDataMock,
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
