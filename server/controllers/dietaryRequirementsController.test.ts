import type { Request, Response } from 'express'
import AuditService from '../services/auditService'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import auditServiceMock from '../test/mocks/auditServiceMock'
import DietaryRequirementsController from './dietaryRequirementsController'
import {
  mockHealthAndMedicationFiltersResponse,
  mockHealthAndMedicationResponse,
} from '../test/mocks/healthAndMedicationApiClientMock'
import { Role } from '../enums/role'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'

describe('DietaryRequirementsController', () => {
  let controller: DietaryRequirementsController
  let dietReportingService: DietReportingService
  let pdfRenderingService: PdfRenderingService
  let auditService: AuditService

  beforeEach(() => {
    dietReportingService = {
      getDietaryRequirementsForPrison: jest.fn(async () => ({
        content: mockHealthAndMedicationResponse.content.map(v => ({ ...v, arrivalDate: new Date() })),
        metadata: mockHealthAndMedicationResponse.metadata,
      })),
      getDietaryFiltersForPrison: jest.fn(async () => mockHealthAndMedicationFiltersResponse),
    } as unknown as DietReportingService

    pdfRenderingService = {
      renderDietReport: jest.fn(),
    } as unknown as PdfRenderingService
    auditService = auditServiceMock()

    controller = new DietaryRequirementsController(dietReportingService, pdfRenderingService, auditService)
  })

  describe('get', () => {
    it('Audits that the report was viewed', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {},
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        render: jest.fn(),
      } as unknown as Response
      const handler = controller.get()
      await handler(req, res, jest.fn())

      expect(auditService.auditDietReportView).toHaveBeenCalledWith({
        prisonId: 'LEI',
        requestId: 'abc-123',
        username: 'USER_NAME',
      })
    })

    it('Reads filter options from query parameters', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {
          personalDiet: 'KOSHER',
          foodAllergies: ['PEANUTS', 'MUSTARD'],
          location: 'DESC',
        },
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        render: jest.fn(),
      } as unknown as Response

      const expectedQuery: DietaryRequirementsQueryParams = {
        size: 25,
        personalDiet: ['KOSHER'],
        foodAllergies: ['PEANUTS', 'MUSTARD'],
        location: 'DESC',
      }

      const handler = controller.get()
      await handler(req, res, jest.fn())

      expect(dietReportingService.getDietaryRequirementsForPrison).toHaveBeenCalledWith(
        'clientToken',
        'LEI',
        expectedQuery,
      )

      expect(res.render).toHaveBeenCalledWith(
        'pages/dietaryRequirements/index',
        expect.objectContaining({
          filters: {
            foodAllergies: [
              { checked: true, count: 4, name: 'Mustard', value: 'MUSTARD' },
              { checked: true, count: 3, name: 'Peanuts', value: 'PEANUTS' },
            ],
            medicalDietaryRequirements: [{ count: 1, name: 'Coeliac (cannot eat gluten)', value: 'COELIAC' }],
            personalisedDietaryRequirements: [{ checked: true, count: 7, name: 'Kosher', value: 'KOSHER' }],
            topLocationLevel: [
              { checked: undefined, count: 1, name: 'B', value: 'B' },
              { checked: undefined, count: 1, name: 'C', value: 'C' },
              { checked: undefined, count: 1, name: 'F', value: 'F' },
            ],
            recentArrival: [
              { checked: undefined, count: 2, name: 'Arrived in the last 3 days', value: 'ARRIVED_LAST_3_DAYS' },
            ],
          },
          printQuery: 'personalDiet=KOSHER&foodAllergies=PEANUTS&foodAllergies=MUSTARD&location=DESC',
          clearAllQuery: 'location=DESC',
        }),
      )
    })
  })

  describe('post', () => {
    it('Redirects to the diet report', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {},
        body: {
          key: 'value',
        },
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        redirect: jest.fn(),
      } as unknown as Response

      const handler = controller.post()
      await handler(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/dietary-requirements?')
    })

    it('Correctly maintains showAll and sorting query parameters and ignores page and size', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {
          page: 2,
          size: 12,
          location: 'DESC',
          showAll: true,
        },
        body: {
          key: 'value',
        },
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        redirect: jest.fn(),
      } as unknown as Response

      const handler = controller.post()
      await handler(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/dietary-requirements?location=DESC&showAll=true')
    })

    it('Adds filter values to query parameters', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {
          page: 2,
          size: 12,
          location: 'DESC',
          showAll: true,
        },
        body: {
          personalDiet: ['A'],
          medicalDiet: ['B'],
          foodAllergies: ['C', 'D'],
        },
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        redirect: jest.fn(),
      } as unknown as Response

      const handler = controller.post()
      await handler(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith(
        '/dietary-requirements?personalDiet=A&medicalDiet=B&foodAllergies=C&foodAllergies=D&location=DESC&showAll=true',
      )
    })
  })

  describe('printAll', () => {
    it('Audits that the print all page for the report was viewed', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {},
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        render: jest.fn(),
      } as unknown as Response
      const handler = controller.printAll()
      await handler(req, res, jest.fn())

      expect(auditService.auditDietReportPrint).toHaveBeenCalledWith({
        prisonId: 'LEI',
        requestId: 'abc-123',
        username: 'USER_NAME',
      })
    })

    it('Passes active filters to the PDF rendering request', async () => {
      const req = {
        middleware: { clientToken: 'clientToken' },
        id: 'abc-123',
        query: {
          personalDiet: ['KOSHER'],
          medicalDiet: ['COELIAC'],
          foodAllergies: ['PEANUTS', 'MUSTARD'],
        },
      } as unknown as Request

      const res = {
        locals: {
          user: {
            username: 'USER_NAME',
            activeCaseLoadId: 'LEI',
            userRoles: [Role.DietAndAllergiesReport],
          },
        },
        render: jest.fn(),
      } as unknown as Response
      const handler = controller.printAll()
      await handler(req, res, jest.fn())

      expect(pdfRenderingService.renderDietReport).toHaveBeenCalledWith(res, {
        footer: expect.anything(),
        content: expect.objectContaining({
          activeFilters: expect.arrayContaining(['Kosher', 'Coeliac (cannot eat gluten)', 'Peanuts', 'Mustard']),
        }),
      })
    })
  })
})
