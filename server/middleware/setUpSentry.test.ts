import { anonymise } from './setUpSentry'

describe('Sentry anonymisation', () => {
  it.each([
    ['http://localhost/prisoner/some-other-url', 'http://localhost/prisoner/some-other-url'],
    ['http://localhost/prisoner/A1234AA', 'http://localhost/prisoner/:prisonerNumber'],
    ['http://localhost/prisoner/A1111AA/and/A2222BB', 'http://localhost/prisoner/:prisonerNumber/and/:prisonerNumber'],
    ['GET /prisoner/A1234AA', 'GET /prisoner/:prisonerNumber'],
  ])('should replace prisoner numbers in “%s”', (urlLike, expected) => {
    expect(anonymise(urlLike)).toEqual(expected)
  })
})
