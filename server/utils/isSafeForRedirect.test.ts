import { isSafeForRedirect } from './isSafeForRedirect'
import config from '../config'

jest.mock('../config')

describe('isSafeForRedirect()', () => {
  beforeEach(() => {
    config.domain = 'https://dps.prison.service.justice.gov.uk'
    config.production = true
  })

  it.each([null, undefined, '', '/', 'link?page=2', 'https://'])(
    'should not consider %j to be safe because it is not a valid absolute URL',
    url => {
      expect(isSafeForRedirect(url)).toBe(false)
    },
  )

  it('should throw an error if configured INGRESS_URL is invalid', () => {
    config.domain = 'https://'
    expect(() => isSafeForRedirect('https://dps.prison.service.justice.gov.uk')).toThrow()
  })

  it.each([
    'https://dps.prison.service.justice.gov.uk',
    'https://dps.prison.service.justice.gov.uk/',
    'https://dps.prison.service.justice.gov.uk/whats-new?search=2025',
  ])('should consider %j to be safe because it has the same host', url => {
    expect(isSafeForRedirect(url)).toBe(true)
  })

  it.each([
    'https://dps-dev.prison.service.justice.gov.uk/whats-new',
    'https://prisoner.digital.prison.service.justice.gov.uk/prisoner/A1111AA',
    'https://incident-reporting.hmpps.service.justice.gov.uk/',
  ])('should consider %j to be safe because *.service.justice.gov.uk hosts are trusted', url => {
    expect(isSafeForRedirect(url)).toBe(true)
  })

  it.each(['https://www.gov.uk/', 'https://localhost/'])(
    'should not consider %j to be safe because the host is not explicitly trusted',
    url => {
      expect(isSafeForRedirect(url)).toBe(false)
    },
  )

  describe('in production (ie. dev, preprod or prod)', () => {
    it.each([
      'http://dps.prison.service.justice.gov.uk/whats-new?search=2025',
      'http://dps-dev.prison.service.justice.gov.uk/whats-new',
      'http://prisoner.digital.prison.service.justice.gov.uk/prisoner/A1111AA',
      'http://incident-reporting.hmpps.service.justice.gov.uk/',
    ])('should not consider %j to be safe because it is insecure', url => {
      expect(isSafeForRedirect(url)).toBe(false)
    })
  })

  describe('locally', () => {
    beforeEach(() => {
      config.domain = 'http://localhost:3000'
      config.production = false
    })

    it.each(['http://localhost:3000', 'http://localhost:3000/whats-new'])(
      'should consider %j to be safe despite not being secure',
      url => {
        expect(isSafeForRedirect(url)).toBe(true)
      },
    )

    it('should not consider http://localhost/ to be safe because the port does not match', () => {
      expect(isSafeForRedirect('http://localhost/')).toBe(false)
    })

    it.each([
      'http://dps.prison.service.justice.gov.uk/whats-new?search=2025',
      'http://dps-dev.prison.service.justice.gov.uk/whats-new',
      'http://prisoner.digital.prison.service.justice.gov.uk/prisoner/A1111AA',
      'http://incident-reporting.hmpps.service.justice.gov.uk/',
    ])('should not consider %j to be safe because it is external and insecure', url => {
      expect(isSafeForRedirect(url)).toBe(false)
    })
  })
})
