import type { PermissionsApiClient } from '../../data/interfaces/permissionsApiClient'

// eslint-disable-next-line import/prefer-default-export
export const permissionsApiClientMock = (): jest.Mocked<PermissionsApiClient> => ({
  checkHighProfilePrisonerStatuses: jest.fn().mockResolvedValue(new Set()),
})
