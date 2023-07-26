import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import { CustomRequest } from '../data/interfaces/customRequest'
import { WhereAboutsConfig } from '../data/interfaces/whereAboutsConfig'
import { KeyWorkerPrisonStatus } from '../data/interfaces/keyWorkerPrisonStatus'
import { ServiceSubLink } from '../data/interfaces/serviceSubLink'

// eslint-disable-next-line import/prefer-default-export
export const hasAnyRole = (requiredRoles: string[], userRoles: string[]): boolean =>
  requiredRoles.some(role => userRoles.includes(role))

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class HomepageController {
  public displayHomepage(): RequestHandler {
    return async (req: Request & CustomRequest, res: Response, next: NextFunction) => {
      const errors = req.flash('errors')

      const userHasRoles = (roles: string[]) => hasAnyRole(res.locals.user.userRoles, roles)
      const userHasGlobal = userHasRoles([Role.GlobalSearch])
      const searchViewAllUrl = `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`

      const services = this.getServices(req, res, next)
        .filter(task => task.enabled())
        .map(task => ({
          id: task.id,
          href: task.href,
          heading: task.heading,
          description: task.description,
          subLinks: task.subLinks ? task.subLinks : [],
        }))

      res.render('pages/index', {
        errors,
        userHasGlobal,
        globalPreset: !!errors?.length && userHasGlobal,
        searchViewAllUrl,
        services,
      })
    }
  }

  public search(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { searchType, name, location } = req.body
      if (searchType === 'global') {
        if (!name?.trim()) {
          req.flash('errors', { text: 'Enter a prisoner’s name or prison number', href: '#name' })
          return res.redirect('/')
        }
        return res.redirect(`${config.serviceUrls.digitalPrisons}/global-search/results?searchText=${name}`)
      }
      return res.redirect(`${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`)
    }
  }

  getServices(req: CustomRequest, res: Response, next: NextFunction) {
    const { whereaboutsMaintenanceMode } = config.app
    const { keyworkerMaintenanceMode } = config.app

    let whereaboutsConfig
    if (whereaboutsMaintenanceMode) {
      whereaboutsConfig = { enabled: false }
    } else {
      whereaboutsConfig = { enabled: true }
    }

    let keyworkerPrisonStatus
    if (keyworkerMaintenanceMode) {
      keyworkerPrisonStatus = { migrated: false } // this can be empty because we're using the feature flag in getTasks
    } else {
      keyworkerPrisonStatus = { migrated: true }
    }

    const allServicess = this.getTasks(
      res.locals.user.activeCaseLoadId,
      res.locals.user.locations,
      res.locals.user.staffId,
      whereaboutsConfig,
      keyworkerPrisonStatus,
      res.locals.user.userRoles,
    )

    return allServicess
  }

  getTasks(
    activeCaseLoadId: string,
    locations: Location[],
    staffId: string,
    whereaboutsConfig: WhereAboutsConfig,
    keyworkerPrisonStatus: KeyWorkerPrisonStatus,
    userRoles: string[],
  ) {
    const userHasRoles = (roles: string[]) => hasAnyRole(userRoles, roles)
    const isMercurySubmitLive = () => {
      return config.apis.mercurySubmit.liveDate && config.apis.mercurySubmit.liveDate < Date.now()
    }

    return [
      {
        id: 'global-search',
        heading: 'Global search',
        description: 'Search for someone in any establishment, or who has been released.',
        href: `${config.serviceUrls.digitalPrisons}/global-search`,
        enabled: () => userHasRoles([Role.GlobalSearch]),
        subLinks: [] as ServiceSubLink[],
      },
      {
        id: 'key-worker-allocations',
        heading: 'My key worker allocation',
        description: 'View your key worker cases.',
        href: `${config.apis.omic.url}/key-worker/${staffId}`,
        enabled: () => config.apis.omic.url && userHasRoles(['KW']),
      },
      {
        id: 'manage-prisoner-whereabouts',
        heading: 'Manage prisoner whereabouts',
        description:
          'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
        href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts`,
        roles: [] as string[],
        enabled: () =>
          whereaboutsConfig?.enabled &&
          !config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
          !config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'change-someones-cell',
        heading: 'Change someone’s cell',
        description:
          'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
        href: `${config.serviceUrls.digitalPrisons}/change-someones-cell`,
        enabled: () => userHasRoles([Role.CellMove]),
      },
      {
        id: 'check-my-diary',
        heading: 'Check My Diary',
        description: 'View your prison staff detail (staff rota) from home.',
        href: config.apis.checkMyDiary.ui_url,
        roles: [] as string[],
        enabled: () => config.apis.checkMyDiary.ui_url,
      },
      {
        id: 'incentives',
        heading: 'Manage incentives',
        description:
          'See prisoner incentive information by residential location and view incentive data visualisations.',
        href: config.apis.incentives.ui_url,
        roles: [] as string[],
        enabled: () =>
          config.apis.incentives.ui_url && (userHasRoles(['MAINTAIN_INCENTIVE_LEVELS']) || locations?.length > 0),
      },
      {
        id: 'use-of-force',
        heading: 'Use of force incidents',
        description: 'Manage and view incident reports and statements.',
        href: config.apis.useOfForce.ui_url,
        roles: [] as string[],
        enabled: () =>
          config.apis.useOfForce.ui_url && config.apis.useOfForce.prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'pathfinder',
        heading: 'Pathfinder',
        description: 'Manage your Pathfinder caseloads.',
        href: config.apis.pathfinder.ui_url,
        enabled: () =>
          config.apis.pathfinder.ui_url &&
          userHasRoles([
            'PF_ADMIN',
            'PF_USER',
            'PF_STD_PRISON',
            'PF_STD_PROBATION',
            'PF_APPROVAL',
            'PF_STD_PRISON_RO',
            'PF_STD_PROBATION_RO',
            'PF_POLICE',
            'PF_HQ',
            'PF_PSYCHOLOGIST',
            'PF_NATIONAL_READER',
            'PF_LOCAL_READER',
          ]),
      },
      {
        id: 'hdc-licences',
        heading: 'Home Detention Curfew',
        description: 'Create and manage Home Detention Curfew.',
        href: config.applications.licences.url,
        enabled: () =>
          config.applications.licences.url &&
          userHasRoles([
            'NOMIS_BATCHLOAD',
            'LICENCE_CA',
            'LICENCE_DM',
            'LICENCE_RO',
            'LICENCE_VARY',
            'LICENCE_READONLY',
          ]),
      },
      {
        id: 'establishment-roll',
        heading: 'Establishment roll check',
        description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
        href: `${config.serviceUrls.digitalPrisons}/establishment-roll`,
        roles: [] as string[],
        enabled: () => Boolean(locations?.length > 0),
      },
      {
        id: 'manage-key-workers',
        heading: 'Manage key workers',
        description: 'Add and remove key workers from prisoners and manage individuals.',
        href: config.apis.omic.url,
        enabled: () => {
          if (config.app.keyworkerMaintenanceMode) {
            return false
          }
          if (!keyworkerPrisonStatus?.migrated) return userHasRoles(['KW_MIGRATION'])
          return userHasRoles(['OMIC_ADMIN', 'KEYWORKER_MONITOR'])
        },
      },
      {
        id: 'pom',
        heading: 'View POM cases',
        description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
        href: config.applications.moic.url,
        enabled: () => config.applications.moic.url && userHasRoles(['ALLOC_MGR', 'ALLOC_CASE_MGR']),
      },
      {
        id: 'manage-users',
        heading: 'Manage user accounts',
        description:
          'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
        href: config.applications.manageaccounts.url,
        enabled: () =>
          config.applications.manageaccounts.url &&
          userHasRoles([
            'MAINTAIN_ACCESS_ROLES',
            'MAINTAIN_ACCESS_ROLES_ADMIN',
            'MAINTAIN_OAUTH_USERS',
            'AUTH_GROUP_MANAGER',
          ]),
      },
      {
        id: 'categorisation',
        heading: 'Categorisation',
        description:
          'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
        href: config.apis.categorisation.ui_url,
        enabled: () =>
          config.apis.categorisation.ui_url &&
          userHasRoles([
            'CREATE_CATEGORISATION',
            'CREATE_RECATEGORISATION',
            'APPROVE_CATEGORISATION',
            'CATEGORISATION_SECURITY',
          ]),
      },
      {
        id: 'secure-move',
        heading: 'Book a secure move',
        description:
          'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
        href: config.applications.pecs.url,
        enabled: () => config.applications.pecs.url && userHasRoles(['PECS_OCA', 'PECS_PRISON']),
      },
      {
        id: 'soc',
        heading: 'Manage SOC cases',
        description: 'Manage your Serious and Organised Crime (SOC) caseload.',
        href: config.apis.soc.ui_url,
        enabled: () => config.apis.soc.ui_url && userHasRoles(['SOC_CUSTODY', 'SOC_COMMUNITY', 'SOC_HQ']),
      },
      {
        id: 'pin-phones',
        heading: 'Prisoner communication monitoring service',
        description: 'Access to the Prisoner communication monitoring service.',
        href: config.apis.pinPhones.ui_url,
        enabled: () =>
          config.apis.pinPhones.ui_url &&
          userHasRoles(['PCMS_ANALYST', 'PCMS_AUTHORISING_OFFICER', 'PCMS_GLOBAL_ADMIN', 'PCMS_AUDIT']),
      },
      {
        id: 'manage-adjudications',
        heading: 'Adjudications',
        description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
        href: config.apis.manageAdjudications.ui_url,
        enabled: () =>
          config.apis.manageAdjudications.ui_url &&
          config.apis.manageAdjudications.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'book-a-prison-visit',
        heading: 'Manage prison visits',
        description: 'Book, view and cancel a prisoner’s social visits.',
        href: config.apis.managePrisonVisits.ui_url,
        enabled: () => config.apis.managePrisonVisits.ui_url && userHasRoles(['MANAGE_PRISON_VISITS']),
      },
      {
        id: 'legacy-prison-visit',
        heading: 'Online visit requests',
        description: 'Respond to online social visit requests.',
        href: config.apis.legacyPrisonVisits.ui_url,
        enabled: () => config.apis.legacyPrisonVisits.ui_url && userHasRoles(['PVB_REQUESTS']),
      },
      {
        id: 'secure-social-video-calls',
        heading: 'Secure social video calls',
        description:
          'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
        href: config.apis.secureSocialVideoCalls.ui_url,
        enabled: () => config.apis.secureSocialVideoCalls.ui_url && userHasRoles(['SOCIAL_VIDEO_CALLS']),
      },
      {
        id: 'check-rule39-mail',
        heading: 'Check Rule 39 mail',
        description: 'Scan barcodes on mail from law firms and other approved senders.',
        href: config.applications.sendLegalMail.url,
        enabled: () => config.applications.sendLegalMail.url && userHasRoles(['SLM_SCAN_BARCODE', 'SLM_ADMIN']),
      },
      {
        id: 'welcome-people-into-prison',
        heading: 'Welcome people into prison',
        description:
          'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
        href: config.apis.welcomePeopleIntoPrison.url,
        roles: [] as string[],
        enabled: () =>
          config.apis.welcomePeopleIntoPrison.url &&
          config.apis.welcomePeopleIntoPrison.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: isMercurySubmitLive() ? 'submit-an-intelligence-report' : 'submit-an-intelligence-report-private-beta',
        heading: isMercurySubmitLive()
          ? 'Submit an Intelligence Report'
          : 'Submit an Intelligence Report (Private Beta)',
        description: isMercurySubmitLive()
          ? 'Access to the new Mercury submission form'
          : 'Access to the new Mercury submission form for those establishments enrolled in the private beta',
        href: config.apis.mercurySubmit.url,
        roles: [] as string[],
        enabled: () =>
          config.apis.mercurySubmit.url &&
          (isMercurySubmitLive() ||
            (config.apis.mercurySubmit.privateBetaDate &&
              config.apis.mercurySubmit.privateBetaDate < Date.now() &&
              config.apis.mercurySubmit.enabled_prisons.split(',').includes(activeCaseLoadId))),
      },
      {
        id: 'manage-restricted-patients',
        heading: 'Manage restricted patients',
        description:
          'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
        href: config.apis.manageRestrictedPatients.ui_url,
        enabled: () =>
          config.apis.manageRestrictedPatients.ui_url &&
          userHasRoles([
            'SEARCH_RESTRICTED_PATIENT',
            'TRANSFER_RESTRICTED_PATIENT',
            'REMOVE_RESTRICTED_PATIENT',
            'RESTRICTED_PATIENT_MIGRATION',
          ]),
      },
      {
        id: 'create-and-vary-a-licence',
        heading: 'Create and vary a licence',
        description: 'Create and vary standard determinate licences and post sentence supervision orders.',
        href: config.apis.createAndVaryALicence.url,
        enabled: () =>
          config.apis.createAndVaryALicence.url &&
          config.apis.createAndVaryALicence.enabled_prisons.split(',').includes(activeCaseLoadId) &&
          userHasRoles(['LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_ACO', 'LICENCE_ADMIN']),
      },
      {
        id: 'activities',
        heading: 'Allocate people to activities',
        description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
        href: config.apis.activities.url,
        enabled: () =>
          config.apis.activities.url && config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'appointments',
        heading: 'Schedule and edit appointments',
        description: 'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
        href: config.apis.appointments.url,
        enabled: () =>
          config.apis.appointments.url &&
          config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'view-unaccounted-for',
        heading: 'View prisoners unaccounted for',
        description: 'View all prisoners not marked as attended or not attended.',
        href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/prisoners-unaccounted-for`,
        enabled: () =>
          config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
          config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'view-people-due-to-leave',
        heading: 'People due to leave',
        description: 'View people due to leave this establishment for court appearances, transfers or being released.',
        href: `${config.serviceUrls.digitalPrisons}/manage-prisoner-whereabouts/scheduled-moves`,
        enabled: () =>
          config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
          config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'view-covid-units',
        heading: 'View COVID units',
        description: 'View who is in each COVID unit in your establishment.',
        href: `${config.serviceUrls.digitalPrisons}/current-covid-units`,
        enabled: () =>
          userHasRoles(['PRISON']) &&
          config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
          config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
      },
      {
        id: 'historical-prisoner-application',
        heading: 'Historical Prisoner Application',
        description: 'This service allows users to view historical prisoner information.',
        href: config.apis.historicalPrisonerApplication.ui_url,
        enabled: () => config.apis.historicalPrisonerApplication.ui_url && userHasRoles(['HPA_USER']),
      },
      {
        id: 'get-someone-ready-to-work',
        heading: 'Get someone ready to work',
        description: 'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
        href: `${config.apis.getSomeoneReadyForWork.ui_url}?sort=releaseDate&order=descending`,
        enabled: () =>
          config.apis.getSomeoneReadyForWork.ui_url && userHasRoles(['WORK_READINESS_VIEW', 'WORK_READINESS_EDIT']),
      },
      {
        id: 'manage-offences',
        heading: 'Manage offences',
        description: 'This service allows you to maintain offence reference data.',
        href: config.apis.manageOffences.ui_url,
        enabled: () => userHasRoles(['MANAGE_OFFENCES_ADMIN', 'UPDATE_OFFENCE_SCHEDULES', 'NOMIS_OFFENCE_ACTIVATOR']),
      },
    ].sort((a, b) => (a.heading < b.heading ? -1 : 1))
  }
}
