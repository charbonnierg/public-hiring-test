# How to use

Stack: NestJs + TypeORM + Postgres

## Requirements

- Docker / Docker Compose
- Node.js 18

## Installation

```bash
$ npm i
```

## Running the app

First you need to start, migrate and seed the db :

```bash
$ npm run init-project
```

you can then start the server:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

To run unit tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage (unit tests only)
$ npm run test:cov

# test coverage (unit tests and e2e tests)
$ npm run test:covall
```

## Database Migration

When the data schema is updated, the database needs to be synchronised with the code. This is done by creating a migration with Typeorm using the following command:

```bash
migrationName=<name> npm run migration:generate
```

# Hiring Test

When working on the following exercise, in addition to answering the product need, to give particular attention to the following points:

- Readability
- Maintainability
- Unit testing
- Handling of corner cases
- Error-handling

We want to compute the Agrybalise carbonfootprint of a foodproduct (e.g.: a hamCheesePizza) that we characterize by its ingredients as shown below

```js
const hamCheesePizza = {
  ingredients: [
    { name: "ham", quantity: 0.1, unit: "kg" },
    { name: "cheese", quantity: 0.15, unit: "kg" },
    { name: "tomato", quantity: 0.4, unit: "kg" },
    { name: "floor", quantity: 0.7, unit: "kg" },
    { name: "oliveOil", quantity: 0.3, unit: "kg" },
  ],
};
```

The calculation of the Agrybalise carbon footprint can be described as below:

- The Agrybalise carbon footprint of one ingredient is obtained by multiplying the quantity of the ingredient by the emission of a matching emission factor (same name and same unit).
- The carbon footprint of the food product is then obtained by summing the carbon footprint of all ingredients.
- If the carbon footprint of one ingredient cannot be calculated, then the carbon footprint of the whole product is set to null.

The tasks of this exercice are as follows:
1/ Implement the carbon footprint calculation of a product and persist the results in database.
2/ Implement a GET endpoint to retrieve the result.
3/ Implement a POST endpoint to trigger the calculation and the saving in the database.
