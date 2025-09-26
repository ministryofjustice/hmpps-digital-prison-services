import { Router } from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import { getFrontendComponents } from '@ministryofjustice/hmpps-connect-dps-components'
import { Strategy } from 'passport-oauth2'
import { AuthenticatedRequest, VerificationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/prisonUser'
import generateOauthClientToken from '../authentication/clientCredentials'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

passport.use(
  new Strategy(
    {
      authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
      tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
      clientID: config.apis.hmppsAuth.apiClientId,
      clientSecret: config.apis.hmppsAuth.apiClientSecret,
      callbackURL: `${config.domain}/sign-in/callback`,
      state: true,
      customHeaders: { Authorization: generateOauthClientToken() },
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  ),
)

export default function setUpAuthentication(): Router {
  const router = Router()
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get(
    '/autherror',
    getFrontendComponents({
      logger,
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrisons,
    }),
    (req, res) => {
      res.status(401)
      return res.render('autherror')
    },
  )

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) => {
    const authCallback: passport.AuthenticateCallback = (err, user, info) => {
      if (err) {
        return res.redirect('/autherror')
      }
      if (!user) {
        const { message } = info as { message: string }
        if (info && message === 'Unable to verify authorization request state.') {
          // failure to due authorisation state not being there on return, so retry
          logger.info('Retrying auth callback as no state found')
          return res.redirect('/')
        }
        logger.info(`Auth failure due to ${JSON.stringify(info)}`)
        return res.redirect('/autherror')
      }
      const { returnTo } = req.session
      req.logIn(user, err2 => {
        if (err2) {
          return next(err2)
        }
        if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
          return res.redirect(returnTo)
        }
        return res.redirect('/')
      })
      return null
    }
    passport.authenticate('oauth2', authCallback)(req, res, next)
  })

  const authUrl = config.apis.hmppsAuth.externalUrl
  const authParameters = `client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.domain}`

  router.use('/sign-out', (req, res, next) => {
    const authSignOutUrl = `${authUrl}/sign-out?${authParameters}`
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details?${authParameters}`)
  })

  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use((req, res, next) => {
    res.locals.user = req.user as PrisonUser
    next()
  })

  return router
}
