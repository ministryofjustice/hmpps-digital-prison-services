/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import fs from 'fs'

import {
  addDefaultSelectedValue,
  asSelectItem,
  findError,
  formatName,
  initialiseName,
  prisonerBelongsToUsersCaseLoad,
  userHasAllRoles,
  userHasRoles,
} from './utils'
import { formatDate, formatDateTime, formatTime, isWithinLast3Days, timeFromDate, toUnixTimeStamp } from './dateHelpers'
import config from '../config'
import { pluralise } from './pluralise'
import logger from '../../logger'

export default function nunjucksSetup(app: express.Express): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Digital Prison Services'
  app.locals.config = config

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
  } catch (_e) {
    logger.error('Could not read asset manifest file')
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/govuk-frontend/dist/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )
  njkEnv.addGlobal('prisonerBelongsToUsersCaseLoad', prisonerBelongsToUsersCaseLoad)
  njkEnv.addGlobal('userHasRoles', userHasRoles)
  njkEnv.addGlobal('userHasAllRoles', userHasAllRoles)

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId.trim())

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)
  njkEnv.addFilter('asSelectItems', asSelectItem)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('formatTime', formatTime)
  njkEnv.addFilter('formatName', formatName)
  njkEnv.addFilter('toUnixTimeStamp', toUnixTimeStamp)
  njkEnv.addFilter('timeFromDate', timeFromDate)
  njkEnv.addFilter('isWithinLast3Days', isWithinLast3Days)
  njkEnv.addFilter('pluralise', pluralise)
}
