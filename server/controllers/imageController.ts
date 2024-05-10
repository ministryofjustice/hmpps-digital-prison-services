import { Request, RequestHandler, Response } from 'express'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'

export default class ImageController {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const prisonApiClient = this.prisonApiClientBuilder(req.middleware.clientToken)
    const { prisonerNumber } = req.params
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : true

    if (prisonerNumber === 'placeholder') {
      res.redirect(placeHolderImage)
    } else {
      prisonApiClient
        .getPrisonerImage(prisonerNumber, fullSizeImage)
        .then(data => {
          res.set('Cache-control', 'private, max-age=86400')
          res.removeHeader('pragma')
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(_error => {
          res.redirect(placeHolderImage)
        })
    }
  }
}
