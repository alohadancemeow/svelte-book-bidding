import type { bids, books } from "$lib/server/db/schema";
import { supabase } from "$lib/supabase-client";
import { BUCKET_NAME } from "./dashboard/shared/constants";
import type { InferSelectModel } from "drizzle-orm";

export const getImage = ({ filekey }: { filekey: string }) => {
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filekey);

    return publicUrl
};

export interface Auction {
    id: string;
    title: string;
    author: string;
    description: string;
    currentPrice: number;
    startingPrice: number;
    status: "active" | "ending-soon" | "ended";
    bidsCount: number;
    endDate: string;
    image: string;
}

type BookRow = InferSelectModel<typeof books>;
type BidRow = InferSelectModel<typeof bids>;
export type BooksWithBids = BookRow & { bids: BidRow[] };

export function mapBooksToAuctions(books: BooksWithBids[]): Auction[] {

    return books.map((book) => {
        const endMs = new Date(book.endDate).getTime();
        const diffMs = endMs - Date.now();

        return {
            id: book.id,
            title: book.name,
            author: book.author,
            description: book.description || "",
            currentPrice: book.currentBid,
            startingPrice: book.startingPrice,
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
        };
    });
}