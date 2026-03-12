'use client';

import React, { useState } from 'react';
import { updateUserSubscription } from './actions';
import { ShieldAlert, Search, Edit2 } from 'lucide-react';

export default function SuperAdminClient({ initialUsers, currentUserEmail }: { initialUsers: any[], currentUserEmail: string }) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    
    // Edit Form State
    const [planId, setPlanId] = useState('free');
    const [expiryDate, setExpiryDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.id.includes(searchTerm)
    );

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setPlanId(user.subscription?.plan_id || 'free');
        
        let initialDate = '';
        if (user.subscription?.current_period_end) {
            // format for input type="date"
            initialDate = new Date(user.subscription.current_period_end).toISOString().split('T')[0];
        } else {
            initialDate = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        setExpiryDate(initialDate);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsLoading(true);

        try {
            // Append time to ensure robust parsing
            const fullIsoDate = `${expiryDate}T23:59:59Z`;
            await updateUserSubscription(editingUser.id, planId, fullIsoDate);
            
            // Update local state to reflect changes without a full page reload
            setUsers(prev => prev.map(u => {
                if (u.id === editingUser.id) {
                    return {
                        ...u,
                        subscription: {
                            ...u.subscription,
                            plan_id: planId,
                            current_period_end: fullIsoDate,
                            status: 'active'
                        }
                    };
                }
                return u;
            }));
            setEditingUser(null);
            alert("✅ 사용자 정보가 성공적으로 수정되었습니다.");
        } catch (error: any) {
            console.error(error);
            alert(`수정 실패: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <ShieldAlert size={40} color="#3b82f6" />
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>전체 관리자 대시보드</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>최고 권한 계정 ({currentUserEmail}) 접속 중 - 전체 사용자: {users.length}명</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <Search size={20} color="var(--text-secondary)" />
                    <input 
                        type="text" 
                        placeholder="가입 이메일 검색..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>가입일</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>이메일</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>현재 요금제</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>만료일</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const sub = user.subscription;
                                const planName = sub ? (sub.plan_id === 'free' || sub.plan_id === 'trial_14days' ? '무료 플랜 (Free)' : (sub.plan_id.includes('pro') ? '프로 플랜 (Pro)' : sub.plan_id)) : '미가입 (오류)';
                                const isPro = sub?.plan_id?.includes('pro');
                                
                                return (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 500 }}>{user.email}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.85rem', 
                                                fontWeight: 600,
                                                background: isPro ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: isPro ? '#2563EB' : '#059669'
                                            }}>
                                                {planName}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button 
                                                onClick={() => handleEditClick(user)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                <Edit2 size={14} /> 수정
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel animate-slide-up" style={{ width: '400px', padding: '32px', background: 'white' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 24px 0' }}>라이선스 권한 강제 수정</h3>
                        <div style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            대상 회원: <strong style={{ color: 'var(--text-primary)' }}>{editingUser.email}</strong>
                        </div>
                        
                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>요금제 변경</label>
                                <select 
                                    value={planId} 
                                    onChange={(e) => setPlanId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                                >
                                    <option value="free">무료 플랜 (Free)</option>
                                    <option value="pro_unlimited">슈퍼셀러 무제한팩 (Pro)</option>
                                    <option value="trial_14days">과거 체험판 호환 (Trial)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>만료일 지정</label>
                                <input 
                                    type="date" 
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary" style={{ padding: '10px 16px' }}>
                                    취소
                                </button>
                                <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '10px 16px', opacity: isLoading ? 0.7 : 1 }}>
                                    {isLoading ? '저장 중...' : '변경 내용 저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
