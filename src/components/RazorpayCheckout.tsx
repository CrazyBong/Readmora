'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void };
  }
}

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number; // in paise
  plan: 'monthly' | 'annual';
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: () => void;
  onFailure: (reason: string) => void;
}

export default function RazorpayCheckout({
  orderId,
  amount,
  plan,
  userId,
  userEmail,
  userName,
  onSuccess,
  onFailure,
}: RazorpayCheckoutProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Readmora',
        description: plan === 'annual' ? 'Premium Annual Plan' : 'Premium Monthly Plan',
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        notes: {
          user_id: userId,
          plan,
        },
        theme: {
          color: '#5b61d1',
        },
        handler: () => {
          onSuccess();
        },
        modal: {
          ondismiss: () => onFailure('Payment cancelled'),
        },
      });
      rzp.open();
    };
    script.onerror = () => onFailure('Failed to load payment gateway');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [orderId, amount, plan, userId, userEmail, userName, onSuccess, onFailure]);

  return <div className="text-sm text-center opacity-60 py-2">Opening payment gateway…</div>;
}
