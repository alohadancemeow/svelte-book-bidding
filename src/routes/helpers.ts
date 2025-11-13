import { supabase } from "$lib/supabase-client";
import { BUCKET_NAME } from "./dashboard/shared/constants";

export const getImage = ({ filekey }: { filekey: string }) => {
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl("asdw.jpg");

    return publicUrl
};