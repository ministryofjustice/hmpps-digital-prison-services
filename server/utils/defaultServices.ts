import type Service from '@ministryofjustice/hmpps-connect-dps-components/dist/types/Service'
import config from '../config'

export default [
  {
    id: 'check-my-diary',
    heading: 'Check my diary',
    description: 'View your prison staff detail (staff rota) from home.',
    href: config.apis.checkMyDiary.ui_url,
    navEnabled: true,
  },
  {
    id: 'submit-an-intelligence-report',
    heading: 'Submit an intelligence report',
    description: 'Access to the intelligence submission form',
    href: config.apis.mercurySubmit.url,
    navEnabled: true,
  },
  {
    id: 'accredited-programmes',
    heading: 'Accredited Programmes',
    description: 'Search for Accredited Programmes, find out where they’re running and start a referral.',
    href: config.apis.accreditedProgrammes.ui_url,
    navEnabled: true,
  },
] as Service[]
