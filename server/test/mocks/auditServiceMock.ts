import AuditService from '../../services/auditService'

export default (): AuditService =>
  ({
    auditDietReportView: jest.fn(),
    auditDietReportPrint: jest.fn(),
  }) as unknown as AuditService
