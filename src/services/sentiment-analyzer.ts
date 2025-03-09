import axios from 'axios';
import { Coin, getCoins, getMarketOverview } from './livecoinwatch';
import OpenAI from 'openai';
import { CRYPTO_NAME_TO_SYMBOL } from '@/utils/cryptoIcons';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Only for demo purposes
});

// Types for news data
interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
}

// Types for sentiment analysis
export interface TokenSentiment {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  analysis: string;
}

/**
 * Fetches news data from the API
 */
async function fetchNewsData(): Promise<NewsItem[]> {
  try {
    // Use absolute URL with origin to fix the invalid URL error
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const response = await axios.get(`${baseUrl}/api/news`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news data:', error);
    return [];
  }
}

/**
 * Extracts basic price data for GPT analysis
 */
function extractPriceData(coin: Coin): Partial<TokenSentiment> {
  const { name, code: symbol, rate: price, delta, volume, cap: marketCap } = coin;
  
  // Extract price changes - delta values are already in percentage format
  const hourChange = delta.hour;
  const dayChange = delta.day;
  const weekChange = delta.week;
  const monthChange = delta.month;
  
  return {
    name,
    symbol,
    price,
    change24h: dayChange,
    marketCap,
    volume24h: volume
  };
}

/**
 * Filters news relevant to a specific coin
 */
function filterRelevantNews(news: NewsItem[], symbol: string): NewsItem[] {
  // Filter news relevant to this coin
  return news.filter(item => {
    const content = (item.title + ' ' + item.contentSnippet).toLowerCase();
    
    // Direct symbol match
    if (content.includes(symbol.toLowerCase())) {
      return true;
    }
    
    // Check for name matches based on the symbol
    for (const [name, mappedSymbol] of Object.entries(CRYPTO_NAME_TO_SYMBOL)) {
      if (mappedSymbol === symbol && content.includes(name)) {
        return true;
      }
    }
    
    // Common name mappings for major coins
    const commonMappings: Record<string, string[]> = {
      'Sonic': ['sonic', 's'],
      'Polygon': ['polygon', 'pol'],
      'BTC': ['bitcoin', 'btc'],
      'ETH': ['ethereum', 'eth'],
      'SOL': ['solana', 'sol'],
      'BNB': ['binance', 'bnb'],
      'XRP': ['ripple', 'xrp'],
      'ADA': ['cardano', 'ada'],
      'DOGE': ['dogecoin', 'doge'],
      'DOT': ['polkadot', 'dot']
    };
    
    if (commonMappings[symbol]) {
      return commonMappings[symbol].some(term => content.includes(term));
    }
    
    return false;
  });
}

/**
 * Uses GPT to analyze market data and news for a specific coin
 */
async function analyzeWithGPT(
  priceData: Partial<TokenSentiment>, 
  relevantNews: NewsItem[]
): Promise<TokenSentiment> {
  try {
    // Prepare the prompt with price data
    const { name, symbol, price, change24h, marketCap, volume24h } = priceData;
    
    // Format market cap and volume for better readability
    const formattedMarketCap = marketCap ? `$${(marketCap / 1000000000).toFixed(2)}B` : 'Unknown';
    const formattedVolume = volume24h ? `$${(volume24h / 1000000000).toFixed(2)}B` : 'Unknown';
    
    // Create a summary of recent news
    let newsContext = '';
    if (relevantNews.length > 0) {
      newsContext = `\nRecent news about ${name} (${symbol}):\n`;
      relevantNews.slice(0, 5).forEach((item, index) => {
        newsContext += `${index + 1}. ${item.title} (Source: ${item.source}, Date: ${new Date(item.pubDate).toLocaleDateString()})\n`;
        if (item.contentSnippet) {
          newsContext += `   Summary: ${item.contentSnippet.substring(0, 200)}...\n`;
        }
      });
    } else {
      newsContext = `\nNo specific recent news found for ${name} (${symbol}).\n`;
    }
    
    // Add market context based on the cryptocurrency
    let marketContext = '';
    if (symbol === 'BTC') {
      marketContext = '\nBitcoin is the largest cryptocurrency by market cap and often influences the entire market.\n';
    } else if (symbol === 'ETH') {
      marketContext = '\nEthereum is the second-largest cryptocurrency and powers many DeFi applications and smart contracts.\n';
    } else if (symbol === 'SOL') {
      marketContext = '\nSolana is known for its high throughput and low transaction costs, competing with Ethereum.\n';
    } else if (symbol === 'BNB') {
      marketContext = '\nBinance Coin is the native token of Binance, one of the largest cryptocurrency exchanges.\n';
    } else if (symbol === 'S') {
      marketContext = '\nSonic is the highest-performing EVM L1, combining speed, incentives, and world-class infrastructure, powering the next generation of DeFi applications. The chain provides 10,000 TPS and sub-second finality.The S token is Sonic\'s native token, used for paying transaction fees, staking, running validators, and participating in governance.\n';
    }
    
    // Create the prompt for GPT
    const prompt = `
You are a cryptocurrency market analyst. Analyze the following market data and news for ${name} (${symbol}):

Market Data:
- Current Price: $${price}
- 24h Change: ${change24h !== undefined ? (change24h > 0 ? '+' : '') + change24h.toFixed(2) : 'Unknown'}%
- Market Cap: ${formattedMarketCap}
- 24h Trading Volume: ${formattedVolume}
${marketContext}
${newsContext}

Based on this information, provide:
1. Overall market sentiment (positive, negative, or neutral)
2. Recommended action (buy, sell, or hold)
3. Confidence level (0.0 to 1.0)
4. Brief analysis explaining your recommendation (max 2-3 sentences)

Format your response as a JSON object with the following structure:
{
  "sentiment": "positive|negative|neutral",
  "action": "buy|sell|hold",
  "confidence": 0.XX,
  "analysis": "Your brief analysis here"
}
`;

    // Call GPT API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a cryptocurrency market analyst providing concise, data-driven analysis." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    const analysis = JSON.parse(content);
    
    // Return the complete TokenSentiment object
    return {
      name: name || '',
      symbol: symbol || '',
      price: price || 0,
      change24h: change24h || 0,
      marketCap: marketCap || 0,
      volume24h: volume24h || 0,
      sentiment: analysis.sentiment,
      action: analysis.action,
      confidence: analysis.confidence,
      analysis: analysis.analysis
    };
  } catch (error) {
    console.error(`Error analyzing ${priceData.symbol} with GPT:`, error);
    
    // Fallback to basic sentiment if GPT fails
    return {
      name: priceData.name || '',
      symbol: priceData.symbol || '',
      price: priceData.price || 0,
      change24h: priceData.change24h || 0,
      marketCap: priceData.marketCap || 0,
      volume24h: priceData.volume24h || 0,
      sentiment: 'neutral',
      action: 'hold',
      confidence: 0.5,
      analysis: `Unable to generate AI analysis for ${priceData.name}. Using default neutral sentiment.`
    };
  }
}

/**
 * Generates market sentiment analysis using GPT based on price data and news
 */
export async function generateMarketSentiment(): Promise<TokenSentiment[]> {
  try {
    // Fetch crypto data
    const coins = await getCoins(20);
    const news = await fetchNewsData();
    
    // Process each coin with GPT
    const sentimentPromises = coins.map(async (coin) => {
      // Extract price data
      const priceData = extractPriceData(coin);
      
      // Filter relevant news
      const relevantNews = filterRelevantNews(news, coin.code);
      
      // Analyze with GPT
      return await analyzeWithGPT(priceData, relevantNews);
    });
    
    // Wait for all analyses to complete
    const sentiments = await Promise.all(sentimentPromises);
    
    return sentiments;
  } catch (error) {
    console.error('Error generating market sentiment:', error);
    return [];
  }
} 