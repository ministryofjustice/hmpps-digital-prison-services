import { Response } from 'express'
import PdfRenderingService, { PdfPageData } from './pdfRenderingService'
import gotenbergApiClientMock from '../test/mocks/gotenbergClientMock'

describe('pdfRenderingService', () => {
  let service: PdfRenderingService

  beforeEach(() => {
    jest.resetAllMocks()
    service = new PdfRenderingService(gotenbergApiClientMock)
  })

  it('renders the diet report', async () => {
    gotenbergApiClientMock.renderPdfFromHtml = async () => Buffer.from('test')
    const res = {
      render: jest.fn(),
    } as unknown as Response
    const pageData: PdfPageData = {
      content: {},
    }

    await service.renderDietReport(res, pageData)
    expect(res.render).toHaveBeenCalled()
  })
})
