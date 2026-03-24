// @ts-nocheck — cloned from MEMELinked, type diffs from different package versions
/**
 * Simple SIWX Verifiers for Multi-Chain Support
 *
 * These verifiers are compatible with DefaultSIWX and handle the CaipNetwork
 * lookup gracefully to prevent "EIP155.verify: CaipNetwork not found" errors
 * when using embedded wallets (social login like X.com, Google, etc.)
 *
 * Key features:
 * - No dependency on internal Reown controllers (avoids import errors)
 * - Fallback to default chainId when no network is active
 * - Support for EOA and Smart Account signatures
 * - Multi-chain support: EIP155 (Ethereum), Solana, Bitcoin
 *
 * @see src/config/appkit.config.ts - Where these verifiers are used
 */

import { SIWXVerifier as BaseVerifier } from '@reown/appkit-siwx';
import type { SIWXSession } from '@reown/appkit';

// Default chainIds for fallback (when CaipNetwork is not found)
const DEFAULT_EIP155_CHAIN_ID = 'eip155:1'; // Ethereum mainnet
const DEFAULT_SOLANA_CHAIN_ID = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpAosCw6';
const DEFAULT_BITCOIN_CHAIN_ID = 'bip122:000000000019d6689c085ae165831e93';

/**
 * Base Simple Verifier
 *
 * Implements shouldVerify with graceful fallback for missing chainId
 */
abstract class SimpleBaseVerifier extends BaseVerifier {
  abstract readonly chainNamespace: any;
  protected abstract readonly defaultChainId: string;

  /**
   * Determine if this verifier should handle the session
   * Handles missing chainId gracefully (fixes "CaipNetwork not found" error)
   */
  public shouldVerify(session: SIWXSession): boolean {
    try {
      // Try to get chainId from session data
      let chainId = session?.data?.chainId;

      // Fallback: try other possible locations for chainId
      if (!chainId) {
        chainId = (session as any)?.chainId;
      }
      if (!chainId && session?.data?.accountAddress?.includes(':')) {
        // Extract from CAIP-10 format: namespace:chainId:address
        const parts = session.data.accountAddress.split(':');
        if (parts.length >= 2) {
          chainId = `${parts[0]}:${parts[1]}`;
        }
      }

      // Ultimate fallback: use default chainId for this namespace
      // This is the KEY fix for embedded wallets (social login)
      if (!chainId) {
        console.log(`[SimpleVerifier:${this.chainNamespace}] No chainId found, using default:`, this.defaultChainId);
        chainId = this.defaultChainId;
      }

      const [namespace] = chainId.split(':');
      const shouldHandle = namespace === this.chainNamespace;

      console.log(`[SimpleVerifier:${this.chainNamespace}] shouldVerify:`, {
        chainId,
        namespace,
        shouldHandle,
        usedFallback: !session?.data?.chainId,
      });

      return shouldHandle;
    } catch (error) {
      console.error(`[SimpleVerifier:${this.chainNamespace}] shouldVerify error:`, error);
      return false;
    }
  }

  /**
   * Verify the session signature
   * This is a basic validation - full cryptographic verification
   * should happen server-side for security.
   *
   * Also enforces session expiry (issuedAt + 24h). This is the correct layer
   * for expiry checks per Reown architecture:
   *   SIWXConfig.getSessions() → storage.get() → verifySession() → HERE
   * When verify() returns false, getSessions() deletes the session from storage
   * and excludes it from the returned array, causing the SIWX modal to reopen.
   */
  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      // Basic validation - ensure required fields exist
      if (!session?.signature || !session?.data?.accountAddress) {
        console.error(`[SimpleVerifier:${this.chainNamespace}] Missing required session data`);
        return false;
      }

      // Expiry check: issuedAt + 24h TTL
      // This ensures expired sessions are filtered at the verifier layer
      // (where Reown designed it), not in storage.get().
      if (session.data?.issuedAt) {
        const issuedAt = new Date(session.data.issuedAt as string);
        if (!isNaN(issuedAt.getTime())) {
          const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
          if (new Date(issuedAt.getTime() + SESSION_TTL_MS) < new Date()) {
            console.log(`[SimpleVerifier:${this.chainNamespace}] Session expired:`, {
              issuedAt: session.data.issuedAt,
              expiredAt: new Date(issuedAt.getTime() + SESSION_TTL_MS).toISOString(),
            });
            return false;
          }
        }
      }

