'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { FAUCET_URL } from '@/config/chains';

export default function WalletConnect() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ConnectButton />
      
      <div className="text-center mt-2 text-sm">
        <p className="text-gray-400">
          Need test tokens? Visit the{' '}
          <Link 
            href={FAUCET_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Sonic Faucet
          </Link>
        </p>
      </div>
    </div>
  );
} 