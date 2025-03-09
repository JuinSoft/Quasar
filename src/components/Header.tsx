'use client';

import WalletConnect from './WalletConnect';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
            Quasar
          </Link>
          <span className="text-sm bg-blue-600 px-2 py-1 rounded-full">Sonic Blockchain</span>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
} 