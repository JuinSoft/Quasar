import ChatInterface from "@/components/ChatInterface";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">Quasar</h1>
        <p className="text-xl text-gray-300 mb-6">
          AI-powered crypto market analysis on Sonic Blockchain
        </p>
        <div className="bg-gray-800/50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="text-left space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Connect your wallet to the Sonic Blaze Testnet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Ask the AI assistant about crypto markets, trends, or investment strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Get detailed analysis and insights to make informed decisions</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="w-full max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Chat with Quasar AI</h2>
          <ChatInterface />
        </div>
      </section>

      <section className="max-w-3xl mx-auto mt-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">About Sonic Blockchain</h2>
        <p className="text-gray-300 mb-4">
          Sonic is a high-performance EVM-compatible blockchain designed for speed, 
          scalability, and low transaction costs. Quasar leverages Sonic's capabilities 
          to provide real-time AI-powered crypto market analysis.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <a 
            href="https://testnet.sonicscan.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Explorer
          </a>
          <a 
            href="https://testnet.soniclabs.com/account" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get Test Tokens
          </a>
        </div>
      </section>
    </div>
  );
}
