export type PdfOptions = {
  headerHtml?: string
  footerHtml?: string
  css?: string
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  paperWidth?: string
  paperHeight?: string
}

export interface GotenbergApiClient {
  renderPdfFromHtml(html: string, options: PdfOptions): Promise<Buffer>
}
