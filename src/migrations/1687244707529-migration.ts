import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687244707529 implements MigrationInterface {
    name = 'migration1687244707529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_29a3d19e7e77ba15bbe8db3b872\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`rentedBooksTagId\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`rentedBooksTagId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_29a3d19e7e77ba15bbe8db3b872\` FOREIGN KEY (\`rentedBooksTagId\`) REFERENCES \`book_copy\`(\`tagId\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
