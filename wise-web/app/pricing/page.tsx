import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import TossPaymentWidget from "@/components/TossPaymentWidget";

export default async function PricingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user's subscription data if logged in
    let subData = null;

    if (user) {
        const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        subData = data;
    }

    // We will use the client-side TossPaymentWidget instead of server actions for real payments
    const userEmail = user?.email || "anonymous@wise.com";
    const userName = user?.user_metadata?.full_name || "WISE User";

    return (
        <div className="container animate-fade-in" style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }}>
                    합리적인 <span className="gradient-text-accent">요금제</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    약정 없이 언제든 해지 가능합니다. 14일 무료 체험으로 먼저 경험해보세요.
                </p>
            </div>

            <div style={pricingGridStyles}>
                {/* Free Tier */}
                <div className="glass-panel animate-slide-up delay-100" style={pricingCardStyles}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>🚀 Starter (Free)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩0 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 평생 무료</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        기본 채널 연동과 제한된 볼륨으로<br />충분히 경험해보세요.
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ 네이버 스마트스토어 연동</li>
                        <li>✔️ <b>카페24(자사몰) 무제한 연동</b></li>
                        <li>✔️ 기본 소싱처 (도매토피아) 연동</li>
                        <li>✔️ 월 동기화 최대 500건 제한</li>
                    </ul>
                    <button disabled className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
                        기본 제공
                    </button>
                </div>

                {/* Coupang Add-on */}
                <div className="glass-panel animate-slide-up delay-200" style={pricingCardStyles}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>📦 쿠팡 무제한 연동권</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩9,900 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 월</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        가장 폭발적인 트래픽을 자랑하는<br />쿠팡(Coupang) 전송 모듈 추가
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ 쿠팡 상품 카테고리 자동 매핑</li>
                        <li>✔️ 쿠팡 옵션 형태 자동 변환</li>
                        <li>✔️ 쿠팡 배송비/출고지 관리 연동</li>
                        <li>✔️ 무제한 쿠팡 스토어 계정 연결</li>
                    </ul>
                    {subData?.plan_id === 'addon_coupang' ? (
                        <button disabled className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
                            이용 중인 플랜입니다
                        </button>
                    ) : (
                        <TossPaymentWidget
                            planId="addon_coupang"
                            amount={9900}
                            orderName="쿠팡 무제한 멀티연동 모듈"
                            customerEmail={userEmail}
                            customerName={userName}
                            buttonText="구매하기 (₩9,900/월)" />
                    )}
                </div>

                {/* Super Seller Unlimited */}
                <div className="glass-panel animate-slide-up delay-300" style={{ ...pricingCardStyles, border: '2px solid var(--accent-primary)', transform: 'scale(1.05)', backgroundColor: 'rgba(20, 20, 22, 0.9)' }}>
                    <div style={popularBadgeStyles}>가장 추천</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>⚡ 슈퍼셀러 무제한팩</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '24px 0' }}>
                        ₩19,900 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 월</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        월 500건 제한을 전면 해제하고<br />초고속 다중 스레드 업로드 제공
                    </p>
                    <ul style={featureListStyles}>
                        <li>✔️ 월 상품 동기화 <b>무제한 해제</b></li>
                        <li>✔️ 다중 스레드 속도 부스트 제공</li>
                        <li>✔️ 대량 엑셀 다운로드 최적화</li>
                        <li>✔️ 1:1 VIP 기술 지원</li>
                    </ul>
                    {subData?.plan_id === 'pro_unlimited' ? (
                        <button disabled className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: 'auto', opacity: 0.5, cursor: 'not-allowed' }}>
                            이용 중인 플랜입니다
                        </button>
                    ) : (
                        <TossPaymentWidget
                            planId="pro_unlimited"
                            amount={19900}
                            orderName="WISE 슈퍼셀러 무제한팩"
                            customerEmail={userEmail}
                            customerName={userName}
                            buttonText="구독하기 (₩19,900/월)" />
                    )}
                </div>
            </div>
        </div>
    );
}

const pricingGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'center',
};

const pricingCardStyles: React.CSSProperties = {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    position: 'relative',
    minHeight: '500px',
};

const popularBadgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
    color: 'white',
    padding: '4px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
};

const featureListStyles: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 40px 0',
    textAlign: 'left',
    lineHeight: 2,
};
