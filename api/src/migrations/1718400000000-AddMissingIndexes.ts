import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexes1718400000000 implements MigrationInterface {
  name = 'AddMissingIndexes1718400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX "IDX_artworks_status" ON "artworks" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_role" ON "users" ("role")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_artists_userId" ON "artists" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_artists_galleryId" ON "artists" ("galleryId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_artists_galleryId"`);
    await queryRunner.query(`DROP INDEX "IDX_artists_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_users_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_artworks_status"`);
  }
}
