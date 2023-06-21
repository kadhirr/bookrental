import { Book, User } from "./app/entities";

enum UserRole {
    USER = 0,
    STAFF = 1,
    ADMIN = 2
}

type CleanedUser = Partial<User>

type CleanedBookCopy = {
    tagId: string,
    user: CleanedUser,
    book: Book
}

export { UserRole, CleanedBookCopy, CleanedUser };