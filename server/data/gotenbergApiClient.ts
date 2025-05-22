import { GotenbergApiClient, PdfOptions } from './interfaces/gotenbergApiClient'
import RestClient from './restClient'

// If the CSS contains any usage of @page Gotenberg will use that over the margin sizes sent in the request
// Setting preferCssPageSize doesn't have any effect
// This seems to be a known bug: https://github.com/gotenberg/gotenberg/issues/651
export default class GotenbergRestApiClient implements GotenbergApiClient {
  constructor(private restClient: RestClient) {}

  async renderPdfFromHtml(html: string, options: PdfOptions = {}): Promise<Buffer> {
    const { headerHtml, footerHtml, css, marginBottom, marginLeft, marginRight, marginTop, paperWidth, paperHeight } =
      options

    const files = this.buildFileAttachments(html, headerHtml, footerHtml, css)
    return this.restClient.postMultipart({
      path: '/forms/chromium/convert/html',
      data: {
        paperWidth: paperWidth ?? '8.27',
        paperHeight: paperHeight ?? '11.7',
        marginTop: marginTop ?? '140px',
        marginBottom: marginBottom ?? '140px',
        marginLeft: marginLeft ?? '50px',
        marginRight: marginRight ?? '50px',
        // waitDelay: '5s',
      },
      files,
      responseType: 'blob',
    })
  }

  private buildFileAttachments(
    html: string,
    headerHtml: string,
    footerHtml: string,
    css: string,
  ): Record<string, { buffer: Buffer; originalName: string }> {
    const files: Record<string, { buffer: Buffer; originalName: string }> = {
      content: {
        buffer: Buffer.from(html),
        originalName: 'index.html',
      },
    }
    if (headerHtml) {
      files.header = {
        buffer: Buffer.from(headerHtml),
        originalName: 'header.html',
      }
    }
    if (footerHtml) {
      files.footer = {
        buffer: Buffer.from(footerHtml),
        originalName: 'footer.html',
      }
    }
    if (css) {
      files.css = {
        buffer: Buffer.from(css),
        originalName: 'index.css',
      }
    }

    return files
  }
}
