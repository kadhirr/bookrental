import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687244636003 implements MigrationInterface {
    name = 'migration1687244636003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD \`userId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD CONSTRAINT \`FK_396210e231b33dc0a5b6eb7fb09\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP FOREIGN KEY \`FK_396210e231b33dc0a5b6eb7fb09\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP COLUMN \`userId\`
        `);
    }

}
