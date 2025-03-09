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
    const response = await fetch('/api/crypto-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get crypto analysis');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error getting crypto analysis:', error);
    return 'Sorry, there was an error analyzing the crypto market. Please try again later.';
  }
} 