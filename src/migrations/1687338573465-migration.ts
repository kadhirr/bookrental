import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687338573465 implements MigrationInterface {
    name = 'migration1687338573465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`role\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`role\` int NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`role\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`role\` varchar(255) NOT NULL
        `);
    }

}
