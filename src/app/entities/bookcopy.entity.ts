// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity()
export class BookCopy extends BaseEntity {

  @PrimaryColumn()
  tagId: string;

  @Column()
  book: Book;

  @OneToMany(() => User, (user) => user.rentedBooks)
  user: User;


}
