import express, { Router } from 'express'

import { endpointHealthComponent, monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import config from '../config'
import logger from '../../logger'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig
      .filter(([_, options]: [string, any]) => options?.healthPath)
      .map(([name, options]: [string, any & { healthPath: string }]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
