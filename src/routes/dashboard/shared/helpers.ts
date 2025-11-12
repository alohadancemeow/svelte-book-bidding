import { supabase } from "$lib/supabase-client";
import { BUCKET_NAME } from "./constants";

export const uploadFile = async ({ file, filekey, userId }: { file: File, filekey: string, userId: string }) => {
    // Check if user is authenticated
    if (!userId) {
        throw new Error('User not authenticated');
    }

    if (!filekey || !file) {
        throw new Error('File key and file are required');
    }

    // check  size be less than 5MB
    if (file.size > 5 * 1024 * 1024) {
        return { err: 'File size must be less than 5MB' };
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filekey, file, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
    });

    if (error) {
        console.log(error, "error");
        return { err: error.message };
    }

    return {
        fileKey: data.path,
    };
}

// Delete file from Supabase Storage
export const deleteFile = async (fileKey: string) => {
    if (!fileKey) {
        throw new Error('File key is required');
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileKey]);

    if (error) {
        console.log(error, "error");
        return { err: error.message };
    }

    return {
        message: 'File deleted successfully',
    };
}