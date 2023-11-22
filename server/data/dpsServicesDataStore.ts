import config from '../config'
import { Role } from '../enums/role'
import { userHasRoles } from '../utils/utils'
import { KeyWorkerPrisonStatus } from './interfaces/keyWorkerPrisonStatus'
import { WhereAboutsConfig } from './interfaces/whereAboutsConfig'

/**
 *
 * @param keyworkerPrisonStatus
 * @param userRoles
 */
export const manageKeyWorkers = (keyworkerPrisonStatus: KeyWorkerPrisonStatus, userRoles: string[]): boolean => {
  if (config.app.keyworkerMaintenanceMode) {
    return false
  }
  if (!keyworkerPrisonStatus?.migrated) return userHasRoles(['KW_MIGRATION'], userRoles)
  return userHasRoles(['OMIC_ADMIN', 'KEYWORKER_MONITOR'], userRoles)
}

/**
 *
 * @param activeCaseLoadId
 * @param locations
 * @param staffId
 * @param whereaboutsConfig
 * @param keyworkerPrisonStatus
 * @param userRoles
 */
export const getTasks = (
  activeCaseLoadId: string,
  locations: Location[],
  staffId: string,
  whereaboutsConfig: WhereAboutsConfig,
  keyworkerPrisonStatus: KeyWorkerPrisonStatus,
  userRoles: string[],
) => {
  const isMercurySubmitLive = () => {
    return config.apis.mercurySubmit.liveDate && config.apis.mercurySubmit.liveDate < Date.now()
  }

  const isManageKeyWorkers = manageKeyWorkers(keyworkerPrisonStatus, userRoles)

  return [
    {
      id: 'global-search',
      heading: 'Global search',
      description: 'Search for someone in any establishment, or who has been released.',
      href: `${config.serviceUrls.digitalPrisons}/global-search`,
      enabled: () => userHasRoles([Role.GlobalSearch], userRoles),
    },
    {
      id: 'key-worker-allocations',
      heading: 'My key worker allocation',
      description: 'View your key worker cases.',
      href: `${config.apis.omic.url}/key-worker/${staffId}`,
      enabled: () => config.apis.omic.url && userHasRoles(['KW'], userRoles),
    },
    {
      id: 'manage-prisoner-whereabouts',
      heading: 'Prisoner whereabouts',
      description: 'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
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
      description: 'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
      href: `${config.serviceUrls.digitalPrisons}/change-someones-cell`,
      enabled: () => userHasRoles([Role.CellMove], userRoles),
    },
    {
      id: 'check-my-diary',
      heading: 'Check my diary',
      description: 'View your prison staff detail (staff rota) from home.',
      href: config.apis.checkMyDiary.ui_url,
      roles: [] as string[],
      enabled: () => config.apis.checkMyDiary.ui_url,
    },
    {
      id: 'incentives',
      heading: 'Incentives',
      description: 'Manage incentive level reviews by residential location and view incentives data charts.',
      href: config.apis.incentives.ui_url,
      roles: [] as string[],
      enabled: () =>
        config.apis.incentives.ui_url &&
        (userHasRoles(['MAINTAIN_INCENTIVE_LEVELS'], userRoles) || locations?.length > 0),
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
        userHasRoles(
          [
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
          ],
          userRoles,
        ),
    },
    {
      id: 'hdc-licences',
      heading: 'Home Detention Curfew',
      description: 'Create and manage Home Detention Curfew.',
      href: config.applications.licences.url,
      enabled: () =>
        config.applications.licences.url &&
        userHasRoles(
          ['NOMIS_BATCHLOAD', 'LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_VARY', 'LICENCE_READONLY'],
          userRoles,
        ),
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
      heading: 'Key workers',
      description: 'Add and remove key workers from prisoners and manage individuals.',
      href: config.apis.omic.url,
      enabled: () => isManageKeyWorkers,
    },
    {
      id: 'pom',
      heading: 'View POM cases',
      description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
      href: config.applications.moic.url,
      enabled: () => config.applications.moic.url && userHasRoles(['ALLOC_MGR', 'ALLOC_CASE_MGR'], userRoles),
    },
    {
      id: 'manage-users',
      heading: 'Manage user accounts',
      description:
        'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
      href: config.applications.manageaccounts.url,
      enabled: () =>
        config.applications.manageaccounts.url &&
        userHasRoles(
          ['MAINTAIN_ACCESS_ROLES', 'MAINTAIN_ACCESS_ROLES_ADMIN', 'MAINTAIN_OAUTH_USERS', 'AUTH_GROUP_MANAGER'],
          userRoles,
        ),
    },
    {
      id: 'categorisation',
      heading: 'Categorisation',
      description: 'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
      href: config.apis.categorisation.ui_url,
      enabled: () =>
        config.apis.categorisation.ui_url &&
        userHasRoles(
          ['CREATE_CATEGORISATION', 'CREATE_RECATEGORISATION', 'APPROVE_CATEGORISATION', 'CATEGORISATION_SECURITY'],
          userRoles,
        ),
    },
    {
      id: 'secure-move',
      heading: 'Book a secure move',
      description:
        'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
      href: config.applications.pecs.url,
      enabled: () => config.applications.pecs.url && userHasRoles(['PECS_OCA', 'PECS_PRISON'], userRoles),
    },
    {
      id: 'soc',
      heading: 'Manage SOC cases',
      description: 'Manage your Serious and Organised Crime (SOC) caseload.',
      href: config.apis.soc.ui_url,
      enabled: () => config.apis.soc.ui_url && userHasRoles(['SOC_CUSTODY', 'SOC_COMMUNITY', 'SOC_HQ'], userRoles),
    },
    {
      id: 'pin-phones',
      heading: 'Prisoner communication monitoring service',
      description: 'Access to the Prisoner communication monitoring service.',
      href: config.apis.pinPhones.ui_url,
      enabled: () =>
        config.apis.pinPhones.ui_url &&
        userHasRoles(['PCMS_ANALYST', 'PCMS_AUTHORISING_OFFICER', 'PCMS_GLOBAL_ADMIN', 'PCMS_AUDIT'], userRoles),
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
      enabled: () => config.apis.managePrisonVisits.ui_url && userHasRoles(['MANAGE_PRISON_VISITS'], userRoles),
    },
    {
      id: 'legacy-prison-visit',
      heading: 'Online visit requests',
      description: 'Respond to online social visit requests.',
      href: config.apis.legacyPrisonVisits.ui_url,
      enabled: () => config.apis.legacyPrisonVisits.ui_url && userHasRoles(['PVB_REQUESTS'], userRoles),
    },
    {
      id: 'secure-social-video-calls',
      heading: 'Secure social video calls',
      description:
        'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
      href: config.apis.secureSocialVideoCalls.ui_url,
      enabled: () => config.apis.secureSocialVideoCalls.ui_url && userHasRoles(['SOCIAL_VIDEO_CALLS'], userRoles),
    },
    {
      id: 'check-rule39-mail',
      heading: 'Check Rule 39 mail',
      description: 'Scan barcodes on mail from law firms and other approved senders.',
      href: config.applications.sendLegalMail.url,
      enabled: () =>
        config.applications.sendLegalMail.url && userHasRoles(['SLM_SCAN_BARCODE', 'SLM_ADMIN'], userRoles),
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
      heading: isMercurySubmitLive() ? 'Submit an Intelligence Report' : 'Submit an Intelligence Report (Private Beta)',
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
        userHasRoles(
          [
            'SEARCH_RESTRICTED_PATIENT',
            'TRANSFER_RESTRICTED_PATIENT',
            'REMOVE_RESTRICTED_PATIENT',
            'RESTRICTED_PATIENT_MIGRATION',
          ],
          userRoles,
        ),
    },
    {
      id: 'create-and-vary-a-licence',
      heading: 'Create and vary a licence',
      description: 'Create and vary standard determinate licences and post sentence supervision orders.',
      href: config.apis.createAndVaryALicence.url,
      enabled: () =>
        config.apis.createAndVaryALicence.url &&
        config.apis.createAndVaryALicence.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        userHasRoles(['LICENCE_CA', 'LICENCE_DM', 'LICENCE_RO', 'LICENCE_ACO', 'LICENCE_ADMIN'], userRoles),
    },
    {
      id: 'activities',
      heading: 'Allocate people, unlock and attend',
      description:
        'Create and edit activities. Log applications and manage waitlists. Allocate people and edit allocations. Print unlock lists and record attendance.',
      href: config.apis.activities.url,
      enabled: () =>
        config.apis.activities.url && config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'appointments',
      heading: 'Schedule and edit appointments',
      description: 'Create and manage appointments. Print movement slips.',
      href: config.apis.appointments.url,
      enabled: () =>
        config.apis.appointments.url && config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
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
        userHasRoles(['PRISON'], userRoles) &&
        config.apis.activities.enabled_prisons.split(',').includes(activeCaseLoadId) &&
        config.apis.appointments.enabled_prisons.split(',').includes(activeCaseLoadId),
    },
    {
      id: 'historical-prisoner-application',
      heading: 'Historical Prisoner Application',
      description: 'This service allows users to view historical prisoner information.',
      href: config.apis.historicalPrisonerApplication.ui_url,
      enabled: () => config.apis.historicalPrisonerApplication.ui_url && userHasRoles(['HPA_USER'], userRoles),
    },
    {
      id: 'get-someone-ready-to-work',
      heading: 'Get someone ready to work',
      description: 'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
      href: `${config.apis.getSomeoneReadyForWork.ui_url}?sort=releaseDate&order=descending`,
      enabled: () =>
        config.apis.getSomeoneReadyForWork.ui_url &&
        userHasRoles(['WORK_READINESS_VIEW', 'WORK_READINESS_EDIT'], userRoles),
    },
    {
      id: 'manage-offences',
      heading: 'Manage offences',
      description: 'This service allows you to maintain offence reference data.',
      href: config.apis.manageOffences.ui_url,
      enabled: () =>
        userHasRoles(['MANAGE_OFFENCES_ADMIN', 'UPDATE_OFFENCE_SCHEDULES', 'NOMIS_OFFENCE_ACTIVATOR'], userRoles),
    },
    {
      id: 'learning-and-work-progress',
      heading: 'Learning and work progress',
      description: 'View and manage learning and work history, support needs, goals and progress.',
      href: config.apis.learningAndWorkProgress.ui_url,
      enabled: () =>
        config.apis.learningAndWorkProgress.ui_url &&
        userHasRoles(['EDUCATION_WORK_PLAN_EDITOR', 'EDUCATION_WORK_PLAN_VIEWER'], userRoles),
    },
    {
      id: 'prepare-someone-for-release',
      heading: 'Prepare someone for release',
      description: 'Search for people with resettlement needs. View and manage their information and support.',
      href: config.apis.prepareSomeoneForRelease.ui_url,
      enabled: () =>
        config.apis.prepareSomeoneForRelease.ui_url && userHasRoles(['RESETTLEMENT_PASSPORT_EDIT'], userRoles),
    },
  ].sort((a, b) => (a.heading < b.heading ? -1 : 1))
}
