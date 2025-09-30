import { auditService } from '@ministryofjustice/hmpps-audit-client'

export default class AuditService {
  constructor(private readonly enabled: boolean) {}

  public async auditDietReportView({
    username,
    prisonId,
    requestId,
  }: {
    username: string
    prisonId: string
    requestId: string
  }) {
    if (this.enabled) {
      await auditService.sendAuditMessage({
        action: 'VIEW_DIET_REPORT',
        who: username,
        subjectId: prisonId,
        subjectType: 'CASELOAD_ID',
        correlationId: requestId,
        service: 'hmpps-digital-prison-services',
      })
    }
  }

  public async auditDietReportPrint({
    username,
    prisonId,
    requestId,
  }: {
    username: string
    prisonId: string
    requestId: string
  }) {
    if (this.enabled) {
      await auditService.sendAuditMessage({
        action: 'PRINT_DIET_REPORT',
        who: username,
        subjectId: prisonId,
        subjectType: 'CASELOAD_ID',
        correlationId: requestId,
        service: 'hmpps-digital-prison-services',
      })
    }
  }
}
