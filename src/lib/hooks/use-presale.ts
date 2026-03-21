import { useState, useMemo } from 'react';

export type PaymentMode = 'crypto' | 'card';

export function usePresale() {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('crypto');
  const [amount, setAmount] = useState<string>('');
  
  const tokenPrice = 0.045; // $0.045 per KB
  
  const tokenAmount = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    return Math.floor(num / tokenPrice);
  }, [amount, tokenPrice]);

  const setPreset = (val: string) => setAmount(val);

  return {
    paymentMode,
    setPaymentMode,
    amount,
    setAmount,
    tokenAmount,
    tokenPrice,
    setPreset
  };
}
