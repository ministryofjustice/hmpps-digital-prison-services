import { Request, Response } from 'express'
import SearchController from './searchController'
import PrisonerSearchService from '../services/prisonerSearchService'
import GlobalSearchService from '../services/globalSearchService'
import Prisoner from '../data/interfaces/prisoner'
import { PagedList } from '../data/interfaces/pagedList'
import { PrisonUser } from '../interfaces/prisonUser'
import { calculateAge } from '../utils/utils'
import { generateListMetadata, ListMetadata, PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import globalSearchDateValidator from '../utils/globalSearchDateValidator'
import { HmppsError } from '../data/interfaces/hmppsError'
import MetricsService from '../services/metricsService'

jest.mock('../utils/generateListMetadata', () => ({
  generateListMetadata: jest.fn(),
}))

jest.mock('../utils/globalSearchDateValidator')

describe('SearchController', () => {
  let user: PrisonUser
  let controller: SearchController
  let prisonerSearchService: PrisonerSearchService
  let globalSearchService: GlobalSearchService
  let metricsService: MetricsService

  beforeEach(() => {
    ;(globalSearchDateValidator as jest.MockedFunction<typeof globalSearchDateValidator>).mockReturnValue(
      [] as HmppsError[],
    )
    prisonerSearchService = {} as PrisonerSearchService
    globalSearchService = { getResultsForUser: jest.fn() } as unknown as GlobalSearchService
    metricsService = {
      trackPrisonerSearchQuery: jest.fn(),
      trackGlobalSearchQuery: jest.fn(),
    } as unknown as MetricsService

    controller = new SearchController(prisonerSearchService, globalSearchService, metricsService)
    user = { userId: '123', userRoles: [], caseLoads: [{ caseLoadId: 'LEI' }] } as PrisonUser
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
        ;(generateListMetadata as jest.MockedFunction<typeof generateListMetadata>).mockReturnValueOnce(
          generatedMetadata,
        )

        prisonerSearchService.getResults = jest.fn(
          async (): Promise<PagedList<Prisoner>> => ({
            content: [
              {
                prisonerNumber: 'A1234BC',
                currentFacialImageId: 1234,
                currentIncentive: { level: { description: 'Current incentive' } },
                cellLocation: 'RECP',
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
          }),
        )
      })

      it('Loads the page correctly with no query params', async () => {
        const req = {
          originalUrl: 'originalUrl',
          query: {},
          middleware: { clientToken: 'clientToken' },
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          sort: 'lastName,firstName,asc',
          showAll: false,
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
            showAll: false,
            size: 50,
            sort: 'lastName,firstName,asc',
          },
          'result',
          [],
          '',
          true,
        )
        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerSearch/index',
          expect.objectContaining({
            prisonerProfileBaseUrl: expect.anything(),
            encodedOriginalUrl: 'originalUrl',
            listMetadata: generatedMetadata,
            links: {
              allResults: '/prisoner-search?showAll=true&sort=lastName%2CfirstName%2Casc&page=1&size=50',
              gridView: '/prisoner-search?showAll=false&view=grid&sort=lastName%2CfirstName%2Casc&page=1&size=50',
              listView: '/prisoner-search?showAll=false&view=list&sort=lastName%2CfirstName%2Casc&page=1&size=50',
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

        expect(res.render).toHaveBeenCalledWith(
          'pages/prisonerSearch/index',
          expect.objectContaining({
            prisonerProfileBaseUrl: expect.anything(),
            encodedOriginalUrl: 'originalUrl',
            listMetadata: generatedMetadata,
            links: {
              allResults:
                '/prisoner-search?showAll=true&view=grid&alerts=HA&alerts=LCE&sort=lastName%2CfirstName%2Cdesc&term=smith&page=2&size=500&location=LEI-A',
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
            results: [
              {
                prisonerNumber: 'A1234BC',
                currentFacialImageId: 1234,
                iepLevel: 'Current incentive',
                assignedLivingUnitDesc: 'Reception',
                name: 'Last, First',
                alerts: [expect.objectContaining({ alertCodes: ['PEEP'] })],
                age: calculateAge('1990-01-01').years,
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
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          showAll: false,
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
        } as unknown as Request

        await controller.localSearch().get()(req, res, jest.fn())

        expect(prisonerSearchService.getResults).toHaveBeenCalledWith('clientToken', user, {
          page: 1,
          size: 50,
          showAll: false,
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
          user: {
            caseLoads: [
              {
                caseLoadId: 'LEI',
              },
            ],
            userId: '123',
            userRoles: [],
          },
        })
      })
    })

    describe('post', () => {
      it('Redirects to the GET endpoint with the sort put into the query', () => {
        const req = {
          baseUrl: 'http://localhost:3000',
          query: { term: 'smith' },
          body: { sort: 'firstName,asc' },
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
        const generatedMetadata = {
          pagination: { itemDescription: 'description' },
        } as ListMetadata<PrisonerSearchQueryParams>
        beforeEach(() => {
          ;(generateListMetadata as jest.MockedFunction<typeof generateListMetadata>).mockReturnValueOnce(
            generatedMetadata,
          )

          globalSearchService.getResultsForUser = jest.fn(
            async (): Promise<PagedList<Prisoner>> => ({
              content: [
                {
                  prisonerNumber: 'A1234BC',
                  currentFacialImageId: 1234,
                  currentIncentive: { level: { description: 'Current incentive' } },
                  cellLocation: 'RECP',
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
            }),
          )
        })

        it('Renders the page when no params are given', async () => {
          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: {},
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
            isLicencesUser: false,
            results: [],
            openFilters: false,
          })
        })

        it('Renders the page when the date is invalid', async () => {
          const dateErrors = [{ href: '#dobDay', text: 'Dob day is incorrect' }]
          ;(globalSearchDateValidator as jest.MockedFunction<typeof globalSearchDateValidator>).mockReturnValue(
            dateErrors,
          )

          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: { searchText: 'smith', dobDay: '50', dobMonth: '12', dobYear: '1990' },
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
            isLicencesUser: false,
            results: [],
            openFilters: true,
          })
        })

        it('Renders the page with a search term', async () => {
          const req = {
            originalUrl: 'http://example.com',
            middleware: { clientToken: 'clientToken' },
            query: { searchText: 'smith' },
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
            isLicencesUser: false,
            results: [
              {
                currentFacialImageId: 1234,
                dateOfBirth: '01/01/1990',
                name: 'Last, First',
                prisonerNumber: 'A1234BC',
                prisonerProfileUrl: 'http://localhost:3002/prisoner/A1234BC',
                showProfileLink: false,
                showUpdateLicenceLink: false,
                workingName: 'Last, First',
              },
            ],
            openFilters: false,
            listMetadata: { pagination: { itemDescription: 'description' } },
          })
        })

        it('Renders the page with a search term and filters', async () => {
          const req = {
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
          } as unknown as Request

          const res = {
            render: jest.fn(),
            locals: { user },
          } as unknown as Response

          await controller.globalSearch().results.get()(req, res, jest.fn())

          expect(globalSearchService.getResultsForUser).toHaveBeenCalledWith('clientToken', {
            page: 1,
            searchTerm: 'smith',
            dateOfBirth: '1990-12-12',
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
                dobDay: '12',
                dobMonth: '12',
                dobYear: '1990',
                genderFilter: 'ALL',
                locationFilter: 'INSIDE',
              },
              searchText: 'smith',
            },
            isLicencesUser: false,
            results: [
              {
                currentFacialImageId: 1234,
                dateOfBirth: '01/01/1990',
                name: 'Last, First',
                prisonerNumber: 'A1234BC',
                prisonerProfileUrl: 'http://localhost:3002/prisoner/A1234BC',
                showProfileLink: false,
                showUpdateLicenceLink: false,
                workingName: 'Last, First',
              },
            ],
            openFilters: true,
            listMetadata: { pagination: { itemDescription: 'description' } },
          })
        })

        it('Tracks the global search query', async () => {
          const req = {
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
            user: {
              caseLoads: [
                {
                  caseLoadId: 'LEI',
                },
              ],
              userId: '123',
              userRoles: [],
            },
          })
        })
      })
    })
  })
})
