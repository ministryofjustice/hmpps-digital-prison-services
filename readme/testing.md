[< Back](../README.md)
---

## Testing

This project uses Jest for unit testing and Cypress for integration testing.

### Unit Tests

To run: `npm run test`

### Integration Tests

For local running, start a test db, redis, and wiremock instance by:

```zsh
docker-compose -f docker-compose-test.yml up
```

Then run the server in test mode by:

```zsh
npm run start-feature
```
or
```zsh
npm run start-feature:dev
```
to run with auto-start on changes

And then either, run tests in headless mode with:

```zsh
npm run int-test
```

Or run tests with the cypress UI:

```zsh
npm run int-test-ui
```
