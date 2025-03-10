# Quasar - Cross-Chain DeFi Platform on Sonic Blockchain

![Quasar Logo](public/quasar-logo.png)

Quasar is a comprehensive cross-chain DeFi platform built on the Sonic Blockchain that enables seamless token transfers, cross-chain swaps, advanced market analysis, and AI-generated smart contracts.

## 🔮 Vision & Mission

Quasar aims to bridge the gap between different blockchain networks while providing sophisticated market analysis and smart contract automation. Our mission is to create a unified DeFi experience that makes cross-chain operations accessible to all users while leveraging the power of AI for market insights and contract development.

## 🌟 Core Features

### Cross-Chain Operations
- **Cross-Chain Swaps**: Seamless token swaps between major blockchain networks
- **Unified Token Transfers**: Easy token transfers across different chains
- **Bridge Integration**: Secure cross-chain bridges for major networks
- **Atomic Swap Protocol**: Guaranteed transaction safety
- **Gas Fee Optimization**: Smart routing for cost-effective transactions

### Market Analysis
- **Real-time Analytics**: Live price tracking and market metrics
- **Technical Indicators**: Advanced trading indicators and signals
- **AI-Powered Insights**: Intelligent market analysis and predictions
- **Sentiment Analysis**: Social media and news sentiment tracking
- **Trading Volume Analysis**: Deep liquidity analytics

### AI Contract Generator
- **Smart Contract Templates**: Pre-built contract templates
- **Custom Contract Generation**: AI-assisted contract creation
- **Security Automation**: Built-in security best practices
- **Audit Checks**: Automated contract auditing
- **Documentation**: Auto-generated technical documentation

## 🌟 Features

- **Cross-Chain Integration**: 
  - Support for major networks (Ethereum, BSC, Solana)
  - Atomic swap protocols
  - Bridge security mechanisms
  - Gas optimization algorithms

- **Token Operations**:
  - Multi-chain token transfers
  - Token swap interface
  - Transaction tracking
  - Portfolio management

- **Market Intelligence**: 
  - Real-time price tracking
  - Technical analysis indicators
  - Volume and liquidity metrics
  - Historical data analysis

- **AI-Powered Tools**:
  - Smart contract generation
  - Market trend analysis
  - Risk assessment
  - Trading suggestions

- **Development Tools**:
  - Contract template library
  - Security audit tools
  - Documentation generator
  - Testing framework

- **User Experience**:
  - Modern, responsive UI
  - Wallet integration
  - Transaction monitoring
  - Cross-chain bridge interface

## 🏗️ Architecture

Quasar follows a modern cross-chain architecture with several key components:

### Frontend
- **Next.js App Router**: For server-side rendering and optimized page loading
- **React Components**: Modular UI components for reusability and maintainability
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: For smooth animations and transitions

### Cross-Chain Infrastructure
- **Bridge Protocols**: Secure cross-chain communication
- **Atomic Swap Engine**: Trustless token exchanges
- **Multi-Chain Indexer**: Real-time blockchain data aggregation
- **Gas Optimization Layer**: Smart transaction routing

### Blockchain Integration
- **RainbowKit/wagmi**: For multi-wallet connection
- **Ethers.js**: For EVM-compatible chain communication
- **Sonic Blockchain**: Primary chain for fast, low-cost transactions
- **Bridge Contracts**: Cross-chain smart contracts

### AI & Data Processing
- **OpenAI API**: Powers contract generation and market analysis
- **Market Data APIs**: Real-time cryptocurrency market data
- **Technical Analysis Engine**: Trading indicators and signals
- **Risk Assessment Module**: AI-powered risk analysis

### Data Flow
1. User initiates cross-chain transaction
2. Bridge protocols verify and process the transfer
3. Market data is aggregated from multiple chains
4. AI analyzes market conditions and generates insights
5. Smart contracts are automatically generated and verified
6. Transactions are optimized and executed

## 🔗 Sonic Blockchain Details

- **Network Name**: Sonic Blaze Testnet
- **RPC URL**: https://rpc.blaze.soniclabs.com
- **Explorer URL**: https://testnet.soniclabs.com
- **Chain ID**: 57054
- **Currency Symbol**: S
- **Faucet**: https://testnet.soniclabs.comaccount

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or any EVM-compatible wallet
- OpenAI API key for AI functionality
- LiveCoinWatch API key for market data

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JuinSoft/Quasar
   cd quasar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_LIVECOINWATCH_API_KEY=your_livecoinwatch_api_key
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

