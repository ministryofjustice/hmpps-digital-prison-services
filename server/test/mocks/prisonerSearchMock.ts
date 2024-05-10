import { Prisoner } from '../../data/interfaces/prisoner'

// eslint-disable-next-line import/prefer-default-export
export const prisonerSearchMock: Prisoner[] = [
  {
    prisonerNumber: 'A1234AA',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1980-01-01',
    gender: '',
    ethnicity: '',
    youthOffender: false,
    maritalStatus: '',
    religion: '',
    nationality: '',
    status: '',
    cellLocation: '1-1-1',
    mostSeriousOffence: '',
    restrictedPatient: false,
    alerts: [
      {
        alertType: 'Hidden disability',
        alertCode: 'HID',
        active: true,
        expired: false,
      },
    ],
    category: 'A',
  },
  {
    prisonerNumber: 'A1234AB',
    firstName: 'Eddie',
    lastName: 'Shannon',
    dateOfBirth: '1980-01-01',
    gender: '',
    ethnicity: '',
    youthOffender: false,
    maritalStatus: '',
    religion: '',
    nationality: '',
    status: '',
    cellLocation: '1-1-1',
    mostSeriousOffence: '',
    restrictedPatient: false,
    alerts: [],
  },
]
