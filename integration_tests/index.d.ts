import Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import Component from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Component'
import { CaseLoad } from '../server/data/interfaces/caseLoad'
import { Location } from '../server/data/interfaces/location'
import { UserToken } from './mockApis/auth'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode?: boolean; redirectPath?: string }): Chainable<AUTWindow>

      setupUserAuth(
        options?: UserToken & {
          locations?: Location[]
        },
      ): Chainable<AUTWindow>

      setupComponentsData(options?: {
        header?: Component
        footer?: Component
        caseLoads?: CaseLoad[]
        services?: Service[]
        residentialLocationsActive?: boolean
      }): Chainable<AUTWindow>
    }
  }
}
