// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class BookCopy extends BaseEntity {

  @PrimaryColumn()
  tagId: string;

  @ManyToOne(() => Book, { nullable: false })
  book: Book;

  @ManyToOne(() => User, (user) => user.rentedBooks, { nullable: true })
  user: User | null;

  @OneToOne(() => Transaction, { nullable: true })
  @JoinColumn()
  transaction: Transaction | null;


}
