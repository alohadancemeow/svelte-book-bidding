import type { LayoutLoad } from './$types'
import { db } from '$lib/server/db';
import { BUCKET_NAME } from './dashboard/shared/constants';
import { supabase } from '$lib/supabase-client';

export const prerender = false;

export const load: LayoutLoad = async ({ }) => {
    // load book auctions
    const books = await db.query.books.findMany({
        with: {
            bids: true,
        }
    });

    // add imageUrl to each book
    books.forEach((book) => {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(book.fileKey);
        book.fileKey = publicUrl;
    })

    return { books }
}