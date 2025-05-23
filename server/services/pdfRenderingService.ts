import { Response } from 'express'
import path from 'path'
import fs from 'fs'
import { GotenbergApiClient } from '../data/interfaces/gotenbergApiClient'
import logger from '../../logger'

export interface PdfPageData {
  header?: Record<string, unknown>
  footer?: Record<string, unknown>
  content: Record<string, unknown>
}

export default class PdfRenderingService {
  constructor(private readonly pdfClient: GotenbergApiClient) {}

  public async renderDietReport(res: Response, pageData: PdfPageData) {
    return this.renderPdf(
      res,
      'pages/printDietaryRequirements/header',
      'pages/printDietaryRequirements/footer',
      'pages/printDietaryRequirements/content',
      'diet-and-allergy-report.pdf',
      pageData,
    )
  }

  private async renderPdf(
    res: Response,
    headerFilePath: string,
    footerFilePath: string,
    contentFilePath: string,
    outputFileName: string,
    pageData: PdfPageData,
  ) {
    return res.render(headerFilePath, pageData.header ?? {}, (headerError: Error, headerHtml: string) => {
      if (headerError) {
        throw headerError
      }
      res.render(footerFilePath, pageData.footer ?? {}, (footerError: Error, footerHtml: string) => {
        if (footerError) {
          throw footerError
        }
        res.render(contentFilePath, pageData.content ?? {}, async (error: Error, contentHtml: string) => {
          if (error) {
            throw error
          }
          return this.pdfClient
            .renderPdfFromHtml({
              contentHtml,
              headerHtml,
              footerHtml,
              css: this.readAssetCss(),
            })
            .then(buffer =>
              res
                .contentType('application/pdf')
                .setHeader('Content-Disposition', `attachment; filename=${outputFileName}`)
                .setHeader('Content-Transfer-Encoding', 'binary')
                .send(buffer),
            )
            .catch(reason => {
              logger.warn(reason)
            })
        })
      })
    })
  }

  private readAssetCss() {
    try {
      const cssPath = './assets/stylesheets/application.css'
      return fs.readFileSync(path.resolve(cssPath), 'utf8')
    } catch (e) {
      logger.error(e, 'Could not read asset css file')
      return null
    }
  }
}
