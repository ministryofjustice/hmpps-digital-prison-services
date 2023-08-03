const dpsServicesDataStoreMock = [
  {
    id: 'manage-adjudications',
    heading: 'Adjudications',
    description: 'Place a prisoner on report after an incident, view reports and manage adjudications.',
    href: '',
    enabled: '',
  },
  {
    id: 'activities',
    heading: 'Allocate people to activities',
    description: 'Set up and edit activities. Allocate people, remove them, and edit allocations.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'secure-move',
    heading: 'Book a secure move',
    description:
      'Schedule secure movement for prisoners in custody, via approved transport suppliers, between locations across England and Wales.',
    href: 'https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk',
    enabled: false,
  },
  {
    id: 'categorisation',
    heading: 'Categorisation',
    description: 'View a prisoner’s category and complete either a first time categorisation or a recategorisation.',
    href: 'http://localhost:3003/',
    enabled: false,
  },
  {
    id: 'change-someones-cell',
    heading: 'Change someone’s cell',
    description: 'Complete a cell move and view the 7 day history of all cell moves completed in your establishment.',
    href: 'http://localhost:3001/change-someones-cell',
    enabled: false,
  },
  {
    id: 'check-my-diary',
    heading: 'Check My Diary',
    description: 'View your prison staff detail (staff rota) from home.',
    href: undefined,
    roles: [] as string[],
    enabled: undefined,
  },
  {
    id: 'check-rule39-mail',
    heading: 'Check Rule 39 mail',
    description: 'Scan barcodes on mail from law firms and other approved senders.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'create-and-vary-a-licence',
    heading: 'Create and vary a licence',
    description: 'Create and vary standard determinate licences and post sentence supervision orders.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'establishment-roll',
    heading: 'Establishment roll check',
    description: 'View the roll broken down by residential unit and see who is arriving and leaving.',
    href: 'http://localhost:3001/establishment-roll',
    roles: [] as string[],
    enabled: false,
  },
  {
    id: 'get-someone-ready-to-work',
    heading: 'Get someone ready to work',
    description: 'Record what support a prisoner needs to get work. View who has been assessed as ready to work.',
    href: 'http://localhost:3002?sort=releaseDate&order=descending',
    enabled: false,
  },
  {
    id: 'global-search',
    heading: 'Global search',
    description: 'Search for someone in any establishment, or who has been released.',
    href: 'http://localhost:3001/global-search',
    enabled: true,
  },
  {
    id: 'historical-prisoner-application',
    heading: 'Historical Prisoner Application',
    description: 'This service allows users to view historical prisoner information.',
    href: '',
    enabled: '',
  },
  {
    id: 'hdc-licences',
    heading: 'Home Detention Curfew',
    description: 'Create and manage Home Detention Curfew.',
    href: 'http://localhost:3003/',
    enabled: false,
  },
  {
    id: 'soc',
    heading: 'Manage SOC cases',
    description: 'Manage your Serious and Organised Crime (SOC) caseload.',
    href: '',
    enabled: '',
  },
  {
    id: 'incentives',
    heading: 'Manage incentives',
    description: 'See prisoner incentive information by residential location and view incentive data visualisations.',
    href: undefined,
    roles: [],
    enabled: undefined,
  },
  {
    id: 'manage-key-workers',
    heading: 'Manage key workers',
    description: 'Add and remove key workers from prisoners and manage individuals.',
    href: 'http://localhost:3001',
    enabled: false,
  },
  {
    id: 'manage-offences',
    heading: 'Manage offences',
    description: 'This service allows you to maintain offence reference data.',
    href: undefined,
    enabled: false,
  },
  {
    id: 'book-a-prison-visit',
    heading: 'Manage prison visits',
    description: 'Book, view and cancel a prisoner’s social visits.',
    href: '',
    enabled: '',
  },
  {
    id: 'manage-prisoner-whereabouts',
    heading: 'Manage prisoner whereabouts',
    description: 'View unlock lists, all appointments and COVID units, manage attendance and add bulk appointments.',
    href: 'http://localhost:3001/manage-prisoner-whereabouts',
    roles: [],
    enabled: false,
  },
  {
    id: 'manage-restricted-patients',
    heading: 'Manage restricted patients',
    description:
      'View your restricted patients, move someone to a secure hospital, or remove someone from the restricted patients service.',
    href: '',
    enabled: '',
  },
  {
    id: 'manage-users',
    heading: 'Manage user accounts',
    description:
      'As a Local System Administrator (LSA) or administrator, manage accounts and groups for service users.',
    href: 'http://localhost:3004/',
    enabled: false,
  },
  {
    id: 'key-worker-allocations',
    heading: 'My key worker allocation',
    description: 'View your key worker cases.',
    href: 'http://localhost:3001/key-worker/123',
    enabled: false,
  },
  {
    id: 'legacy-prison-visit',
    heading: 'Online visit requests',
    description: 'Respond to online social visit requests.',
    href: '',
    enabled: '',
  },
  {
    id: 'pathfinder',
    heading: 'Pathfinder',
    description: 'Manage your Pathfinder caseloads.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'view-people-due-to-leave',
    heading: 'People due to leave',
    description: 'View people due to leave this establishment for court appearances, transfers or being released.',
    href: 'http://localhost:3001/manage-prisoner-whereabouts/scheduled-moves',
    enabled: false,
  },
  {
    id: 'pin-phones',
    heading: 'Prisoner communication monitoring service',
    description: 'Access to the Prisoner communication monitoring service.',
    href: 'http://localhost:3000/',
    enabled: false,
  },
  {
    id: 'appointments',
    heading: 'Schedule and edit appointments',
    description: 'Create one-to-one and group appointments. Edit existing appointments and print movement slips.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'secure-social-video-calls',
    heading: 'Secure social video calls',
    description:
      'Manage and monitor secure social video calls with prisoners. Opens the Prison Video Calls application.',
    href: '',
    enabled: '',
  },
  {
    id: 'submit-an-intelligence-report-private-beta',
    heading: 'Submit an Intelligence Report (Private Beta)',
    description: 'Access to the new Mercury submission form for those establishments enrolled in the private beta',
    href: undefined,
    roles: [],
    enabled: undefined,
  },
  {
    id: 'use-of-force',
    heading: 'Use of force incidents',
    description: 'Manage and view incident reports and statements.',
    href: undefined,
    roles: [],
    enabled: undefined,
  },
  {
    id: 'view-covid-units',
    heading: 'View COVID units',
    description: 'View who is in each COVID unit in your establishment.',
    href: 'http://localhost:3001/current-covid-units',
    enabled: false,
  },
  {
    id: 'pom',
    heading: 'View POM cases',
    description: 'Keep track of your allocations. If you allocate cases, you also can do that here.',
    href: undefined,
    enabled: undefined,
  },
  {
    id: 'view-unaccounted-for',
    heading: 'View prisoners unaccounted for',
    description: 'View all prisoners not marked as attended or not attended.',
    href: 'http://localhost:3001/manage-prisoner-whereabouts/prisoners-unaccounted-for',
    enabled: false,
  },
  {
    id: 'welcome-people-into-prison',
    heading: 'Welcome people into prison',
    description:
      'View prisoners booked to arrive today, add them to the establishment roll, and manage reception tasks for recent arrivals.',
    href: undefined,
    roles: [],
    enabled: undefined,
  },
]

export default dpsServicesDataStoreMock