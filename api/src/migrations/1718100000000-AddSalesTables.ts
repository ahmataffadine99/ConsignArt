import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesTables1718100000000 implements MigrationInterface {
  name = 'AddSalesTables1718100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."invoices_type_enum" AS ENUM ('BUYER', 'ARTIST')
    `);

    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "artworkId" uuid NOT NULL,
        "buyerId" uuid NOT NULL,
        "salePrice" numeric(10,2) NOT NULL,
        "commissionRate" numeric(5,2) NOT NULL,
        "commissionAmount" numeric(10,2) NOT NULL,
        "artistBalance" numeric(10,2) NOT NULL,
        "saleDate" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sales" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sales_artwork" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_sales_buyer" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "saleId" uuid NOT NULL,
        "type" "public"."invoices_type_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "generatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invoices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoices_sale" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sales_artworkId" ON "sales" ("artworkId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sales_buyerId" ON "sales" ("buyerId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sales_buyerId"`);
    await queryRunner.query(`DROP INDEX "IDX_sales_artworkId"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TYPE "public"."invoices_type_enum"`);
  }
}
