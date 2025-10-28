import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'

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
  audit: {
    enabled: get('AUDIT_ENABLED', 'false') === 'true',
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      healthPath: '/health/ping',
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
    componentApi: {
      url: get('COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPONENT_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('COMPONENT_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('COMPONENT_TIMEOUT_DEADLINE', 10000))),
    },
    gotenberg: {
      url: get('GOTENBERG_API_URL', 'http://localhost:3100', requiredInProduction),
      healthPath: '/health',
      timeout: {
        response: Number(get('GOTENBERG_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('GOTENBERG_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('GOTENBERG_API_TIMEOUT_DEADLINE', 20000))),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 3000))),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    mercurySubmit: {
      url: process.env.MERCURY_SUBMIT_URL,
      privateBetaDate: parseDate(process.env.MERCURY_SUBMIT_PRIVATE_BETA_ENABLED_DATE),
      enabled_prisons: process.env.MERCURY_SUBMIT_PRIVATE_BETA_ENABLED_PRISONS || '',
      liveDate: parseDate(process.env.MERCURY_SUBMIT_LIVE_ENABLED_DATE),
    },
    checkMyDiary: {
      ui_url: process.env.CHECK_MY_DIARY_URL,
    },
    accreditedProgrammes: {
      ui_url: get('ACCREDITED_PROGRAMMES_URL', 'http://localhost:3002', requiredInProduction),
      enabled: get('ACCREDITED_PROGRAMMES_ENABLED', 'false') === 'true',
    },
    healthAndMedicationApi: {
      url: get('HEALTH_AND_MEDICATION_API_URL', 'http://localhost:8082', requiredInProduction),
      healthPath: '/health/ping',
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
  cache: {
    whatsNewTtl: Number(get('WHATS_NEW_CACHE_TTL', 10)),
    outageBannerTtl: Number(get('OUTAGE_BANNER_CACHE_TTL', 1)),
  },
  features: {
    prisonerSearchEnabled: get('PRISONER_SEARCH_ENABLED', 'false') === 'true',
  },
}
