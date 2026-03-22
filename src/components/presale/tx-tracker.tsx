"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleNotch, CheckCircle, XCircle, ArrowSquareOut } from '@phosphor-icons/react';

export type TxStage = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

interface TxTrackerProps {
  stage: TxStage;
  txSignature?: string;
  error?: string;
  onDismiss: () => void;
}

const SOLSCAN_URL = 'https://solscan.io/tx/';

export function TxTracker({ stage, txSignature, error, onDismiss }: TxTrackerProps) {
  const [autoDismiss, setAutoDismiss] = useState(false);

  // Auto-dismiss after 8s on success
  useEffect(() => {
    if (stage !== 'success') return;
    const timer = setTimeout(() => {
      setAutoDismiss(true);
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [stage, onDismiss]);

  if (stage === 'idle' || autoDismiss) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl border p-4 flex flex-col gap-3"
        style={{
          borderColor: stage === 'error' ? 'rgba(239,68,68,0.3)' : stage === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
          backgroundColor: stage === 'error' ? 'rgba(239,68,68,0.05)' : stage === 'success' ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)',
        }}
      >
        {/* Status row */}
        <div className="flex items-center gap-3">
          {(stage === 'signing' || stage === 'confirming') && (
            <CircleNotch size={20} weight="bold" className="text-white/60 animate-spin flex-shrink-0" />
          )}
          {stage === 'success' && (
            <CheckCircle size={20} weight="fill" className="text-green-400 flex-shrink-0" />
          )}
          {stage === 'error' && (
            <XCircle size={20} weight="fill" className="text-red-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">
              {stage === 'signing' && 'Approve in wallet...'}
              {stage === 'confirming' && 'Confirming on Solana...'}
              {stage === 'success' && 'Transaction confirmed'}
              {stage === 'error' && 'Transaction failed'}
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              {stage === 'signing' && 'Sign the transaction in your wallet to proceed'}
              {stage === 'confirming' && 'Waiting for block confirmation (~400ms)'}
              {stage === 'success' && 'Your allocation has been reserved'}
              {stage === 'error' && (error || 'Please try again')}
            </div>
          </div>

          {/* Dismiss button */}
          {(stage === 'success' || stage === 'error') && (
            <button
              onClick={onDismiss}
              className="text-white/30 hover:text-white/60 text-xs font-mono uppercase tracking-widest transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>

        {/* Progress bar */}
        {(stage === 'signing' || stage === 'confirming') && (
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white/30 rounded-full"
              initial={{ width: stage === 'signing' ? '0%' : '50%' }}
              animate={{ width: stage === 'signing' ? '40%' : '90%' }}
              transition={{ duration: stage === 'signing' ? 2 : 5, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Solscan link */}
        {txSignature && (stage === 'confirming' || stage === 'success') && (
          <a
            href={`${SOLSCAN_URL}${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 font-mono transition-colors"
          >
            <ArrowSquareOut size={12} />
            View on Solscan
          </a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
