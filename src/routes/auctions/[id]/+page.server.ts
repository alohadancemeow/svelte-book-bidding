import { db } from "$lib/server/db";
import { error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getImage } from "../../helpers";
import { bids, books } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

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


export const actions = {
    createBid: async ({ request, locals }) => {
        // Ensure user is authenticated
        const userId = await locals.session?.userId;

        if (!userId) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await request.formData();
        const bidAmount = Number(form.get('bidAmount'));
        const auctionId = String(form.get('auctionId'));

        if (!bidAmount || isNaN(bidAmount)) {
            return fail(400, { message: 'Invalid bid amount' });
        }

        try {
            // get bid from db
            const book = await db.query.books.findFirst({
                where: (b, { eq }) => eq(b.id, auctionId),
            });

            if (!book) {
                return fail(404, { message: 'Auction not found' });
            }

            // check if is bid over
            if (book.endDate < new Date()) {
                return fail(400, { message: 'This auction is over' });
            }

            const lastestBid = book.currentBid + bidAmount;

            // place a bid
            await db.insert(bids).values({
                id: crypto.randomUUID(),
                itemId: auctionId,
                userId,
                amount: lastestBid,
            });

            // update current bid
            await db.update(books).set({
                currentBid: lastestBid,
            }).where(eq(books.id, auctionId));

            // return success
            return {
                success: true,
                message: 'Bid placed successfully',
                bidAmount: lastestBid,
            };

        } catch (error) {
            console.error('Error creating bid:', error);
            return fail(500, { message: 'Internal server error' });
        }
    },

} satisfies Actions;