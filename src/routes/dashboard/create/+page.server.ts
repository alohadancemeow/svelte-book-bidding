import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { books } from '$lib/server/db/schema';
import { auth } from '$lib/auth';
import { uploadFile } from './helpers';

export const actions = {
    createAuction: async (event) => {
        // Ensure user is authenticated
        const session = await auth.api.getSession({
            headers: event.request.headers,
        });
        const userId = session?.session?.userId;
        if (!userId) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await event.request.formData();
        const title = String(form.get('title') || '').trim();
        const author = String(form.get('author') || '').trim();
        const description = String(form.get('description') || '').trim();
        const startingPrice = Number(form.get('startingPrice') || 0);
        const condition = String(form.get('condition') || '').trim();
        const pages = Number(form.get('pages') || 0);
        const yearPublished = Number(form.get('yearPublished') || 0);
        const endDateMs = String(form.get('endDate') || '').trim();
        const file = form.get('file') as File;

        // console.log(file, 'file');

        // Basic validation
        if (!title || !author || !condition || !file) {
            return fail(400, { message: 'Missing required fields' });
        }
        if (startingPrice <= 0 || pages <= 0 || yearPublished <= 0 || !endDateMs) {
            return fail(400, { message: 'Invalid numeric fields or end date' });
        }

        // Upload the file to Supabase Storage
        const { fileKey, err } = await uploadFile({
            file,
            filekey: file.name,
            userId,
        });

        if (!fileKey || err) {
            console.log(err, "err");
            return fail(500, { message: 'Failed to upload file' });
        }

        const newAuction = {
            id: crypto.randomUUID(),
            name: title,
            author,
            userId,
            description,
            fileKey,
            currentBid: startingPrice,
            startingPrice,
            endDate: endDateMs,
            condition,
            yearPublished,
            pages,
            bidInterval: 100,
        };

        // console.log(newAuction, 'newAuction');

        // Create a new book record (auction)
        try {
            await db.insert(books).values({ ...newAuction, endDate: new Date(newAuction.endDate) });
        } catch (e) {
            console.error('Failed to create auction:', e);
            return fail(500, { message: 'Failed to create auction' });
        }

        // Redirect back to dashboard after creation
        throw redirect(303, '/dashboard');
    },
    deleteAuction: async (event) => {
        // TODO delete the auction
    }

} satisfies Actions;