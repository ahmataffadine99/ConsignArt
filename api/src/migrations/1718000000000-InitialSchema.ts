import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1718000000000 implements MigrationInterface {
    name = 'InitialSchema1718000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migration initiale générée
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'artist',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            );
        `);
        // Les autres tables (artists, artworks) seront ajoutées par synchronisation TypeORM en mode dev.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
