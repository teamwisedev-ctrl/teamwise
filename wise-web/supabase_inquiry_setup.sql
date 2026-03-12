-- 1:1 Inquiry Board Table Setup

CREATE TABLE public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- e.g., '결제/환불', '기술지원', '기타'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'answered'
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own inquiries
CREATE POLICY "Users can view own inquiries" ON public.inquiries
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own inquiries
CREATE POLICY "Users can insert own inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Super Admin requires Service Role Key to view ALL and UPDATE responses,
-- so no additional RLS policies are needed for the Super Admin (they bypass RLS).
