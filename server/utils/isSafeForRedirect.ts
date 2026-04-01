import config from '../config'

const safeHostSuffixes = ['.service.justice.gov.uk']

/**
 * Whether a redirect URL is to a safe/trusted host; must be absolute.
 * Configured INGRESS_URL and hosts ending in .service.justice.gov.uk are considered safe.
 * https is required in production and for external hosts.
 */
// eslint-disable-next-line import/prefer-default-export
export function isSafeForRedirect(url: unknown): url is string {
  const { domain, production } = config
  const { hostname: homepageHostname } = new URL(domain)
  if (typeof url !== 'string') {
    return false
  }
  try {
    const { hostname: redirectHostname, protocol } = new URL(url)
    const redirectsToSecure = protocol === 'https:'
    return (
      (redirectHostname === homepageHostname && (redirectsToSecure || !production)) ||
      (safeHostSuffixes.some(suffix => redirectHostname.endsWith(suffix)) && redirectsToSecure)
    )
  } catch {
    // invalid url
    return false
  }
}
