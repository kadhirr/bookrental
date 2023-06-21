import { Book, BookCopy } from "../app/entities";
import { dataSource } from '../db';

export const schema = {
  additionalProperties: false,
  properties: {
    tagId: { type: 'string' },
    bookId: { type: 'number' }
  },
  required: [
    'tagId',
    'bookId'
  ],
  type: 'object',
};

type createBookCopyArgs = {
  tagId: string,
  bookId: number
}

export async function main(args: createBookCopyArgs) {
  await dataSource.initialize();

  try {
    const bookcopy = new BookCopy();
    bookcopy.tagId = args.tagId;

    const book = await Book.findOneBy({ id: args.bookId });

    if (!book) {
      console.log("No Book with ID found");
      return;
    }

    bookcopy.book = book;

    console.log(await bookcopy.save());
  } catch (error: any) {
    console.error(error.message);
  } finally {
    await dataSource.destroy();
  }
}
