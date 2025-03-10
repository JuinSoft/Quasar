'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';

export default function Footer() {
  return (
    <motion.footer 
      className="bg-gray-900/80 backdrop-blur-md text-gray-400 py-8 px-6 border-t border-gray-800/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text gradient-primary mb-2">Quasar</h3>
            <p className="text-sm">AI-powered crypto analysis on Sonic Blockchain</p>
            <div className="flex space-x-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/live-crypto" className="text-gray-400 hover:text-white transition-colors text-sm">
                Live Crypto
              </Link>
              <Link href="/news" className="text-gray-400 hover:text-white transition-colors text-sm">
                Crypto News
              </Link>
              <Link href="/market-analysis" className="text-gray-400 hover:text-white transition-colors text-sm">
                Market Analysis
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-semibold mb-2">Sonic Blockchain Resources</h4>
            <div className="flex flex-col space-y-2">
              <Link 
                href="https://testnet.soniclabs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Block Explorer
              </Link>
              <Link 
                href="https://testnet.soniclabs.comaccount" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Faucet
              </Link>
              <Link 
                href="https://docs.soniclabs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Quasar. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
} 