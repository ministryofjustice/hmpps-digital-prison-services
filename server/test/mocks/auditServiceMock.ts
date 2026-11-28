import type AuditService from '../../services/auditService'

export default (): jest.Mocked<AuditService> =>
  ({
    auditDietReportView: jest.fn(),
    auditDietReportPrint: jest.fn(),
    auditPrisonerSearch: jest.fn(),
    auditGlobalSearch: jest.fn(),
  }) as unknown as jest.Mocked<AuditService>
