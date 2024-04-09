import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { GreenlyDataSource, dataSource } from "../config/dataSource";
import { AppModule } from "../src/app.module";
import { CarbonEmissionFactor } from "../src/carbonEmissionFactor/carbonEmissionFactor.entity";
import { ReadCarbonEmissionFactorDto } from "../src/carbonEmissionFactor/dto/read-carbonEmissionFactor.dto";
import { getTestEmissionFactor } from "../src/seed-dev-data";

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
});

const readAllFactorsFromDb = async () =>
  await dataSource.getRepository(CarbonEmissionFactor).find();

const setFactorsInDb = async () =>
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save([getTestEmissionFactor("ham"), getTestEmissionFactor("beef")]);

describe("CarbonEmissionFactorsController", () => {
  let app: INestApplication;
  let allFactors: CarbonEmissionFactor[];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await setFactorsInDb();

    allFactors = await readAllFactorsFromDb();
  });

  afterEach(async () => {
    await app.close();
  });

  it("GET /carbon-emission-factors", async () => {
    return request(app.getHttpServer())
      .get("/carbon-emission-factors")
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          allFactors.map((factor) =>
            ReadCarbonEmissionFactorDto.fromEntity(factor),
          ),
        );
      });
  });

  describe("GET /carbon-emission-factors/:name", () => {
    it("should return 200 and carbon emission factor", async () => {
      return request(app.getHttpServer())
        .get("/carbon-emission-factors/ham")
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject(
            ReadCarbonEmissionFactorDto.fromEntity(
              getTestEmissionFactor("ham"),
            ),
          );
        });
    });
    it("should return 404 when carbon emission factor does not exist", async () => {
      return request(app.getHttpServer())
        .get("/carbon-emission-factors/unknown-factor")
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 404,
            error: "Not Found",
            message: ["carbon emission factor not found"],
          });
        });
    });
  });

  describe("DELETE /carbon-emission-factors/:name", () => {
    it("should return 204 and delete carbon emission factor", async () => {
      return request(app.getHttpServer())
        .delete("/carbon-emission-factors/ham")
        .expect(204)
        .expect(({ body }) => {
          expect(body).toEqual({});
        });
    });
    it("should return 404 when carbon emission factor does not exist", async () => {
      return request(app.getHttpServer())
        .delete("/carbon-emission-factors/unknown-factor")
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 404,
            error: "Not Found",
            message: ["carbon emission factor not found"],
          });
        });
    });
  });

  describe("POST /carbon-emission-factors", () => {
    it("should return 201 and create a new carbon emission factor", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(carbonEmissionFactorArgs)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toMatchObject(carbonEmissionFactorArgs);
        });
    });
    it("should return 400 if the request body is empty", async () => {
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send({})
        .expect(400);
    });
    it("should return 400 if the name is empty", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["name must be longer than or equal to 2 characters"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if the source is empty", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["source must be longer than or equal to 2 characters"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if emissionCO2eInKgPerUnit is negative", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: -12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["emissionCO2eInKgPerUnit must be a positive number"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if emissionCO2eInKgPerUnit is not a number", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: "not a number",
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: [
              "emissionCO2eInKgPerUnit must be a positive number",
              "emissionCO2eInKgPerUnit must be a number conforming to the specified constraints",
            ],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if unit is empty", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "",
        emissionCO2eInKgPerUnit: 12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["unit must be one of the following values: kg, oz"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if unit is not valid", async () => {
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "invalid",
        emissionCO2eInKgPerUnit: 12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors")
        .send(invalidCarbonEmissionFactorArgs)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["unit must be one of the following values: kg, oz"],
            statusCode: 400,
          });
        });
    });
  });

  describe("POST /carbon-emission-factors/bulk", () => {
    it("should return 201 and create a new carbon emission factor", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([carbonEmissionFactorArgs])
        .expect(201)
        .expect(({ body }) => {
          expect(body.length).toEqual(1);
          expect(body[0]).toMatchObject(carbonEmissionFactorArgs);
        });
    });
    it("should return 400 if the request body is empty", async () => {
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([{}])
        .expect(400);
    });
    it("should return 400 if one of the carbon emission factors name is empty", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([carbonEmissionFactorArgs, invalidCarbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["name must be longer than or equal to 2 characters"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if one of the carbon emission factors source is empty", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([invalidCarbonEmissionFactorArgs, carbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["source must be longer than or equal to 2 characters"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if one of the carbon emission factors emissionCO2eInKgPerUnit is negative", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: -12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([invalidCarbonEmissionFactorArgs, carbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["emissionCO2eInKgPerUnit must be a positive number"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if one of the carbon emission factors emissionCO2eInKgPerUnit is not a number", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: "not a number",
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([invalidCarbonEmissionFactorArgs, carbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: [
              "emissionCO2eInKgPerUnit must be a positive number",
              "emissionCO2eInKgPerUnit must be a number conforming to the specified constraints",
            ],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if one the carbon emission factors unit is empty", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "",
        emissionCO2eInKgPerUnit: 12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([invalidCarbonEmissionFactorArgs, carbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["unit must be one of the following values: kg, oz"],
            statusCode: 400,
          });
        });
    });
    it("should return 400 if one the carbon emission factors unit is not valid", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const invalidCarbonEmissionFactorArgs = {
        name: "Another test Carbon Emission Factor",
        unit: "invalid",
        emissionCO2eInKgPerUnit: 12,
        source: "Another Test Source",
      };
      return request(app.getHttpServer())
        .post("/carbon-emission-factors/bulk")
        .send([invalidCarbonEmissionFactorArgs, carbonEmissionFactorArgs])
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: "Bad Request",
            message: ["unit must be one of the following values: kg, oz"],
            statusCode: 400,
          });
        });
    });
  });
});
