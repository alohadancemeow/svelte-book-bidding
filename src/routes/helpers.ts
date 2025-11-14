import type { bids, books, user } from "$lib/server/db/schema";
import { supabase } from "$lib/supabase-client";
import { BUCKET_NAME } from "./dashboard/shared/constants";
import type { InferSelectModel } from "drizzle-orm";

export const getImage = ({ filekey }: { filekey: string }) => {
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filekey);

    return publicUrl
};


type BookRow = InferSelectModel<typeof books>;
type BidRow = InferSelectModel<typeof bids>;
type UserRow = InferSelectModel<typeof user>;

export type BidsWithUser = BidRow & { user: Partial<UserRow> };
export type BooksWithBids = BookRow & { bids: BidsWithUser[] } & { user: Partial<UserRow> };

export type Auction = Partial<Omit<BookRow, "endDate">> & {
    status: "active" | "ending-soon" | "ended";
    bidsCount: number;
    image: string;
    bids: (BidRow & { user: Partial<UserRow> })[];
    endDate: string;
}

export const mapBooksToAuctions = (books: BooksWithBids[]) => {
    return books.map((book) => {
        const endMs = new Date(book.endDate).getTime();
        const diffMs = endMs - Date.now();

        return {
            ...book,
            status: diffMs <= 0
                ? "ended"
                : diffMs < 5 * 60 * 60 * 1000
                    ? "ending-soon"
                    : "active",
            bidsCount: book.bids.length,
            image: book.fileKey || "",
            endDate: (() => {
                if (diffMs <= 0) return "Ended";

                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""}`;

                return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
            })(),
            bids: book.bids.map((bid) => ({
                ...bid,
                user: bid.user || {},
            })),
            user: book.user || {},
        };
    });
}