import type { ErrorRequestHandler, RequestHandler, Router } from 'express'
import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import config from '../config'
import auth from '../authentication/auth'
import logger from '../../logger'

const router = express.Router()

export default function setUpAuth(): Router {
  auth.init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('oauth2'))

  const authSuccess: RequestHandler = (req, res) => {
    const redirectUrl = req.session.returnTo || '/'
    res.redirect(redirectUrl)
  }
  const authFailure: ErrorRequestHandler = (err, req, res, next) => {
    logger.error(`Passport auth error: ${err}`)
    res.redirect('/autherror')
  }

  router.get(
    '/sign-in/callback',
    passport.authenticate('oauth2', {
      failWithError: true,
    }),
    authSuccess,
    authFailure,
  )

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authSignOutUrl = `${authUrl}/sign-out?client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.domain}`

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
