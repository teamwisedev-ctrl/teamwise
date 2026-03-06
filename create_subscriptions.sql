-- 이 SQL을 Supabase 대시보드 -> SQL Editor 탭에 붙여넣고 RUN(실행) 하시면 됩니다.

-- 유저별 구독(요금제) 정보를 저장하는 테이블 생성
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- 활성화된 모듈 ID (예: addon_coupang, pro_unlimited 등)
    plan_id TEXT NOT NULL,
    
    -- 구독 상태 (active, expired, canceled 등)
    status TEXT NOT NULL DEFAULT 'active',
    
    -- 현재 결제 주기 시작/종료일
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 동일한 유저가 동일한 플랜을 중복 결제하지 않도록 방지
    UNIQUE(user_id, plan_id)
);

-- (선택) 보안을 위해 RLS 활성화. 
-- 저희 서버(Next.js)는 토스페이먼츠 웹훅을 받을 때 보안키(Service Role Key)를 사용하므로 기능에 지장 없습니다.
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
