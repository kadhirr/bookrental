import { Book } from '../app/entities/book.entity';
import { dataSource } from '../db';

export const schema = {
  additionalProperties: false,
  properties: {
    name: { type: 'string', maxLength: 255 },
    price: { type: 'number' },
    author: { type: 'string', maxLength: 255 }
  },
  required: [
    'name',
    'price',
    'author'
  ],
  type: 'object',
};

type createBookArgs = {
  name: string,
  price: number,
  author: string
}

export async function main(args: createBookArgs) {
  await dataSource.initialize();

  try {
    const book = new Book();
    book.name = args.name;
    book.author = args.author;
    book.price = args.price;

    console.log(await book.save());
  } catch (error: any) {
    console.error(error.message);
  } finally {
    await dataSource.destroy();
  }
}
