import { MigrationInterface, QueryRunner } from "typeorm";

export class FoodProductAndFootprintScore1712597786333 implements MigrationInterface {
    name = 'FoodProductAndFootprintScore1712597786333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food_ingredient" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "unit" character varying NOT NULL, CONSTRAINT "PK_af88dd2bae730924dd21ce9cce5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b428fefec8ac198c38efedbc69" ON "food_ingredient" ("name") `);
        await queryRunner.query(`CREATE TABLE "food_product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_398d3643b03f14a730b364c7515" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0c26a9b7c69877f3aed9ba4796" ON "food_product" ("name") `);
        await queryRunner.query(`CREATE TABLE "food_product_ingredient_quantity" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "ingredient_id" integer NOT NULL, "quantity" double precision NOT NULL, CONSTRAINT "PK_61dcc4f018831082d1145f90526" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carbon_footprint_contribution" ("factor_id" integer NOT NULL, "quantity_id" integer NOT NULL, "score" double precision NOT NULL, CONSTRAINT "PK_e3836e072005a2a70ef29a8f749" PRIMARY KEY ("factor_id", "quantity_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e3836e072005a2a70ef29a8f74" ON "carbon_footprint_contribution" ("factor_id", "quantity_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_57096ef561d0d6c1c357061321" ON "carbon_emission_factors" ("name") `);
        await queryRunner.query(`ALTER TABLE "food_product_ingredient_quantity" ADD CONSTRAINT "FK_ac2ebd20ba8316e1dae069ca7a2" FOREIGN KEY ("ingredient_id") REFERENCES "food_ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "food_product_ingredient_quantity" ADD CONSTRAINT "FK_65c1b513447cd89b226733629da" FOREIGN KEY ("product_id") REFERENCES "food_product"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "carbon_footprint_contribution" ADD CONSTRAINT "FK_059a74d780bcf450623419f4b0e" FOREIGN KEY ("factor_id") REFERENCES "carbon_emission_factors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carbon_footprint_contribution" ADD CONSTRAINT "FK_99a03e5419fe09ef29d07db1594" FOREIGN KEY ("quantity_id") REFERENCES "food_product_ingredient_quantity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carbon_footprint_contribution" DROP CONSTRAINT "FK_99a03e5419fe09ef29d07db1594"`);
        await queryRunner.query(`ALTER TABLE "carbon_footprint_contribution" DROP CONSTRAINT "FK_059a74d780bcf450623419f4b0e"`);
        await queryRunner.query(`ALTER TABLE "food_product_ingredient_quantity" DROP CONSTRAINT "FK_65c1b513447cd89b226733629da"`);
        await queryRunner.query(`ALTER TABLE "food_product_ingredient_quantity" DROP CONSTRAINT "FK_ac2ebd20ba8316e1dae069ca7a2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57096ef561d0d6c1c357061321"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3836e072005a2a70ef29a8f74"`);
        await queryRunner.query(`DROP TABLE "carbon_footprint_contribution"`);
        await queryRunner.query(`DROP TABLE "food_product_ingredient_quantity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c26a9b7c69877f3aed9ba4796"`);
        await queryRunner.query(`DROP TABLE "food_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b428fefec8ac198c38efedbc69"`);
        await queryRunner.query(`DROP TABLE "food_ingredient"`);
    }

}
