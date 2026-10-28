/**
 * Query parameter telling the service we are sending the user back to that their active caseload has
 * just changed, so a url naming a prison may now describe the one they have left.
 *
 * Services cannot work this out for themselves: a request for another prison's page looks the same
 * whether the user has just switched or deliberately followed a link to a prison they still have
 * access to.
 *
 * It carries no authority — anyone can put it in a url — so services must take the prison to show
 * from the user's active caseload and keep running their own authorisation.
 */
export const CASELOAD_CHANGED_PARAM = 'caseloadChanged'

/**
 * The given url with the caseload change marker added.
 *
 * Only ever call this with a url that has already passed `isSafeForRedirect`: adding the marker must
 * not be able to turn an unsafe url into one we redirect to.
 *
 * Built with `URL` rather than string concatenation so the parameter survives an existing query
 * string and lands before any fragment, where the receiving server can actually see it.
 */
export default function withCaseloadChangedMarker(url: string): string {
  const target = new URL(url)
  target.searchParams.set(CASELOAD_CHANGED_PARAM, 'true')
  return target.href
}
