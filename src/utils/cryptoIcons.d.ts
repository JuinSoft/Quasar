import { ReactElement } from 'react';

/**
 * Get cryptocurrency icon path
 */
export function getCryptoIconPath(
  symbol: string, 
  type?: 'color' | 'black', 
  format?: 'svg' | 'png'
): string;

/**
 * Get cryptocurrency icon component
 */
export function CryptoIcon(props: {
  symbol: string;
  [key: string]: any;
}): ReactElement;

/**
 * Map of common cryptocurrency names to their symbols
 */
export const CRYPTO_NAME_TO_SYMBOL: Record<string, string>;

/**
 * Get cryptocurrency symbol from name
 */
export function getSymbolFromName(name: string): string | null; 