/**
 * Presale Products — centralized product definitions
 *
 * MAIN: $4,999 presale allocation (5M $KB tokens)
 * TEST: $5 test product (admin-only, 5K $KB tokens)
 */

// Admin user IDs who can see the test product
const ADMIN_USER_IDS = [
  '7c41e4ee-ce49-4535-85aa-4ee5dbdef6c0', // the_dip_buyer_test (superadmin)
  'ef4f23b5-dbc9-41c2-bf09-c8582955e281', // pablocro (owner)
];

export interface PresaleProduct {
  id: string;
  name: string;
  usdAmount: number;
  tokenAllocation: number;
  isTest: boolean;
}

export const PRODUCTS = {
  main: {
    id: 'main',
    name: '$KB Private Sale',
    usdAmount: 4999,
    tokenAllocation: 5_000_000,
    isTest: false,
  },
  test: {
    id: 'test',
    name: '$KB Test Purchase',
    usdAmount: 5,
    tokenAllocation: 5_000,
    isTest: true,
  },
} as const satisfies Record<string, PresaleProduct>;

export type ProductId = keyof typeof PRODUCTS;

export function getProduct(id: ProductId): PresaleProduct {
  return PRODUCTS[id];
}

export function isAdmin(userId: string | undefined): boolean {
  return !!userId && ADMIN_USER_IDS.includes(userId);
}

export function getAvailableProducts(userId: string | undefined): PresaleProduct[] {
  if (isAdmin(userId)) {
    return [PRODUCTS.main, PRODUCTS.test];
  }
  return [PRODUCTS.main];
}
