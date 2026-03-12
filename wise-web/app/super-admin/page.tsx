import { getAllUsersData } from './actions';
import SuperAdminClient from './SuperAdminClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SuperAdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'mo2kr.team@gmail.com') {
        // Redirect unauthorized users to login or a safe page
        redirect('/login');
    }

    let initialUsers: any[] = [];
    try {
        initialUsers = await getAllUsersData();
    } catch (e) {
        console.error("Failed to fetch super admin data:", e);
    }

    return (
        <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
            <SuperAdminClient initialUsers={initialUsers} currentUserEmail={user.email} />
        </div>
    );
}
