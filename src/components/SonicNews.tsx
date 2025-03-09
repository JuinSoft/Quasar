'use client';

import { useState, useEffect } from 'react';
import { FaNewspaper, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
}

export default function SonicNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSonicNews = async () => {
      try {
        setLoading(true);
        // Call our API endpoint to search for Sonic coin news
        const response = await fetch('/api/sonic-news');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Sonic news');
        }
        
        const data = await response.json();
        setNews(data);
      } catch (err) {
        console.error('Error fetching Sonic news:', err);
        setError('Failed to load Sonic news');
      } finally {
        setLoading(false);
      }
    };

    fetchSonicNews();
  }, []);

  if (loading) {
    return (
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FaNewspaper className="text-blue-400" />
          <h2 className="text-xl font-semibold gradient-text gradient-secondary">Sonic News</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FaNewspaper className="text-blue-400" />
          <h2 className="text-xl font-semibold gradient-text gradient-secondary">Sonic News</h2>
        </div>
        <p className="text-center text-gray-400 py-4">
          {error || "No recent news found for Sonic coin."}
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <FaNewspaper className="text-blue-400" />
        <h2 className="text-xl font-semibold gradient-text gradient-secondary">Latest Sonic News</h2>
      </div>
      
      <div className="space-y-4">
        {news.slice(0, 3).map((item, index) => (
          <motion.div 
            key={index}
            className="bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/70 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="font-medium text-white mb-2 hover:text-blue-400 transition-colors flex items-start">
                <span>{item.title}</span>
                <FaExternalLinkAlt className="text-xs ml-2 mt-1 text-gray-400" />
              </h3>
              <p className="text-sm text-gray-400 mb-2">{item.snippet}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <a 
          href="https://www.google.com/search?q=Sonic+coin+crypto+news" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View more news →
        </a>
      </div>
    </div>
  );
} 