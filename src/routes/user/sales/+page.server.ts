import { db } from "$lib/server/db";
import { getImage } from "../../helpers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.user;
    if (!user?.id) {
        return { books: [], stats: {} };
    }

    const myAuctions = await db.query.books.findMany({
        where: (b, { eq: eql }) => eql(b.userId, user.id),
        with: {
            bids: {
                with: { user: true },
            },
            user: true,
        },
        orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    myAuctions.forEach((b) => {
        b.fileKey = getImage({ filekey: b.fileKey });
    });

    const now = Date.now();
    const endedAuctions = myAuctions.filter((b) => new Date(b.endDate).getTime() <= now);
    const awaitingPayment = endedAuctions.filter((b) => (b.currentBid || 0) > 0);
    const pendingPaymentValue = awaitingPayment.reduce((a, c) => a + (c.currentBid || 0), 0);

    const myBids = await db.query.bids.findMany({
        where: (b, { eq: eql }) => eql(b.userId, user.id),
        with: { item: true },
        orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    const seen = new Set<string | number>();
    const myWonItems: (typeof myBids[number]['item'])[] = [];

    for (const bid of myBids) {
        const item = bid.item;
        if (!item) continue;

        const itemId = item.id as string | number | undefined;
        if (itemId == null || seen.has(itemId)) continue;
        
        const isEnded = new Date(item.endDate).getTime() <= now;
        const isWinner = (bid.amount || 0) === (item.currentBid || 0);
        if (isEnded && isWinner) {
            if (item.fileKey) item.fileKey = getImage({ filekey: item.fileKey });
            myWonItems.push(item);
            seen.add(itemId);
        }
    }

    const stats = {
        endedCount: endedAuctions.length,
        pendingPaymentCount: awaitingPayment.length,
        pendingPaymentValue,
        wonCount: myWonItems.length,
    };

    return { books: endedAuctions, awaitingPayment, myWonItems, stats };
};