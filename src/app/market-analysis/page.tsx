'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaChartLine, FaThumbsUp, FaThumbsDown, FaHandsHelping } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

interface CryptoToken {
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

export default function MarketAnalysisPage() {
  const [tokens, setTokens] = useState<CryptoToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterAction, setFilterAction] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        setLoading(true);
        
        // Fetch market analysis from our API
        const response = await axios.get('/api/market-analysis');
        
        if (response.data && response.data.tokens) {
          setTokens(response.data.tokens);
        } else {
          throw new Error('Invalid response format');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data. Please try again later.');
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const aValue = a[sortBy as keyof CryptoToken];
    const bValue = b[sortBy as keyof CryptoToken];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const filteredTokens = filterAction 
    ? sortedTokens.filter(token => token.action === filterAction)
    : sortedTokens;

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
        <h1 className="text-4xl font-bold gradient-text gradient-primary mb-4">Market Analysis</h1>
        <p className="text-xl text-gray-300">AI-powered sentiment analysis and trading recommendations</p>
      </motion.div>

      <div className="mb-8 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setFilterAction(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filterAction === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setFilterAction('buy')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            filterAction === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaThumbsUp size={12} /> Buy Recommendations
        </button>
        <button
          onClick={() => setFilterAction('hold')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            filterAction === 'hold'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaHandsHelping size={12} /> Hold Recommendations
        </button>
        <button
          onClick={() => setFilterAction('sell')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            filterAction === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FaThumbsDown size={12} /> Sell Recommendations
        </button>
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
                  <th className="px-4 py-3 text-left">
                    <button 
                      className="flex items-center font-medium"
                      onClick={() => handleSort('name')}
                    >
                      Token
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button 
                      className="flex items-center font-medium ml-auto"
                      onClick={() => handleSort('price')}
                    >
                      Price
                      {sortBy === 'price' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button 
                      className="flex items-center font-medium ml-auto"
                      onClick={() => handleSort('change24h')}
                    >
                      24h Change
                      {sortBy === 'change24h' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    <button 
                      className="flex items-center font-medium ml-auto"
                      onClick={() => handleSort('marketCap')}
                    >
                      Market Cap
                      {sortBy === 'marketCap' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    <button 
                      className="flex items-center font-medium ml-auto"
                      onClick={() => handleSort('volume24h')}
                    >
                      Volume (24h)
                      {sortBy === 'volume24h' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button 
                      className="flex items-center font-medium mx-auto"
                      onClick={() => handleSort('action')}
                    >
                      Recommendation
                      {sortBy === 'action' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredTokens.map((token, index) => (
                  <motion.tr 
                    key={token.symbol}
                    className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors"
                    variants={item}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 mr-3 bg-gray-700 rounded-full flex items-center justify-center">
                          {token.symbol.substring(0, 1)}
                        </div>
                        <div>
                          <div className="font-medium">{token.name}</div>
                          <div className="text-gray-500 text-sm">{token.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatPrice(token.price)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={`flex items-center justify-end ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {token.change24h >= 0 ? <FaArrowUp size={12} className="mr-1" /> : <FaArrowDown size={12} className="mr-1" />}
                        {formatPercentage(token.change24h)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400 hidden md:table-cell">
                      {formatNumber(token.marketCap)}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400 hidden md:table-cell">
                      {formatNumber(token.volume24h)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 ${getActionColor(token.action)}`}>
                          {getActionIcon(token.action)}
                          {token.action}
                        </span>
                        <div className="w-24 mt-1">
                          {getConfidenceBar(token.confidence)}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 gradient-text gradient-secondary text-center">Detailed Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTokens.map((token, index) => (
            <motion.div 
              key={token.symbol}
              className="glass rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3 bg-gray-700 rounded-full flex items-center justify-center">
                    {token.symbol.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{token.name}</h3>
                    <div className="text-gray-500">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(token.price)}</div>
                  <div className={`${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-end`}>
                    {token.change24h >= 0 ? <FaArrowUp size={10} className="mr-1" /> : <FaArrowDown size={10} className="mr-1" />}
                    {formatPercentage(token.change24h)}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Market Cap</span>
                  <span>Volume (24h)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{formatNumber(token.marketCap)}</span>
                  <span>{formatNumber(token.volume24h)}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className={`${getSentimentColor(token.sentiment)} font-medium mr-2 capitalize`}>
                      {token.sentiment} Sentiment
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 ${getActionColor(token.action)}`}>
                    {getActionIcon(token.action)}
                    {token.action}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Confidence</span>
                  <span>{Math.round(token.confidence * 100)}%</span>
                </div>
                {getConfidenceBar(token.confidence)}
              </div>
              
              <p className="text-gray-300 text-sm">{token.analysis}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/news" 
          className="btn bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg"
        >
          View Crypto News
        </Link>
      </div>
    </div>
  );
} 