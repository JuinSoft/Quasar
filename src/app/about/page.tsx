import Link from 'next/link';

export const metadata = {
  title: 'About Quasar - AI Crypto Analysis on Sonic Blockchain',
  description: 'Learn more about Quasar, an AI-powered crypto market analysis dapp built on Sonic Blockchain',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">About Quasar</h1>
      
      <section className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">What is Quasar?</h2>
        <p className="text-gray-300 mb-4">
          Quasar is an AI-powered decentralized application (dApp) built on Sonic Blockchain that 
          allows users to interact with an AI assistant to analyze cryptocurrency markets and make 
          informed investment decisions.
        </p>
        <p className="text-gray-300">
          By combining the power of artificial intelligence with blockchain technology, Quasar 
          provides users with detailed insights, trend analysis, and investment strategies in 
          the rapidly evolving world of cryptocurrencies.
        </p>
      </section>
      
      <section className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sonic Blockchain</h2>
        <p className="text-gray-300 mb-4">
          Sonic Blockchain is a high-performance EVM-compatible blockchain designed for speed, 
          scalability, and low transaction costs. It provides the perfect infrastructure for 
          decentralized applications like Quasar.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Network Details</h3>
            <ul className="space-y-2 text-gray-300">
              <li><span className="font-semibold">Network Name:</span> Sonic Blaze Testnet</li>
              <li><span className="font-semibold">RPC URL:</span> https://rpc.blaze.soniclabs.com</li>
              <li><span className="font-semibold">Chain ID:</span> 57054</li>
              <li><span className="font-semibold">Currency Symbol:</span> S</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://testnet.soniclabs.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Block Explorer
                </Link>
              </li>
              <li>
                <Link 
                  href="https://testnet.soniclabs.comaccount" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Faucet
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ol className="space-y-4 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <div>
              <h3 className="font-semibold">Connect Your Wallet</h3>
              <p>Connect your wallet to the Sonic Blaze Testnet to access the Quasar platform.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <div>
              <h3 className="font-semibold">Ask the AI Assistant</h3>
              <p>Ask questions about cryptocurrency markets, trends, specific coins, or investment strategies.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <div>
              <h3 className="font-semibold">Receive Analysis</h3>
              <p>Get detailed analysis and insights powered by advanced AI to help you make informed decisions.</p>
            </div>
          </li>
        </ol>
      </section>
      
      <div className="text-center mt-8">
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
        >
          Try Quasar Now
        </Link>
      </div>
    </div>
  );
} 