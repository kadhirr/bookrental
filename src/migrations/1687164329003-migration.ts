import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687164329003 implements MigrationInterface {
    name = 'migration1687164329003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`book_copy\` (
                \`tagId\` varchar(255) NOT NULL,
                \`bookId\` int NOT NULL,
                PRIMARY KEY (\`tagId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`role\` varchar(255) NOT NULL,
                \`isBanned\` tinyint NOT NULL,
                \`rentedBooksTagId\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`authorId\` int NOT NULL,
                \`bookId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`book\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`price\` int NOT NULL,
                \`author\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`transaction\` (
                \`id\` varchar(36) NOT NULL,
                \`rentalStart\` datetime NOT NULL,
                \`rentalEnd\` datetime NOT NULL,
                \`duration\` int NOT NULL,
                \`amount\` int NOT NULL,
                \`bookCopyTagId\` varchar(255) NOT NULL,
                \`userId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\`
            ADD CONSTRAINT \`FK_8639f9a7d3293fad88c8fd3c43d\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_29a3d19e7e77ba15bbe8db3b872\` FOREIGN KEY (\`rentedBooksTagId\`) REFERENCES \`book_copy\`(\`tagId\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_9eb8ce066f46b656be75d847150\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\`
            ADD CONSTRAINT \`FK_9feeff8a41284a44a2d6b27aacf\` FOREIGN KEY (\`bookCopyTagId\`) REFERENCES \`book_copy\`(\`tagId\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\`
            ADD CONSTRAINT \`FK_605baeb040ff0fae995404cea37\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_605baeb040ff0fae995404cea37\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_9feeff8a41284a44a2d6b27aacf\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_9eb8ce066f46b656be75d847150\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_29a3d19e7e77ba15bbe8db3b872\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book_copy\` DROP FOREIGN KEY \`FK_8639f9a7d3293fad88c8fd3c43d\`
        `);
        await queryRunner.query(`
            DROP TABLE \`transaction\`
        `);
        await queryRunner.query(`
            DROP TABLE \`book\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comment\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`book_copy\`
        `);
    }

}
