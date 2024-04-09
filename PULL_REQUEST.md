# Pending Pull Request

> This is a draft document to be deleted before PR completion.

## Description

As a reminder, this PR aimed at solving the following exercice:

> The tasks of this exercice are as follows:
> 1. Implement the carbon footprint calculation of a product and persist the results in database.
> 2. Implement a GET endpoint to retrieve the result.
> 3. Implement a POST endpoint to trigger the calculation and the saving in the database.

## Checklist

- [x] I have installed the project with `yarn`.
- [x] I have bootstrapped the project with `yarn init-project`. 
- [x] I have successfully run the project tests with `yarn test`
- [x] I have successfully run the project e2e tests with `yarn test:e2e`

## Breaking changes

- The `POST /carbon-emission-factors` endpoint has been updated to accept a single `CarbonEmissionFactor` object instead of an array of `CarbonEmissionFactor` objects.

- The `POST /carbon-emission-factors/bulk` endpoint has been added. If your application used `POST /carbon-emission-factors` endpoint, you will need to update your code to send a request to `POST /carbon-emission-factors/bulk` instead.

## New Features

### Developer Tools

- [x] OpenAPI documentation using `@nest/swagger`.
- [x] Developer documentation using `compodoc`.

### Modules

- [x] `FoodProductModule` to handle the food product CRUD operations.

- [x] `FootprintScoreModule` to handle the carbon footprint calculation and storage.

Run `yarn docs` and open the `http://localhost:8080` to see the documentation for each module.

## Further work

The following tasks are still pending:

- [ ] Provide unit test for `footprintScoreService`.
- [ ] Provide a way to compute coverage which includes the e2e tests.
- [ ] Provide a GitHub action to run the tests on PRs.
- [ ] Provide a pre-commit hook to format the code with prettier and type checking before commiting.
