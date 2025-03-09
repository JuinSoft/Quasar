# Quasar - AI Crypto Analysis on Sonic Blockchain

![Quasar Logo](public/quasar-logo.png)

Quasar is an AI-powered decentralized application built on the Sonic Blockchain that enables users to interact with an advanced AI agent for comprehensive crypto market analysis and informed decision-making.

## 🌟 Features

- **Sonic Blockchain Integration**: Seamlessly connect to Sonic Blaze Testnet
- **AI-Powered Analysis**: Chat with a sophisticated AI assistant for real-time crypto market insights
- **Market Intelligence**: Get detailed analysis on trends, price movements, and investment opportunities
- **User-Friendly Interface**: Modern, responsive UI built with Next.js, TypeScript, and Tailwind CSS
- **Secure Wallet Connection**: Easy wallet integration with RainbowKit

## 🔗 Sonic Blockchain Details

- **Network Name**: Sonic Blaze Testnet
- **RPC URL**: https://rpc.blaze.soniclabs.com
- **Explorer URL**: https://testnet.sonicscan.org
- **Chain ID**: 57054
- **Currency Symbol**: S
- **Faucet**: https://testnet.soniclabs.com/account

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or any EVM-compatible wallet
- OpenAI API key for AI functionality

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

## 📱 Usage

1. Connect your wallet to the Sonic Blaze Testnet using the "Connect Wallet" button
2. If you need test tokens, visit the [Sonic Faucet](https://testnet.soniclabs.com/account)
3. Navigate to the chat interface and start asking questions about crypto markets, trends, or investment strategies
4. The AI assistant will provide detailed analysis and insights to help you make informed decisions
5. Explore additional features like market data visualization and portfolio analysis

## 🛠️ Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Blockchain**: Ethers.js, RainbowKit/wagmi, Web3Modal
- **AI**: OpenAI API
- **Data**: Axios, RSS Parser, Cryptocurrency Icons
- **Animation**: Framer Motion

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Sonic Blockchain for providing the EVM-compatible blockchain infrastructure
- OpenAI for the AI capabilities
- The open-source community for various libraries and tools used in this project

## 📞 Contact

For questions or support, please open an issue in the GitHub repository or contact the project maintainers.
