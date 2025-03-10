import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/config/env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// System prompt for the DeFi assistant
const SYSTEM_PROMPT = `
You are a helpful DeFi assistant for the Quasar application, which is built on the Sonic blockchain.
Your role is to help users with their DeFi operations, including:

1. Cross-chain swaps and bridging using LI.FI
2. Portfolio management and analysis
3. Creating tokens and NFTs on Sonic blockchain
4. Lending and borrowing assets
5. Understanding DeFi concepts and strategies

When users ask about specific operations:
- For swaps and bridges, explain how to use the LI.FI widget
- For portfolio management, explain how to use the portfolio tab
- For token creation, guide them to the token creation tools
- For lending/borrowing, explain the available options

Always be helpful, concise, and accurate. If you don't know something, admit it rather than making up information.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userAddress } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Format messages for OpenAI
    const formattedMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: 'user' | 'assistant'; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Add user context if available
    if (userAddress) {
      formattedMessages.push({
        role: 'system' as const,
        content: `The user's wallet address is ${userAddress}`,
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return NextResponse.json({ content: responseContent });
  } catch (error) {
    console.error('Error in DeFi assistant API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 