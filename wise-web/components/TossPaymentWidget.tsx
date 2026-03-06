'use client';

import { useEffect, useState } from 'react';
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
    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const containerId = `payment-widget-${planId}`;

    // TODO: Replace with real Toss Payments Client Key from environment variables
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

    useEffect(() => {
        // Generate a unique order ID once on mount to avoid impure function warnings during render
        setOrderId(`order_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`);

        let isMounted = true;

        const fetchPaymentWidget = async () => {
            try {
                // Initialize the widget with the customer key (can be 'ANONYMOUS' for testing or a unique user ID)
                const customerKey = customerEmail ? customerEmail.replace(/[^a-zA-Z0-9-]/g, '_') : "ANONYMOUS";
                const widget = await loadPaymentWidget(clientKey, customerKey);

                if (isMounted) {
                    setPaymentWidget(widget);
                }
            } catch (error) {
                console.error("Failed to load Toss Payments Widget:", error);
            }
        };

        fetchPaymentWidget();

        return () => {
            isMounted = false;
        };
    }, [clientKey, customerEmail]);

    useEffect(() => {
        // Only render the payment widget when the modal is open
        if (!isModalOpen || paymentWidget == null) {
            return;
        }

        let mountTimer: NodeJS.Timeout;

        const mountWidget = () => {
            const container = document.getElementById(containerId);
            if (!container) {
                // If the DOM element isn't ready yet, try again in 50ms
                mountTimer = setTimeout(mountWidget, 50);
                return;
            }

            try {
                const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                    `#${containerId}`,
                    { value: amount },
                    { variantKey: 'DEFAULT' }
                );

                // Allow the UI to render smoothly before enabling the purchase button
                setTimeout(() => {
                    setIsWidgetLoaded(true);
                }, 500);

            } catch (error) {
                console.error("Error rendering payment methods:", error);
            }
        };

        mountWidget();

        return () => {
            clearTimeout(mountTimer);
            if (!isModalOpen) {
                setIsWidgetLoaded(false);
            }
        };

    }, [isModalOpen, paymentWidget, amount, containerId]);

    const handlePaymentRequest = async () => {
        if (!paymentWidget) return;

        setIsProcessing(true);

        try {
            // Initiate the payment request
            await paymentWidget.requestPayment({
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
                    <div style={modalContentStyles} className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>결제 진행</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Toss Payment Methods Widget mounts here */}
                        <div id={containerId} style={{ minHeight: '300px', marginBottom: '16px', background: 'white', borderRadius: '8px' }} />

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
                            {isProcessing ? '결제 및 등록 중...' : (!isWidgetLoaded ? '결제 수단 로딩 중...' : `${amount.toLocaleString()}원 결제하기`)}
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
