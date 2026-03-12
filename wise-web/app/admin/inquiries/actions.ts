'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInquiries() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    // We fetch inquiries for the logged-in user only
    const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        // If the table doesn't exist yet, it'll throw an error
        console.error("Failed to fetch inquiries. Table might not exist yet:", error.message);
        return [];
    }

    return data;
}

export async function createInquiry(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!type || !title || !content) {
        throw new Error("모든 필드를 입력해주세요.");
    }

    const { error } = await supabase
        .from('inquiries')
        .insert([{ 
            user_id: user.id, 
            type, 
            title, 
            content 
        }]);

    if (error) {
        throw new Error(`문의 등록 실패: ${error.message}`);
    }

    revalidatePath('/admin/inquiries');
    return { success: true };
}
