import { Location } from '../data/interfaces/location'

export const locationMock: Location = {
  locationId: 12624,
  locationType: 'WING',
  description: 'A-wing',
  agencyId: 'LEI',
  currentOccupancy: 162,
  locationPrefix: 'LEI-A',
  operationalCapacity: 165,
  internalLocationCode: 'A',
}

export const locationsMock: Location[] = [
  {
    locationId: -1,
    locationType: 'INST',
    description: 'Leeds (HMP)',
    agencyId: 'LEI',
    locationPrefix: 'LEI',
  },
  {
    locationId: 12624,
    locationType: 'WING',
    description: 'A-wing',
    agencyId: 'LEI',
    currentOccupancy: 162,
    locationPrefix: 'LEI-A',
    operationalCapacity: 165,
    internalLocationCode: 'A',
  },
  {
    locationId: 12713,
    locationType: 'WING',
    description: 'B-wing',
    agencyId: 'LEI',
    currentOccupancy: 201,
    locationPrefix: 'LEI-B',
    operationalCapacity: 221,
    internalLocationCode: 'B',
  },
]
