import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getImage } from "../../helpers";

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    const book = await db.query.books.findFirst({
        where: (b, { eq }) => eq(b.id, id),
        with: {
            bids: {
                with: {
                    user: true,
                },
            },
            user: true,
        },

    });

    if (!book) {
        throw error(404, "Book not found");
    }

    // add imageUrl to each book
    book.fileKey = getImage({ filekey: book.fileKey });

    return { book };
};