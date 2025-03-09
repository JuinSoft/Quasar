import ChatInterface from "@/components/ChatInterface";
import Image from "next/image";
import Link from "next/link";
import { FaRocket, FaNewspaper, FaChartLine, FaBitcoin } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 py-8">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="gradient-text gradient-primary">Quasar</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          AI-powered crypto market analysis on Sonic Blockchain
        </p>
        <div className="glass p-8 rounded-2xl mb-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 gradient-text gradient-secondary">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-medium mb-2">Real-time Data</h3>
              <p className="text-gray-400 text-sm">Fetches live cryptocurrency data from trusted sources</p>
            </div>
            <div>
              <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-medium mb-2">News Analysis</h3>
              <p className="text-gray-400 text-sm">Analyzes latest crypto news for sentiment and impact</p>
            </div>
            <div>
              <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-medium mb-2">Smart Insights</h3>
              <p className="text-gray-400 text-sm">Generates data-driven market insights and recommendations</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-center gradient-text gradient-primary">Chat with Quasar AI</h2>
          <ChatInterface />
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-8 text-center gradient-text gradient-accent">Explore More Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/live-crypto" className="card bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-all">
            <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBitcoin className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Crypto</h3>
            <p className="text-gray-400 text-sm">Real-time crypto data with GPT-powered market predictions</p>
          </Link>
          
          <Link href="/news" className="card bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-all">
            <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaNewspaper className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Crypto News</h3>
            <p className="text-gray-400 text-sm">Stay updated with the latest news from top crypto sources</p>
          </Link>
          
          <Link href="/market-analysis" className="card bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-all">
            <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-400 text-sm">Get AI-powered sentiment analysis and trading recommendations</p>
          </Link>
          
          <a href="https://testnet.soniclabs.com/account" target="_blank" rel="noopener noreferrer" className="card bg-gray-800/50 p-6 rounded-xl text-center hover:bg-gray-800/70 transition-all">
            <div className="bg-orange-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRocket className="text-orange-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Started</h3>
            <p className="text-gray-400 text-sm">Get test tokens and start exploring the Sonic Blockchain</p>
          </a>
        </div>
      </section>

      <section className="max-w-3xl mx-auto mt-8 text-center glass p-8 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4 gradient-text gradient-secondary">About Sonic Blockchain</h2>
        <p className="text-gray-300 mb-6">
          Sonic is a high-performance EVM-compatible blockchain designed for speed, 
          scalability, and low transaction costs. Quasar leverages Sonic's capabilities 
          to provide real-time AI-powered crypto market analysis.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <a 
            href="https://testnet.sonicscan.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg"
          >
            Explorer
          </a>
          <a 
            href="https://testnet.soniclabs.com/account" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
          >
            Get Test Tokens
          </a>
        </div>
      </section>
    </div>
  );
}
