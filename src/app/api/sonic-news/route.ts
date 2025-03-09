import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo purposes
});

export async function GET() {
  try {
    // Use OpenAI to search for recent Sonic coin news
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides the latest news about the Sonic cryptocurrency (S). Return the response as a JSON array of news items with title, url, source, date, and snippet fields."
        },
        {
          role: "user",
          content: "Find the latest news about Sonic cryptocurrency (S). Return only the 3 most recent and relevant news articles in JSON format with the following structure: [{title, url, source, date, snippet}]. Make sure the date is formatted as 'MMM DD, YYYY'."
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const parsedContent = JSON.parse(content);
    
    // Return the news items
    return NextResponse.json(parsedContent.news || []);
  } catch (error) {
    console.error('Error fetching Sonic news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sonic news' },
      { status: 500 }
    );
  }
} 