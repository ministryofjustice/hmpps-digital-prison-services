import express from 'express'
import config from '../config'

const router = express.Router()

export default () => {
  router.get('/establishment-roll', (req, res) => res.redirect(301, config.apis.establishmentRoll.ui_url))

  router.get('/establishment-roll/arrived-today', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/arrived-today`),
  )

  router.get('/establishment-roll/out-today', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/out-today`),
  )

  router.get('/establishment-roll/en-route', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/en-route`),
  )

  router.get('/establishment-roll/in-reception', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/in-reception`),
  )

  router.get('/establishment-roll/no-cell-allocated', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/no-cell-allocated`),
  )

  router.get('/establishment-roll/total-currently-out', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/total-currently-out`),
  )

  router.get('/wing/:wingId/landing/:landingId', (req, res) =>
    res.redirect(
      301,
      `${config.apis.establishmentRoll.ui_url}/wing/${req.params.wingId}/landing/${req.params.landingId}`,
    ),
  )

  router.get('/wing/:wingId/spur/:spurId/landing/:landingId', (req, res) =>
    res.redirect(
      301,
      `${config.apis.establishmentRoll.ui_url}/wing/${req.params.wingId}/spur/${req.params.spurId}/landing/${req.params.landingId}`,
    ),
  )

  router.get('/:livingUnitId/currently-out', (req, res) =>
    res.redirect(301, `${config.apis.establishmentRoll.ui_url}/${req.params.livingUnitId}/currently-out`),
  )

  return router
}
