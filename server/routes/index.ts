import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import managedPageRouter from './managedPageRouter'
import dietaryRequirementsRouter from './dietaryRequirementsRouter'
import config, { AgentConfig } from '../config'
import RestClient from '../data/restClient'
import restClientBuilder from '../data'

class ComponentClient {
  constructor(private restClient: RestClient) {}

  private get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private async post<T>(args: object): Promise<T> {
    return this.restClient.post<T>(args)
  }

  async addNotification(data: any, userToken: string) {
    await this.restClient.post({
      path: '/notifications/add-notification',
      data,
      headers: {
        'x-user-token': userToken,
      },
    })
  }
  async seeNotification(data: any, userToken: string) {
    await this.restClient.post({
      path: '/notifications/see-notification',
      data,
      headers: {
        'x-user-token': userToken,
      },
    })
  }
}

const componentClientBuilder = restClientBuilder(
  'Component',
  {
    url: 'http://localhost:3001',
    timeout: {
      response: 20000,
      deadline: 20000,
    },
    agent: { timeout: 2000 },
  },
  ComponentClient,
)

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )
  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const homepageController = new HomepageController(
    services.contentfulService,
    services.establishmentRollService,
    services.serviceData,
  )

  get('/', homepageController.displayHomepage())
  post('/search', homepageController.search())
  get(
    '/add-notification',
    asyncMiddleware(async (req, res, next) => {
      return res.render('pages/notifications/add', {
        userId: res.locals.user.userId,
      })
    }),
  )

  get(
    '/notification/:notificationId',
    asyncMiddleware(async (req, res, next) => {
      const { notificationId } = req.params
      const url = req.query?.url as string
      const { clientToken } = req.middleware
      const client = componentClientBuilder(clientToken)
      await client.seeNotification({ userId: res.locals.user.userId, notificationId }, res.locals.user.token)
      return res.redirect(decodeURIComponent(url))
    }),
  )

  post(
    '/add-notification',
    asyncMiddleware(async (req, res, next) => {
      const { clientToken } = req.middleware
      const client = componentClientBuilder(clientToken)
      await client.addNotification(req.body, res.locals.user.token)
      return res.redirect('/add-notification')
    }),
  )

  router.use(managedPageRouter(services))
  router.use('/whats-new', whatsNewRouter(services))
  router.use('/dietary-requirements', dietaryRequirementsRouter(services))
  router.get(
    '/establishment-roll*',
    asyncMiddleware(async (req, res) => {
      res.render('pages/establishmentRollHasMoved', { establishmentRollUrl: config.apis.establishmentRoll.ui_url })
    }),
  )

  return router
}
