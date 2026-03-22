import { useState, useMemo } from 'react';

export type PaymentMode = 'crypto' | 'card';

export function usePresale() {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('crypto');
  const [amount, setAmount] = useState<string>('');
  
  const tokensPerEth = 2000; // 2,000 KB per ETH
  const tokenPrice = 1 / tokensPerEth; // ETH per KB

  const tokenAmount = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    return Math.floor(num * tokensPerEth);
  }, [amount, tokensPerEth]);

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
