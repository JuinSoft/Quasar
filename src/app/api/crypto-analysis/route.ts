import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a crypto market analysis expert. Provide detailed insights about cryptocurrency markets, trends, and investment strategies. Focus on providing factual information and balanced analysis.'
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      content: response.choices[0]?.message?.content || 'No analysis available' 
    });
  } catch (error) {
    console.error('Error in crypto analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to get crypto analysis' },
      { status: 500 }
    );
  }
} 