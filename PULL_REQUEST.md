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

- ✅ Export the `CarbonEmissionFactorService` class from the `CarbonEmissionFactor` module:
  - This will allow to use the service in other modules.

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

- ✅ Use dedicated logger instance:
  - This is recommended in the NestJS documentation to avoid conflicts between different controllers.
  - This is not a breaking change unless parsers are relying on the current log format.
  - I'm not sure this is the proper way to implement an audit log though. A middleware would be more appropriate.
  - Logging is not tested. This has been left out due to lack of time, but it should be tested.

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

### `FoodProduct` module

The `FoodProduct` module has been created to handle the CRUD operations for food products.

It is completely independent from the `CarbonEmissionFactor` module, and it does not concern itself with concepts such as carbon footprint.

The goal of this module is to provide a controller to:

- Create a food product.
- Delete a food product.

Update operations are not provided as they are not needed for this exercice.

This module should also export a `FoodProductService` class for the controller to use, and for another module to use (see `FootprintScore` module below).

#### `FoodProduct` entity

- 🎁 Introduce a new entity `FoodProduct`:
  - This entity has a single field `name`.
  - It has a relation `composition`.
    - `composition` is an array of `IngredientQuantity` entities (see below).

- 🎁 Introduce a new entity `Ingredient`:
  - This entity has a `name` and a `unit`.
  - `unit` validation is very basic. It should be improved in the future.

- 🎁 Introcuce a new entity `IngredientQuantity`:
  - This entity will allow to store the quantity of an ingredient in a food product.
  - This entity has a the fields `ingredient_id`, `product_id` and `quantity`.
  - It has a relation `ingredient` to the `Ingredient` entity through the `ingredient_id` field.
  - It has a relation `product` to the `FoodProduct` entity through the `product_id` field.

#### `FoodProductService`

- 🎁 Introduce a new service `FoodProductService`:
  - This service will allow to create and delete food products.
  - It will also allow to retrieve a food product by its name.

##### Limitations

###### Unit testing

- At the moment, the service is not really "unit tested" in a sense that it depends on the `TypeORM` repository. This is not a good practice IMO, but I'm not sure what are the best practices here.

###### Exception handling

- The `FoodProductService` does not handle exceptions throwned by `TypeORM`. I'm not sure what is the best way to handle exceptions in a service. I don't think we should throw HTTP exceptions, so maybe we should create our custom exception classes and throw them. The controllers would then be responsible for catching these exceptions and returning the appropriate HTTP status code. 

###### Units conversion

- When asking to create a product with an ingredient expressed in a different unit than an existing product with same ingredient, the application will crash with a `500` status code. This is due to the fact that the application does not handle units conversion properly, and will try to create a new ingredient with the same name but a different unit, and there is a unique constraint on the `name` field in the `Ingredient` entity.

  - This is intentionally left out as I'm not sure whether the units should exist in the database schema, e.g, why not a column `quantityInKg` ? If for any reason we must store the unit in database, then we should have a function to convert the quantity of an ingredient in the unit of the ingredient in the database, and tests for that too.

#### `FoodProductController`

- 🎁 Introduce a new controller `FoodProductController`:
  - This controller will allow to create and delete food products.
  - It will also allow to retrieve a food product by its name.

##### Limitations

###### Exception handling

- The `FoodProductController` does not handle exceptions properly. For example, when trying to create a food product with an existing name, the application will crash with a `500` status code. This should be handled properly and return an appropriate status code with a proper error message.

> I have to admit that I'm not very experienced with `NestJS` and I'm not sure what is the best way to handle exceptions in a controller. I have seen that `HttpException` can be thrown, and that's what I did in the `CarbonEmissionFactorController`. However, I'm not sure if this is the best way to handle exceptions in a controller. Also, I'm not sure whether services should throw exceptions or return a result object with an error field. This is something that is strongly impacted by the current practices of the team I guess. 

###### Performance

- The `FoodProductController` is not optimized for performance. Several comments have been added to indicate where the code could be optimized.


### `FootprintScore` module

The `FootprintScore` module has been created to handle the carbon footprint calculation and storage.

I'm not very confident in the way the module is organized, and I'm not sure if the `FootprintScoreService` class is the right place to handle the calculation. It may be better to have a dedicated class, completely unrelated to either `NestJS` or `TypeORM` for the calculation. I'm not sure what are the best practices in this case.

