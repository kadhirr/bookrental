import { ApiUseTag, Context, Delete, Get, HttpResponseForbidden, HttpResponseInternalServerError, HttpResponseNotFound, HttpResponseOK, Post, ValidateBody, ValidatePathParam, ValidateQueryParam, controller } from '@foal/core';
import { Book, BookCopy, Transaction, User } from '../../entities';
import { IsNull, Like } from 'typeorm';
import { JWTRequired } from '@foal/jwt';
import { dataSource } from '../../../db';
import { AdminRequired, StaffRequired } from '../../hooks';
import { CleanedBookCopy, CleanedUser } from '../../../types';

function cleanBookCopy(bc: BookCopy) {
  if (!bc.user) return bc;
  let { password, isBanned, ...user } = bc.user;
  return {
    tagId: bc.tagId,
    book: bc.book,
    user
  }
}

@ApiUseTag("Books")
export class BookController {

  @Get('/')
  @ValidateQueryParam('name', { type: 'string' }, { required: false })
  @ValidateQueryParam('author', { type: 'string' }, { required: false })
  async getAllBooks(ctx: Context) {
    const bookname = ctx.request.query.name || "";
    const authorname = ctx.request.query.author || "";
    const books = await Book.createQueryBuilder('book')
      .where('name LIKE :name', { name: `%${bookname}%` })
      .andWhere('author LIKE :author', { author: `%${authorname}%` })
      .getMany();
    console.log(books);
    return new HttpResponseOK({ books });
  }

  @Get('/:bookId')
  @ValidatePathParam("bookId", { type: 'number' })
  async getBook(ctx: Context, { bookId }: { bookId: number }) {
    const book = await Book.findOneBy({ id: bookId });

    if (!book) {
      return new HttpResponseNotFound();
    }

    const copies = await BookCopy.count({
      where: {
        book: {
          id: bookId
        },
        user: IsNull()
      }
    });

    console.log(copies, "Copies");

    return new HttpResponseOK({
      ...book,
      remaining: copies
    })

  }

  @Post('/:bookId/rent')
  @ValidatePathParam("bookId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async rentBook(ctx: Context<User>, { bookId }: { bookId: number }) {
    try {
      // Check if user already has one copy of book
      const userBookCopies = await BookCopy.find({
        relations: {
          book: true,
          user: true
        },
        where: {
          user: {
            id: ctx.user.id
          }
        }
      })

      console.log("User Books", userBookCopies);

      if (userBookCopies.findIndex((e) => e.book.id == bookId) !== -1) {
        return new HttpResponseForbidden({
          error: "User already has one copy of the book"
        })
      }

      // Check if user has borrowed more than 2 book
      if (userBookCopies.length >= 2) {
        return new HttpResponseForbidden({
          error: "User already has borrowed max number of books"
        })
      }

      const book = await BookCopy.findOne({
        relations: {
          book: true
        },
        where: {
          book: {
            id: bookId
          }
        }
      });

      if (!book) {
        return new HttpResponseNotFound({
          error: "No more copies of this book available"
        })
      }

      book.user = ctx.user;



      const transaction = new Transaction();
      transaction.bookCopy = book;
      transaction.user = ctx.user;
      transaction.rentalStart = new Date();

      // Start a transaction to save data
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await book.save();
        await transaction.save();

        await queryRunner.commitTransaction();
      }
      catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

    } catch (e: any) {
      console.log(e);
      return new HttpResponseInternalServerError();
    }

