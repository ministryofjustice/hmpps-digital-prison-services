import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { Role } from '../enums/role'
import HomepageController from './homepageController'
import config from '../config'
import HomepageService from '../services/homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import HmppsCache from '../middleware/hmppsCache'
import ContentfulService from '../services/contentfulService'
import { whatsNewPostsMock } from '../mocks/whatsNewPostsMock'
import { whatsNewDataMock } from '../mocks/whatsNewDataMock'

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

    contentfulService = new ContentfulService(new ApolloClient({ cache: new InMemoryCache() }))
    contentfulService.getWhatsNewPosts = jest.fn(async () => whatsNewDataMock)
    contentfulService.getOutageBanner = jest.fn(async () => 'Banner')

    controller = new HomepageController(homepageService, new HmppsCache(1), contentfulService)
  })

  describe('Display homepage', () => {
    it('should get homepage data', async () => {
      await controller.displayHomepage()(req, res)

      expect(controller['homepageService'].getTodaySection).toHaveBeenCalled()
      expect(controller['contentfulService'].getWhatsNewPosts).toHaveBeenCalled()
      expect(controller['contentfulService'].getOutageBanner).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        currentPopulationCount: 1023,
        errors: undefined,
        globalPreset: false,
        inTodayCount: 17,
        outTodayCount: 9,
        outageBanner: 'Banner',
        searchViewAllUrl: 'http://localhost:3001/prisoner-search?keywords=&location=undefined',
        services: [
          {
            description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
            heading: 'Adjudications',
            href: config.apis.manageAdjudications.ui_url,
            id: 'manage-adjudications',
          },
          {
            description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
            heading: 'Allocate people to activities',
            href: config.apis.activities.url,
            id: 'activities',
          },
          {
            description:
              'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
            heading: 'Book a secure move',
            href: config.applications.pecs.url,
            id: 'secure-move',
          },
          {
            description:
              'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
            heading: 'Categorisation',
            href: config.apis.categorisation.ui_url,
            id: 'categorisation',
          },
          {
            description:
              'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
            heading: 'Change someone’s cell',
            href: `${config.serviceUrls.digitalPrisons}/change-someones-cell`,
            id: 'change-someones-cell',
          },
          {
            description: 'View your prison staff detail (staff rota) from home.',
            heading: 'Check My Diary',
            href: config.apis.checkMyDiary.ui_url,
            id: 'check-my-diary',
          },
          {
            description: 'Scan barcodes on mail from law firms and other approved senders.',
            heading: 'Check Rule 39 mail',
            href: config.applications.sendLegalMail.url,
            id: 'check-rule39-mail',
          },
          {
            description: 'Create and vary standard determinate licences and post sentence supervision orders.',
            heading: 'Create and vary a licence',
            href: config.apis.createAndVaryALicence.url,
            id: 'create-and-vary-a-licence',
          },
          {
            description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
            heading: 'Establishment roll check',
            href: `${config.serviceUrls.digitalPrisons}/establishment-roll`,
            id: 'establishment-roll',
          },
          {
            description:
              'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
            heading: 'Get someone ready to work',
            href: `${config.apis.getSomeoneReadyForWork.ui_url}?sort=releaseDate&order=descending`,
            id: 'get-someone-ready-to-work',
          },
          {
            description: 'Search for someone in any establishment, or who has been released.',
            heading: 'Global search',
            href: `${config.serviceUrls.digitalPrisons}/global-search`,
            id: 'global-search',
          },
          {
            description: 'This service allows users to view historical prisoner information.',
            heading: 'Historical Prisoner Application',
            href: config.apis.historicalPrisonerApplication.ui_url,
            id: 'historical-prisoner-application',
          },
          {
            description: 'Create and manage Home Detention Curfew.',
            heading: 'Home Detention Curfew',
            href: config.applications.licences.url,
            id: 'hdc-licences',
          },
          {
            description: 'Manage your Serious and Organised Crime (SOC) caseload.',
            heading: 'Manage SOC cases',
            href: config.apis.soc.ui_url,
            id: 'soc',
          },
          {
            description:
              'See prisoner incentive information by residential location and view incentive data visualisations.',
            heading: 'Manage incentives',
            href: config.apis.incentives.ui_url,
            id: 'incentives',
          },
          {
            description: 'Add and remove key workers from prisoners and manage individuals.',
            heading: 'Manage key workers',
            href: config.apis.omic.url,
            id: 'manage-key-workers',
          },
          {
            description: 'This service allows you to maintain offence reference data.',
            heading: 'Manage offences',
            href: config.apis.manageOffences.ui_url,
            id: 'manage-offences',
          },
          {
            description: 'Book, view and cancel a prisoner’s social visits.',
            heading: 'Manage prison visits',
            href: config.apis.managePrisonVisits.ui_url,
            id: 'book-a-prison-visit',
          },
          {
            description:
              'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
            heading: 'Manage prisoner whereabouts',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts`,
            id: 'manage-prisoner-whereabouts',
          },
          {
            description:
              'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
            heading: 'Manage restricted patients',
            href: config.apis.manageRestrictedPatients.ui_url,
            id: 'manage-restricted-patients',
          },
          {
            description:
              'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
            heading: 'Manage user accounts',
            href: config.applications.manageaccounts.url,
            id: 'manage-users',
          },
          {
            description: 'View your key worker cases.',
            heading: 'My key worker allocation',
            href: `${config.apis.omic.url}/key-worker/${res.locals.user.staffId}`,
            id: 'key-worker-allocations',
          },
          {
            description: 'Respond to online social visit requests.',
            heading: 'Online visit requests',
            href: config.apis.legacyPrisonVisits.ui_url,
            id: 'legacy-prison-visit',
          },
          {
            description: 'Manage your Pathfinder caseloads.',
            heading: 'Pathfinder',
            href: config.apis.pathfinder.ui_url,
            id: 'pathfinder',
          },
          {
            description:
              'View people due to leave this establishment for court appearances, transfers or being released.',
            heading: 'People due to leave',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/scheduled-moves`,
            id: 'view-people-due-to-leave',
          },
          {
            description: 'Access to the Prisoner communication monitoring service.',
            heading: 'Prisoner communication monitoring service',
            href: config.apis.pinPhones.ui_url,
            id: 'pin-phones',
          },
          {
            description:
              'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
            heading: 'Schedule and edit appointments',
            href: config.apis.appointments.url,
            id: 'appointments',
          },
          {
            description:
              'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
            heading: 'Secure social video calls',
            href: config.apis.secureSocialVideoCalls.ui_url,
            id: 'secure-social-video-calls',
          },
          {
            description:
              'Access to the new Mercury submission form for those establishments enrolled in the private beta',
            heading: 'Submit an Intelligence Report (Private Beta)',
            href: config.apis.mercurySubmit.url,
            id: 'submit-an-intelligence-report-private-beta',
          },
          {
            description: 'Manage and view incident reports and statements.',
            heading: 'Use of force incidents',
            href: config.apis.useOfForce.ui_url,
            id: 'use-of-force',
          },
          {
            description: 'View who is in each COVID unit in your establishment.',
            heading: 'View COVID units',
            href: `${config.serviceUrls.digitalPrisons}/current-covid-units`,
            id: 'view-covid-units',
          },
          {
            description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
            heading: 'View POM cases',
            href: config.applications.moic.url,
            id: 'pom',
          },
          {
            description: 'View all prisoners not marked as attended or not attended.',
            heading: 'View prisoners unaccounted for',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/prisoners-unaccounted-for`,
            id: 'view-unaccounted-for',
          },
          {
            description:
              'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
            heading: 'Welcome people into prison',
            href: config.apis.welcomePeopleIntoPrison.url,
            id: 'welcome-people-into-prison',
          },
        ],
        todayLastUpdated: '2023-07-20T12:45',
        unlockRollCount: 1015,
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
            heading: 'Adjudications',
            href: config.apis.manageAdjudications.ui_url,
            id: 'manage-adjudications',
          },
          {
            description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
            heading: 'Allocate people to activities',
            href: config.apis.activities.url,
            id: 'activities',
          },
          {
            description:
              'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
            heading: 'Book a secure move',
            href: config.applications.pecs.url,
            id: 'secure-move',
          },
          {
            description:
              'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
            heading: 'Categorisation',
            href: config.apis.categorisation.ui_url,
            id: 'categorisation',
          },
          {
            description:
              'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
            heading: 'Change someone’s cell',
            href: `${config.serviceUrls.digitalPrisons}/change-someones-cell`,
            id: 'change-someones-cell',
          },
          {
            description: 'View your prison staff detail (staff rota) from home.',
            heading: 'Check My Diary',
            href: config.apis.checkMyDiary.ui_url,
            id: 'check-my-diary',
          },
          {
            description: 'Scan barcodes on mail from law firms and other approved senders.',
            heading: 'Check Rule 39 mail',
            href: config.applications.sendLegalMail.url,
            id: 'check-rule39-mail',
          },
          {
            description: 'Create and vary standard determinate licences and post sentence supervision orders.',
            heading: 'Create and vary a licence',
            href: config.apis.createAndVaryALicence.url,
            id: 'create-and-vary-a-licence',
          },
          {
            description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
            heading: 'Establishment roll check',
            href: `${config.serviceUrls.digitalPrisons}/establishment-roll`,
            id: 'establishment-roll',
          },
          {
            description:
              'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
            heading: 'Get someone ready to work',
            href: `${config.apis.getSomeoneReadyForWork.ui_url}?sort=releaseDate&order=descending`,
            id: 'get-someone-ready-to-work',
          },
          {
            description: 'Search for someone in any establishment, or who has been released.',
            heading: 'Global search',
            href: `${config.serviceUrls.digitalPrisons}/global-search`,
            id: 'global-search',
          },
          {
            description: 'This service allows users to view historical prisoner information.',
            heading: 'Historical Prisoner Application',
            href: config.apis.historicalPrisonerApplication.ui_url,
            id: 'historical-prisoner-application',
          },
          {
            description: 'Create and manage Home Detention Curfew.',
            heading: 'Home Detention Curfew',
            href: config.applications.licences.url,
            id: 'hdc-licences',
          },
          {
            description: 'Manage your Serious and Organised Crime (SOC) caseload.',
            heading: 'Manage SOC cases',
            href: config.apis.soc.ui_url,
            id: 'soc',
          },
          {
            description:
              'See prisoner incentive information by residential location and view incentive data visualisations.',
            heading: 'Manage incentives',
            href: config.apis.incentives.ui_url,
            id: 'incentives',
          },
          {
            description: 'Add and remove key workers from prisoners and manage individuals.',
            heading: 'Manage key workers',
            href: config.apis.omic.url,
            id: 'manage-key-workers',
          },
          {
            description: 'This service allows you to maintain offence reference data.',
            heading: 'Manage offences',
            href: config.apis.manageOffences.ui_url,
            id: 'manage-offences',
          },
          {
            description: 'Book, view and cancel a prisoner’s social visits.',
            heading: 'Manage prison visits',
            href: config.apis.managePrisonVisits.ui_url,
            id: 'book-a-prison-visit',
          },
          {
            description:
              'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
            heading: 'Manage prisoner whereabouts',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts`,
            id: 'manage-prisoner-whereabouts',
          },
          {
            description:
              'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
            heading: 'Manage restricted patients',
            href: config.apis.manageRestrictedPatients.ui_url,
            id: 'manage-restricted-patients',
          },
          {
            description:
              'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
            heading: 'Manage user accounts',
            href: config.applications.manageaccounts.url,
            id: 'manage-users',
          },
          {
            description: 'View your key worker cases.',
            heading: 'My key worker allocation',
            href: `${config.apis.omic.url}/key-worker/${res.locals.user.staffId}`,
            id: 'key-worker-allocations',
          },
          {
            description: 'Respond to online social visit requests.',
            heading: 'Online visit requests',
            href: config.apis.legacyPrisonVisits.ui_url,
            id: 'legacy-prison-visit',
          },
          {
            description: 'Manage your Pathfinder caseloads.',
            heading: 'Pathfinder',
            href: config.apis.pathfinder.ui_url,
            id: 'pathfinder',
          },
          {
            description:
              'View people due to leave this establishment for court appearances, transfers or being released.',
            heading: 'People due to leave',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/scheduled-moves`,
            id: 'view-people-due-to-leave',
          },
          {
            description: 'Access to the Prisoner communication monitoring service.',
            heading: 'Prisoner communication monitoring service',
            href: config.apis.pinPhones.ui_url,
            id: 'pin-phones',
          },
          {
            description:
              'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
            heading: 'Schedule and edit appointments',
            href: config.apis.appointments.url,
            id: 'appointments',
          },
          {
            description:
              'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
            heading: 'Secure social video calls',
            href: config.apis.secureSocialVideoCalls.ui_url,
            id: 'secure-social-video-calls',
          },
          {
            description:
              'Access to the new Mercury submission form for those establishments enrolled in the private beta',
            heading: 'Submit an Intelligence Report (Private Beta)',
            href: config.apis.mercurySubmit.url,
            id: 'submit-an-intelligence-report-private-beta',
          },
          {
            description: 'Manage and view incident reports and statements.',
            heading: 'Use of force incidents',
            href: config.apis.useOfForce.ui_url,
            id: 'use-of-force',
          },
          {
            description: 'View who is in each COVID unit in your establishment.',
            heading: 'View COVID units',
            href: `${config.serviceUrls.digitalPrisons}/current-covid-units`,
            id: 'view-covid-units',
          },
          {
            description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
            heading: 'View POM cases',
            href: config.applications.moic.url,
            id: 'pom',
          },
          {
            description: 'View all prisoners not marked as attended or not attended.',
            heading: 'View prisoners unaccounted for',
            href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/prisoners-unaccounted-for`,
            id: 'view-unaccounted-for',
          },
          {
            description:
              'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
            heading: 'Welcome people into prison',
            href: config.apis.welcomePeopleIntoPrison.url,
            id: 'welcome-people-into-prison',
          },
        ],
        searchViewAllUrl: `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`,
        ...todayDataMock,
        whatsNewPosts: whatsNewPostsMock,
        outageBanner: 'Banner',
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
