'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaSync, FaThumbsUp, FaThumbsDown, FaHandsHelping, FaRobot } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { getCoins } from '@/services/livecoinwatch';
import { TokenSentiment, generateMarketSentiment } from '@/services/sentiment-analyzer';
import { CryptoIcon } from '@/utils/cryptoIcons';

export default function LiveCryptoData() {
  const [tokens, setTokens] = useState<TokenSentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchData(true);
    }, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Fetch market analysis from our API
      const response = await axios.get('/api/market-analysis');
      
      if (response.data && response.data.tokens) {
        setTokens(response.data.tokens);
        setLastUpdated(new Date());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(decimals)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(decimals)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(decimals)}K`;
    } else {
      return `$${num.toFixed(decimals)}`;
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 10) {
      return `$${price.toFixed(3)}`;
    } else if (price < 1000) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

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
      case 'buy': return 'bg-green-900/20 text-green-400';
      case 'sell': return 'bg-red-900/20 text-red-400';
      case 'hold': return 'bg-blue-900/20 text-blue-400';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const width = `${Math.round(confidence * 100)}%`;
    const color = confidence > 0.8 ? 'bg-green-500' : confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
        <div className={`${color} h-2 rounded-full`} style={{ width }}></div>
      </div>
    );
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
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Live Crypto Data</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={() => fetchData()} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            disabled={loading || refreshing}
          >
            <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
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
        <div className="glass rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 text-sm">
                  <th className="px-4 py-3 text-left">Token</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">24h Change</th>
                  <th className="px-4 py-3 text-right">Market Cap</th>
                  <th className="px-4 py-3 text-right">Volume (24h)</th>
                  <th className="px-4 py-3 text-center">Sentiment</th>
                  <th className="px-4 py-3 text-center">Action</th>
                  <th className="px-4 py-3 text-center">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <motion.tr 
                    key={token.symbol}
                    variants={item}
                    className={index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 relative">
                          <CryptoIcon 
                            symbol={token.symbol} 
                            className="w-8 h-8"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-xs text-gray-400">{token.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatPrice(token.price)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                        {formatPercentage(token.change24h)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300">
                      {formatNumber(token.marketCap)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-300">
                      {formatNumber(token.volume24h)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(token.sentiment)}`}>
                        {token.sentiment.charAt(0).toUpperCase() + token.sentiment.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${getActionColor(token.action)}`}>
                        {getActionIcon(token.action)}
                        {token.action.charAt(0).toUpperCase() + token.action.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-32">
                      <div className="text-center text-xs mb-1">{Math.round(token.confidence * 100)}%</div>
                      {getConfidenceBar(token.confidence)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && tokens.length > 0 && (
        <motion.div 
          className="mt-8 glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            GPT Analysis <FaRobot className="text-blue-400" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tokens.map((token) => (
              <div key={`analysis-${token.symbol}`} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 relative">
                    <CryptoIcon 
                      symbol={token.symbol} 
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="font-medium">{token.name} ({token.symbol})</div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${getActionColor(token.action)}`}>
                    {token.action.charAt(0).toUpperCase() + token.action.slice(1)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{token.analysis}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 