import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { getImage } from "../../helpers";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
    const user = await locals.user;

    if (!user?.id) {
        redirect(302, '/auth/login')
        // return { bids: [] };
    }

    const myBids = await db.query.bids.findMany({
        where: (bids, { eq }) => eq(bids.userId, user.id),
        with: { item: true },
        orderBy: (b, { desc }) => [desc(b.createdAt)],
    });

    const seen = new Set<string | number>();
    const uniqueBids: typeof myBids = [];

    for (const b of myBids) {
        const itemId = b.item?.id as string | number | undefined;
        if (itemId == null) continue;

        if (seen.has(itemId)) continue;
        seen.add(itemId);

        if (b.item?.fileKey) {
            b.item.fileKey = getImage({ filekey: b.item.fileKey });
        }
        uniqueBids.push(b);
    }

    return { bids: uniqueBids };
};