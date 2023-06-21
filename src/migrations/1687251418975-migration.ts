import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687251418975 implements MigrationInterface {
    name = 'migration1687251418975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`rentalStart\` \`rentalStart\` datetime NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`rentalEnd\` \`rentalEnd\` datetime NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`duration\` \`duration\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`amount\` \`amount\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`amount\` \`amount\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`duration\` \`duration\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`rentalEnd\` \`rentalEnd\` datetime NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` CHANGE \`rentalStart\` \`rentalStart\` datetime NOT NULL
        `);
    }

}