    return new HttpResponseOK();
  }

  @Post('/:bookId/return')
  @ValidatePathParam("bookId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async returnBook(ctx: Context<User>, { bookId }: { bookId: number }) {
    const newTransaction = new Transaction();
    try {
      const bookcopy = await BookCopy.findOne({
        relations: {
          book: true
        },
        where: {
          book: {
            id: bookId
          },
          user: {
            id: ctx.user.id
          }
        }

      });

      if (!bookcopy) {
        return new HttpResponseForbidden({ error: "You haven't borrowed this book" })
      }

      const prevTransaction = await Transaction.findOne({
        relations: {
          bookCopy: true
        },
        where: {
          bookCopy: {
            book: {
              id: bookId
            }
          },
          user: {
            id: ctx.user.id
          }
        },
        order: {
          rentalStart: "DESC"
        }
      });

      if (!prevTransaction) {
        return new HttpResponseInternalServerError();
      }

      bookcopy.user = null;

      const prevDuration = prevTransaction.duration || 0;

      const msSinceRent = (new Date().getTime()) - prevTransaction.rentalStart.getTime();
      let daysSinceRent = Math.ceil(msSinceRent / (1000 * 3600 * 24));

      newTransaction.bookCopy = prevTransaction.bookCopy;
      newTransaction.rentalEnd = new Date();
      newTransaction.user = ctx.user;
      newTransaction.duration = (daysSinceRent + prevDuration);
      newTransaction.amount = Math.ceil((daysSinceRent + prevDuration) / 30) * bookcopy.book.price;

      // If you had the book for more than 30 days since last rental, or total duration
      // of book rental is greater than 90 days, add fine
      if (daysSinceRent + prevDuration > 90 || daysSinceRent > 30) {
        newTransaction.amount += 20;
      }
      console.log(bookcopy);
      console.log(prevTransaction);
      console.log(newTransaction);
      // Start a transaction to save data
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await bookcopy.save();
        await newTransaction.save();

        await queryRunner.commitTransaction();
      }
      catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }


    } catch (error: any) {
      console.log(error);
      return new HttpResponseInternalServerError();
    }

    return new HttpResponseOK({
      duration: newTransaction.duration,
      amount: newTransaction.amount
    })
  }

  @Post('/:bookId/renew')
  @ValidatePathParam("bookId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async renewBook(ctx: Context<User>, { bookId }: { bookId: number }) {
    const newTransaction = new Transaction();
    try {
      const bookcopy = await BookCopy.findOne({
        relations: {
          book: true
        },
        where: {
          book: {
            id: bookId
          },
          user: {
            id: ctx.user.id
          }
        }

      });

      if (!bookcopy) {
        return new HttpResponseForbidden({ error: "You haven't borrowed this book" })
      }

      const prevTransaction = await Transaction.findOne({
        where: {
          bookCopy: {
            book: {
              id: bookId
            }
          },
          user: {
            id: ctx.user.id
          }
        },
        order: {
          rentalStart: "DESC"
        }
      });

      if (!prevTransaction) {
        return new HttpResponseInternalServerError();
      }


      const prevDuration = prevTransaction.duration || 0;

      const msSinceRent = (new Date().getTime()) - prevTransaction.rentalStart.getTime();
      let daysSinceRent = Math.ceil(msSinceRent / (1000 * 3600 * 24));

      newTransaction.bookCopy = prevTransaction.bookCopy;
      newTransaction.rentalEnd = new Date();
      newTransaction.user = ctx.user;
      newTransaction.duration = (daysSinceRent + prevDuration);

      if ((daysSinceRent + prevDuration) >= 90 || daysSinceRent > 30) {
        return new HttpResponseForbidden({
          error: "Cannot Renew Book due to late submission/maximum renewals. Please return book."
        })
      }


      // Start a transaction to save data
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await bookcopy.save();
        await newTransaction.save();

        await queryRunner.commitTransaction();
      }
      catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }


    } catch (error: any) {
      console.log(error);
      return new HttpResponseInternalServerError();
    }
    const nowDate = new Date();
    nowDate.setDate(nowDate.getDate() + 30)


    return new HttpResponseOK({
      maxReturnDate: nowDate.toDateString()
    })
  }

  @Get("/:bookId/tags")
  @ValidatePathParam("bookId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async getBookCopies(ctx: Context<User>, { bookId }: { bookId: number }) {

    const book = await Book.findOneBy({ id: bookId })

    if (!book) {
      return new HttpResponseNotFound({ error: "No Book with the given ID" })
    }
    const bookCopies = await BookCopy.createQueryBuilder("book_copy")
      .leftJoinAndSelect("book_copy.user", "user")
      .leftJoinAndSelect("book_copy.book", "book")
      // .leftJoinAndSelect("transaction.bookCopyTagId", "tagId")
      .where("bookId = :bookId", { bookId })
      .getMany();

    // Remove Unnecessary Fields
    let cleanedBookCopies = bookCopies.map(cleanBookCopy);

    return new HttpResponseOK(cleanedBookCopies);
  }

  @Get("/tags/:tagId")
  @ValidatePathParam("tagId", { type: 'string' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async getCopyDetails(ctx: Context<User>, { bookId, tagId }: { bookId: number, tagId: string }) {

    const bookCopy = await BookCopy.createQueryBuilder("book_copy")
      .leftJoinAndSelect("book_copy.user", "user")
      .leftJoinAndSelect("book_copy.book", "book")
      // .leftJoinAndSelect("transaction.bookCopyTagId", "tagId")
      .where("tagId = :tagId", { tagId })
      .getOne();

    if (!bookCopy) {
      return new HttpResponseNotFound();
    }

    return new HttpResponseOK(cleanBookCopy(bookCopy))

  }

  @Post('/:bookId/tags')
  @ValidateBody({
    additionalProperties: false,
    properties: {
      tagId: { type: 'string' },
      bookId: { type: 'number' }
    },
    required: ['tagId', 'bookId'],
    type: 'object'
  })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async createNewCopy(ctx: Context<User>) {
    const book = await Book.findOneBy({ id: ctx.request.body.bookId })

    if (!book) {
      return new HttpResponseNotFound({ error: "No Book with the given ID" })
    }

    const copy = new BookCopy();
    copy.tagId = ctx.request.body.tagId;
    copy.book = book;
    try {
      await copy.save()
    } catch (e: any) {
      return new HttpResponseInternalServerError();
    }

    return new HttpResponseOK();
  }

  @Delete('/tag/:tagId')
  @ValidatePathParam("tagId", { type: 'string' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async deleteCopy(ctx: Context<User>, { tagId }: { tagId: string }) {
    const bookcopy = await BookCopy.findOneBy({ tagId })
    if (!bookcopy) {
      return new HttpResponseNotFound();
    }
    try {
      await bookcopy.remove();
    } catch (e: any) {
      return new HttpResponseInternalServerError();
    }

    return new HttpResponseOK();
  }

  @Delete('/:bookId')
  @ValidatePathParam("bookId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async deleteBook(ctx: Context<User>, { bookId }: { bookId: number }) {
    const book = await Book.findOneBy({ id: bookId })
    if (!book) {
      return new HttpResponseNotFound();
    }
    try {
      await book.remove();
    } catch (e: any) {
      if (e.errno == 1451) {
        return new HttpResponseForbidden({ error: "Remove book copies before deleting book." })
      }
      console.log(e)
      return new HttpResponseInternalServerError();
    }

    return new HttpResponseOK();
  }

}
