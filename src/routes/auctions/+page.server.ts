import { db } from "$lib/server/db";
import { getImage } from "../helpers";

export const load = async ({ }) => {
    // load book auctions
    const books = await db.query.books.findMany({
        with: {
            bids: true,
        }
    });

    // add imageUrl to each book
    books.forEach((book) => {
        book.fileKey = getImage({ filekey: book.fileKey });
    })

    return { books }
}