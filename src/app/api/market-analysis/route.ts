import { NextResponse } from 'next/server';
import { generateMarketSentiment } from '@/services/sentiment-analyzer';

export async function GET() {
  try {
    // Generate market sentiment using our custom analyzer
    const tokens = await generateMarketSentiment();
    
    if (!tokens || tokens.length === 0) {
      throw new Error('Failed to generate market sentiment');
    }

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error in market analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market data' },
      { status: 500 }
    );
  }
} 