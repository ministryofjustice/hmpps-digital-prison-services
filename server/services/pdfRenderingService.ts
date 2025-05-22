import { Response } from 'express'
import path from 'path'
import fs from 'fs'
import { RestClientBuilder } from '../data'
import { GotenbergApiClient } from '../data/interfaces/gotenbergApiClient'
import logger from '../../logger'

export default class PdfRenderingService {
  constructor(private readonly gotenbergApiBuilder: RestClientBuilder<GotenbergApiClient>) {}

  private readAssetCss() {
    try {
      const cssPath = './assets/stylesheets/application.css'
      return fs.readFileSync(path.resolve(cssPath), 'utf8')
    } catch (e) {
      logger.error(e, 'Could not read asset css file')
      return null
    }
  }

  public async renderDietReport(token: string, res: Response, pageData: Record<string, unknown>) {
    const gotenbergApi = this.gotenbergApiBuilder(token)

    return res.render('pages/printDietaryRequirements/header', pageData, (headerErr: Error, headerHtml: string) => {
      res.render('pages/printDietaryRequirements/footer', pageData, (footerErr: Error, footerHtml: string) => {
        res.render('pages/printDietaryRequirements/content', pageData, async (err: Error, html: string) => {
          return gotenbergApi
            .renderPdfFromHtml(html, {
              headerHtml,
              footerHtml,
              css: this.readAssetCss(),
            })
            .then(buffer =>
              res
                .contentType('application/pdf')
                .setHeader('Content-Disposition', 'attachment; filename=diet-and-allergy-report.pdf')
                .send(buffer),
            )
            .catch(reason => {
              logger.warn(reason)
            })
        })
      })
    })
  }
}