### Rational

As this module is the most complex one, a dedicated section is provided to explain the choices made.

#### Requirements

This exercice defines the following requirement:

> 3/ Implement a POST endpoint to trigger the calculation and the saving in the database.

I understand this requirement as follows:

1. A user can upload a new food product.
2. A reply is immediately sent to the user with a `201` status code.
3. The carbon footprint calculation is triggered in the background.
4. The result of the calculation is stored in the database.
5. The result of the calculation can be retrieved by the user using a `GET` endpoint.

#### Solution candidates

Several solutions are possible to solve this problem:

1. **Synchronous calculation**:
   - The calculation is done synchronously in the controller.
   - The result is stored in the database.
   - The result is returned to the user.
   - This solution is simple but has the drawback of being slow.
   - The user has to wait for the calculation to be done before getting a reply.
   - This is not a good user experience.
   - Mostly, this **violate the implicit requirement** of having the calculation done in the background (if such requirement exists 😅).

2. **Asynchronous calculation**:
    - Upon sending the created product, the calculation is done asynchronously in the controller.
    - When calculation is done, the result is stored in the database.
    - The user can retrieve the result using a `GET` endpoint once the result is stored.
    - This solution is better as the user does not have to wait for the calculation to be done.
    - However in case of a server crash, the calculation may be lost, and there is no easy way to recover it.

3. **Asynchronous calculation using a persisted queue**:
    - Upon sending the created product, the calculation is done asynchronously in the controller.
    - The calculation is stored in a queue.
    - A worker is responsible for taking the calculation from the queue and storing the result in the database.
    - The user can retrieve the result using a `GET` endpoint once the result is stored.
    - This solution is the best as it ensures that the calculation is not lost in case of a server crash.
    - However, it is more complex to implement, as default queue integration in `NestJS` relies on `redis`: See https://docs.nestjs.com/techniques/queues
    - IMO, it also **violates the first requirement of the exercice** which is: `Stack: NestJs + TypeORM + Postgres`. Using `redis` would introduce a new technology in the stack.

4. **Pending inserts in SQL tables and polling**:
    - Upon creating a product in the SQL table, a trigger is fired and **inserts a row in a `pending_footprint_score` table**.
    - Every `n` seconds, a worker checks the `pending_footprint_score` table and calculates the carbon footprint for the products that are not yet calculated.
    - The result is stored in the `footprint_score` table.
    - The user can retrieve the result using a `GET` endpoint once the result is stored.
    - This solution is a compromise between the previous two solutions.
    - It is more complex to implement than the first solution, but it is simpler than the third solution.
    - It is also **more aligned with the first requirement of the exercice** which is: `Stack: NestJs + TypeORM + Postgres`.
    - While it may not seem very elegant, this is battle tested, and this is a very easy solution to understand.
    - `TypeORM` migrations allows defining triggers, so this is transparent to the developer.
    - This is the solution I have chosen to implement.

#### Retained solution

I have chosen to implement the fourth solution.

The `FootprintScore` module is organized as follows:

- `FootprintScoreContribution` entity:
  - This entity stores the result of the carbon footprint calculation for a **single ingredient**
  - It has a relation to the `FoodProduct` entity through the `IngredientQuantity` entity.
  - It has a relation to the `CarbonEmissionFactor` entity.

> I have chosen to store the result of the calculation for a single ingredient, as this is the most atomic unit of the calculation. This allows to store the result of the calculation for each ingredient, and then either using SQL or on client side sum the results to get the total carbon footprint of the product and the percentage of each ingredient in the total carbon footprint.

- `PendingFootprintScore` entity:
  - This entity designates the need for a calculation of the carbon footprint for either a **single food product** or **all products using a specific ingredient**.
  - It has a relation to the `FoodProduct` entity.
  - It has a relation to the `CarbonEmissionFactor` entity.
  - It has a `status` field to indicate if the calculation is pending, in progress or failed.
  - It has a `created_at` field to indicate when the calculation was requested.
  - It has a `last_udpdate` field to indicate when the calculation was last updated.

The lifecycle of a calculation is as follows:

1. A user creates/deletes a food product OR a carbon emission factor.
2. A trigger is fired and inserts a row in the `pending_footprint_score` table.
3. A worker checks the `pending_footprint_score` table and calculates the carbon footprint for the products that are not yet calculated.
4. The result is stored in the `footprint_score` table.
5. The user can retrieve the result using a `GET` endpoint once the result is stored.

##### Benefits

- The calculation is done in the background.
- The calculation is not lost in case of a server crash.
- The calculation still hapens in Typescript within the `NestJS` application, we're not using a complex `plsql` function.
- The polling mechanism is simple to implement and understand. It even supports having multiple workers if needed thanks to `FOR UPDATE SKIP LOCKED` SQL statement.
- The calculation is done for each ingredient, which allows to have a detailed representation of the carbon footprint of the product (`ReadFootprintScoreDto`).

##### Limitations

###### Testing

- Due to lack of time, the retained solution is not tested.

- However, even given some time, the solution may prove to be tedious to test, as only integration tests can be used to validate the solution, and they tend to be quite slow.

###### Units conversion

The requirement states:

> The Agrybalise carbon footprint of one ingredient is obtained by multiplying the quantity of the ingredient by the emission of a matching emission factor (same name and same unit).

However very few effort have been made to guarantee that the `CarbonEmissionFactor` and `Ingredient` entities are using the same units.

A pure function should be created to convert a factor value with a unit into a target unit. Both factor unit and target unit must be valid unit in the `UnitT` type.

Example: a function `convertFactor` that takes a `CarbonEmissionFactor` entity and an `Ingredient` entity and returns the factor value in the ingredient unit.


Assuming that we validate on creation that:

- `CarbonEmissionFactor` entities have a valid unit.
- `Ingredient` entities have a valid unit.
- `IngredientQuantity` entities have their quantities transformed into the unit of the ingredient in database.

We can allow carbon emission factors and ingredients to have different units.

However, I'm not sure to understand the need to save units into the database. Assuming that ALL units are weights, and can be converted into `kg`, I would rather have a field in database `quantityInKg` and let my DTO handle any conversion required. This way, there would be no risk of having different units in the database, and it would simplify the computation of the carbon footprint.

As this design would break the existing database schema, I decided not to implement it, and to keep the units in the database, while implementing a "dummy" solution at the moment with clearly identified risks.

###### Polling error handling

The error handling is very basic. If the calculation fails, the `status` field of the `PendingFootprintScore` entity is never updated and stays into `pending` state. This is a limitation of the current implementation.

It's not possible to explicitely mark a calculation as `failed` from the worker. This should be implemented.

An additional worker should be implemented to handle the "locked" calculations and update the `status` field to `failed`.

An additional worker should be implemented ot handle the "failed" calculations and update the `status` field to `processing` before either retrying the calculation or deleting the calculation (if it's not desirable to retry).

In total, it means that 3 workers should be implemented:

- Pending to Processing or Failed => Perform the calculation and store the result
- Processing to Failed => No additional logic, only mark "locked" calculations as "failed"
- Failed to Processing => Retry the calculation or delete the calculation

With this, the system would be more robust and would handle errors more gracefully.


### Developer Tools

- [x] OpenAPI documentation using `@nest/swagger`.
- [x] Developer documentation using `compodoc`.

### Modules

- [x] `FoodProductModule` to handle the food product CRUD operations.

- [x] `FootprintScoreModule` to handle the carbon footprint calculation and storage.

Run `yarn docs` and open the `http://localhost:8080` to see the documentation for each module.

## About testing

The tests are not complete, and the e2e tests are not complete either.

The philosophy behind the tests is to test the happy path, and to test the most important features of the application.

Efforts have been made to avoid relying on implementation details in the tests, and to test the public API of the application. IMO, at the initial stage of a project, it is more important to have a good coverage of the public API than to have a good coverage of the implementation details.

One major downside is that tests rely on a lot on infrastructure. Developers more experienced with TypeORM may be able to provide a better testing strategy.

## Further work

The following tasks are still pending:

- [ ] Provide unit test for `footprintScoreService`.
- [ ] Provide a way to compute coverage which includes the e2e tests.
- [ ] Provide a GitHub action to run the tests on PRs.
- [ ] Provide a pre-commit hook to format the code with prettier and type checking before commiting.
