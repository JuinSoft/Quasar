/**
 * Utility for handling cryptocurrency icons using the cryptocurrency-icons package
 */
import React from 'react';
import Image from 'next/image';

// Import default icon for fallback
import defaultIcon from 'cryptocurrency-icons/svg/color/generic.svg';

// Define a type for icon options
type IconOptions = {
  symbol: string;
  type?: 'color' | 'black';
  format?: 'svg' | 'png';
};

/**
 * Get cryptocurrency icon URL
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param {string} type - Icon type ('color' or 'black')
 * @param {string} format - Icon format ('svg' or 'png')
 * @returns {string} - URL to the cryptocurrency icon
 */
export const getCryptoIconUrl = ({
  symbol,
  type = 'color',
  format = 'svg'
}: IconOptions): string => {
  if (!symbol) return defaultIcon;
  
  const normalizedSymbol = symbol.toLowerCase();
  
  // Use a static path approach instead of dynamic require
  try {
    // This will be resolved at build time
    return `/node_modules/cryptocurrency-icons/${format}/${type}/${normalizedSymbol}.${format}`;
  } catch (error) {
    // If icon not found, return default icon
    return defaultIcon;
  }
};

/**
 * Get cryptocurrency icon component
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @param {Object} props - Additional props for the img element
 * @returns {JSX.Element} - Image element with the cryptocurrency icon
 */
export const CryptoIcon: React.FC<{ symbol: string; width?: number; height?: number; [key: string]: any }> = ({ 
  symbol, 
  width = 24, 
  height = 24, 
  ...props 
}) => {
  // For the component, we'll use a simpler approach with public assets
  // You'll need to copy the icons you need to the public folder
  return (
    <img 
      src={`/images/crypto/${symbol.toLowerCase()}.svg`}
      alt={`${symbol} icon`}
      width={width}
      height={height}
      onError={(e) => {
        // Fallback to default icon if the specific one isn't found
        (e.target as HTMLImageElement).src = '/images/crypto/generic.svg';
      }}
      {...props}
    />
  );
};

/**
 * Map of common cryptocurrency names to their symbols
 */
export const CRYPTO_NAME_TO_SYMBOL: Record<string, string> = {
  'sonic': 'S',
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'bnb': 'BNB',
  'binance coin': 'BNB',
  'xrp': 'XRP',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'avalanche': 'AVAX',
  'dogecoin': 'DOGE',
  'polkadot': 'DOT',
  'polygon': 'MATIC',
  'tron': 'TRX',
  'litecoin': 'LTC',
  'chainlink': 'LINK',
  'uniswap': 'UNI',
  'stellar': 'XLM',
  'cosmos': 'ATOM',
  'monero': 'XMR',
  'tether': 'USDT',
  'usd coin': 'USDC',
  'dai': 'DAI',
  'shiba inu': 'SHIB',
};

/**
 * Get cryptocurrency symbol from name
 * @param {string} name - Cryptocurrency name
 * @returns {string|null} - Cryptocurrency symbol or null if not found
 */
export const getSymbolFromName = (name: string): string | null => {
  if (!name) return null;
  
  const normalizedName = name.toLowerCase();
  
  // Check if the name is in the map
  if (CRYPTO_NAME_TO_SYMBOL[normalizedName]) {
    return CRYPTO_NAME_TO_SYMBOL[normalizedName];
  }
  
  // Check if the name is already a symbol
  if (normalizedName.length <= 5 && normalizedName === normalizedName.toUpperCase()) {
    return normalizedName;
  }
  
  // Check if any key in the map contains the name
  for (const [key, value] of Object.entries(CRYPTO_NAME_TO_SYMBOL)) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return value;
    }
  }
  
  return null;
}; 