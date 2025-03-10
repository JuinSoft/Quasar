'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DeFiAssistant() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your DeFi assistant. I can help you with cross-chain swaps, portfolio management, and more. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call OpenAI API
      const response = await fetch('/api/defi-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error calling assistant API:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Example DeFi tasks the assistant can help with
  const exampleTasks = [
    "How do I swap ETH to USDC?",
    "What's the best way to bridge tokens to Sonic?",
    "Show me my portfolio performance",
    "How can I create my own token on Sonic?",
  ];

  const handleExampleClick = (task: string) => {
    setInput(task);
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center p-4 bg-gray-800">
        <FaRobot className="text-blue-500 text-xl mr-2" />
        <h2 className="text-lg font-semibold">DeFi Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-800 text-gray-200">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Example tasks */}
      {messages.length <= 2 && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {exampleTasks.map((task, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(task)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-2 rounded-full transition-colors"
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DeFi operations..."
            className="flex-1 bg-gray-700 text-white rounded-l-lg px-4 py-2 focus:outline-none"
            disabled={!isConnected || isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 transition-colors"
            disabled={!isConnected || !input.trim() || isLoading}
          >
            <FaPaperPlane />
          </button>
        </div>
        {!isConnected && (
          <p className="text-red-500 text-xs mt-2">Please connect your wallet to use the assistant</p>
        )}
      </form>
    </div>
  );
} 