      // For embedded wallets (social login), signatures may be special formats
      // We trust the signature was verified by the auth provider (X.com, Google, etc.)
      const isEmbeddedWallet = this.isEmbeddedWalletSignature(session.signature);
      if (isEmbeddedWallet) {
        return true;
      }

      // Basic signature format validation
      const isValidFormat = this.validateSignatureFormat(session.signature);
      if (!isValidFormat) {
        console.error(`[SimpleVerifier:${this.chainNamespace}] Invalid signature format`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[SimpleVerifier:${this.chainNamespace}] Verification error:`, error);
      return false;
    }
  }

  /**
   * Check if this is an embedded wallet signature (social login)
   */
  protected isEmbeddedWalletSignature(signature: string): boolean {
    // Embedded wallets often have longer signatures or non-standard formats
    // They're created by the social provider (X.com, Google, etc.)
    return signature.length > 200 || !signature.startsWith('0x');
  }

  /**
   * Validate signature format (to be overridden by specific verifiers)
   */
  protected abstract validateSignatureFormat(signature: string): boolean;
}

/**
 * Ethereum (EIP155) Verifier
 */
export class SimpleEIP155Verifier extends SimpleBaseVerifier {
  public readonly chainNamespace = 'eip155' as const;
  protected readonly defaultChainId = DEFAULT_EIP155_CHAIN_ID;

  protected validateSignatureFormat(signature: string): boolean {
    // Valid EIP155 signatures:
    // - EOA: 0x + 130 hex chars (65 bytes)
    // - Smart Account: 0x + variable length hex

    if (!signature.startsWith('0x')) {
      return false;
    }

    const hexPart = signature.slice(2);
    if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
      return false;
    }

    // Minimum 64 chars (32 bytes) for any valid signature
    if (hexPart.length < 64) {
      return false;
    }

    return true;
  }
}

/**
 * Solana Verifier
 */
export class SimpleSolanaVerifier extends SimpleBaseVerifier {
  public readonly chainNamespace = 'solana' as const;
  protected readonly defaultChainId = DEFAULT_SOLANA_CHAIN_ID;

  protected validateSignatureFormat(signature: string): boolean {
    // Solana signatures via WalletConnect can arrive in various formats:
    // - Base58 (~88 chars, native Solana)
    // - Hex with 0x prefix (via WC relay)
    // - Base64 (some wallet implementations)
    // Accept any non-empty signature — real verification is server-side.
    return signature.length > 0;
  }
}

/**
 * Bitcoin (BIP122) Verifier
 */
export class SimpleBitcoinVerifier extends SimpleBaseVerifier {
  public readonly chainNamespace = 'bip122' as const;
  protected readonly defaultChainId = DEFAULT_BITCOIN_CHAIN_ID;

  protected validateSignatureFormat(signature: string): boolean {
    // Bitcoin signatures can be various formats
    // Just do basic length check

    if (!signature || signature.length < 50) {
      return false;
    }

    return true;
  }
}

/**
 * Factory to create all verifiers
 */
export class SimpleVerifierFactory {
  /**
   * Create all supported verifiers
   */
  static createAllVerifiers(): BaseVerifier[] {
    return [
      new SimpleEIP155Verifier(),
      new SimpleSolanaVerifier(),
      new SimpleBitcoinVerifier(),
    ];
  }

  /**
   * Create Ethereum verifier only
   */
  static createEthereumVerifier(): BaseVerifier {
    return new SimpleEIP155Verifier();
  }

  /**
   * Create Solana verifier only
   */
  static createSolanaVerifier(): BaseVerifier {
    return new SimpleSolanaVerifier();
  }

  /**
   * Create Bitcoin verifier only
   */
  static createBitcoinVerifier(): BaseVerifier {
    return new SimpleBitcoinVerifier();
  }
}

// Default export
export default SimpleVerifierFactory;
