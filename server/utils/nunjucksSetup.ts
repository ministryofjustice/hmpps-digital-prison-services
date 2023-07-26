/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import path from 'path'
import {
  addDefaultSelectedValue,
  asSelectItem,
  baseUrl,
  findError,
  initialiseName,
  prisonerBelongsToUsersCaseLoad,
  userHasAllRoles,
  userHasRoles,
} from './utils'
import { ApplicationInfo } from '../applicationInfo'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Digital Prison Services'

  // Cachebusting version string
  if (production) {
    // Version only changes with new commits
    app.locals.version = applicationInfo.gitShortHash
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )
  njkEnv.addGlobal('prisonerBelongsToUsersCaseLoad', prisonerBelongsToUsersCaseLoad)
  njkEnv.addGlobal('userHasRoles', userHasRoles)
  njkEnv.addGlobal('userHasAllRoles', userHasAllRoles)

  njkEnv.addGlobal('baseUrl', baseUrl)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)
  njkEnv.addFilter('asSelectItems', asSelectItem)
}
