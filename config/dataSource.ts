import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from "dotenv";
import { join } from "path";
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: ".env" });

const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  port: parseInt(
    `${process.env.NODE_ENV === "test" ? process.env.DATABASE_TEST_PORT : process.env.DATABASE_PORT}`,
  ),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
  entities: [join(__dirname, "../src/**/*.entity.{js,ts}")],
  migrations: [join(__dirname, "../migrations", "*.*")],
  migrationsTableName: "migrations",
  migrationsRun: process.env.MIGRATIONS_RUN === "true",
};

export const typeorm = registerAs("typeorm", () => dataSourceOptions);

export class GreenlyDataSource {
  private static dataSource: DataSource;
  private static testDataSource: DataSource;

  public static getInstance() {
    if (process.env.NODE_ENV === "test") {
      if (this.testDataSource) {
        console.log(`testDataSource already set for ${process.env.NODE_ENV}`);
        return this.testDataSource;
      }
      this.testDataSource = new DataSource(dataSourceOptions);

      return this.testDataSource;
    }
    if (this.dataSource) {
      console.log(`dataSource already set for ${process.env.NODE_ENV}`);
      return this.dataSource;
    }
    this.dataSource = new DataSource(dataSourceOptions);

    return this.dataSource;
  }

  public static async cleanDatabase(): Promise<void> {
    try {
      const entities = dataSource.entityMetadatas;
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(", ");

      await dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
    } catch (error) {
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    }
  }
}

export const dataSource = GreenlyDataSource.getInstance();
