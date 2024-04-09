import { MigrationInterface, QueryRunner } from "typeorm";

export class FootprintScore1712606100954 implements MigrationInterface {
    name = 'FootprintScore1712606100954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pending_footprint_score" ("id" SERIAL NOT NULL, "product_id" integer, "factor_id" integer, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "last_update" TIMESTAMP NOT NULL, CONSTRAINT "PK_506eded0c80c88c51380468b482" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_36c6f62014ef3cfa17e369a14c" ON "pending_footprint_score" ("status") `);
        await queryRunner.query(`ALTER TABLE "pending_footprint_score" ADD CONSTRAINT "FK_e0698e7d391b838bfe7759e0a16" FOREIGN KEY ("product_id") REFERENCES "food_product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pending_footprint_score" ADD CONSTRAINT "FK_cafa11a97c8d4e451c1c16d37b4" FOREIGN KEY ("factor_id") REFERENCES "carbon_emission_factors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pending_footprint_score" DROP CONSTRAINT "FK_cafa11a97c8d4e451c1c16d37b4"`);
        await queryRunner.query(`ALTER TABLE "pending_footprint_score" DROP CONSTRAINT "FK_e0698e7d391b838bfe7759e0a16"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36c6f62014ef3cfa17e369a14c"`);
        await queryRunner.query(`DROP TABLE "pending_footprint_score"`);
    }

}
