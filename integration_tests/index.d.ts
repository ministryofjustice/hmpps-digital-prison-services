import { CaseLoad } from '../server/data/interfaces/caseLoad'
import { Location } from '../server/data/interfaces/location'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode?: boolean; redirectPath?: string }): Chainable<AUTWindow>

      setupUserAuth(options?: {
        roles?: string[]
        caseLoads?: CaseLoad[]
        activeCaseLoadId?: string
        locations?: Location[]
      }): Chainable<AUTWindow>
    }
  }
}
