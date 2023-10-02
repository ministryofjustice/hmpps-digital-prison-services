// eslint-disable-next-line no-shadow,import/prefer-default-export
export enum Role {
  UpdateAlert = 'ROLE_UPDATE_ALERT',
  InactiveBookings = 'ROLE_INACTIVE_BOOKINGS',
  DeleteSensitiveCaseNotes = 'ROLE_DELETE_SENSITIVE_CASE_NOTES',
  PathfinderUser = 'ROLE_PF_USER',
  PathfinderStdPrison = 'ROLE_PF_STD_PRISON',
  PathfinderStdProbation = 'ROLE_PF_STD_PROBATION',
  PathfinderApproval = 'ROLE_PF_APPROVAL',
  PathfinderHQ = 'ROLE_PF_HQ',
  PathfinderNationalReader = 'ROLE_PF_NATIONAL_READER',
  PathfinderLocalReader = 'ROLE_PF_LOCAL_READER',
  PathfinderPolice = 'ROLE_PF_POLICE',
  PathfinderPsychologist = 'ROLE_PF_PSYCHOLOGIST',
  SocCustody = 'ROLE_SOC_CUSTODY',
  SocCommunity = 'ROLE_SOC_COMMUNITY',
  CreateCategorisation = 'ROLE_CREATE_CATEGORISATION',
  CreateRecategorisation = 'ROLE_CREATE_RECATEGORISATION',
  ApproveCategorisation = 'ROLE_APPROVE_CATEGORISATION',
  CategorisationSecurity = 'ROLE_CATEGORISATION_SECURITY',
  GlobalSearch = 'ROLE_GLOBAL_SEARCH',
  PomUser = 'ROLE_POM',
  ViewProbationDocuments = 'ROLE_VIEW_PROBATION_DOCUMENTS',
  PrisonUser = 'ROLE_PRISON',
  ReceptionUser = 'ROLE_PRISON_RECEPTION',
  CellMove = 'ROLE_CELL_MOVE',
  KeyWorker = 'KW',
}
