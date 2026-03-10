import { Router } from 'express'
import { Services } from '../services'
import ChangeCaseloadController from '../controllers/changeCaseloadController'

export default function changeCaseloadRouter(services: Services): Router {
  const router = Router()

  const changeCaseloadController = new ChangeCaseloadController(services.userService)

  router.get('/', changeCaseloadController.get())
  router.post('/', changeCaseloadController.post())

  return router
}
