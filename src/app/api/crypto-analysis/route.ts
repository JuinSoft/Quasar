import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with internet access
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  baseURL: 'https://api.openai.com/v1'
});

export async function POST(request: Request) {
  try {
    const { messages, analysisType = 'general' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // Define different system prompts based on analysis type
    const systemPrompts: Record<string, string> = {
      general: 'You are a crypto market analysis expert with access to current market data. Provide detailed insights about cryptocurrency markets, trends, and investment strategies based on real-time information. IMPORTANT: When market sentiments are positive or bullish indicators are present, you MUST recommend BUY strategies rather than HOLD. Always interpret positive signals as buying opportunities. Be optimistic and growth-oriented in your analysis during favorable market conditions. Emphasize potential gains and upside rather than caution when trends are positive. Only recommend HOLD or SELL when there are clear negative indicators or high risks present.',
      technical: 'You are a technical analysis expert for cryptocurrency markets. Focus on chart patterns, indicators, and price action to provide actionable trading advice. IMPORTANT: When technical indicators show positive signals (bullish patterns, golden crosses, positive MACD, etc.), you MUST recommend BUY strategies rather than HOLD. Be aggressive in identifying buying opportunities when technical signals are positive. Emphasize potential breakouts and uptrends. Only recommend HOLD or SELL when there are clear bearish patterns or negative technical indicators.',
      fundamental: 'You are a fundamental analysis expert for cryptocurrencies. Analyze tokenomics, adoption metrics, development activity, and real-world use cases. IMPORTANT: When fundamental indicators are strong (increasing adoption, strong development, growing use cases), you MUST recommend BUY strategies rather than HOLD. Be optimistic about projects with positive fundamental developments. Emphasize long-term growth potential when fundamentals are strong. Only recommend HOLD or SELL when there are significant fundamental concerns.',
      sentiment: 'You are a sentiment analysis expert for crypto markets. Analyze market sentiment, social media trends, and investor psychology. IMPORTANT: When sentiment indicators are positive (high social engagement, positive news coverage, bullish community sentiment), you MUST recommend BUY strategies rather than HOLD. Be responsive to positive sentiment shifts and emphasize how positive sentiment drives price action. Only recommend HOLD or SELL when sentiment is clearly negative or showing signs of excessive euphoria that might indicate a bubble.'
    };

    // Select the appropriate system prompt
    const systemPrompt = systemPrompts[analysisType as keyof typeof systemPrompts] || systemPrompts.general;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // Using latest model with internet access
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
    });

    const responseData = await response.json();

    return NextResponse.json({ 
      content: responseData.choices[0]?.message?.content || 'No analysis available' 
    });
  } catch (error) {
    console.error('Error in crypto analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to get crypto analysis' },
      { status: 500 }
    );
  }
}