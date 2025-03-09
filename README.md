# Quasar - AI Crypto Analysis on Sonic Blockchain

Quasar is an AI-powered dapp built on Sonic Blockchain that allows users to interact with an AI agent to analyze crypto markets and make informed decisions.

## Features

- Connect to Sonic Blaze Testnet
- Chat with an AI assistant for crypto market analysis
- Get detailed insights and investment strategies
- Built on Next.js with TypeScript and Tailwind CSS

## Sonic Blockchain Details

- **Network Name**: Sonic Blaze Testnet
- **RPC URL**: https://rpc.blaze.soniclabs.com
- **Explorer URL**: https://testnet.sonicscan.org
- **Chain ID**: 57054
- **Currency Symbol**: S
- **Faucet**: https://testnet.soniclabs.com/account

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quasar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Connect your wallet to the Sonic Blaze Testnet
2. If you need test tokens, visit the [Sonic Faucet](https://testnet.soniclabs.com/account)
3. Ask the AI assistant questions about crypto markets, trends, or investment strategies
4. Receive detailed analysis and insights to help make informed decisions

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Ethers.js
- RainbowKit/wagmi
- OpenAI API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sonic Blockchain for providing the EVM-compatible blockchain infrastructure
- OpenAI for the AI capabilities
