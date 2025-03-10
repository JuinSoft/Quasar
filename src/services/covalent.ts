import { env } from '@/config/env';
import { sonicBlazeTestnet } from '@/config/chains';

// Covalent API key
const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY || '';

/**
 * Fetches activity data for a given wallet address using the Covalent API.
 * @param {string} address - The wallet address to fetch activity data for.
 * @returns {Promise<Object>} - A promise that resolves to transaction data.
 */
export const fetchActivityData = async (address: string) => {
    try {
        const response = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/?key=${COVALENT_API_KEY}`);
        const data = await response.json();
        return data.data; // Return the data directly for easier use in components
    } catch (error) {
        console.error("Error fetching activity data:", error);
        return { items: [] }; // Return an empty array in case of error to avoid further breaks
    }
};

/**
 * Fetches token balances for a given wallet address using the Covalent API.
 * @param {string} address - The wallet address to fetch token balances for.
 * @param {string} chainName - The chain name to fetch balances from.
 * @returns {Promise<Object>} - A promise that resolves to token balance data.
 */
export const fetchTokenBalances = async (address: string, chainName = 'eth-mainnet') => {
    try {
        const response = await fetch(`https://api.covalenthq.com/v1/${chainName}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`);
        const data = await response.json();
        return data.data; // Return the data directly for easier use in components
    } catch (error) {
        console.error("Error fetching token balances:", error);
        return { items: [] }; // Return an empty array in case of error to avoid further breaks
    }
};

/**
 * Fetches NFT balances for a given wallet address using the Covalent API.
 * @param {string} address - The wallet address to fetch NFT balances for.
 * @param {string} chainName - The chain name to fetch balances from.
 * @returns {Promise<Object>} - A promise that resolves to NFT balance data.
 */
export const fetchNFTBalances = async (address: string, chainName = 'eth-mainnet') => {
    try {
        const response = await fetch(`https://api.covalenthq.com/v1/${chainName}/address/${address}/balances_nft/?key=${COVALENT_API_KEY}`);
        const data = await response.json();
        return data.data; // Return the data directly for easier use in components
    } catch (error) {
        console.error("Error fetching NFT balances:", error);
        return { items: [] }; // Return an empty array in case of error to avoid further breaks
    }
};

/**
 * Fetches token transfers for a given wallet address using the Covalent API.
 * @param {string} address - The wallet address to fetch token transfers for.
 * @param {string} chainName - The chain name to fetch transfers from.
 * @returns {Promise<Object>} - A promise that resolves to token transfer data.
 */
export const fetchTokenTransfers = async (address: string, chainName = 'eth-mainnet') => {
    try {
        const response = await fetch(`https://api.covalenthq.com/v1/${chainName}/address/${address}/transfers_v2/?key=${COVALENT_API_KEY}`);
        const data = await response.json();
        return data.data; // Return the data directly for easier use in components
    } catch (error) {
        console.error("Error fetching token transfers:", error);
        return { items: [] }; // Return an empty array in case of error to avoid further breaks
    }
};

/**
 * Fetches transaction details for a given transaction hash using the Covalent API.
 * @param {string} txHash - The transaction hash to fetch details for.
 * @param {string} chainName - The chain name where the transaction occurred.
 * @returns {Promise<Object>} - A promise that resolves to transaction details.
 */
export const fetchTransactionDetails = async (txHash: string, chainName = 'eth-mainnet') => {
    try {
        const response = await fetch(`https://api.covalenthq.com/v1/${chainName}/transaction_v2/${txHash}/?key=${COVALENT_API_KEY}`);
        const data = await response.json();
        return data.data; // Return the data directly for easier use in components
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        return null; // Return null in case of error
    }
}; 