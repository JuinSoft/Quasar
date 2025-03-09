'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-white mb-2">Quasar</h3>
            <p className="text-sm">AI-powered crypto analysis on Sonic Blockchain</p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <h4 className="text-white font-semibold mb-2">Sonic Blockchain Resources</h4>
            <div className="flex flex-col space-y-1">
              <Link 
                href="https://testnet.sonicscan.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Block Explorer
              </Link>
              <Link 
                href="https://testnet.soniclabs.com/account" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Faucet
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Quasar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 