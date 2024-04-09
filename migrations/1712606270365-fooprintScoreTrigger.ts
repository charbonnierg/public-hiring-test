import { MigrationInterface, QueryRunner } from "typeorm";

export class FooprintScoreTrigger1712606270365 implements MigrationInterface {
  name = "fooprintScoreTrigger1712606270365";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION create_pending_score_from_product_update() RETURNS TRIGGER AS
    $$
    BEGIN
        INSERT INTO pending_footprint_score VALUES(DEFAULT,new.id,NULL,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
            RETURN new;
    END;
    $$ language plpgsql;

    CREATE OR REPLACE TRIGGER trig_food_product_update
        AFTER INSERT OR UPDATE ON "food_product"
        FOR EACH ROW
        EXECUTE PROCEDURE create_pending_score_from_product_update();
    `);
    await queryRunner.query(`CREATE OR REPLACE FUNCTION create_pending_score_from_factor_update() RETURNS TRIGGER AS
    $$
    BEGIN
        INSERT INTO pending_footprint_score VALUES(DEFAULT,NULL,new.id,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
        RETURN new;
    END;
    $$ language plpgsql;

    CREATE OR REPLACE TRIGGER trig_pending_carbon_emission_factors_update
        AFTER INSERT OR UPDATE ON "carbon_emission_factors"
        FOR EACH ROW
        EXECUTE PROCEDURE create_pending_score_from_factor_update();
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trig_food_product_update ON food_product;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS create_pending_entry_from_product;`
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trig_pending_carbon_emission_factors_update ON carbon_emission_factors;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS create_pending_entry_from_carbon_emission_factors;`
    );
  }
}
