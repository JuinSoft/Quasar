'use client';

import { motion } from 'framer-motion';
import LiveCryptoData from '@/components/LiveCryptoData';
import Link from 'next/link';
import { FaChartLine, FaNewspaper, FaRobot } from 'react-icons/fa';

export default function LiveCryptoPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text gradient-primary mb-4">Live Crypto Market</h1>
        <p className="text-xl text-gray-300">Real-time cryptocurrency data with GPT-powered market prediction</p>
      </motion.div>

      <LiveCryptoData />

      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        <Link 
          href="/news" 
          className="btn bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <FaNewspaper /> View Crypto News
        </Link>
        <Link 
          href="/market-analysis" 
          className="btn bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg flex items-center gap-2"
        >
          <FaChartLine /> Market Analysis
        </Link>
      </div>

      <motion.div 
        className="mt-12 glass rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">About This Page</h2>
        <p className="text-gray-300 mb-4">
          This page displays live cryptocurrency data from LiveCoinWatch API and uses GPT to generate market predictions and trading signals.
        </p>
        <p className="text-gray-300 mb-4">
          Our advanced approach combines:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
          <li>Real-time price data from LiveCoinWatch API</li>
          <li>Latest cryptocurrency news from multiple RSS feeds</li>
          <li>GPT-powered analysis of market conditions and news sentiment</li>
          <li>AI-generated trading recommendations with confidence scores</li>
        </ul>
        <p className="text-gray-300 flex items-center gap-2">
          <FaRobot className="text-blue-400" /> GPT analyzes both technical market data and news content to provide more nuanced and context-aware predictions.
        </p>
      </motion.div>
    </div>
  );
} 