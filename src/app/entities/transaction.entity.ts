// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BookCopy } from './bookcopy.entity';
import { User } from './user.entity';

@Entity()
export class Transaction extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => BookCopy, { nullable: false })
  bookCopy: BookCopy;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @CreateDateColumn()
  date: Date;

  @Column({ nullable: true })
  rentalStart: Date;

  @Column({ nullable: true })
  rentalEnd: Date;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  amount: number;

}
