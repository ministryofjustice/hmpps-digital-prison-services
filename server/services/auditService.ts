import { auditService } from '@ministryofjustice/hmpps-audit-client'

export interface PrisonerSearchDetails {
  query: {
    term?: string
    alerts?: string[]
    location?: string
    view?: string
    sort?: string
    page?: number
    size?: number
    showAll?: boolean
  }
  results: {
    prisonerNumbers: string[]
    prisonerInformationDisplayed: string[]
  }
}

export interface GlobalSearchDetails {
  query: {
    page: number
    searchText: string
    location: string
    gender: string
    referrer: string
    dateOfBirth: {
      day: string
      month: string
      year: string
    }
  }
  results: {
    prisonerNumbers: string[]
    profileLinkedPrisonerNumbers: string[]
    profilePictureDisplayedPrisonerNumbers: string[]
    licenceLinkedPrisonerNumbers: string[]
    prisonerInformationDisplayed: string[]
  }
}

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

  public async auditPrisonerSearch({
    username,
    requestId,
    searchDetails,
  }: {
    username: string
    requestId: string
    searchDetails: PrisonerSearchDetails
  }) {
    if (this.enabled) {
      await auditService.sendAuditMessage({
        action: 'PRISONER_SEARCH',
        who: username,
        correlationId: requestId,
        details: JSON.stringify(searchDetails),
        service: 'hmpps-digital-prison-services',
      })
    }
  }

  public async auditGlobalSearch({
    username,
    requestId,
    searchDetails,
  }: {
    username: string
    requestId: string
    searchDetails: GlobalSearchDetails
  }) {
    if (this.enabled) {
      await auditService.sendAuditMessage({
        action: 'GLOBAL_SEARCH',
        who: username,
        correlationId: requestId,
        details: JSON.stringify(searchDetails),
        service: 'hmpps-digital-prison-services',
      })
    }
  }
}
