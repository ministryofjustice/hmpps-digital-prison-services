import type { Request, Response } from 'express'
import { InternalServerError } from 'http-errors'
import SearchController from './searchController'
import config from '../config'
import type PrisonerSearchService from '../services/prisonerSearchService'
import type GlobalSearchService from '../services/globalSearchService'
import type MetricsService from '../services/metricsService'
import type AuditService from '../services/auditService'
import type { PermissionsApiClient } from '../data/interfaces/permissionsApiClient'
import type Prisoner from '../data/interfaces/prisoner'
import type { HmppsError } from '../data/interfaces/hmppsError'
import type { PrisonUser } from '../interfaces/hmppsUser'
import type { Pagination } from '../data/interfaces/pagination'
import { calculateAge } from '../utils/utils'
import { generateListMetadata, ListMetadata, PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import auditServiceMock from '../test/mocks/auditServiceMock'
import { permissionsApiClientMock } from '../test/mocks/permissionsApiClientMock'
import globalSearchDateValidator from '../utils/globalSearchDateValidator'
import { Role } from '../enums/role'

jest.mock('../utils/generateListMetadata')
jest.mock('../utils/globalSearchDateValidator')

let wasHighProfilePrisonersEnabled: boolean
beforeAll(() => {
  wasHighProfilePrisonersEnabled = config.features.highProfilePrisonersEnabled
})
afterEach(() => {
  config.features.highProfilePrisonersEnabled = wasHighProfilePrisonersEnabled
})

describe('SearchController', () => {
  let user: PrisonUser
  let controller: SearchController
  let prisonerSearchService: jest.Mocked<PrisonerSearchService>
  let globalSearchService: jest.Mocked<GlobalSearchService>
  let metricsService: jest.Mocked<MetricsService>
  let auditService: jest.Mocked<AuditService>
  let permissionsApiClient: jest.Mocked<PermissionsApiClient>

  beforeEach(() => {
    jest.mocked(globalSearchDateValidator).mockReturnValue([])
    prisonerSearchService = { getResults: jest.fn() } as unknown as jest.Mocked<PrisonerSearchService>
    globalSearchService = { getResultsForUser: jest.fn() } as unknown as jest.Mocked<GlobalSearchService>
    metricsService = {
      trackPrisonerSearchQuery: jest.fn(),
      trackGlobalSearchQuery: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>
    auditService = auditServiceMock()
    permissionsApiClient = permissionsApiClientMock()

    controller = new SearchController(
      prisonerSearchService,
      globalSearchService,
      metricsService,
      auditService,
      () => permissionsApiClient,
    )
    user = {
      username: 'USER_NAME',
      userId: '123',
      userRoles: [Role.GlobalSearch, Role.LicencesVary, Role.LicencesReadOnly],
      caseLoads: [{ caseLoadId: 'LEI' }],
      activeCaseLoad: { caseLoadId: 'LEI', description: 'Leeds' },
      locations: [{ value: 'LEI-A', text: 'A' }],
    } as PrisonUser
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Prisoner search', () => {
    describe('get', () => {
      let res: Response

      const generatedMetadata = {
        pagination: { itemDescription: 'description' },
      } as ListMetadata<PrisonerSearchQueryParams>

      beforeEach(() => {
        res = {
          locals: { user },
          render: jest.fn(),
          redirect: jest.fn(),
        } as unknown as Response
        jest.mocked(generateListMetadata).mockReturnValueOnce(generatedMetadata)

        prisonerSearchService.getResults.mockResolvedValue({
          content: [
            {
              prisonId: 'LEI',
              prisonerNumber: 'A1234BC',
              currentFacialImageId: 1234,
              currentIncentive: { level: { description: 'Current incentive' } },
              cellLocation: 'RECP',
              firstName: 'First',
              lastName: 'LAST',
              alerts: [{ alertCode: 'DONT_SHOW' }, { alertCode: 'PEEP' }],
              dateOfBirth: '1990-01-01',
              category: 'A',
            } as Prisoner,
          ],
          metadata: {
            first: true,
            last: true,
            offset: 0,
            pageNumber: 0,
            size: 1,
            numberOfElements: 1,
            totalElements: 1,
            totalPages: 1,
          },
        })
      })

      it('Loads the page correctly with no query params', async () => {
        const req = {
          originalUrl: 'originalUrl',
          query: {},
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          sort: 'lastName,firstName,asc',
        })
        expect(generateListMetadata).toHaveBeenCalledWith(
          {
            content: [
              {
                alerts: [{ alertCode: 'DONT_SHOW' }, { alertCode: 'PEEP' }],
                cellLocation: 'RECP',
                currentFacialImageId: 1234,
                currentIncentive: { level: { description: 'Current incentive' } },
                dateOfBirth: '1990-01-01',
                firstName: 'First',
                lastName: 'LAST',
                prisonerNumber: 'A1234BC',
                prisonId: 'LEI',
                category: 'A',
              },
            ],
            metadata: {
              first: true,
              last: true,
              numberOfElements: 1,
              offset: 0,
              pageNumber: 0,
              size: 1,
              totalElements: 1,
              totalPages: 1,
            },
          },
          {
            size: 50,
            sort: 'lastName,firstName,asc',
          },
          'result',
          true,
        )
        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerSearch/index',
          expect.objectContaining({
            prisonerProfileBaseUrl: expect.anything(),
            encodedOriginalUrl: 'originalUrl',
            listMetadata: generatedMetadata,
            links: {
              gridView: '/prisoner-search?view=grid&sort=lastName%2CfirstName%2Casc&page=1&size=50',
              listView: '/prisoner-search?view=list&sort=lastName%2CfirstName%2Casc&page=1&size=50',
            },
            alertOptions: expect.anything(),
            results: [
              {
                prisonerNumber: 'A1234BC',
                currentFacialImageId: 1234,
                iepLevel: 'Current incentive',
                assignedLivingUnitDesc: 'Reception',
                name: 'Last, First',
                alerts: [expect.objectContaining({ alertCodes: ['PEEP'] })],
                age: calculateAge('1990-01-01').years,
                category: 'A',
              },
            ],
            formValues: {
              location: undefined,
              alerts: undefined,
              sort: 'lastName,firstName,asc',
              term: undefined,
            },
          }),
        )
      })

      it('Loads the page correctly with all query params', async () => {
        const req = {
          originalUrl: 'originalUrl',
          query: {
            view: 'grid',
            showAll: 'true',
            sort: 'lastName,firstName,desc',
            term: 'smith',
            page: 2,
            size: 500,
            location: 'LEI-A',
            alerts: ['HA', 'LCE'],
          },
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          view: 'grid',
          showAll: true,
          sort: 'lastName,firstName,desc',
          term: 'smith',
          page: 2,
          size: 500,
          location: 'LEI-A',
          alerts: ['HA', 'LCE'],
        })

        expect(req.session.prisonerNumberImagesPermitted).toEqual(['A1234BC'])
        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerSearch/index',
          expect.objectContaining({
            prisonerProfileBaseUrl: expect.anything(),
            encodedOriginalUrl: 'originalUrl',
            listMetadata: generatedMetadata,
            links: {
              gridView:
                '/prisoner-search?showAll=true&view=grid&alerts=HA&alerts=LCE&sort=lastName%2CfirstName%2Cdesc&term=smith&page=2&size=500&location=LEI-A',
              listView:
                '/prisoner-search?showAll=true&view=list&alerts=HA&alerts=LCE&sort=lastName%2CfirstName%2Cdesc&term=smith&page=2&size=500&location=LEI-A',
            },
            alertOptions: expect.arrayContaining([
              expect.objectContaining({ checked: true, value: ['HA'] }),
              expect.objectContaining({ checked: false, value: ['HA1'] }),
              expect.objectContaining({ checked: true, value: ['LCE'] }),
            ]),
            printedValues: { alerts: ['ACCT open', 'Care experienced'], location: { text: 'A', value: 'LEI-A' } },
            results: [
              {
                prisonerNumber: 'A1234BC',
                currentFacialImageId: 1234,
                iepLevel: 'Current incentive',
                assignedLivingUnitDesc: 'Reception',
                name: 'Last, First',
                alerts: [expect.objectContaining({ alertCodes: ['PEEP'] })],
                age: calculateAge('1990-01-01').years,
                category: 'A',
              },
            ],
            formValues: {
              alerts: ['HA', 'LCE'],
              location: 'LEI-A',
              sort: 'lastName,firstName,desc',
              term: 'smith',
            },
            view: 'grid',
          }),
        )
      })

      it('Handles non-sort legacy params correctly', async () => {
        const req = {
          originalUrl: 'originalUrl',
          query: {
            keywords: 'smith',
            viewAll: 'true',
            pageLimitOption: 500,
            'alerts[]': ['A', 'B'],
          },
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          alerts: ['A', 'B'],
          showAll: true,
          term: 'smith',
          page: 1,
          size: 500,
          sort: 'lastName,firstName,asc',
        })
      })

      it.each([
        ['assignedLivingUnitDesc:asc', 'cellLocation,asc'],
        ['lastName,firstName:asc', 'lastName,firstName,asc'],
      ])('Handles sort legacy params correctly: %s -> %s', async (legacyParam, mappedParam) => {
        const req = {
          originalUrl: 'originalUrl',
          query: { sortFieldsWithOrder: legacyParam },
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          sort: mappedParam,
        })
      })

      it.each([
        ['legacy alerts', { 'alerts[]': 'A' }],
        ['new alerts', { alerts: 'A' }],
      ])('Handles single alert params: %s', async (_, params) => {
        const req = {
          originalUrl: 'originalUrl',
          query: params,
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          sort: 'lastName,firstName,asc',
          alerts: ['A'],
        })
      })

      it('Returns empty results when the location prison ID is not in the users caseloads', async () => {
        const req = {
          originalUrl: 'originalUrl',
          query: {
            location: 'MDI-A',
          },
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerSearch/index',
          expect.objectContaining({
            results: [],
          }),
        )
      })

      it('Tracks the prisoner search query', async () => {
        const req = {
          id: 123454321,
          originalUrl: 'originalUrl',
          query: {
            view: 'grid',
            showAll: 'true',
            sort: 'lastName,firstName,desc',
            term: 'smith',
            page: 2,
            size: 500,
            location: 'LEI-A',
            alerts: ['HA', 'LCE'],
          },
          middleware: { clientToken: 'clientToken' },
          session: {},
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(metricsService.trackPrisonerSearchQuery).toHaveBeenCalledWith({
          offenderNos: ['A1234BC'],
          searchTerms: {
            alerts: ['HA', 'LCE'],
            location: 'LEI-A',
            page: 2,
            showAll: true,
            size: 500,
            sort: 'lastName,firstName,desc',
            term: 'smith',
            view: 'grid',
          },
          user,
        })

        expect(auditService.auditPrisonerSearch).toHaveBeenCalledWith({
          requestId: 123454321,
          searchDetails: {
            query: {
              alerts: ['HA', 'LCE'],
              location: 'LEI-A',
              page: 2,
              showAll: true,
              size: 500,
              sort: 'lastName,firstName,desc',
              term: 'smith',
              view: 'grid',
            },
            results: {
              prisonerInformationDisplayed: ['number', 'image', 'profileLink', 'assignedLivingUnit'],
              prisonerNumbers: ['A1234BC'],
            },
          },
          username: 'USER_NAME',
        })
      })
    })

    describe('post', () => {
      it('Redirects to the GET endpoint with the sort put into the query', () => {
        const req = {
          baseUrl: 'http://localhost:3000',
          query: { term: 'smith' },
          body: { sort: 'firstName,asc' },
          session: {},
        } as unknown as Request

        const res = {
          redirect: jest.fn(),
        } as unknown as Response

        controller.localSearch().post()(req, res, jest.fn())

        expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000?term=smith&sort=firstName%2Casc')
      })

      it('Redirects to the GET endpoint with the legacy sort param deleted', () => {
        const req = {
          baseUrl: 'http://localhost:3000',
          query: { term: 'smith', sortFieldsWithOrder: 'delete me' },
          body: { sort: 'firstName,asc' },
          session: {},
        } as unknown as Request

        const res = {
          redirect: jest.fn(),
        } as unknown as Response

        controller.localSearch().post()(req, res, jest.fn())

        expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000?term=smith&sort=firstName%2Casc')
      })
    })
  })

  describe('Global search', () => {
    describe('get', () => {
      it('Loads the page', () => {
        const req = {
          query: {},
          session: {},
        } as unknown as Request

        const res = {
          render: jest.fn(),
        } as unknown as Response

        controller.globalSearch().get()(req, res, jest.fn())
        expect(res.render).toHaveBeenCalledWith('pages/globalSearch/index', { formValues: { searchText: '' } })
      })

      it('Loads the page with search term and referrer', () => {
        const req = {
          query: { searchText: 'smith', referrer: 'licences' },
          session: {},
        } as unknown as Request

        const res = {
          render: jest.fn(),
        } as unknown as Response

        controller.globalSearch().get()(req, res, jest.fn())
        expect(res.render).toHaveBeenCalledWith('pages/globalSearch/index', {
          backLink: expect.anything(),
          formValues: { searchText: 'smith' },
          referrer: 'licences',
        })
      })
    })

    describe('results', () => {
      describe('get', () => {
        const generatedMetadata: ListMetadata<PrisonerSearchQueryParams> = {
          pagination: {
            itemDescription: 'description',
          } as Pagination,
          filtering: {},
        }
        beforeEach(() => {
          jest.mocked(generateListMetadata).mockReturnValueOnce(generatedMetadata)

          globalSearchService.getResultsForUser.mockResolvedValue({
            content: [
              {
                prisonId: 'LEI',
                bookingId: 1234,
                status: 'ACTIVE_IN',
                prisonerNumber: 'A1234BC',
                currentFacialImageId: 1234,
                currentIncentive: { level: { description: 'Current incentive' } },
                cellLocation: 'RECP',
                locationDescription: 'Leeds (HMP & YOI)',
                firstName: 'First',
                lastName: 'LAST',
                alerts: [{ alertCode: 'DONT_SHOW' }, { alertCode: 'PEEP' }],
                dateOfBirth: '1990-01-01',
              } as Prisoner,
            ],
            metadata: {
              first: true,
              last: true,
              offset: 0,
              pageNumber: 0,
              size: 1,
              numberOfElements: 1,
              totalElements: 1,
              totalPages: 1,
            },
          })
        })

        it('Renders the page when no params are given', async () => {
          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: {},
            session: {},
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(globalSearchService.getResultsForUser).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalledWith('pages/globalSearch/results', {
            encodedOriginalUrl: encodeURIComponent('http://example.com'),
            errors: [],
            prisonerProfileBaseUrl: expect.anything(),
            formValues: {
              filters: {},
              searchText: '',
            },
            isLicencesUser: true,
            results: [],
            openFilters: false,
          })
        })

        it('Renders the page when the date is invalid', async () => {
          const dateErrors: HmppsError[] = [{ href: '#dobDay', text: 'Dob day is incorrect' }]
          jest.mocked(globalSearchDateValidator).mockReturnValue(dateErrors)

          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: { searchText: 'smith', dobDay: '50', dobMonth: '12', dobYear: '1990' },
            session: {},
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(globalSearchService.getResultsForUser).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalledWith('pages/globalSearch/results', {
            encodedOriginalUrl: encodeURIComponent('http://example.com'),
            errors: dateErrors,
            prisonerProfileBaseUrl: expect.anything(),
            formValues: {
              filters: {
                dobDay: '50',
                dobMonth: '12',
                dobYear: '1990',
              },
              searchText: 'smith',
            },
            isLicencesUser: true,
            results: [],
            openFilters: true,
          })
        })

        it('Renders the page with a search term', async () => {
          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: { searchText: 'smith' },
            session: {},
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(globalSearchService.getResultsForUser).toHaveBeenCalledWith('clientToken', {
            page: 1,
            searchTerm: 'smith',
          })
          expect(res.render).toHaveBeenCalledWith('pages/globalSearch/results', {
            encodedOriginalUrl: encodeURIComponent('http://example.com'),
            errors: [],
            prisonerProfileBaseUrl: expect.anything(),
            formValues: {
              filters: {},
              searchText: 'smith',
            },
            isLicencesUser: true,
            results: [
              {
                currentFacialImageId: 1234,
                dateOfBirth: '01/01/1990',
                name: 'Last, First',
                prisonerNumber: 'A1234BC',
                prisonerProfileUrl: 'http://localhost:3002/prisoner/A1234BC',
                showUpdateLicenceLink: true,
                workingName: 'Last, First',
                latestLocation: 'Leeds (HMP & YOI)',
                showProfileLink: true,
                showProfileImage: true,
                updateLicenceLink: expect.stringContaining('hdc/taskList/1234'),
              },
            ],
            openFilters: false,
            listMetadata: { pagination: { itemDescription: 'description' }, filtering: {} },
          })
        })

        it('Renders the page with a search term and filters', async () => {
          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: {
              referrer: 'licences',
              searchText: 'smith',
              dobDay: '2',
              dobMonth: '9',
              dobYear: '1990',
              genderFilter: 'ALL',
              locationFilter: 'INSIDE',
            },
            session: {},
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(req.session.prisonerNumberImagesPermitted).toEqual(['A1234BC'])

          expect(globalSearchService.getResultsForUser).toHaveBeenCalledWith('clientToken', {
            page: 1,
            searchTerm: 'smith',
            dateOfBirth: '1990-09-02',
            gender: 'ALL',
            location: 'INSIDE',
          })

          expect(res.render).toHaveBeenCalledWith('pages/globalSearch/results', {
            backLink: expect.anything(),
            referrer: 'licences',
            encodedOriginalUrl: encodeURIComponent('http://example.com'),
            errors: [],
            prisonerProfileBaseUrl: expect.anything(),
            formValues: {
              filters: {
                dobDay: '2',
                dobMonth: '9',
                dobYear: '1990',
                genderFilter: 'ALL',
                locationFilter: 'INSIDE',
              },
              searchText: 'smith',
            },
            isLicencesUser: true,
            results: [
              {
                currentFacialImageId: 1234,
                dateOfBirth: '01/01/1990',
                name: 'Last, First',
                prisonerNumber: 'A1234BC',
                prisonerProfileUrl: 'http://localhost:3002/prisoner/A1234BC',
                showProfileLink: true,
                showProfileImage: true,
                showUpdateLicenceLink: true,
                workingName: 'Last, First',
                latestLocation: 'Leeds (HMP & YOI)',
                updateLicenceLink: expect.stringContaining('hdc/taskList/1234'),
              },
            ],
            openFilters: true,
            listMetadata: { pagination: { itemDescription: 'description' }, filtering: {} },
          })
        })

        describe('high-profile prisoners', () => {
          let req: Request
          let res: Response

          const prisonerInCaseloads1 = {
            prisonId: 'LEI',
            bookingId: 1234,
            status: 'ACTIVE_IN',
            prisonerNumber: 'A1234BC',
            currentFacialImageId: 1234,
            currentIncentive: { level: { description: 'Current incentive' } },
            cellLocation: 'RECP',
            locationDescription: 'Leeds (HMP & YOI)',
            firstName: 'First',
            lastName: 'LAST',
            alerts: [{ alertCode: 'DONT_SHOW' }, { alertCode: 'PEEP' }],
            dateOfBirth: '1990-01-01',
          } as Prisoner
          const prisonerInCaseloads2 = {
            prisonId: 'LEI',
            bookingId: 1235,
            status: 'ACTIVE_IN',
            prisonerNumber: 'G6123VU',
            currentFacialImageId: 746523,
            currentIncentive: { level: { description: 'Current incentive' } },
            cellLocation: 'A-1-014',
            locationDescription: 'Leeds (HMP & YOI)',
            firstName: 'First',
            lastName: 'LAST',
            alerts: [],
            dateOfBirth: '2002-01-01',
          } as Prisoner
          const prisonerOutsideCaseloads1 = {
            prisonId: 'BXI',
            bookingId: 1236,
            status: 'ACTIVE_IN',
            prisonerNumber: 'B2222BB',
            currentFacialImageId: 433,
            currentIncentive: { level: { description: 'Current incentive' } },
            cellLocation: 'C-2-102',
            locationDescription: 'Brixton (HMP)',
            firstName: 'First',
            lastName: 'LAST',
            alerts: [],
            dateOfBirth: '1973-01-01',
          } as Prisoner

          beforeEach(() => {
            req = {
              originalUrl: 'http://example.com',
              middleware: { clientToken: 'clientToken' },
              query: {
                searchText: 'LAST',
                locationFilter: 'INSIDE',
              },
              session: {},
            } as unknown as Request

            res = {
              render: jest.fn(),
              locals: { user },
            } as unknown as Response
          })

          it('should not check permissions api by default', async () => {
            globalSearchService.getResultsForUser.mockResolvedValue({
              content: [prisonerInCaseloads1, prisonerInCaseloads2, prisonerOutsideCaseloads1],
              metadata: {
                first: true,
                last: true,
                offset: 0,
                pageNumber: 0,
                size: 3,
                numberOfElements: 3,
                totalElements: 3,
                totalPages: 1,
              },
            })

            await controller.globalSearch().results.get()(req, res, jest.fn())

            expect(res.render).toHaveBeenCalledWith(
              'pages/globalSearch/results',
              expect.objectContaining({
                results: [
                  expect.objectContaining({
                    prisonerNumber: 'A1234BC',
                    latestLocation: 'Leeds (HMP & YOI)',
                  }),
                  expect.objectContaining({
                    prisonerNumber: 'G6123VU',
                    latestLocation: 'Leeds (HMP & YOI)',
                  }),
                  expect.objectContaining({
                    prisonerNumber: 'B2222BB',
                    latestLocation: 'Brixton (HMP)',
                  }),
                ],
              }),
            )
            expect(permissionsApiClient.checkHighProfilePrisonerStatuses).not.toHaveBeenCalled()
          })

          it('should not hide location of high-profile prisoners in caseloads when enabled', async () => {
            config.features.highProfilePrisonersEnabled = true
            permissionsApiClient.checkHighProfilePrisonerStatuses.mockResolvedValue(new Set(['G6123VU']))

            globalSearchService.getResultsForUser.mockResolvedValue({
              content: [prisonerInCaseloads1, prisonerInCaseloads2],
              metadata: {
                first: true,
                last: true,
                offset: 0,
                pageNumber: 0,
                size: 3,
                numberOfElements: 3,
                totalElements: 3,
                totalPages: 1,
              },
            })

            await controller.globalSearch().results.get()(req, res, jest.fn())

            expect(res.render).toHaveBeenCalledWith(
              'pages/globalSearch/results',
              expect.objectContaining({
                results: [
                  expect.objectContaining({
                    prisonerNumber: 'A1234BC',
                    latestLocation: 'Leeds (HMP & YOI)',
                  }),
                  expect.objectContaining({
                    prisonerNumber: 'G6123VU',
                    latestLocation: 'Leeds (HMP & YOI)',
                  }),
                ],
              }),
            )
            expect(permissionsApiClient.checkHighProfilePrisonerStatuses).toHaveBeenCalledWith(['A1234BC', 'G6123VU'])
          })

          it('should hide location of high-profile prisoners outside caseloads when enabled', async () => {
            config.features.highProfilePrisonersEnabled = true
            permissionsApiClient.checkHighProfilePrisonerStatuses.mockResolvedValue(new Set(['B2222BB']))

            globalSearchService.getResultsForUser.mockResolvedValue({
              content: [prisonerInCaseloads1, prisonerOutsideCaseloads1],
              metadata: {
                first: true,
                last: true,
                offset: 0,
                pageNumber: 0,
                size: 3,
                numberOfElements: 3,
                totalElements: 3,
                totalPages: 1,
              },
            })

            await controller.globalSearch().results.get()(req, res, jest.fn())

            expect(res.render).toHaveBeenCalledWith(
              'pages/globalSearch/results',
              expect.objectContaining({
                results: [
                  expect.objectContaining({
                    prisonerNumber: 'A1234BC',
                    latestLocation: 'Leeds (HMP & YOI)',
                  }),
                  expect.objectContaining({
                    prisonerNumber: 'B2222BB',
                    latestLocation: 'Restricted',
                  }),
                ],
              }),
            )
            expect(permissionsApiClient.checkHighProfilePrisonerStatuses).toHaveBeenCalledWith(['A1234BC', 'B2222BB'])
          })

          it('should throw an error if permissions api returns one', async () => {
            config.features.highProfilePrisonersEnabled = true
            permissionsApiClient.checkHighProfilePrisonerStatuses.mockRejectedValue(new InternalServerError())

            globalSearchService.getResultsForUser.mockResolvedValue({
              content: [prisonerInCaseloads1, prisonerInCaseloads2, prisonerOutsideCaseloads1],
              metadata: {
                first: true,
                last: true,
                offset: 0,
                pageNumber: 0,
                size: 3,
                numberOfElements: 3,
                totalElements: 3,
                totalPages: 1,
              },
            })

            await expect(controller.globalSearch().results.get()(req, res, jest.fn())).rejects.toThrow(
              'Internal Server Error',
            )

            expect(res.render).not.toHaveBeenCalled()
            expect(permissionsApiClient.checkHighProfilePrisonerStatuses).toHaveBeenCalledWith([
              'A1234BC',
              'G6123VU',
              'B2222BB',
            ])
          })
        })

        it('Tracks the global search query', async () => {
          const req = {
            id: 1234,
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: {
              referrer: 'licences',
              searchText: 'smith',
              dobDay: '12',
              dobMonth: '12',
              dobYear: '1990',
              genderFilter: 'ALL',
              locationFilter: 'INSIDE',
            },
            session: {},
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(metricsService.trackGlobalSearchQuery).toHaveBeenCalledWith({
            offenderNos: ['A1234BC'],
            openFilterValues: {
              dobDay: '12',
              dobMonth: '12',
              dobYear: '1990',
              genderFilter: 'ALL',
              locationFilter: 'INSIDE',
            },
            searchText: 'smith',
            user,
          })

          expect(auditService.auditGlobalSearch).toHaveBeenCalledWith({
            username: user.username,
            requestId: 1234,
            searchDetails: {
              query: {
                dateOfBirth: {
                  day: '12',
                  month: '12',
                  year: '1990',
                },
                gender: 'ALL',
                location: 'INSIDE',
                page: 1,
                referrer: 'licences',
                searchText: 'smith',
              },
              results: {
                licenceLinkedPrisonerNumbers: ['A1234BC'],
                prisonerInformationDisplayed: ['name', 'workingName', 'prisonerNumber', 'dateOfBirth', 'location'],
                profilePictureDisplayedPrisonerNumbers: ['A1234BC'],
                prisonerNumbers: ['A1234BC'],
                profileLinkedPrisonerNumbers: ['A1234BC'],
              },
            },
          })
        })
      })
    })
  })
})
