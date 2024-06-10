import PrisonRollCount from '../data/interfaces/prisonRollCount'

export const prisonRollCountMock: PrisonRollCount = {
  prisonId: 'MDI',
  numUnlockRollToday: 100,
  numCurrentPopulation: 200,
  numArrivedToday: 300,
  numInReception: 400,
  numStillToArrive: 500,
  numOutToday: 600,
  numNoCellAllocated: 700,
  totals: {
    bedsInUse: 10,
    currentlyInCell: 20,
    currentlyOut: 30,
    workingCapacity: 40,
    netVacancies: 50,
    outOfOrder: 60,
  },
  locations: [
    {
      locationId: '10000',
      locationType: 'WING',
      locationCode: 'B',
      fullLocationPath: 'B',
      certified: true,
      localName: 'B Wing',
      rollCount: {
        bedsInUse: 194,
        currentlyInCell: 192,
        currentlyOut: 1,
        workingCapacity: 470,
        netVacancies: 276,
        outOfOrder: 0,
      },
      subLocations: [
        {
          locationId: '12714',
          locationType: 'LAND',
          locationCode: '1',
          fullLocationPath: 'B-1',
          certified: true,
          localName: '1',
          rollCount: {
            bedsInUse: 27,
            currentlyInCell: 27,
            currentlyOut: 0,
            workingCapacity: 28,
            netVacancies: 1,
            outOfOrder: 0,
          },
          subLocations: [],
        },
        {
          locationId: '12729',
          locationType: 'LAND',
          locationCode: '2',
          fullLocationPath: 'B-2',
          certified: true,
          localName: '2',
          rollCount: {
            bedsInUse: 39,
            currentlyInCell: 38,
            currentlyOut: 1,
            workingCapacity: 46,
            netVacancies: 7,
            outOfOrder: 0,
          },
          subLocations: [],
        },
      ],
    },
    {
      locationId: '20000',
      locationType: 'WING',
      locationCode: 'C',
      fullLocationPath: 'C',
      certified: true,
      localName: 'C Wing',
      rollCount: {
        bedsInUse: 194,
        currentlyInCell: 192,
        currentlyOut: 1,
        workingCapacity: 470,
        netVacancies: 276,
        outOfOrder: 0,
      },
      subLocations: [
        {
          locationId: '100',
          locationType: 'SPUR',
          locationCode: '1',
          fullLocationPath: 'C-1',
          certified: true,
          localName: 'C-1',
          rollCount: {
            bedsInUse: 27,
            currentlyInCell: 27,
            currentlyOut: 0,
            workingCapacity: 28,
            netVacancies: 1,
            outOfOrder: 0,
          },
          subLocations: [
            {
              locationId: '12729',
              locationType: 'LAND',
              locationCode: 'C-1-1',
              fullLocationPath: 'C-1-1',
              certified: true,
              localName: 'C-1-1',
              rollCount: {
                bedsInUse: 39,
                currentlyInCell: 38,
                currentlyOut: 1,
                workingCapacity: 46,
                netVacancies: 7,
                outOfOrder: 0,
              },
              subLocations: [],
            },
          ],
        },
      ],
    },
  ],
}