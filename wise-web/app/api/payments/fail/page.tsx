export default async function PaymentFailPage({
  searchParams
}: {
  searchParams: { code: string; message: string; orderId: string }
}) {
  // Parse error codes from Toss
  const { message, code } = await searchParams

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
      <div
        className="glass-panel"
        style={{
          padding: '60px',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⚠️</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: '#ef4444' }}>
          결제에 실패했습니다.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '20px' }}>
          결제 진행 중 오류가 발생하여 승인되지 않았습니다.
        </p>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '40px',
            textAlign: 'left'
          }}
        >
          <strong>오류 사유:</strong> {message || '알 수 없는 오류'} <br />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            코드: {code || 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a
            href="/pricing"
            className="btn-primary"
            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          >
            요금제 다시 선택하기
          </a>
          <a
            href="/"
            className="btn-secondary"
            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          >
            메인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
