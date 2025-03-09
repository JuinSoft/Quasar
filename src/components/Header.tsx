'use client';

import { useEffect, useState } from 'react';
import WalletConnect from './WalletConnect';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHome, FaNewspaper, FaChartLine, FaBitcoin, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { getCoin } from '@/services/livecoinwatch';
import Image from 'next/image';

// SonicPrice component to display the Sonic coin price
const SonicPrice = () => {
  const [sonicData, setSonicData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSonicPrice = async () => {
      try {
        setLoading(true);
        const data = await getCoin('S');
        setSonicData(data);
      } catch (err) {
        setError('Failed to fetch Sonic price');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSonicPrice();
    // Refresh price every 60 seconds
    const interval = setInterval(fetchSonicPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400">Loading Sonic price...</div>;
  }

  if (error || !sonicData) {
    return <div className="text-sm text-red-400">Error loading Sonic price</div>;
  }

  const priceChange = sonicData.delta.day;
  const isPositive = priceChange >= 0;

  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-full">
      {sonicData.webp64 && (
        <div className="w-6 h-6 relative">
          <Image 
            src={sonicData.webp64} 
            alt="Sonic" 
            width={24} 
            height={24} 
            className="rounded-full"
          />
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-medium">${sonicData.rate.toFixed(4)}</span>
          <span className={`ml-2 text-xs flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <FaArrowUp size={10} className="mr-1" /> : <FaArrowDown size={10} className="mr-1" />}
            {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>
        <span className="text-xs text-gray-400">Sonic (S)</span>
      </div>
    </div>
  );
};

export default function Header() {
  return (
    <motion.header 
      className="bg-gray-900/80 backdrop-blur-md text-white py-4 px-6 shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold gradient-text gradient-primary hover:opacity-80 transition-opacity">
            Quasar
          </Link>
          <span className="text-sm bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1 rounded-full">Sonic Blockchain</span>
        </div>
        
        {/* Sonic Price Display */}
        <div className="hidden md:block">
          <SonicPrice />
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
            <FaHome />
            <span>Home</span>
          </Link>
          <Link href="/live-crypto" className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
            <FaBitcoin />
            <span>Live Crypto</span>
          </Link>
          <Link href="/news" className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
            <FaNewspaper />
            <span>News</span>
          </Link>
          <Link href="/market-analysis" className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors">
            <FaChartLine />
            <span>Market Analysis</span>
          </Link>
        </nav>
        
        <WalletConnect />
      </div>
    </motion.header>
  );
} 