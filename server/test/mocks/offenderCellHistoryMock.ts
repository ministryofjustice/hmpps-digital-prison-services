import { BedAssignment } from '../../data/interfaces/bedAssignment'

export const offenderCellHistoryMock: BedAssignment[] = [
  {
    bookingId: 1,
    livingUnitId: 1,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-01-01',
    assignmentEndDateTime: '2021-01-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-1-1-1',
    bedAssignmentHistorySequence: 1,
    movementMadeBy: 'CWADDLE',
    offenderNo: 'A1234AB',
  },
  {
    bookingId: 1,
    livingUnitId: 1,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-02-01',
    assignmentEndDateTime: '2021-02-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-1-1-2',
    bedAssignmentHistorySequence: 2,
    movementMadeBy: 'MWHITFIELD',
    offenderNo: 'A1234AB',
  },
  {
    bookingId: 1,
    livingUnitId: 1,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-03-01',
    assignmentEndDateTime: '2021-03-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-1-1-3',
    bedAssignmentHistorySequence: 3,
    movementMadeBy: 'ESHANNON',
    offenderNo: 'A1234AB',
  },
]

export const offenderCellHistory2Mock: BedAssignment[] = [
  {
    bookingId: 4,
    livingUnitId: 4,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-03-01',
    assignmentEndDateTime: '2021-03-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-2-1-1',
    bedAssignmentHistorySequence: 3,
    movementMadeBy: 'CWADDLE',
    offenderNo: 'A1234AB',
  },
  {
    bookingId: 5,
    livingUnitId: 5,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-01-01',
    assignmentEndDateTime: '2021-01-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-2-1-2',
    bedAssignmentHistorySequence: 1,
    movementMadeBy: 'MWHITFIELD',
    offenderNo: 'A1234AB',
  },
  {
    bookingId: 6,
    livingUnitId: 6,
    assignmentDate: '2021-01-01',
    assignmentReason: 'ADM',
    assignmentEndDate: '2021-02-01',
    assignmentEndDateTime: '2021-02-01T00:00:00',
    agencyId: 'MDI',
    description: 'MDI-2-1-3',
    bedAssignmentHistorySequence: 2,
    movementMadeBy: 'ESHANNON',
    offenderNo: 'A1234AB',
  },
]
