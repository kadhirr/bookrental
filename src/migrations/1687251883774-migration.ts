import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687251883774 implements MigrationInterface {
    name = 'migration1687251883774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transaction\`
            ADD \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transaction\` DROP COLUMN \`date\`
        `);
    }

}
