import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

// LiveCoinWatch API configuration
const LCW_API_KEY = process.env.NEXT_PUBLIC_LIVECOINWATCH_API_KEY || '';
const LCW_API_URL = 'https://api.livecoinwatch.com';

// Top cryptocurrencies to analyze
const TOP_CRYPTOCURRENCIES = [
  { name: 'Bitcoin', code: 'BTC' },
  { name: 'Ethereum', code: 'ETH' },
  { name: 'Binance Coin', code: 'BNB' },
  { name: 'Solana', code: 'SOL' },
  { name: 'Cardano', code: 'ADA' },
  { name: 'XRP', code: 'XRP' },
  { name: 'Polkadot', code: 'DOT' },
  { name: 'Dogecoin', code: 'DOGE' }
];

export async function GET() {
  try {
    // Fetch market data from LiveCoinWatch
    const marketData = await fetchMarketData();
    
    if (!marketData || marketData.length === 0) {
      throw new Error('Failed to fetch market data');
    }

    // Call OpenAI for market analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: 'system',
          content: `You are an expert cryptocurrency trader who generates trading signals based on market data.
          For each cryptocurrency in the provided market data:
          1. Determine if the overall market conditions suggest a buy, sell, or hold signal
          2. Assign a confidence score from 0.0 to 1.0 based on the strength of the signal
          3. Determine the overall sentiment (positive, negative, or neutral)
          4. Provide clear reasoning for the trading signal based on price, volume, and market cap data
          
          Be conservative with your signals - only suggest buy or sell when there is strong evidence.
          Otherwise, suggest hold. Consider price movements, volume, and market cap in your analysis.`
        },
        {
          role: 'user',
          content: `Generate trading signals based on this market data: ${JSON.stringify(marketData)}`
        }
      ],
      functions: [
        {
          name: 'generate_market_analysis',
          description: 'Generate market analysis and trading signals based on cryptocurrency market data',
          parameters: {
            type: 'object',
            properties: {
              tokens: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of the cryptocurrency'
                    },
                    symbol: {
                      type: 'string',
                      description: 'Symbol of the cryptocurrency'
                    },
                    price: {
                      type: 'number',
                      description: 'Current price of the cryptocurrency'
                    },
                    change24h: {
                      type: 'number',
                      description: '24-hour price change percentage'
                    },
                    marketCap: {
                      type: 'number',
                      description: 'Market capitalization of the cryptocurrency'
                    },
                    volume24h: {
                      type: 'number',
                      description: '24-hour trading volume'
                    },
                    sentiment: {
                      type: 'string',
                      enum: ['positive', 'negative', 'neutral'],
                      description: 'Overall sentiment based on market data'
                    },
                    action: {
                      type: 'string',
                      enum: ['buy', 'sell', 'hold'],
                      description: 'Recommended action based on market analysis'
                    },
                    confidence: {
                      type: 'number',
                      description: 'Confidence in the recommendation from 0.0 to 1.0'
                    },
                    analysis: {
                      type: 'string',
                      description: 'Detailed analysis and reasoning for the recommendation'
                    }
                  },
                  required: ['name', 'symbol', 'price', 'change24h', 'marketCap', 'volume24h', 'sentiment', 'action', 'confidence', 'analysis']
                },
                description: 'Trading signals and analysis for specific cryptocurrencies'
              }
            },
            required: ['tokens']
          }
        }
      ],
      function_call: { name: 'generate_market_analysis' }
    });

    // Extract the function call result
    const functionCall = response.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to get function call result from OpenAI');
    }

    // Parse the function call arguments and handle potential control characters
    const analysisResult = JSON.parse(functionCall.arguments.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''));

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in market analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market data' },
      { status: 500 }
    );
  }
}

async function fetchMarketData() {
  try {
    // Fetch data for each cryptocurrency
    const promises = TOP_CRYPTOCURRENCIES.map(async (crypto) => {
      try {
        const response = await axios.post(
          `${LCW_API_URL}/coins/single`,
          {
            currency: 'USD',
            code: crypto.code,
            meta: true
          },
          {
            headers: {
              'content-type': 'application/json',
              'x-api-key': LCW_API_KEY
            }
          }
        );
        
        const data = response.data;
        
        return {
          name: crypto.name,
          symbol: crypto.code,
          price: data.rate,
          change24h: data.delta.day * 100, // Convert to percentage
          marketCap: data.cap,
          volume24h: data.volume
        };
      } catch (err) {
        console.error(`Error fetching data for ${crypto.code}:`, err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
} 