import { Request, RequestHandler, Response } from 'express'
import { PrisonApiClient } from '../../data/interfaces/prisonApiClient'
import { RestClientBuilder } from '../../data'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'

export default class CommonApiRoutes {
  public constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : false
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    prisonApiClient
      .getPrisonerImage(prisonerNumber as string, fullSizeImage)
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
