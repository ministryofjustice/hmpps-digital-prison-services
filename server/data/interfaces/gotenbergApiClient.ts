export interface PdfOptions {
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
  paperWidth?: string
  paperHeight?: string
}

export interface PdfRenderRequest {
  contentHtml: string
  headerHtml: string
  footerHtml: string
  css: string
  options?: PdfOptions
}

export interface GotenbergApiClient {
  renderPdfFromHtml(request: PdfRenderRequest): Promise<Buffer>
}
