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

## Proposed Changes

The following changes have been made to the project.

Some of the changes are breaking changes and will require changes in the client code:

- 🎁 means the change is a new feature (not breaking).
- ✅ means the change is not breaking.
- 🧹 means the change only impacts development.
- 🚨 means the change is breaking.

### Project management

- 🧹 Add a `docs` script to generate the developer documentation using `compodoc`.

- 🧹 Use `--runInBand` option with `jest` when running tests to speed up tests.
  - I'm aware that this may hide some issues with the tests, like the fact that two tests cannot be run in parallel because they are using the same database.
  - But tests were awefully slow on my machine, so I tried to speed them up, and at this stage I'm not sure if this is a good idea or not.

- 🧹 Fix `migration:generate` task in `package.json`
  - The task was not generating the migration files in the proper directory (`src/migrations` instead of `migrations/`)

- 🧹 Fix `format` format task in `package.json`
  - The task was not formatting all the files in the project.

- 🧹 Add `.vscode/launch.json` to let developers debug the application easily in VSCode.

- 🧹 Add `.vscode/extensions.json` to indicate recommended extensions to developers using VSCode.

- 🧹 Add `.vscode/settings.default.json` to provide default settings to developers using VSCode.
  - Also removed `.vscode/settings.json` from the git repository and added it into the `.gitignore`.
  - This will allow developers to have their own settings without having to worry about conflicts.
  - IMO developers should be able to control their `settings.json` file, while having sane defaults in `settings.default.json`.

### `CarbonEmissionFactor` module


#### `CarbonEmissionFactor` entity

- ✅ Add an index on `name` field in the `CarbonEmissionFactor` entity:
  - This will speed up the search by name in the database.

- ✅ Remove constructor from the `CarbonEmissionFactor` entity:
  - I'm not familiar enough with `typeorm` to know if this is a good practice or not.
  - The current implementation seemed to be buggy (constructor was never called)

#### `CarbonEmissionFactorService`

- ✅ Extract the `ICarbonEmissionFactorService` interface from the `CarbonEmissionFactorService` class:
  - This will allow to use the interface in the `CarbonEmissionFactorController` classes and elsewhere in the project.
  - I'm not familiar enough with `typeorm`, maybe it provides way to create stubs for `Repository` classes esily without the need for an interface.

- ✅ Renamed the `save` method into `saveBulk`:
  - This is more explicit and aligned with the fact that the method is saving multiple entities at once.
  - This is not a breaking change as this application is not used as a library.

- 🎁 Added a `save` method:
  - This method will allow to save a single `CarbonEmissionFactor` entity in the database.
  - This is a new feature, it is not a breaking change.
  - It has been introduced because today `saveBulk` returns an array of created objects, but it may be useful to not return such a large object in the future. However, when creating a single object, it may be useful to always return the created object.

- 🎁 Add a `findByName` method:
  - This method will allow to search for a `CarbonEmissionFactor` entity by its name.
  - If the name is not found, the method will return `null`. This is a design choice, it could be changed to throw an error instead.

- 🎁 Add a `findListByNames` method:
  - This method will allow to search for a list of `CarbonEmissionFactor` entities by their names.
  - If any of the names is not found, the method will return `null`. This is a design choice, it could be changed to throw an error instead.

- 🎁 Add a `delete` method:
  - This method will allow to delete a `CarbonEmissionFactor` entity by its name.
  - It the entity is removed, this method will return `true`, otherwise it will return `false`. This is a design choice, it could be changed to throw an error instead, or the `string|null` type could be used to return either the `id` or `null`.
  - This is a new feature, it is not a breaking change.
  - This method is useful to test CASCADE delete in the database.

#### `CarbonEmissionFactorController`

- 🚨 Rename `POST /carbon-emission-factors` into `POST /carbon-emission-factors/bulk` endpoint. This is more aligned with REST principles. Moreover, the endpoint no longer returns an array of `CarbonEmissionFactor` entities but an array of `ReadCarbonEmissionFactorDto` data transfer objects instead.
  - The returned dto does not include the `id` field as it is not needed by the client.

- 🚨 Update `GET /carbon-emission-factors` endpoint:
  - This endpoint no longer returns the entity but returns a `ReadCarbonEmissionFactorDto` data transfer object instead.
  - The returned dto does not include the `id` field as it is not needed by the client.

- 🎁 Add `GET /carbon-emission-factors/:name` endpoint:
  - This endpoint will allow to get a `ReadCarbonEmissionFactorDto` for a carbon emission factor by its name.
  - If the name is not found, the endpoint will return a `404` status code.
  - This is a new feature, it is not a breaking change.

- 🎁 Add `DELETE /carbon-emission-factors/:name` endpoint:
  - This endpoint will allow to delete a carbon emission factor by its name.
  - If the factor is deleted, the endpoint will return a `204` status code.
  - If the name is not found, the endpoint will return a `404` status code.
  - This is a new feature, it is not a breaking change.

- 🎁 Add `POST /carbon-emission-factors` endpoint:
  - This endpoint will allow to create a carbon emission factor.
  - The endpoint will return a `201` status code if the entity is create, together with a `ReadCarbonEmissionFactorDto` data transfer object.
  - This is a new feature, it is not a breaking change.

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
