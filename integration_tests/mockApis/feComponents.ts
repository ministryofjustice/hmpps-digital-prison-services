import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'

export default {
  stubFeComponents: (
    options: {
      caseLoads?: CaseLoad[]
      services?: Service[]
      residentialLocationsActive?: boolean
    } = {},
  ) => {
    const caseLoads = options.caseLoads || [
      {
        caseLoadId: 'LEI',
        currentlyActive: true,
        description: 'Leeds (HMP)',
        type: '',
        caseloadFunction: '',
      },
    ]

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/frontend-components/components\\?.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          header: { html: '', css: [], javascript: [] },
          footer: { html: '', css: [], javascript: [] },
          meta: {
            caseLoads,
            activeCaseLoad: caseLoads.find(caseLoad => caseLoad.currentlyActive === true),
            services: options.services || [
              {
                id: 'check-my-diary',
                heading: 'Check my diary',
                description: 'View your prison staff detail (staff rota) from home.',
                href: 'http://localhost:3001',
                navEnabled: true,
              },
              {
                id: 'key-worker-allocations',
                heading: 'My key worker allocation',
                description: 'View your key worker cases.',
                href: 'http://localhost:3001/key-worker/111111',
                navEnabled: true,
              },
              {
                id: 'residential-locations',
                heading: 'Residential Locations',
                description: 'Manage residential locations.',
                href: 'http://localhost:3001/locations',
                navEnabled: options.residentialLocationsActive,
              },
            ],
          },
        },
      },
    })
  },
}
