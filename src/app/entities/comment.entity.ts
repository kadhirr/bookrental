// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity()
export class Comment extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;


  @ManyToOne(() => Book, (book) => book.comments)
  book: Book

}
