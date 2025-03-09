import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
});

// Top cryptocurrencies to analyze
const TOP_CRYPTOCURRENCIES = [
  'Bitcoin (BTC)',
  'Ethereum (ETH)',
  'Binance Coin (BNB)',
  'Solana (SOL)',
  'Cardano (ADA)',
  'XRP',
  'Polkadot (DOT)',
  'Dogecoin (DOGE)',
  'Avalanche (AVAX)',
  'Chainlink (LINK)'
];

export async function POST(request: Request) {
  try {
    const { url, title, content } = await request.json();

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Prepare the article data for analysis
    const articleData = {
      url,
      title,
      content: content || 'No content provided'
    };

    // Call OpenAI for sentiment analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert cryptocurrency trader who generates trading signals based on news sentiment.
          Focus on these top cryptocurrencies: ${TOP_CRYPTOCURRENCIES.join(', ')}.
          For each cryptocurrency that has significant sentiment data in the article:
          1. Determine if the overall sentiment suggests a buy, sell, or hold signal
          2. Assign a confidence score from 0.0 to 1.0 based on the strength of the signal
          3. Calculate an overall sentiment score from -1.0 to 1.0
          4. Provide clear reasoning for the trading signal
          
          Be conservative with your signals - only suggest buy or sell when there is strong evidence.
          Otherwise, suggest hold. Consider both the sentiment score and confidence in your analysis.`
        },
        {
          role: 'user',
          content: `Generate trading signals based on this news article: 
          Title: ${articleData.title}
          URL: ${articleData.url}
          Content: ${articleData.content}`
        }
      ],
      functions: [
        {
          name: 'generate_trading_signals',
          description: 'Generate trading signals based on sentiment analysis of news article',
          parameters: {
            type: 'object',
            properties: {
              sentiment: {
                type: 'string',
                enum: ['positive', 'negative', 'neutral'],
                description: 'Overall sentiment of the article'
              },
              score: {
                type: 'number',
                description: 'Overall sentiment score from 0.0 to 1.0'
              },
              summary: {
                type: 'string',
                description: 'Brief summary of the article and its implications'
              },
              tokens: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Name of the cryptocurrency'
                    },
                    action: {
                      type: 'string',
                      enum: ['buy', 'sell', 'hold'],
                      description: 'Recommended action based on sentiment'
                    },
                    confidence: {
                      type: 'number',
                      description: 'Confidence in the recommendation from 0.0 to 1.0'
                    },
                    reason: {
                      type: 'string',
                      description: 'Reasoning behind the recommendation'
                    }
                  },
                  required: ['name', 'action', 'confidence', 'reason']
                },
                description: 'Trading signals for specific cryptocurrencies mentioned in the article'
              }
            },
            required: ['sentiment', 'score', 'summary', 'tokens']
          }
        }
      ],
      function_call: { name: 'generate_trading_signals' }
    });

    // Extract the function call result
    const functionCall = response.choices[0]?.message?.function_call;
    
    if (!functionCall || !functionCall.arguments) {
      throw new Error('Failed to get function call result from OpenAI');
    }

    // Parse the function call arguments
    const analysisResult = JSON.parse(functionCall.arguments);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in sentiment analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
} 