const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  // Sets the working socket to timeout after timeout milliseconds of inactivity on the working socket.
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    // sets maximum time to wait for the first byte to arrive from the server, but it does not limit how long the
    // entire download can take.
    response: number
    // sets a deadline for the entire request (including all uploads, redirects, server processing time) to complete.
    // If the response isn't fully downloaded within that time, the request will be aborted.
    deadline: number
  }
  agent: AgentConfig
}

const toNumber = (value: string | undefined): number | undefined => {
  const result = parseInt(value, 10)
  return Number.isSafeInteger(result) && result
}

export const parseDate = (value: string | undefined): number => {
  return value ? Date.parse(value) : null
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
  redis: {
    enabled: get('REDIS_ENABLED', 'false', requiredInProduction) === 'true',
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: toNumber(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  applications: {
    licences: {
      url: process.env.LICENCES_URL || 'http://localhost:3003/',
    },
    manageaccounts: {
      url: process.env.MANAGE_AUTH_ACCOUNTS_URL || 'http://localhost:3004/',
    },
    moic: {
      url: process.env.MOIC_URL,
    },
    pecs: {
      url:
        process.env.PECS_URL ||
        'https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk',
    },
    sendLegalMail: {
      url: process.env.SEND_LEGAL_MAIL_URL,
    },
  },
  app: {
    whereaboutsMaintenanceMode: process.env.WHEREABOUTS_MAINTENANCE_MODE === 'true' || false,
    keyworkerMaintenanceMode: process.env.KEYWORKER_MAINTENANCE_MODE === 'true' || false,
    covidUnitsEnabled: process.env.COVID_UNITS_ENABLED === 'true' || false,
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000))),
    },
    locationsInsidePrisonApi: {
      url: get('LOCATIONS_INSIDE_PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_DEADLINE', 20000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 20000))),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    omic: {
      url: process.env.OMIC_URL || 'http://localhost:3001',
    },
    useOfForce: {
      ui_url: process.env.USE_OF_FORCE_URL,
      prisons: process.env.USE_OF_FORCE_PRISONS || '',
    },
    pathfinder: {
      url: process.env.PATHFINDER_ENDPOINT_API_URL || '',
      ui_url: process.env.PATHFINDER_UI_URL,
      timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
    },
    categorisation: {
      ui_url: process.env.CATEGORISATION_UI_URL || 'http://localhost:3003/',
    },
    soc: {
      url: process.env.SOC_API_URL || '',
      ui_url: process.env.SOC_UI_URL || '',
      timeoutSeconds: 10,
      enabled: process.env.SOC_API_ENABLED === 'true',
    },
    pinPhones: {
      ui_url: process.env.PIN_PHONES_URL || 'http://localhost:3000/',
    },
    manageAdjudications: {
      ui_url: process.env.MANAGE_ADJUDICATIONS_URL || '',
      enabled_prisons: process.env.PRISONS_WITH_MANAGE_ADJUDICATIONS_ENABLED || '',
    },
    managePrisonVisits: {
      ui_url: process.env.MANAGE_PRISON_VISITS_URL || '',
    },
    legacyPrisonVisits: {
      ui_url: process.env.LEGACY_PRISON_VISITS_URL || '',
    },
    secureSocialVideoCalls: {
      ui_url: process.env.SECURE_SOCIAL_VIDEO_CALLS_URL || '',
    },
    welcomePeopleIntoPrison: {
      url: process.env.WELCOME_PEOPLE_INTO_PRISON_URL,
      enabled_prisons: process.env.WELCOME_PEOPLE_INTO_PRISON_ENABLED_PRISONS || '',
    },
    mercurySubmit: {
      url: process.env.MERCURY_SUBMIT_URL,
      privateBetaDate: parseDate(process.env.MERCURY_SUBMIT_PRIVATE_BETA_ENABLED_DATE),
      enabled_prisons: process.env.MERCURY_SUBMIT_PRIVATE_BETA_ENABLED_PRISONS || '',
      liveDate: parseDate(process.env.MERCURY_SUBMIT_LIVE_ENABLED_DATE),
    },
    manageRestrictedPatients: {
      ui_url: process.env.MANAGE_RESTRICTED_PATIENTS_URL || '',
    },
    checkMyDiary: {
      ui_url: process.env.CHECK_MY_DIARY_URL,
    },
    incentives: {
      ui_url: process.env.INCENTIVES_URL,
    },
    createAndVaryALicence: {
      url: process.env.CREATE_AND_VARY_A_LICENCE_URL,
      enabled_prisons: process.env.CREATE_AND_VARY_A_LICENCE_ENABLED_PRISONS || '',
    },
    activities: {
      url: process.env.ACTIVITIES_URL,
      enabled_prisons: process.env.ACTIVITIES_ENABLED_PRISONS || '',
    },
    appointments: {
      url: process.env.APPOINTMENTS_URL,
      enabled_prisons: process.env.APPOINTMENTS_ENABLED_PRISONS || '',
    },
    historicalPrisonerApplication: {
      ui_url: process.env.HISTORICAL_PRISONER_APPLICATION_URL || '',
    },
    getSomeoneReadyForWork: {
      ui_url: process.env.GET_SOMEONE_READY_FOR_WORK_URL || 'http://localhost:3002',
    },
    manageOffences: {
      ui_url: process.env.MANAGE_OFFENCES_URL,
    },
    whereabouts: {
      url: process.env.WHEREABOUTS_ENDPOINT_URL || 'http://localhost:8082',
      timeout: {
        response: Number(get('API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('API_WHEREABOUTS_ENDPOINT_TIMEOUT_SECONDS', 20000))),
    },
    keyworker: {
      url: process.env.KEYWORKER_API_URL || 'http://localhost:8081/',
      timeout: {
        response: Number(get('KEYWORKER_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('KEYWORKER_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('KEYWORKER_API_TIMEOUT_SECONDS', 20000))),
    },
    frontendComponents: {
      url: get('COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('COMPONENT_API_TIMEOUT_SECONDS', 3000))),
      latest: get('COMPONENT_API_LATEST', 'false') === 'true',
    },
    learningAndWorkProgress: {
      ui_url: get('LEARNING_AND_WORK_PROGRESS_URL', 'http://localhost:3002', requiredInProduction),
    },
    prepareSomeoneForRelease: {
      ui_url: get('PREPARE_SOMEONE_FOR_RELEASE_URL', 'http://localhost:3002', requiredInProduction),
    },
    accreditedProgrammes: {
      ui_url: get('ACCREDITED_PROGRAMMES_URL', 'http://localhost:3002', requiredInProduction),
      enabled: get('ACCREDITED_PROGRAMMES_ENABLED', 'false') === 'true',
    },
    healthAndMedicationApi: {
      url: get('HEALTH_AND_MEDICATION_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('HEALTH_AND_MEDICATION_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HEALTH_AND_MEDICATION_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HEALTH_AND_MEDICATION_TIMEOUT_DEADLINE', 10000))),
    },
    establishmentRoll: {
      ui_url: get('ESTABLISHMENT_ROLL_URL', 'http://localhost:8082', requiredInProduction),
    },
  },
  serviceUrls: {
    digitalPrisons: get('DIGITAL_PRISONS_URL', 'http://localhost:3001', requiredInProduction),
    prisonerProfile: get('PRISONER_PROFILE_URL', 'http://localhost:3002', requiredInProduction),
    changeSomeonesCell: get('CHANGE_SOMEONES_CELL_URL', 'http://localhost:3002', requiredInProduction),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  contentful: {
    host: get('CONTENTFUL_HOST', ''),
    spaceId: get('CONTENTFUL_SPACE_ID', 'spaceId', requiredInProduction),
    environment: get('CONTENTFUL_ENVIRONMENT', 'environment', requiredInProduction),
    accessToken: get('CONTENTFUL_ACCESS_TOKEN', 'token', requiredInProduction),
  },
  environmentName: get('ENVIRONMENT_NAME', ''),
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  feedbackSurveyUrl: 'https://www.smartsurvey.co.uk/s/43EWY0/',
}
