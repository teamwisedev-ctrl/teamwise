'use client';

import { useState } from 'react';
import { replyToInquiry } from './actions';

export default function SuperAdminInquiryClient({ initialInquiries }: { initialInquiries: Record<string, unknown>[] }) {
    const [inquiries] = useState(initialInquiries);
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    async function handleReply(e: React.FormEvent<HTMLFormElement>, inquiryId: string) {
        e.preventDefault();
        setSubmittingId(inquiryId);
        
        try {
            const formData = new FormData(e.currentTarget);
            formData.append('inquiryId', inquiryId);
            await replyToInquiry(formData);
            
            alert('답변이 등록되었습니다.');
            // Reload page or optimistically update
            window.location.reload();
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert(String(error));
            }
        } finally {
            setSubmittingId(null);
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            {inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    등록된 문의 내역이 없습니다.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {inquiries.map((iq) => (
                        <div key={iq.id} style={{ padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#FAFAFA' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px', fontWeight: 600 }}>
                                            {iq.type}
                                        </span>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{iq.title}</h3>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        작성자 이메일: {iq.user_email}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: iq.status === 'answered' ? '#10B981' : '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', height: '32px' }}>
                                    {iq.status === 'answered' ? '✓ 답변 완료' : '⚠ 미답변'}
                                </div>
                            </div>
                            
                            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.95rem', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>[문의 내용]</div>
                                {iq.content}
                            </div>
                            
                            {/* Admin Reply Section */}
                            {iq.status === 'answered' ? (
                                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid var(--accent-primary)', borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '8px' }}>[제출된 답변]</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{iq.response}</div>
                                </div>
                            ) : (
                                <form onSubmit={(e) => handleReply(e, iq.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                    <textarea 
                                        name="response" 
                                        required 
                                        rows={4} 
                                        placeholder="이곳에 고객에게 보낼 답변을 입력하세요." 
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
                                    ></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn-primary" disabled={submittingId === iq.id} style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
                                            {submittingId === iq.id ? '전송 중...' : '답변 🚀'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                작성일: {new Date(iq.created_at).toLocaleString()} {iq.updated_at && iq.status === 'answered' && `| 마지막 처리: ${new Date(iq.updated_at).toLocaleString()}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
