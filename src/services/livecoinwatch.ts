import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_LIVECOINWATCH_API_KEY || '';
const API_URL = 'https://api.livecoinwatch.com';

export interface Coin {
  name: string;
  code: string;
  rate: number;
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number;
    quarter: number;
    year: number;
  };
  volume: number;
  cap: number;
  png64: string;
  png128: string;
  webp64: string;
  webp128: string;
}

export interface Exchange {
  name: string;
  code: string;
  volume: number;
  bidTotal: number;
  askTotal: number;
  depth: number;
  visitors: number;
  volumePerVisitor: number;
  png64: string;
  png128: string;
  webp64: string;
  webp128: string;
}

/**
 * Fetches a list of coins from the LiveCoinWatch API
 */
export async function getCoins(limit = 50): Promise<Coin[]> {
  try {
    const response = await axios.post(
      `${API_URL}/coins/list`,
      {
        currency: 'USD',
        sort: 'cap',
        order: 'descending',
        offset: 0,
        limit,
        meta: true
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching coins:', error);
    return [];
  }
}

/**
 * Fetches a single coin by code from the LiveCoinWatch API
 */
export async function getCoin(code: string): Promise<Coin | null> {
  try {
    const response = await axios.post(
      `${API_URL}/coins/single`,
      {
        currency: 'USD',
        code,
        meta: true
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching coin ${code}:`, error);
    return null;
  }
}

/**
 * Fetches a list of exchanges from the LiveCoinWatch API
 */
export async function getExchanges(limit = 20): Promise<Exchange[]> {
  try {
    const response = await axios.post(
      `${API_URL}/exchanges/list`,
      {
        currency: 'USD',
        sort: 'volume',
        order: 'descending',
        offset: 0,
        limit,
        meta: true
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return [];
  }
}

/**
 * Fetches the global market overview from the LiveCoinWatch API
 */
export async function getMarketOverview() {
  try {
    const response = await axios.post(
      `${API_URL}/overview`,
      {
        currency: 'USD'
      },
      {
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return null;
  }
} 