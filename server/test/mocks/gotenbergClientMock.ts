import type { GotenbergApiClient } from '../../data/interfaces/gotenbergApiClient'

const gotenbergApiClientMock: jest.Mocked<GotenbergApiClient> = {
  renderPdfFromHtml: jest.fn(),
}

export default gotenbergApiClientMock
