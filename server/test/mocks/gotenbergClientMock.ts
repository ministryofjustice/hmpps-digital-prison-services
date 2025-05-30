import { GotenbergApiClient } from '../../data/interfaces/gotenbergApiClient'

const gotenbergApiClientMock: GotenbergApiClient = {
  renderPdfFromHtml: jest.fn(),
}

export default gotenbergApiClientMock
