import { Role } from '../enums/role'
import { dpsServicesDataStoreMockA } from '../mocks/dpsServicesDataStoreMock'
import { getTasks } from './dpsServicesDataStore'

describe.skip('DPS Services Data Store', () => {
  it('Should return all the dps services data', () => {
    expect(getTasks('LEI', [], '123', { enabled: true }, { migrated: true }, [Role.GlobalSearch])).toEqual(
      dpsServicesDataStoreMockA,
    )
  })
})
