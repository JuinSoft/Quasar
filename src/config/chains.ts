import { Chain } from 'wagmi';

export const sonicBlazeTestnet: Chain = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'sonic-blaze-testnet',
  nativeCurrency: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.blaze.soniclabs.com'],
    },
    public: {
      http: ['https://rpc.blaze.soniclabs.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SonicScan',
      url: 'https://testnet.sonicscan.org',
    },
  },
  testnet: true,
};

export const FAUCET_URL = 'https://testnet.soniclabs.com/account'; 