'use client';

import { useState, useEffect } from 'react';
import { getCoin } from '@/services/livecoinwatch';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaGlobe, FaTwitter, FaReddit, FaTelegram, FaDiscord, FaInstagram } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SonicCoinInfo() {
  const [sonicData, setSonicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSonicData = async () => {
      try {
        setLoading(true);
        const data = await getCoin('S');
        setSonicData(data);
      } catch (err) {
        setError('Failed to fetch Sonic coin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSonicData();
  }, []);

  if (loading) {
    return (
      <div className="glass p-8 rounded-2xl shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="flex flex-wrap gap-6">
            <div className="h-24 bg-gray-700 rounded w-full md:w-64"></div>
            <div className="h-24 bg-gray-700 rounded w-full md:w-64"></div>
            <div className="h-24 bg-gray-700 rounded w-full md:w-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sonicData) {
    return (
      <div className="glass p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 gradient-text gradient-primary">Sonic Coin (S)</h2>
        <p className="text-red-400">
          {error || 'Failed to load Sonic coin data. Please try again later.'}
        </p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  return (
    <div className="glass p-8 rounded-2xl shadow-xl">
      <div className="flex items-center mb-6">
        {sonicData.png64 && (
          <Image 
            src={sonicData.png64} 
            alt="Sonic" 
            width={40} 
            height={40} 
            className="mr-4"
          />
        )}
        <h2 className="text-2xl font-semibold gradient-text gradient-primary">
          {sonicData.name} (S)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="bg-gray-800/50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-gray-400 text-sm mb-1">Price</div>
          <div className="text-2xl font-bold">${sonicData.rate.toFixed(4)}</div>
          <div className={`flex items-center text-sm mt-2 ${sonicData.delta.day >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {sonicData.delta.day >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(sonicData.delta.day).toFixed(2)}% (24h)
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-gray-400 text-sm mb-1">Volume (24h)</div>
          <div className="text-2xl font-bold">${formatNumber(sonicData.volume)}</div>
          <div className="text-sm text-gray-400 mt-2">
            Liquidity: ${formatNumber(sonicData.liquidity || 0)}
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-gray-400 text-sm mb-1">Supply</div>
          <div className="text-2xl font-bold">{formatNumber(sonicData.totalSupply)}</div>
          <div className="text-sm text-gray-400 mt-2">
            All-time high: ${sonicData.allTimeHighUSD?.toFixed(4) || 'N/A'}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div 
          className="bg-gray-800/50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-gray-400 text-sm mb-3">Price Change</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-400">1h</div>
              <div className={`${sonicData.delta.hour >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {sonicData.delta.hour >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
                {Math.abs(sonicData.delta.hour).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">24h</div>
              <div className={`${sonicData.delta.day >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {sonicData.delta.day >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
                {Math.abs(sonicData.delta.day).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">7d</div>
              <div className={`${sonicData.delta.week >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {sonicData.delta.week >= 0 ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
                {Math.abs(sonicData.delta.week).toFixed(2)}%
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/50 p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-gray-400 text-sm mb-3">Market Data</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Rank</div>
              <div className="text-white">#{sonicData.rank || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Exchanges</div>
              <div className="text-white flex items-center">
                <FaExchangeAlt className="mr-2" size={12} />
                {sonicData.exchanges || 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Social Links */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-gray-400 text-sm mb-3">Official Links</div>
        <div className="flex flex-wrap gap-3">
          {sonicData.links?.website && (
            <a 
              href={sonicData.links.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
              title="Website"
            >
              <FaGlobe size={16} />
            </a>
          )}
          {sonicData.links?.twitter && (
            <a 
              href={sonicData.links.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-blue-800 p-2 rounded-full transition-colors"
              title="Twitter"
            >
              <FaTwitter size={16} />
            </a>
          )}
          {sonicData.links?.telegram && (
            <a 
              href={sonicData.links.telegram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-blue-600 p-2 rounded-full transition-colors"
              title="Telegram"
            >
              <FaTelegram size={16} />
            </a>
          )}
          {sonicData.links?.discord && (
            <a 
              href={sonicData.links.discord} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-indigo-700 p-2 rounded-full transition-colors"
              title="Discord"
            >
              <FaDiscord size={16} />
            </a>
          )}
          {sonicData.links?.reddit && (
            <a 
              href={sonicData.links.reddit} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-orange-700 p-2 rounded-full transition-colors"
              title="Reddit"
            >
              <FaReddit size={16} />
            </a>
          )}
          {sonicData.links?.instagram && (
            <a 
              href={sonicData.links.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-pink-700 p-2 rounded-full transition-colors"
              title="Instagram"
            >
              <FaInstagram size={16} />
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
} 