import withCaseloadChangedMarker from './withCaseloadChangedMarker'

describe('withCaseloadChangedMarker', () => {
  it.each([
    ['no query string', 'https://example.service.justice.gov.uk/prison/BFI'],
    ['an existing query string', 'https://example.service.justice.gov.uk/prison/BFI?status=ACTIVE'],
    ['repeated parameters', 'https://example.service.justice.gov.uk/prison/BFI?status=ACTIVE&status=INACTIVE'],
  ])('adds the marker to a url with %s', (_scenario, url) => {
    expect(new URL(withCaseloadChangedMarker(url)).searchParams.get('caseloadChanged')).toEqual('true')
  })

  it('keeps the existing query string', () => {
    expect(withCaseloadChangedMarker('https://example.service.justice.gov.uk/prison/BFI?status=ACTIVE&page=3')).toEqual(
      'https://example.service.justice.gov.uk/prison/BFI?status=ACTIVE&page=3&caseloadChanged=true',
    )
  })

  it('puts the marker before the fragment, where the server can see it', () => {
    expect(withCaseloadChangedMarker('https://example.service.justice.gov.uk/prison/BFI#results')).toEqual(
      'https://example.service.justice.gov.uk/prison/BFI?caseloadChanged=true#results',
    )
  })

  it('does not repeat a marker that is already there', () => {
    expect(withCaseloadChangedMarker('https://example.service.justice.gov.uk/prison/BFI?caseloadChanged=true')).toEqual(
      'https://example.service.justice.gov.uk/prison/BFI?caseloadChanged=true',
    )
  })

  it('throws on a relative url, so callers must validate first', () => {
    expect(() => withCaseloadChangedMarker('/prison/BFI')).toThrow()
  })
})
