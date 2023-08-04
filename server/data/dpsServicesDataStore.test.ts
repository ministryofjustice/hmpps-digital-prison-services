import { Role } from '../enums/role'
import { dpsServicesDataStoreMockA } from '../mocks/dpsServicesDataStoreMock'
import { getTasks } from './dpsServicesDataStore'

describe('DPS Services Data Store', () => {
  it('Should return all the dps services data', () => {
    expect(getTasks('LEI', [], '123', { enabled: false }, { migrated: false }, [Role.GlobalSearch])).toEqual(
      dpsServicesDataStoreMockA,
    )
  })
})
