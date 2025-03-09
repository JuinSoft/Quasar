'use client';

import WalletConnect from './WalletConnect';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaHome, FaNewspaper, FaChartLine, FaBitcoin } from 'react-icons/fa';

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