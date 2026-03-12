import { redirect } from 'next/navigation'

export default async function PaymentSuccessPage({
  searchParams
}: {
  searchParams: { orderId: string; paymentKey: string; amount: string; planId: string }
}) {
  // In a real integration, you would typically verify the paymentKey with the Toss Payments API here
  // or rely on the webhook that we set up earlier to actually provision the service.
  // For this demonstration, we'll assume success if they land here and redirect them to the dashboard
  // with a success flag.

  const { planId } = await searchParams

  // Simulate a brief loading/verification graphic
  return (
    <div
      className="container animate-fade-in"
      style={{
        padding: '80px 24px',
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div className="glass-panel" style={{ padding: '60px', maxWidth: '600px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
          결제가 <span className="gradient-text-accent">완료되었습니다!</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>
          {planId === 'pro_unlimited' ? '슈퍼셀러 무제한팩' : '쿠팡 무제한 연동'} 구독이 정상적으로
          시작되었습니다.
          <br />
          데스크톱 앱을 재시작하시거나 연동 버튼을 누르면 즉시 잠금이 해제됩니다.
        </p>
        <a
          href="/admin"
          className="btn-primary"
          style={{ padding: '16px 32px', fontSize: '1.1rem', display: 'inline-block' }}
        >
          내 라이선스 대시보드로 이동
        </a>
      </div>
    </div>
  )
}
