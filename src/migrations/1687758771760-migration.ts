import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687758771760 implements MigrationInterface {
    name = 'migration1687758771760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD \`transactionId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD UNIQUE INDEX \`IDX_e6cc60d832ca3fe0a96add5493\` (\`transactionId\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_e6cc60d832ca3fe0a96add5493\` ON \`book_copy\` (\`transactionId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD CONSTRAINT \`FK_e6cc60d832ca3fe0a96add5493d\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP FOREIGN KEY \`FK_e6cc60d832ca3fe0a96add5493d\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_e6cc60d832ca3fe0a96add5493\` ON \`book_copy\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP INDEX \`IDX_e6cc60d832ca3fe0a96add5493\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP COLUMN \`transactionId\`
        `);
    }

}
