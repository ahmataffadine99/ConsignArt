import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArtworkStatusHistory1718300000000 implements MigrationInterface {
  name = 'AddArtworkStatusHistory1718300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."artwork_status_history_oldstatus_enum" AS ENUM ('AVAILABLE', 'ON_LOAN', 'SOLD', 'RETURNED')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."artwork_status_history_newstatus_enum" AS ENUM ('AVAILABLE', 'ON_LOAN', 'SOLD', 'RETURNED')
    `);

    await queryRunner.query(`
      CREATE TABLE "artwork_status_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "artworkId" uuid NOT NULL,
        "oldStatus" "public"."artwork_status_history_oldstatus_enum",
        "newStatus" "public"."artwork_status_history_newstatus_enum" NOT NULL,
        "changedById" character varying,
        "changedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_artwork_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_artwork_status_history_artwork" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_artwork_status_history_artworkId" ON "artwork_status_history" ("artworkId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_artwork_status_history_artworkId"`);
    await queryRunner.query(`DROP TABLE "artwork_status_history"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_status_history_newstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."artwork_status_history_oldstatus_enum"`);
  }
}
