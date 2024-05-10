import { OffenderIn } from '../../data/interfaces/offenderIn'

// eslint-disable-next-line import/prefer-default-export
export const movementsInMock: OffenderIn[] = [
  {
    offenderNo: 'A1234AA',
    bookingId: 1,
    dateOfBirth: '1980-01-01',
    firstName: 'John',
    lastName: 'Smith',
    fromAgencyId: 'LEI',
    fromAgencyDescription: 'Leeds',
    toAgencyId: 'MDI',
    toAgencyDescription: 'Moorland',
    fromCity: 'Sheffield',
    toCity: 'York',
    movementTime: '10:00:00',
    movementDateTime: '2024-05-10',
    location: 'LEI',
  },
  {
    offenderNo: 'A1234AB',
    bookingId: 2,
    dateOfBirth: '1980-01-01',
    firstName: 'Eddie',
    lastName: 'Shannon',
    fromAgencyId: 'CKI',
    fromAgencyDescription: 'Cookham Wood',
    toAgencyId: 'MDI',
    toAgencyDescription: 'Moorland',
    fromCity: 'York',
    toCity: 'Sheffield',
    movementTime: '10:30:00',
    movementDateTime: '2024-05-10',
    location: 'CKI',
  },
]
