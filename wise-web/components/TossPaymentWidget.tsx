'use client';

import { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';

interface TossPaymentWidgetProps {
    planId: string;
    amount: number;
    orderName: string;
    customerEmail: string;
    customerName: string;
    disabled?: boolean;
    buttonText: string;
}

export default function TossPaymentWidget({
    planId,
    amount,
    orderName,
    customerEmail,
    customerName,
    disabled = false,
    buttonText
}: TossPaymentWidgetProps) {
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const containerId = `payment-widget-${planId}`;
    const agreementId = `agreement-widget-${planId}`;

    // Use Toss Payments Widget Test Key from environment variables, or fallback to the official public Widget test key
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

    // When modal opens, initialize the Toss SDK and render it into the DOM in a single asynchronous flow
    useEffect(() => {
        if (!isModalOpen) {
            // Cleanup on close to force a fresh render next time
            setTimeout(() => {
                setIsWidgetLoaded(false);
            }, 0);
            paymentWidgetRef.current = null;
            return;
        }

        // Generate a fresh unique order ID each time the modal opens
        setTimeout(() => {
            setOrderId(`order_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`);
        }, 0);
        let isMounted = true;

        const initializeTossWidget = async () => {
            try {
                // 1. Authenticate with SDK
                const customerKey = customerEmail ? customerEmail.replace(/[^a-zA-Z0-9-]/g, '_') : "ANONYMOUS";
                const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

                if (!isMounted) return;

                // 2. Render Payment Methods inside the Modal
                paymentWidget.renderPaymentMethods(
                    `#${containerId}`,
                    { value: amount },
                    { variantKey: 'DEFAULT' }
                );

                // 3. Render Agreement UI (Required by Toss)
                paymentWidget.renderAgreement(
                    `#${agreementId}`,
                    { variantKey: 'AGREEMENT' }
                );

                paymentWidgetRef.current = paymentWidget;
                setIsWidgetLoaded(true);

            } catch (error) {
                console.error("Failed to initialize Toss Payments:", error);
            }
        };

        // Enforce a tiny delay to ensure React has painted the modal DOM elements before querying them
        const renderTimer = setTimeout(() => {
            initializeTossWidget();
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(renderTimer);
        };
    }, [isModalOpen, clientKey, customerEmail, amount, containerId, agreementId]);


    const handlePaymentRequest = async () => {
        if (!paymentWidgetRef.current) return;

        setIsProcessing(true);

        try {
            // Initiate the payment request
            await paymentWidgetRef.current.requestPayment({
                orderId,
                orderName,
                customerName,
                customerEmail,
                successUrl: `${window.location.origin}/api/payments/success?planId=${planId}`,
                failUrl: `${window.location.origin}/api/payments/fail`,
            });
            // The browser will redirect to the success or fail URL
        } catch (error: any) {
            console.error("Payment failed:", error);
            if (error.code !== 'USER_CANCEL') {
                alert(`결제 요청에 실패했습니다: ${error.message}`);
            }
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ marginTop: 'auto', width: '100%' }}>

            <button
                className={planId === 'pro_unlimited' ? 'btn-primary' : 'btn-primary'}
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.1rem',
                    background: planId === 'pro_unlimited' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : undefined,
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                {buttonText}
            </button>

            {isModalOpen && (
                <div style={modalBackdropStyles}>
                    <div style={modalContentStyles} className="glass-panel animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>결제 진행</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                            >
                                &times;
                            </button>
                        </div>

                        {!isWidgetLoaded && (
                            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                결제 모듈을 불러오는 중입니다...
                            </div>
                        )}

                        {/* Toss Payment Methods Widget mounts here */}
                        <div id={containerId} style={{ background: 'white', borderRadius: '8px', minHeight: '300px' }} />
                        <div id={agreementId} style={{ marginTop: '8px', marginBottom: '24px', background: 'white', borderRadius: '8px' }} />

                        <button
                            className="btn-primary"
                            onClick={handlePaymentRequest}
                            disabled={!isWidgetLoaded || isProcessing}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '1.2rem',
                                opacity: (!isWidgetLoaded || isProcessing) ? 0.6 : 1,
                                cursor: (!isWidgetLoaded || isProcessing) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isProcessing ? '결제 요청 중...' : `${amount.toLocaleString()}원 안전결제`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const modalBackdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
};

const modalContentStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    maxHeight: '90vh',
    overflowY: 'auto',
    textAlign: 'left',
};
