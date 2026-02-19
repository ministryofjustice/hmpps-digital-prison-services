import nock from 'nock'
import config from '../config'
import { ApplicationInfo } from '../applicationInfo'
import { HealthAndMedicationApiClient, HealthAndMedicationFilters } from './interfaces/healthAndMedicationApiClient'
import HealthAndMedicationRestApiClient from './healthAndMedicationRestApiClient'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'

jest.mock('../applicationInfo.ts', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return {
        applicationName: 'test',
        buildNumber: '1',
        gitRef: 'long ref',
        gitShortHash: 'short ref',
      } as ApplicationInfo
    }),
  }
})

const token = { access_token: 'token-1', expires_in: 300 }
const prisonId = 'MDI'

describe('healthAndMedicationApiClient', () => {
  let fakeHealthAndMedicationApi: nock.Scope
  let healthAndMedicationApiClient: HealthAndMedicationApiClient

  beforeEach(() => {
    fakeHealthAndMedicationApi = nock(config.apis.healthAndMedicationApi.url)
    healthAndMedicationApiClient = new HealthAndMedicationRestApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulHealthAndMedicationApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeHealthAndMedicationApi
      .get(url)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('getFiltersForPrison', () => {
    const filtersMock: HealthAndMedicationFilters = {
      foodAllergies: [],
      medicalDietaryRequirements: [],
      personalisedDietaryRequirements: [],
      topLocationLevel: [],
      recentArrival: [],
    }

    it('should return data from api', async () => {
      mockSuccessfulHealthAndMedicationApiCall(`/prisons/${prisonId}/filters`, filtersMock)

      const output = await healthAndMedicationApiClient.getFiltersForPrison(prisonId)
      expect(output).toEqual(filtersMock)
    })
  })

  describe('getHealthAndMedicationForPrison', () => {
    it('Should return data from the API', async () => {
      const queryParams: DietaryRequirementsQueryParams = {
        page: 1,
        size: 20,
      }
      fakeHealthAndMedicationApi
        .post(`/prisons/${prisonId}`, {
          page: 1,
          size: 20,
          sort: 'prisonerName,asc',
          filters: null,
        })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })

      const output = await healthAndMedicationApiClient.getHealthAndMedicationForPrison(prisonId, queryParams)
      expect(output).toEqual({ body: 'RESPONSE' })
    })

    it('Should allow sorting by prisoner name', async () => {
      const queryParams: DietaryRequirementsQueryParams = {
        page: 1,
        size: 20,
        nameAndNumber: 'desc',
      }
      fakeHealthAndMedicationApi
        .post(`/prisons/${prisonId}`, {
          page: 1,
          size: 20,
          sort: 'prisonerName,desc',
          filters: null,
        })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })

      const output = await healthAndMedicationApiClient.getHealthAndMedicationForPrison(prisonId, queryParams)
      expect(output).toEqual({ body: 'RESPONSE' })
    })

    it('Should allow sorting by prisoner location', async () => {
      const queryParams: DietaryRequirementsQueryParams = {
        page: 1,
        size: 20,
        location: 'asc',
      }
      fakeHealthAndMedicationApi
        .post(`/prisons/${prisonId}`, {
          page: 1,
          size: 20,
          sort: 'location,asc',
          filters: null,
        })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })

      const output = await healthAndMedicationApiClient.getHealthAndMedicationForPrison(prisonId, queryParams)
      expect(output).toEqual({ body: 'RESPONSE' })
    })

    it('Should send filtering information in request', async () => {
      const queryParams: DietaryRequirementsQueryParams = {
        page: 1,
        size: 20,
        personalDiet: ['KOSHER'],
        medicalDiet: ['COELIAC'],
        foodAllergies: ['PEANUTS', 'SESAME'],
        topLocationLevel: ['B', 'C'],
        recentArrival: true,
      }
      fakeHealthAndMedicationApi
        .post(`/prisons/${prisonId}`, {
          page: 1,
          size: 20,
          sort: 'prisonerName,asc',
          filters: {
            personalisedDietaryRequirements: ['KOSHER'],
            medicalDietaryRequirements: ['COELIAC'],
            foodAllergies: ['PEANUTS', 'SESAME'],
            topLocationLevel: ['B', 'C'],
            recentArrival: true,
          },
        })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, { body: 'RESPONSE' })

      const output = await healthAndMedicationApiClient.getHealthAndMedicationForPrison(prisonId, queryParams)
      expect(output).toEqual({ body: 'RESPONSE' })
    })
  })
})
