import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Define the RSS feed URLs
const RSS_FEEDS = {
  COINTELEGRAPH: 'https://cointelegraph.com/rss',
  BITCOINMAGAZINE: 'https://bitcoinmagazine.com/feed',
  BITCOINIST: 'https://bitcoinist.com/feed/',
  NEWSBTC: 'https://www.newsbtc.com/feed'
};

// Create a new parser
const parser = new Parser();

export async function GET() {
  try {
    // Fetch and parse all feeds in parallel
    const feedPromises = [
      fetchFeed(RSS_FEEDS.COINTELEGRAPH, 'CoinTelegraph'),
      fetchFeed(RSS_FEEDS.BITCOINMAGAZINE, 'Bitcoin Magazine'),
      fetchFeed(RSS_FEEDS.BITCOINIST, 'Bitcoinist'),
      fetchFeed(RSS_FEEDS.NEWSBTC, 'NewsBTC')
    ];

    // Wait for all feeds to be fetched and parsed
    const feedsResults = await Promise.allSettled(feedPromises);
    
    // Filter out rejected promises and flatten the array of items
    const allItems = feedsResults
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any[]>).value)
      .flat();

    // Sort by publication date (newest first)
    const sortedItems = allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.isoDate || 0);
      const dateB = new Date(b.pubDate || b.isoDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Return the sorted items
    return NextResponse.json(sortedItems);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news feeds' },
      { status: 500 }
    );
  }
}

async function fetchFeed(url: string, sourceName: string) {
  try {
    const feed = await parser.parseURL(url);
    // Map the feed items to a consistent format and add the source name
    return feed.items.map(item => ({
      ...item,
      source: sourceName
    }));
  } catch (error) {
    console.error(`Error fetching feed from ${sourceName}:`, error);
    return [];
  }
} 