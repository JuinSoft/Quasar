import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { env } from '@/config/env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// System prompt for the contract assistant
const SYSTEM_PROMPT = `
You are an expert smart contract developer specializing in Solidity and blockchain development.
Your task is to assist users with their smart contract questions and provide helpful guidance.

When responding to questions:
1. Provide clear, concise explanations
2. Suggest best practices for security and gas optimization
3. If code changes are suggested, provide the full context to make implementation clear
4. Explain the reasoning behind your suggestions
5. If you detect potential security issues, highlight them prominently

Always prioritize security and correctness in your advice.
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, contractSource } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare the user message
    let userMessage = prompt;
    if (contractSource) {
      userMessage = `${prompt}\n\nHere is my current contract code:\n\`\`\`solidity\n${contractSource}\n\`\`\``;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Check if the response contains code suggestions
    let suggestedCode = null;
    if (contractSource) {
      const codeBlockMatch = response.match(/```solidity\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        // If the response contains a full contract, use it as the suggested code
        if (codeBlockMatch[1].includes('pragma solidity') || codeBlockMatch[1].includes('contract ')) {
          suggestedCode = codeBlockMatch[1];
        }
      }
    }

    return NextResponse.json({ 
      response,
      suggestedCode
    });
  } catch (error) {
    console.error('Error with AI assistant:', error);
    return NextResponse.json(
      { error: 'Failed to get AI assistance' },
      { status: 500 }
    );
  }
} 