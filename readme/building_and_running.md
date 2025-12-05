[< Back](../README.md)
---

## Building and Running

To use the same version of NodeJS locally as is used in CI and production, follow [these notes](nvm.md).

First, build the project by running:

`npm run setup` and then `npm run build`

The DPS Homepage has a number of dependencies:

* [redis](https://redis.io/) - session store and token caching
* [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) - for authentication
* [prison-api](https://github.com/ministryofjustice/prison-api) - the main API for retrieving data from NOMIS
* [manage-soc-cases-api](https://github.com/ministryofjustice/manage-soc-cases-api) - an API for retrieving SOC case data
* [contentful](https://graphql.contentful.com) - for banner and 'what’s new' content

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
CONTENTFUL_HOST=https://graphql.eu.contentful.com
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_SPACE_ID=
CHECK_MY_DIARY_URL=https://check-my-diary-dev.prison.service.justice.gov.uk?fromDPS=true
DEV_COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
DIGITAL_PRISONS_URL=https://digital-dev.prison.service.justice.gov.uk
HEALTH_AND_MEDICATION_API_URL=https://health-and-medication-api-dev.hmpps.service.justice.gov.uk
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
HMPPS_COOKIE_DOMAIN=digital-dev.prison.service.justice.gov.uk
INGRESS_URL=http://localhost:3000
OAUTH_ENDPOINT_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
PRISONER_PROFILE_URL=https://prisoner-dev.digital.prison.service.justice.gov.uk
GOTENBERG_API_URL=http://localhost:3100
```
</details>

2/ And then, to build the assets and start the app with esbuild:
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
