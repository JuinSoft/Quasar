'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi there! I\'m your Sonic blockchain assistant. I can help you learn about Sonic - the highest-performing EVM L1 with 10,000 TPS and sub-second finality. Ask me anything about Sonic\'s features, token, or ecosystem!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Default response
      let botResponse = "I'm sorry, I don't have enough information to answer that question about Sonic blockchain.";
      
      // Sonic blockchain knowledge base
      const userQuery = userMessage.content.toLowerCase();
      
      // General Sonic information
      if (userQuery.includes('what is sonic') || userQuery.includes('sonic blockchain') || userQuery.includes('about sonic')) {
        botResponse = "Sonic is the highest-performing EVM L1 blockchain, combining speed, incentives, and world-class infrastructure for DeFi. The chain provides 10,000 TPS and sub-second finality, making it ideal for high-performance applications.";
      } 
      // Performance and technical features
      else if (userQuery.includes('performance') || userQuery.includes('tps') || userQuery.includes('transactions per second')) {
        botResponse = "Sonic blockchain delivers exceptional performance with 10,000 Transactions per Second (TPS) and sub-second finality. It's EVM compatible and supports Solidity and Vyper programming languages.";
      }
      // Token information
      else if (userQuery.includes('token') || userQuery.includes('s token') || userQuery.includes('native token')) {
        botResponse = "The native token of Sonic is 'S', which is used for transaction fees, staking, running validators, and participating in governance. Users holding FTM can upgrade to S on a 1:1 basis.";
      }
      // Gateway information
      else if (userQuery.includes('gateway') || userQuery.includes('bridge') || userQuery.includes('ethereum bridge')) {
        botResponse = "The Sonic Gateway provides developers and users with seamless access to vast liquidity through a secure bridge connected to Ethereum. It features a unique fail-safe mechanism to ensure your assets are protected in all circumstances.";
      }
      // Incentive programs
      else if (userQuery.includes('incentive') || userQuery.includes('rewards') || userQuery.includes('earn')) {
        botResponse = "Sonic offers several incentive programs: 1) Fee Monetization - earn up to 90% of the fees your apps generate, 2) Innovator Fund - up to 200 million S to onboard apps and support new ventures, and 3) Airdrop - ~200 million S to incentivize users of both Opera and Sonic chain.";
      }
      // Fee monetization
      else if (userQuery.includes('fee monetization') || userQuery.includes('app fees') || userQuery.includes('revenue')) {
        botResponse = "Sonic's Fee Monetization program allows developers to earn up to 90% of the fees their apps generate, similar to an ad-revenue model. This creates a sustainable revenue stream for application developers on the platform.";
      }
      // Innovator fund
      else if (userQuery.includes('innovator fund') || userQuery.includes('funding') || userQuery.includes('grants')) {
        botResponse = "The Sonic Innovator Fund allocates up to 200 million S tokens to onboard applications to Sonic and support new ventures. This fund aims to accelerate ecosystem growth and innovation.";
      }
      // Airdrop
      else if (userQuery.includes('airdrop') || userQuery.includes('free tokens') || userQuery.includes('distribution')) {
        botResponse = "Sonic has allocated approximately 200 million S tokens for airdrops to incentivize users of both Opera and the Sonic chain. This is part of their strategy to grow the ecosystem and reward community participation.";
      }
      // EVM compatibility
      else if (userQuery.includes('evm') || userQuery.includes('ethereum') || userQuery.includes('compatibility')) {
        botResponse = "Sonic is fully EVM (Ethereum Virtual Machine) compatible, allowing developers to easily port their Ethereum applications to Sonic with minimal changes. It supports Solidity and Vyper programming languages.";
      }
      // Node deployment
      else if (userQuery.includes('node') || userQuery.includes('validator') || userQuery.includes('archive node')) {
        botResponse = "Sonic supports different types of node deployments, including Archive Nodes for data storage and Validator Nodes for network consensus. Running a validator node requires staking S tokens.";
      }
      // Staking
      else if (userQuery.includes('staking') || userQuery.includes('stake') || userQuery.includes('validator')) {
        botResponse = "You can stake S tokens on Sonic to participate in network security and earn rewards. Staking is used for running validators and participating in the Proof of Stake consensus mechanism.";
      }
      // Governance
      else if (userQuery.includes('governance') || userQuery.includes('voting') || userQuery.includes('dao')) {
        botResponse = "S token holders can participate in Sonic's governance, voting on proposals that affect the network's development and parameters. This gives the community direct input into the blockchain's future.";
      }
      // FTM conversion
      else if (userQuery.includes('ftm') || userQuery.includes('fantom') || userQuery.includes('conversion') || userQuery.includes('upgrade')) {
        botResponse = "Users holding FTM tokens can upgrade to S tokens on a 1:1 basis. This conversion mechanism allows Fantom users to easily transition to the Sonic ecosystem.";
      }
      // Basic greetings
      else if (userQuery.includes('hello') || userQuery.includes('hi') || userQuery.includes('hey')) {
        botResponse = "Hello! I'm your Sonic blockchain assistant. How can I help you learn about Sonic's features, token, or ecosystem today?";
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={20} /> : <FaRobot size={24} />}
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-96 bg-gray-900 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center">
              <FaRobot className="text-white mr-2" size={20} />
              <h3 className="text-white font-medium">Sonic Blockchain Assistant</h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-800 text-white rounded-tl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-2 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-r-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 