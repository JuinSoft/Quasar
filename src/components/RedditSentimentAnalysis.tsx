'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaReddit, FaArrowUp, FaArrowDown, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

interface RedditPost {
  title: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

interface RedditSentiment {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  postCount: number;
  topPosts: RedditPost[];
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  lastUpdated: Date;
}

export default function RedditSentimentAnalysis() {
  const [sentiment, setSentiment] = useState<RedditSentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedditSentiment = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call your backend API
        // For now, we'll simulate the data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data for demonstration
        const mockSentiment: RedditSentiment = {
          overallSentiment: 'positive',
          sentimentScore: 0.72,
          postCount: 47,
          positivePercentage: 65,
          negativePercentage: 15,
          neutralPercentage: 20,
          lastUpdated: new Date(),
          topPosts: [
            {
              title: "Sonic's new partnership with major exchange announced!",
              url: "https://reddit.com/r/0xSonic/post1",
              score: 156,
              num_comments: 32,
              created_utc: Date.now() / 1000 - 86400
            },
            {
              title: "Technical analysis: Sonic breaking resistance levels",
              url: "https://reddit.com/r/0xSonic/post2",
              score: 98,
              num_comments: 24,
              created_utc: Date.now() / 1000 - 172800
            },
            {
              title: "Community update: Sonic development roadmap for Q3",
              url: "https://reddit.com/r/0xSonic/post3",
              score: 87,
              num_comments: 19,
              created_utc: Date.now() / 1000 - 259200
            }
          ]
        };
        
        setSentiment(mockSentiment);
      } catch (err) {
        console.error('Error fetching Reddit sentiment:', err);
        setError('Failed to load Reddit sentiment data');
      } finally {
        setLoading(false);
      }
    };

    fetchRedditSentiment();
  }, []);

  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center space-x-2 py-8">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span className="text-gray-300">Analyzing r/0xSonic sentiment...</span>
        </div>
      </div>
    );
  }

  if (error || !sentiment) {
    return (
      <div className="glass p-6 rounded-2xl shadow-xl">
        <div className="flex items-center mb-4">
          <FaReddit className="text-red-500 text-2xl mr-2" />
          <h2 className="text-xl font-semibold">Reddit Sentiment Analysis</h2>
        </div>
        <p className="text-red-400">
          {error || 'Failed to load Reddit sentiment data. Please try again later.'}
        </p>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'neutral': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center mb-6">
        <FaReddit className="text-red-500 text-2xl mr-2" />
        <h2 className="text-xl font-semibold">r/0xSonic Sentiment Analysis</h2>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className={`${getSentimentColor(sentiment.overallSentiment)} font-medium text-lg capitalize`}>
              {sentiment.overallSentiment} Sentiment
            </span>
            <span className="ml-2 text-sm text-gray-400">
              ({sentiment.sentimentScore.toFixed(2)} score)
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {sentiment.postCount} posts analyzed
          </div>
        </div>
        
        <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 h-full" 
              style={{ width: `${sentiment.positivePercentage}%` }}
              title={`Positive: ${sentiment.positivePercentage}%`}
            ></div>
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${sentiment.neutralPercentage}%` }}
              title={`Neutral: ${sentiment.neutralPercentage}%`}
            ></div>
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${sentiment.negativePercentage}%` }}
              title={`Negative: ${sentiment.negativePercentage}%`}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <span>{sentiment.positivePercentage}% Positive</span>
          <span>{sentiment.neutralPercentage}% Neutral</span>
          <span>{sentiment.negativePercentage}% Negative</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-md font-medium mb-3">Top Posts</h3>
        <div className="space-y-3">
          {sentiment.topPosts.map((post, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800/50 p-3 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:text-blue-400 transition-colors"
              >
                {post.title}
              </a>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <FaArrowUp className="text-green-400 mr-1" />
                  {post.score} points
                </div>
                <div>{post.num_comments} comments</div>
                <div>{formatTimeAgo(post.created_utc)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="text-right text-xs text-gray-500">
        Last updated: {formatDate(sentiment.lastUpdated)}
      </div>
    </div>
  );
} 