/**
 * Custom SIWX Signer using Wagmi (cloned from normie-tool, no telemetry)
 *
 * Uses wagmi's signMessage directly instead of ConnectionControllerState.client
 * Fixes: "No ConnectionController client found" error in DefaultSigner
 */

import { signMessage as wagmiSignMessage, getAccount } from '@wagmi/core';
import type { Config } from '@wagmi/core';

export interface SIWXSignerInterface {
  signMessage(message: string): Promise<string>;
}

export class WagmiSigner implements SIWXSignerInterface {
  private wagmiConfig: Config;

  constructor(wagmiConfig: Config) {
    this.wagmiConfig = wagmiConfig;
  }

  async signMessage(message: string): Promise<string> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 800;
    const SIGN_TIMEOUT_MS = 60_000;

    let account = getAccount(this.wagmiConfig);
    for (let attempt = 0; attempt < MAX_RETRIES && (!account.isConnected || !account.address); attempt++) {
      console.log(`[WagmiSigner] Wallet not ready (attempt ${attempt + 1}/${MAX_RETRIES}), waiting...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      account = getAccount(this.wagmiConfig);
    }

    if (!account.isConnected || !account.address) {
      throw new Error('No wallet connected after retries. Please reconnect your wallet.');
    }

    try {
      let timeoutId: ReturnType<typeof setTimeout>;
      const signature = await Promise.race([
        wagmiSignMessage(this.wagmiConfig, {
          message,
          account: account.address,
        }).then(sig => {
          clearTimeout(timeoutId);
          return sig;
        }),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Signing timed out after 60s. Please try again.'));
          }, SIGN_TIMEOUT_MS);
        }),
      ]);

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
          throw new Error('Signature request was rejected. Please try connecting again.');
        }
        throw new Error(`[WagmiSigner] Failed to sign: ${error.message}`);
      }
      throw error;
    }
  }
}

export function createWagmiSigner(wagmiConfig: Config): WagmiSigner {
  return new WagmiSigner(wagmiConfig);
}
