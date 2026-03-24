/**
 * Custom SIWX Signer using Wagmi
 *
 * This signer uses wagmi's signMessage action directly instead of relying on
 * ConnectionControllerState.client which may not be properly initialized.
 *
 * Fixes: "No ConnectionController client found" error in DefaultSigner
 *
 * Note: SIWXSigner is not exported from @reown/appkit-siwx, so we implement
 * the interface directly instead of extending the abstract class.
 *
 * @see https://wagmi.sh/core/api/actions/signMessage
 */

import { signMessage as wagmiSignMessage, getAccount } from '@wagmi/core';
import type { Config } from '@wagmi/core';
// Stub telemetry — KeyshiBros doesn't have the full telemetry system
const emitSiwxTelemetry = (..._args: any[]) => {};
const getAttemptId = () => 'kb-' + Date.now();

/**
 * SIWXSigner interface - matches the abstract class from @reown/appkit-siwx
 * that is not exported from the package's main entry point.
 */
export interface SIWXSignerInterface {
  signMessage(message: string): Promise<string>;
}

/**
 * Custom SIWX Signer that uses wagmi's signMessage action
 * Implements SIWXSignerInterface (compatible with DefaultSIWX's signer parameter)
 */
export class WagmiSigner implements SIWXSignerInterface {
  private wagmiConfig: Config;

  constructor(wagmiConfig: Config) {
    this.wagmiConfig = wagmiConfig;
  }

  /**
   * Sign a message using the connected wagmi wallet.
   *
   * Includes retry logic for the brief window after wallet connection where
   * wagmi state hasn't synced yet (common on mobile deep link return).
   * Also includes a 60-second timeout to prevent infinite hangs.
   */
  async signMessage(message: string): Promise<string> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 800;
    const SIGN_TIMEOUT_MS = 60_000;

    // Retry loop: wagmi state may lag behind AppKit connection by a few hundred ms
    let account = getAccount(this.wagmiConfig);
    for (let attempt = 0; attempt < MAX_RETRIES && (!account.isConnected || !account.address); attempt++) {
      console.log(`[WagmiSigner] Wallet not ready (attempt ${attempt + 1}/${MAX_RETRIES}), waiting ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      account = getAccount(this.wagmiConfig);
    }

    if (!account.isConnected || !account.address) {
      emitSiwxTelemetry('sign_rejected', { wallet: undefined, context: 'no_wallet_after_retries' });
      throw new Error('No wallet connected after retries. Please reconnect your wallet.');
    }

    console.log('[WagmiSigner] Signing message for address:', account.address);
    const walletShort = account.address.slice(0, 10);

    // Telemetry: sign phase start
    emitSiwxTelemetry('sign_start', { wallet: account.address });

    try {
      // Wrap signMessage in a timeout to prevent infinite hangs
      // (e.g., mobile wallet app closed without responding)
      emitSiwxTelemetry('sign_request_sent', { wallet: account.address, context: 'wagmi_signMessage' });

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
            emitSiwxTelemetry('sign_timeout', { wallet: account.address, data: { timeoutMs: SIGN_TIMEOUT_MS } });
            reject(new Error('Signing timed out after 60s. Please try again.'));
          }, SIGN_TIMEOUT_MS);
        }),
      ]);

      console.log('[WagmiSigner] Message signed successfully');
      emitSiwxTelemetry('sign_resolved', { wallet: account.address });
      return signature;
    } catch (error) {
      console.error('[WagmiSigner] Sign message error:', error);

      if (error instanceof Error) {
        const isRejection = error.message.includes('User rejected') || error.message.includes('user rejected');
        const isTimeout = error.message.includes('timed out');

        // Emit rejection telemetry (timeout already emitted above)
        if (isRejection) {
          emitSiwxTelemetry('sign_rejected', { wallet: account.address, context: 'user_rejected' });
        } else if (!isTimeout) {
          emitSiwxTelemetry('sign_rejected', { wallet: account.address, context: 'error', data: { message: error.message.slice(0, 200) } });
        }

        if (isRejection) {
          throw new Error('Signature request was rejected. Please try connecting again.');
        }
        throw new Error(`[WagmiSigner] Failed to sign: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Create a custom SIWX signer that uses wagmi's signMessage action
 *
 * @param wagmiConfig - The wagmi config instance from WagmiAdapter
 * @returns WagmiSigner instance compatible with DefaultSIWX
 */
export function createWagmiSigner(wagmiConfig: Config): WagmiSigner {
  return new WagmiSigner(wagmiConfig);
}

export default createWagmiSigner;