1. **Connect Wallet**: Connect your wallet to the Sonic Blaze Testnet using the "Connect Wallet" button
2. **Get Test Tokens**: If you need test tokens, visit the [Sonic Faucet](https://testnet.soniclabs.com/account)
3. **AI Assistant**: Use the floating chatbot in the bottom-right corner to ask questions about crypto markets, trends, or investment strategies
4. **Live Crypto Data**: View real-time cryptocurrency prices, market caps, and percentage changes
5. **Reddit Sentiment**: Analyze community sentiment from the r/0xSonic subreddit
6. **News Analysis**: Read the latest crypto news with AI-generated sentiment analysis
7. **Market Analysis**: Get detailed market analysis with buy/sell/hold recommendations
8. **Smart Contract Studio**: Create and deploy smart contracts with these steps:
   - Select a contract template or request a custom contract
   - Configure contract parameters or provide a detailed description
   - Review and edit the generated contract in the live editor
   - Compile the contract to check for errors
   - Deploy the contract to Sonic Testnet or Mainnet
   - Verify the contract on the blockchain explorer

## 🧠 AI Capabilities

Quasar's AI assistant can:

- **Answer Questions**: Provide information about cryptocurrencies, blockchain technology, and market trends
- **Analyze Sentiment**: Determine if news articles or social media posts are positive, negative, or neutral
- **Generate Recommendations**: Suggest whether to buy, sell, or hold based on market data and sentiment
- **Explain Concepts**: Break down complex crypto and blockchain concepts in simple terms
- **Track Trends**: Identify emerging trends in the cryptocurrency market
- **Personalize Insights**: Tailor recommendations based on user preferences and risk tolerance

## 🛠️ Technologies Used

- **Frontend**: 
  - Next.js 15 (App Router)
  - React 19 (Server Components)
  - TypeScript 5
  - Tailwind CSS 4
  - Framer Motion

- **Blockchain**: 
  - Ethers.js
  - RainbowKit/wagmi
  - Web3Modal
  - Sonic Blockchain (EVM-compatible)

- **AI & Data**: 
  - OpenAI API (GPT models)
  - LiveCoinWatch API
  - Reddit API
  - RSS Parser for news aggregation
  - Axios for API requests

- **Development Tools**:
  - ESLint
  - Prettier
  - Turbopack
  - Node.js

## 📊 Key Components

### 1. FloatingChatbot
A persistent chatbot that follows the user across all pages, providing AI assistance whenever needed.

### 2. RedditSentimentAnalysis
Analyzes posts from r/0xSonic to gauge community sentiment and identify trending topics.

### 3. LiveCryptoData
Displays real-time cryptocurrency data with price changes, market cap, and volume.

### 4. SonicCoinInfo
Provides detailed information about the Sonic token, including price, supply, and historical data.

### 5. SonicNews
Aggregates and analyzes news related to Sonic and the broader cryptocurrency market.

### 6. Market Analysis
AI-powered analysis of cryptocurrency markets with actionable insights and recommendations.

### 7. Smart Contract Studio
A comprehensive environment for creating, editing, and deploying smart contracts on the Sonic blockchain with features like:
- Template-based contract generation
- Live contract editing with real-time compilation
- AI-assisted contract development
- Multi-network deployment (Testnet/Mainnet)
- Automatic contract verification

## 🧪 Development

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 🔄 API Integration

### LiveCoinWatch API
Used to fetch real-time cryptocurrency data:
- Price information
- Market capitalization
- Trading volume
- Historical data
- Percentage changes

### OpenAI API
Powers the AI capabilities:
- Natural language processing
- Sentiment analysis
- Market predictions
- Content generation
- Query understanding

### Reddit API
Used for community sentiment analysis:
- Post aggregation
- Comment analysis
- Sentiment scoring
- Trend identification

## 🔮 Future Roadmap

1. **Q3 2025**: 
   - Mobile application release
   - Advanced technical analysis tools
   - Community governance features

4. **Q4 2025**: 
   - Multi-chain portfolio management
   - AI-powered DeFi strategy recommendations
   - Institutional-grade analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:
   - Ensure you're connected to the Sonic Blaze Testnet
   - Check that your wallet has the correct RPC settings

2. **API Rate Limiting**:
   - LiveCoinWatch API has a daily limit of 10,000 requests
   - OpenAI API may have rate limits based on your subscription

3. **Build Errors**:
   - Make sure all dependencies are installed
   - Check that your environment variables are correctly set

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Sonic Blockchain for providing the EVM-compatible blockchain infrastructure
- OpenAI for the AI capabilities
- LiveCoinWatch for cryptocurrency market data
- The open-source community for various libraries and tools used in this project

## 📞 Contact

For questions or support, please open an issue in the GitHub repository or contact the project maintainers.
