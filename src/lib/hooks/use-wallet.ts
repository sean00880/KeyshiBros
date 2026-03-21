import { useState, useCallback } from 'react';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    // Mock connection
    setTimeout(() => {
      setIsConnected(true);
      setAddress('0x71C...97d1');
    }, 500);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
  }, []);

  return {
    isConnected,
    address,
    connect,
    disconnect,
  };
}
