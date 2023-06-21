import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687164800217 implements MigrationInterface {
    name = 'migration1687164800217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`first_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`last_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`firstName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`lastName\` varchar(255) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`lastName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`firstName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`last_name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`first_name\` varchar(255) NOT NULL
        `);
    }

}
