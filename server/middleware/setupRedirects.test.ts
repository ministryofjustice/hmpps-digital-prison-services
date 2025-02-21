import express from 'express'
import request from 'supertest'
import setupRedirects from './setupRedirects'
import config from '../config'

describe('setup redirects', () => {
  let app: any
  beforeEach(() => {
    app = express()
    app.use(setupRedirects())
  })

  it('should redirect to establishment roll service', done => {
    request(app).get('/establishment-roll').expect('location', config.apis.establishmentRoll.ui_url).expect(301, done)
  })

  it('should redirect to establishment roll service with correct path and params', done => {
    request(app)
      .get('/123/currently-out')
      .expect('location', `${config.apis.establishmentRoll.ui_url}/123/currently-out`)
      .expect(301, done)
  })
})
