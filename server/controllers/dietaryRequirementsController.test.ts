import type { Request, Response } from 'express'
import AuditService from '../services/auditService'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import auditServiceMock from '../test/mocks/auditServiceMock'
import DietaryRequirementsController from './dietaryRequirementsController'
import { mockHealthAndMedicationResponse } from '../test/mocks/healthAndMedicationApiClientMock'
import { Role } from '../enums/role'

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
  })
})
