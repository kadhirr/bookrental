// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column()
  rentalStart: Date;

  @Column()
  rentalEnd: Date;

  @Column()
  duration: number;

  @Column()
  amount: number;

}
