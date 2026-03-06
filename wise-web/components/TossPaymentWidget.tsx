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
    const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const paymentMethodsWidgetRef = useRef<any>(null);

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
        if (paymentWidget == null) {
            return;
        }

        // Render payment methods widget in a hidden div or a modal
        // For subscription/billing key, Toss UI is often a popup or embedded frame
        try {
            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                '#payment-widget-container',
                { value: amount },
                { variantKey: 'DEFAULT' }
            );

            paymentMethodsWidgetRef.current = paymentMethodsWidget;
            setIsWidgetLoaded(true);
        } catch (error) {
            console.error("Error rendering payment methods:", error);
        }

    }, [paymentWidget, amount]);

    const handlePayment = async () => {
        if (!paymentWidget) return;

        setIsProcessing(true);

        try {
            // Initiate the payment request
            // In a real subscription scenario, you might use requestBillingAuth instead of requestPayment
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
            {/* The widget UI container (can be hidden or shown in a modal if preferred) */}
            <div id="payment-widget-container" style={{ display: 'none' }} />

            <button
                className={planId === 'pro_unlimited' ? 'btn-primary' : 'btn-primary'}
                onClick={handlePayment}
                disabled={disabled || !isWidgetLoaded || isProcessing}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '1.1rem',
                    background: planId === 'pro_unlimited' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : undefined,
                    opacity: disabled || !isWidgetLoaded || isProcessing ? 0.6 : 1,
                    cursor: disabled || !isWidgetLoaded || isProcessing ? 'not-allowed' : 'pointer'
                }}
            >
                {isProcessing ? '요청 중...' : (!isWidgetLoaded ? '결제 모듈 로딩 중...' : buttonText)}
            </button>
        </div>
    );
}
