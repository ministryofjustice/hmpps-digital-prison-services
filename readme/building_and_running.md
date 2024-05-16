[< Back](../README.md)
---

## Building and Running

To use the same version of NodeJS locally as is used in CI and production, follow [these notes](nvm.md).

First, build the project by running:

`npm install` and then `npm run build`

The DPS Homepage has a number of dependencies:

* [redis](https://redis.io/) - session store and token caching
* [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) - for authentication
* [prison-api](https://github.com/ministryofjustice/prison-api) - the main API for retrieving data from NOMIS
* [keyworker-api](https://github.com/ministryofjustice/keyworker-api) - an API providing backend functionality for keyworkers
* [whereabouts-api](https://github.com/ministryofjustice/whereabouts-api) - an API providing backend functionality for the location of prisoners
* [pathfinder-api](https://github.com/ministryofjustice/pathfinder-api) - an API for retrieving Pathfinder data
* [manage-soc-cases-api](https://github.com/ministryofjustice/manage-soc-cases-api) - an API for retrieving SOC case data
* [contentful](https://graphql.contentful.com) - for banner and 'what's new' content

### Developing against the development environment
Development of this application has mainly relied on configuring `hmpps-digital-prison-services` to point at the development 
environment instances of the above dependencies (redis being the exception, a local instance of this was used).

Here's the process.

1/ Create a .env file with environment variables pointing to the development environment
<details>
<summary>Click here for an example of the .env file</summary>
<br>
Note, credentials need to be retrieved from the dev kubernetes secrets to provide the missing auth and contentful variables.

```
PORT=3000
API_CLIENT_ID=
API_CLIENT_SECRET=
SYSTEM_CLIENT_ID=
SYSTEM_CLIENT_SECRET=
ENVIRONMENT_NAME=DEV
NODE_ENV=dev
COMPONENT_API_LATEST=true
TOKEN_VERIFICATION_ENABLED=false
CONTENTFUL_HOST=https://graphql.contentful.com
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_SPACE_ID=
ACTIVITIES_URL=https://activities-dev.prison.service.justice.gov.uk/activities
APPOINTMENTS_URL=https://activities-dev.prison.service.justice.gov.uk/appointments
CATEGORISATION_UI_URL=https://dev.offender-categorisation.service.justice.gov.uk
CHECK_MY_DIARY_URL=https://check-my-diary-dev.prison.service.justice.gov.uk?fromDPS=true
DEV_COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
CREATE_AND_VARY_A_LICENCE_URL=https://create-and-vary-a-licence-dev.hmpps.service.justice.gov.uk
DIGITAL_PRISONS_URL=https://digital-dev.prison.service.justice.gov.uk
GET_SOMEONE_READY_FOR_WORK_URL=https://get-ready-for-work-dev.hmpps.service.justice.gov.uk
HISTORICAL_PRISONER_APPLICATION_URL=https://hpa-stage.hmpps.dsd.io
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
HMPPS_COOKIE_DOMAIN=digital-dev.prison.service.justice.gov.uk
INCENTIVES_URL=https://incentives-ui-dev.hmpps.service.justice.gov.uk
INGRESS_URL=http://localhost:3000
KEYWORKER_API_URL=https://keyworker-api-dev.prison.service.justice.gov.uk
LEARNING_AND_WORK_PROGRESS_URL=https://learning-and-work-progress-dev.hmpps.service.justice.gov.uk
LEGACY_PRISON_VISITS_URL=https://prison-visits-booking-staff-dev.apps.live.cloud-platform.service.justice.gov.uk
LICENCES_URL=https://licences-dev.prison.service.justice.gov.uk
MANAGE_ADJUDICATIONS_URL=https://manage-adjudications-dev.hmpps.service.justice.gov.uk
MANAGE_AUTH_ACCOUNTS_URL=https://manage-users-dev.hmpps.service.justice.gov.uk
MANAGE_OFFENCES_URL=https://manage-offences-dev.hmpps.service.justice.gov.uk
MANAGE_PRISON_VISITS_URL=https://manage-prison-visits-dev.prison.service.justice.gov.uk
MANAGE_RESTRICTED_PATIENTS_URL=https://manage-restricted-patients-dev.hmpps.service.justice.gov.uk
MERCURY_SUBMIT_URL=https://submit-a-mercury-report-dev.hmpps.service.justice.gov.uk
MOIC_URL=https://dev.moic.service.justice.gov.uk
OAUTH_ENDPOINT_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
OMIC_URL=https://dev.manage-key-workers.service.justice.gov.uk
PATHFINDER_ENDPOINT_API_URL=https://dev-api.pathfinder.service.justice.gov.uk
PATHFINDER_UI_URL=https://dev.pathfinder.service.justice.gov.uk
PECS_URL=https://hmpps-book-secure-move-frontend-staging.apps.live-1.cloud-platform.service.justice.gov.uk
PIN_PHONES_URL=https://pcms-dev.prison.service.justice.gov.uk
PREPARE_SOMEONE_FOR_RELEASE_URL=https://resettlement-passport-ui-dev.hmpps.service.justice.gov.uk
PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
SECURE_SOCIAL_VIDEO_CALLS_URL=https://auth.dev.prisonvideo.com/accounts/login/oauth/redirect
SEND_LEGAL_MAIL_URL=https://check-rule39-mail-dev.prison.service.justice.gov.uk
SOC_API_URL=https://manage-soc-cases-api-dev.hmpps.service.justice.gov.uk
SOC_UI_URL=https://manage-soc-cases-dev.hmpps.service.justice.gov.uk
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
USE_OF_FORCE_URL=https://dev.use-of-force.service.justice.gov.uk
WELCOME_PEOPLE_INTO_PRISON_URL=https://welcome-dev.prison.service.justice.gov.uk
WHEREABOUTS_ENDPOINT_URL=https://whereabouts-api-dev.service.justice.gov.uk
PRISONER_SEARCH_API_URL=https://prisoner-search-dev.prison.service.justice.gov.uk
PRISONER_PROFILE_URL=https://prisoner-dev.digital.prison.service.justice.gov.uk

```
</details>

2/ And then, to build the assets and start the app with nodemon:
```
npm run start:dev
```

3/ To access the service, navigate in a web browser to http://localhost:3000

### Run linter

After making code changes eslint can be used to ensure code style is maintained
(although husky ensures this is run as part of the pre-commit hook too)
```
npm run lint
```
