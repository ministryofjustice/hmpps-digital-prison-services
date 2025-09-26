import express, { Router } from 'express'

import {
  endpointHealthComponent,
  EndpointHealthComponentOptions,
  monitoringMiddleware,
} from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import logger from '../../logger'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis).filter(
    ([name]) => config.environmentName.toUpperCase() !== 'DEV' || ['hmppsAuth', 'tokenVerification'].includes(name),
  )

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig
      .filter(([_, options]) => 'healthPath' in options && options.healthPath)
      .map(([name, options]) => endpointHealthComponent(logger, name, options as EndpointHealthComponentOptions)),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
