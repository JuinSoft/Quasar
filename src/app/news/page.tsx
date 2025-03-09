'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { FaExternalLinkAlt, FaCalendarAlt, FaNewspaper } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  source: string;
  guid: string;
  categories?: string[];
  isoDate?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  const filteredNews = activeSource 
    ? news.filter(item => item.source === activeSource)
    : news;

  const sources = [...new Set(news.map(item => item.source))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text gradient-primary mb-4">Crypto News</h1>
        <p className="text-xl text-gray-300">Stay updated with the latest cryptocurrency news</p>
      </motion.div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveSource(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeSource === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Sources
          </button>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSource === source
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-900/20 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredNews.map((newsItem, index) => (
            <motion.div
              key={newsItem.guid || index}
              className="glass rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              variants={item}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-900/30 text-blue-400">
                    {newsItem.source}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {formatDate(newsItem.pubDate)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold mb-3 line-clamp-2">{newsItem.title}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{newsItem.contentSnippet}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/news/analyze?url=${encodeURIComponent(newsItem.link)}&title=${encodeURIComponent(newsItem.title)}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Analyze Sentiment
                  </Link>
                  <a 
                    href={newsItem.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    Read More <FaExternalLinkAlt className="ml-1" size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && !error && filteredNews.length === 0 && (
        <div className="text-center p-12 glass rounded-xl">
          <FaNewspaper className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">No News Found</h3>
          <p className="text-gray-400">
            {activeSource 
              ? `No news articles available from ${activeSource}.` 
              : 'No news articles available at the moment.'}
          </p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link 
          href="/market-analysis" 
          className="btn bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg"
        >
          View Market Analysis
        </Link>
      </div>
    </div>
  );
} 