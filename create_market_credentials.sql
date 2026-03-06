-- 이 SQL을 Supabase 대시보드 -> SQL Editor 탭에 붙여넣고 RUN(실행) 하시면 됩니다.

CREATE TABLE IF NOT EXISTS public.market_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    market_type TEXT NOT NULL,
    mall_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    access_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(market_type, mall_id)
);

-- (선택) 보안을 위해 RLS 활성화. 
-- 저희 서버(Next.js)는 보안키(Service Role Key)를 사용하므로 RLS의 영향을 받지 않고 자유롭게 기록이 가능합니다.
ALTER TABLE public.market_credentials ENABLE ROW LEVEL SECURITY;
