import nock, { Body } from 'nock'
import config from '../config'
import { GotenbergApiClient, PdfRenderRequest } from './interfaces/gotenbergApiClient'
import GotenbergRestApiClient from './gotenbergApiClient'

const gotenbergConfig = config.apis.gotenberg

const requestBodyMatches = (body: Body, expected: Record<string, { value: string; filename?: string }>) => {
  return Object.entries(expected).every(value => {
    if (value[1].filename) {
      return (
        body.includes(`Content-Disposition: form-data; name="${value[0]}"; filename="${value[1].filename}"`) &&
        body.includes(value[1].value)
      )
    }
    return body.includes(`Content-Disposition: form-data; name="${value[0]}"\r\n\r\n${value[1].value}`)
  })
}

describe('Gotenberg client', () => {
  let client: GotenbergApiClient
  let fakeGotenbergApi: nock.Scope

  beforeEach(() => {
    fakeGotenbergApi = nock(gotenbergConfig.url)
    client = new GotenbergRestApiClient(gotenbergConfig)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  it('Should send a PDF render request to Gotenberg', async () => {
    const request: PdfRenderRequest = {
      contentHtml: '<html lang="">content</html>',
      headerHtml: '<html lang="">header</html>',
      footerHtml: '<html lang="">footer</html>',
      css: 'css',
      options: {
        marginTop: '10px',
        marginBottom: '20px',
        marginLeft: '30px',
        marginRight: '40px',
        paperWidth: '123px',
        paperHeight: '456px',
      },
    }

    fakeGotenbergApi
      .post('/forms/chromium/convert/html', body =>
        requestBodyMatches(body, {
          marginTop: {
            value: request.options.marginTop,
          },
          marginBottom: {
            value: request.options.marginBottom,
          },
          marginLeft: {
            value: request.options.marginLeft,
          },
          marginRight: {
            value: request.options.marginRight,
          },
          paperWidth: {
            value: request.options.paperWidth,
          },
          paperHeight: {
            value: request.options.paperHeight,
          },
          content: {
            value: request.contentHtml,
            filename: 'index.html',
          },
          header: {
            value: request.headerHtml,
            filename: 'header.html',
          },
          footer: {
            value: request.footerHtml,
            filename: 'footer.html',
          },
          stylesheet: {
            value: request.css,
            filename: 'index.css',
          },
        }),
      )
      .reply(200, 'PDF content')

    const result = await client.renderPdfFromHtml(request)

    expect(result).toEqual(Buffer.from('PDF content'))
    expect(fakeGotenbergApi.isDone())
  })

  it('Should provide sensible default page sizes if not provided', async () => {
    const request: PdfRenderRequest = {
      contentHtml: '<html lang="">content</html>',
      headerHtml: '<html lang="">header</html>',
      footerHtml: '<html lang="">footer</html>',
      css: 'css',
    }

    fakeGotenbergApi
      .post('/forms/chromium/convert/html', body =>
        requestBodyMatches(body, {
          marginTop: {
            value: '140px',
          },
          marginBottom: {
            value: '140px',
          },
          marginLeft: {
            value: '50px',
          },
          marginRight: {
            value: '50px',
          },
          paperWidth: {
            value: '8.27',
          },
          paperHeight: {
            value: '11.7',
          },
          content: {
            value: request.contentHtml,
            filename: 'index.html',
          },
          header: {
            value: request.headerHtml,
            filename: 'header.html',
          },
          footer: {
            value: request.footerHtml,
            filename: 'footer.html',
          },
          stylesheet: {
            value: request.css,
            filename: 'index.css',
          },
        }),
      )
      .reply(200, 'PDF content')

    const result = await client.renderPdfFromHtml(request)

    expect(result).toEqual(Buffer.from('PDF content'))
    expect(fakeGotenbergApi.isDone())
  })
})
