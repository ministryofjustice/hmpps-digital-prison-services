import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { ApiConfig } from '@ministryofjustice/hmpps-rest-client'
import { GotenbergApiClient, PdfRenderRequest } from './interfaces/gotenbergApiClient'

const defaultPage = {
  paperWidth: '8.27',
  paperHeight: '11.7',
  marginTop: '140px',
  marginBottom: '140px',
  marginLeft: '50px',
  marginRight: '50px',
}

// If the CSS contains any usage of @page, Gotenberg will use that over the margin sizes sent in the request
// Setting preferCssPageSize doesn't have any effect
// This seems to be a known bug: https://github.com/gotenberg/gotenberg/issues/651
export default class GotenbergRestApiClient implements GotenbergApiClient {
  agent: Agent

  constructor(private config: ApiConfig) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  async renderPdfFromHtml(renderRequest: PdfRenderRequest): Promise<Buffer> {
    const { marginBottom, marginLeft, marginRight, marginTop, paperWidth, paperHeight } = renderRequest.options ?? {}

    const request = superagent
      .post(`${this.config.url}/forms/chromium/convert/html`)
      .agent(this.agent)
      .set('Content-Type', 'multipart/form-data')
      .field('paperWidth', paperWidth ?? defaultPage.paperWidth)
      .field('paperHeight', paperHeight ?? defaultPage.paperHeight)
      .field('marginTop', marginTop ?? defaultPage.marginTop)
      .field('marginBottom', marginBottom ?? defaultPage.marginBottom)
      .field('marginLeft', marginLeft ?? defaultPage.marginLeft)
      .field('marginRight', marginRight ?? defaultPage.marginRight)
      // needed to avoid blank PDFs - see https://gotenberg.dev/docs/troubleshooting#blank-pdfs
      .field('skipNetworkIdleEvent', false)
      .buffer(true)
      .attach('content', Buffer.from(renderRequest.contentHtml), 'index.html')
      .attach('header', Buffer.from(renderRequest.headerHtml), 'header.html')
      .attach('footer', Buffer.from(renderRequest.footerHtml), 'footer.html')
      .attach('stylesheet', Buffer.from(renderRequest.css), 'index.css')
      .responseType('blob')
      .timeout(this.config.timeout)

    const response = await request
    return response.body
  }
}
