'use server'

import { requireSuperAdmin } from '../actions'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseAdmin(supabaseUrl, supabaseServiceKey)
}

export async function getAllInquiries() {
  await requireSuperAdmin()
  const adminClient = getServiceRoleClient()

  const { data: inquiries, error } = await adminClient
    .from('inquiries')
    .select(
      `
            id, type, title, content, status, response, created_at, updated_at, user_id
        `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch all inquiries:', error.message)
    return []
  }

  // We also need user emails. We can fetch all users and map them.
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()

  if (authError) {
    console.error('Failed to fetch auth users for inquiries:', authError.message)
    return inquiries
  }

  const userEmailMap = new Map()
  authData.users.forEach((u) => userEmailMap.set(u.id, u.email))

  const inquiriesWithEmails = inquiries.map((iq) => ({
    ...iq,
    user_email: userEmailMap.get(iq.user_id) || 'Unknown User'
  }))

  return inquiriesWithEmails
}

export async function replyToInquiry(formData: FormData) {
  await requireSuperAdmin()
  const adminClient = getServiceRoleClient()

  const inquiryId = formData.get('inquiryId') as string
  const responseText = formData.get('response') as string

  if (!inquiryId || !responseText) {
    throw new Error('Missing required fields')
  }

  const { error } = await adminClient
    .from('inquiries')
    .update({
      response: responseText,
      status: 'answered',
      updated_at: new Date().toISOString()
    })
    .eq('id', inquiryId)

  if (error) {
    throw new Error(`Failed to update inquiry: ${error.message}`)
  }

  revalidatePath('/super-admin/inquiries')
  return { success: true }
}
