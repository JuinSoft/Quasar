'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaArrowLeft, FaThumbsUp, FaThumbsDown, FaHandsHelping } from 'react-icons/fa';
import Link from 'next/link';

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  summary: string;
  tokens: {
    name: string;
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reason: string;
  }[];
}

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title');
  
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function analyzeSentiment() {
      if (!url) {
        setError('No URL provided for analysis');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // In a real app, this would call your API to analyze the article
        // For demo purposes, we'll simulate a response after a delay
        setTimeout(() => {
          const mockAnalysis: SentimentAnalysis = {
            sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
            score: Math.random(),
            summary: "This article discusses recent developments in the cryptocurrency market, highlighting both opportunities and risks. It mentions regulatory changes and technological advancements that could impact various tokens.",
            tokens: [
              {
                name: "Bitcoin (BTC)",
                action: Math.random() > 0.5 ? 'buy' : (Math.random() > 0.5 ? 'sell' : 'hold'),
                confidence: 0.7 + Math.random() * 0.3,
                reason: "Strong institutional adoption and positive market sentiment"
              },
              {
                name: "Ethereum (ETH)",
                action: Math.random() > 0.5 ? 'buy' : (Math.random() > 0.5 ? 'sell' : 'hold'),
                confidence: 0.7 + Math.random() * 0.3,
                reason: "Upcoming protocol upgrades and growing DeFi ecosystem"
              },
              {
                name: "Solana (SOL)",
                action: Math.random() > 0.5 ? 'buy' : (Math.random() > 0.5 ? 'sell' : 'hold'),
                confidence: 0.7 + Math.random() * 0.3,
                reason: "Increasing developer activity and network performance improvements"
              },
              {
                name: "Cardano (ADA)",
                action: Math.random() > 0.5 ? 'buy' : (Math.random() > 0.5 ? 'sell' : 'hold'),
                confidence: 0.7 + Math.random() * 0.3,
                reason: "New partnerships and ecosystem growth"
              }
            ]
          };
          
          setAnalysis(mockAnalysis);
          setLoading(false);
        }, 2000);
      } catch (err) {
        setError('Failed to analyze the article. Please try again later.');
        console.error(err);
        setLoading(false);
      }
    }

    analyzeSentiment();
  }, [url]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'neutral': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <FaThumbsUp className="text-green-400" />;
      case 'sell': return <FaThumbsDown className="text-red-400" />;
      case 'hold': return <FaHandsHelping className="text-blue-400" />;
      default: return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-900/20 text-green-400 border-green-800/30';
      case 'sell': return 'bg-red-900/20 text-red-400 border-red-800/30';
      case 'hold': return 'bg-blue-900/20 text-blue-400 border-blue-800/30';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const width = `${Math.round(confidence * 100)}%`;
    const color = confidence > 0.8 ? 'bg-green-500' : confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
        <div className={`${color} h-2.5 rounded-full`} style={{ width }}></div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/news" className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
        <FaArrowLeft className="mr-2" /> Back to News
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-xl p-8 shadow-xl mb-8"
      >
        <h1 className="text-2xl font-bold mb-4">{title || 'Article Analysis'}</h1>
        
        {url && (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors"
          >
            View Original Article <FaExternalLinkAlt className="ml-2" size={12} />
          </a>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Analyzing article sentiment...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-900/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : analysis && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 glass rounded-lg">
              <div>
                <h2 className="text-lg font-medium mb-1">Overall Sentiment</h2>
                <p className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment)} capitalize`}>
                  {analysis.sentiment}
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{Math.round(analysis.score * 100)}%</span>
                  <div className="w-32 bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`${analysis.sentiment === 'positive' ? 'bg-green-500' : analysis.sentiment === 'negative' ? 'bg-red-500' : 'bg-blue-500'} h-2.5 rounded-full`} 
                      style={{ width: `${Math.round(analysis.score * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">Summary</h2>
              <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Token Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.tokens.map((token, index) => (
                  <motion.div 
                    key={index}
                    className="border border-gray-800 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-4 ${getActionColor(token.action)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{token.name}</h3>
                        <div className="flex items-center gap-1">
                          {getActionIcon(token.action)}
                          <span className="text-sm font-medium uppercase">{token.action}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{token.reason}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Confidence</span>
                        <span>{Math.round(token.confidence * 100)}%</span>
                      </div>
                      {getConfidenceBar(token.confidence)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="text-center mt-8">
        <Link 
          href="/market-analysis" 
          className="btn bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg"
        >
          View Full Market Analysis
        </Link>
      </div>
    </div>
  );
} 