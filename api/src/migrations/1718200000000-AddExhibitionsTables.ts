import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExhibitionsTables1718200000000 implements MigrationInterface {
  name = 'AddExhibitionsTables1718200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "exhibitions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "location" character varying,
        "virtualLink" character varying,
        "galleryId" uuid NOT NULL,
        "isClosed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exhibitions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_exhibitions_gallery" FOREIGN KEY ("galleryId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "exhibition_artworks" (
        "exhibitionId" uuid NOT NULL,
        "artworkId" uuid NOT NULL,
        CONSTRAINT "PK_exhibition_artworks" PRIMARY KEY ("exhibitionId", "artworkId"),
        CONSTRAINT "FK_exhibition_artworks_exhibition" FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_exhibition_artworks_artwork" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."loans_status_enum" AS ENUM ('ACTIVE', 'RETURNED')
    `);

    await queryRunner.query(`
      CREATE TABLE "loans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "artworkId" uuid NOT NULL,
        "fromGalleryId" uuid NOT NULL,
        "toGalleryId" uuid NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "conditions" text,
        "status" "public"."loans_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_loans" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loans_artwork" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_loans_fromGallery" FOREIGN KEY ("fromGalleryId") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_loans_toGallery" FOREIGN KEY ("toGalleryId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loans_artworkId" ON "loans" ("artworkId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_loans_artworkId"`);
    await queryRunner.query(`DROP TABLE "loans"`);
    await queryRunner.query(`DROP TYPE "public"."loans_status_enum"`);
    await queryRunner.query(`DROP TABLE "exhibition_artworks"`);
    await queryRunner.query(`DROP TABLE "exhibitions"`);
  }
}
