import axios from 'axios';

const API_URL = 'https://li.quest/v1';

// Types
export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface ChainInfo {
  id: number;
  name: string;
  key: string;
  logoURI?: string;
}

export interface ConnectionInfo {
  fromChain: ChainInfo;
  toChain: ChainInfo;
  fromToken: TokenInfo;
  toToken: TokenInfo;
}

/**
 * Get all supported chains
 */
export const getSupportedChains = async () => {
  try {
    const response = await axios.get(`${API_URL}/chains`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supported chains:', error);
    throw error;
  }
};

/**
 * Get all supported tokens for a chain
 */
export const getSupportedTokens = async (chainId: number) => {
  try {
    const response = await axios.get(`${API_URL}/tokens`, {
      params: { chains: chainId },
    });
    return response.data[chainId] || [];
  } catch (error) {
    console.error(`Error fetching tokens for chain ${chainId}:`, error);
    throw error;
  }
};

/**
 * Get all possible connections between chains and tokens
 */
export const getPossibleConnections = async () => {
  try {
    const response = await axios.get(`${API_URL}/connections`);
    return response.data;
  } catch (error) {
    console.error('Error fetching possible connections:', error);
    throw error;
  }
};

/**
 * Request a quote for token transfer
 */
export const getQuote = async (
  fromChain: number,
  fromToken: string,
  toChain: number,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
) => {
  try {
    const response = await axios.get(`${API_URL}/quote`, {
      params: {
        fromChain,
        fromToken,
        toChain,
        toToken,
        fromAmount,
        fromAddress,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
};

/**
 * Get status of a transaction
 */
export const getStatus = async (txHash: string, bridge: string, fromChain: number, toChain: number) => {
  try {
    const response = await axios.get(`${API_URL}/status`, {
      params: {
        txHash,
        bridge,
        fromChain,
        toChain,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    throw error;
  }
};

/**
 * Request a quote for cross-chain contract call
 */
export const getContractCallQuote = async (
  fromChain: number,
  fromToken: string,
  toChain: number,
  toContractAddress: string,
  toContractCallData: string,
  fromAmount: string,
  fromAddress: string,
) => {
  try {
    const response = await axios.get(`${API_URL}/quote`, {
      params: {
        fromChain,
        fromToken,
        toChain,
        toToken: '0x0000000000000000000000000000000000000000', // ETH by default
        fromAmount,
        fromAddress,
        contractCalls: JSON.stringify([
          {
            callData: toContractCallData,
            callTo: toContractAddress,
            callType: 'CALL',
          },
        ]),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contract call quote:', error);
    throw error;
  }
};

export default {
  getSupportedChains,
  getSupportedTokens,
  getPossibleConnections,
  getQuote,
  getStatus,
  getContractCallQuote,
}; 