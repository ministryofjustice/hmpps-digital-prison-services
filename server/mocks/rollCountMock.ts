import { BlockRollCount } from '../data/interfaces/blockRollCount'

export const assignedRollCountMock: BlockRollCount[] = [
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 1,
    fullLocationPath: 'CKI-A',
    locationCode: 'A',
    livingUnitDesc: 'A',
    bedsInUse: 76,
    currentlyOut: 5,
    operationalCapacity: 60,
    netVacancies: -16,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 33,
    outOfLivingUnits: 0,
    livingUnitId: 2,
    fullLocationPath: 'CKI-B',
    locationCode: 'B',
    livingUnitDesc: 'B',
    bedsInUse: 64,
    currentlyOut: 0,
    operationalCapacity: 63,
    netVacancies: -1,
    maximumCapacity: 127,
    availablePhysical: 63,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 45,
    outOfLivingUnits: 0,
    livingUnitId: 3,
    fullLocationPath: 'CKI-B',
    locationCode: 'C',
    livingUnitDesc: 'C',
    bedsInUse: 64,
    currentlyOut: 0,
    operationalCapacity: 63,
    netVacancies: -1,
    maximumCapacity: 127,
    availablePhysical: 63,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 7,
    outOfLivingUnits: 0,
    livingUnitId: 4,
    fullLocationPath: 'CKI-B',
    locationCode: 'D',
    livingUnitDesc: 'D',
    bedsInUse: 64,
    currentlyOut: 0,
    operationalCapacity: 63,
    netVacancies: -1,
    maximumCapacity: 127,
    availablePhysical: 63,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 15,
    outOfLivingUnits: 0,
    livingUnitId: 5,
    fullLocationPath: 'CKI-B',
    locationCode: 'E',
    livingUnitDesc: 'E',
    bedsInUse: 64,
    currentlyOut: 0,
    operationalCapacity: 63,
    netVacancies: -1,
    maximumCapacity: 127,
    availablePhysical: 63,
    outOfOrder: 0,
  },
]

export const unassignedRollCountMock: BlockRollCount[] = [
  {
    currentlyInCell: 7,
    outOfLivingUnits: 0,
    livingUnitId: 10,
    fullLocationPath: 'CKI-COURT',
    locationCode: 'COURT',
    livingUnitDesc: 'COURT',
    bedsInUse: 4,
    currentlyOut: 4,
    maximumCapacity: 50,
    availablePhysical: 46,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 4,
    outOfLivingUnits: 0,
    livingUnitId: 11,
    fullLocationPath: 'CKI-COURT',
    locationCode: 'COURT',
    livingUnitDesc: 'COURT',
    bedsInUse: 4,
    currentlyOut: 4,
    maximumCapacity: 50,
    availablePhysical: 46,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 12,
    outOfLivingUnits: 0,
    livingUnitId: 12,
    fullLocationPath: 'CKI-COURT',
    locationCode: 'COURT',
    livingUnitDesc: 'COURT',
    bedsInUse: 4,
    currentlyOut: 4,
    maximumCapacity: 50,
    availablePhysical: 46,
    outOfOrder: 0,
  },
]

export const assignedRollCountWithSpursMock: BlockRollCount[] = [
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 1,
    fullLocationPath: 'CKI-A',
    locationCode: 'A',
    livingUnitDesc: 'A',
    bedsInUse: 76,
    currentlyOut: 5,
    operationalCapacity: 60,
    netVacancies: -16,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 2,
    parentLocationId: 1,
    fullLocationPath: 'CKI-A-1',
    locationCode: 'A1',
    livingUnitDesc: 'Spur A1',
    bedsInUse: 76,
    currentlyOut: 5,
    operationalCapacity: 60,
    netVacancies: -16,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 3,
    parentLocationId: 2,
    fullLocationPath: 'CKI-A-1-x',
    locationCode: 'A1X',
    livingUnitDesc: 'Landing A1X',
    bedsInUse: 76,
    currentlyOut: 5,
    operationalCapacity: 60,
    netVacancies: -16,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 4,
    fullLocationPath: 'CKI-B',
    locationCode: 'B',
    livingUnitDesc: 'B',
    bedsInUse: 76,
    currentlyOut: 5,
    operationalCapacity: 60,
    netVacancies: -16,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
  {
    currentlyInCell: 900,
    outOfLivingUnits: 0,
    livingUnitId: 5,
    parentLocationId: 4,
    fullLocationPath: 'CKI-Y',
    locationCode: 'BY',
    livingUnitDesc: 'LANDING BY',
    bedsInUse: 76,
    currentlyOut: 5,
    maximumCapacity: 97,
    availablePhysical: 21,
    outOfOrder: 0,
  },
]
