import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import { getImage } from "../../helpers";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.user;
    if (!user?.id) {
        redirect(302, '/auth/login')
        // return { books: [], stats: {} };
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

    const myPayments = await db.query.payments.findMany({
        where: (p, { eq }) => eq(p.userId, user.id),
    });

    const expenses = myPayments
        .filter((p) => ["paid", "succeeded", "completed"].includes(p.status))
        .reduce((a, c) => a + (c.amount || 0), 0);

    const sellerPayments = await db.query.payments.findMany({
        with: { item: true },
    });

    const salesRevenue = sellerPayments
        .filter((p) => p.item?.userId === user.id && ["paid", "succeeded", "completed"].includes(p.status))
        .reduce((a, c) => a + (c.amount || 0), 0);

    const stats = {
        pendingPaymentValue,
        expenses,
        salesRevenue,
    };

    return { books: endedAuctions, awaitingPayment, myWonItems, stats };
};
