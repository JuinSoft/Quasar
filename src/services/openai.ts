import OpenAI from 'openai';

// Initialize OpenAI client
// Note: In production, use environment variables for API keys
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo purposes
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getCryptoAnalysis(messages: ChatMessage[]): Promise<string> {
  try {
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

    return response.choices[0]?.message?.content || 'No analysis available';
  } catch (error) {
    console.error('Error getting crypto analysis:', error);
    return 'Sorry, there was an error analyzing the crypto market. Please try again later.';
  }
} 