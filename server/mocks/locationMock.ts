import PrisonHierarchyDto from '../data/interfaces/prisonHierarchyDto'

export const prisonHierarchyMock: PrisonHierarchyDto[] = [
  {
    locationId: '-1',
    locationType: 'INST',
    locationCode: 'LEI',
    fullLocationPath: 'LEI',
    localName: 'Leeds (HMP)',
    level: 0,
    status: 'ACTIVE',
    subLocations: [
      {
        locationId: '12624',
        locationType: 'WING',
        locationCode: 'A',
        fullLocationPath: 'A',
        localName: 'A-wing',
        level: 1,
        status: 'ACTIVE',
        subLocations: [],
      },
      {
        locationId: '12713',
        locationType: 'WING',
        locationCode: 'B',
        fullLocationPath: 'B',
        localName: 'B-wing',
        level: 1,
        status: 'ACTIVE',
        subLocations: [
          {
            locationId: '127134',
            locationType: 'WING',
            locationCode: '1',
            fullLocationPath: 'B-1',
            localName: 'B-wing section 1',
            level: 2,
            status: 'ACTIVE',
          }
        ],
      },
    ],
  },
]
