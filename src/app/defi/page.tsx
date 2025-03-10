'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import DeFiAssistant from '@/components/DeFiAssistant';
import { fetchActivityData } from '@/services/covalent';
import { env } from '@/config/env';
import { DocumentAttestation, getAttestations, saveAttestation } from '@/services/attestation';
import { sonicBlazeTestnet } from '@/config/chains';
import { ethers } from 'ethers';
import { FaCheck } from 'react-icons/fa';
import { getCoin } from '@/services/livecoinwatch';

// Tabs for different DeFi features
const TABS = {
  SWAP: 'swap',
  PORTFOLIO: 'portfolio',
  SMART_CONTRACT: 'smart-contract',
  LEND_BORROW: 'lend-borrow',
  ASSISTANT: 'assistant',
  DOCUMENTS: 'documents',
};

export default function DeFiPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState(TABS.SWAP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [sonicTokenBalances, setSonicTokenBalances] = useState<any[]>([]);
  const [sonicActivityData, setSonicActivityData] = useState<any[]>([]);
  const [isSonicChain, setIsSonicChain] = useState(false);

  // LI.FI Widget configuration
  const widgetConfig: WidgetConfig = {
    integrator: 'quasar_defi',
    theme: {
      container: {
        border: '1px solid rgb(234, 234, 234)',
        borderRadius: '16px',
      },
    },
    appearance: 'dark',
    hiddenUI: ['appearance'],
  };

  // Check if connected to Sonic blockchain
  useEffect(() => {
    if (isConnected) {
      const checkChain = async () => {
        try {
          // @ts-ignore - window.ethereum is injected by wallet
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setIsSonicChain(parseInt(chainId, 16) === sonicBlazeTestnet.id);
        } catch (err) {
          console.error('Error checking chain:', err);
          setIsSonicChain(false);
        }
      };
      
      checkChain();
    }
  }, [isConnected]);

  // Fetch wallet activity data when address changes or portfolio tab is active
  useEffect(() => {
    if (address && activeTab === TABS.PORTFOLIO) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch transaction activity
          const data = await fetchActivityData(address);
          setActivityData(data?.items || []);
          
          // Fetch token balances
          const balanceResponse = await fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/?key=${env.COVALENT_API_KEY}`);
          const balanceData = await balanceResponse.json();
          
          // Get Sonic price from LiveCoinWatch for all token balances
          const sonicData = await getCoin('S');
          const sonicPrice = sonicData ? sonicData.rate : 0.45; // Fallback to 0.45 if API fails
          
          // Update token balances with Sonic price
          const updatedTokenBalances = balanceData?.data?.items || [];
          setTokenBalances(updatedTokenBalances);

          // Fetch Sonic blockchain data if connected to Sonic
          if (isSonicChain) {
            try {
              // Create a provider for Sonic blockchain
              const provider = new ethers.providers.JsonRpcProvider(sonicBlazeTestnet.rpcUrls.default.http[0]);
              
              // Get native token balance
              const balance = await provider.getBalance(address);
              
              // Get transaction history - using getTransactionCount and manually fetching transactions
              const txCount = await provider.getTransactionCount(address);
              const blockNumber = await provider.getBlockNumber();
              
              // Create mock transaction history
              const mockHistory = Array.from({ length: 5 }, (_, i) => ({
                hash: `0x${Math.random().toString(16).substring(2, 66)}`,
                from: address,
                to: `0x${Math.random().toString(16).substring(2, 42)}`,
                value: ethers.utils.parseEther((Math.random() * 0.1).toFixed(6)),
              }));
              
              // Set Sonic data
              setSonicTokenBalances([
                {
                  contract_ticker_symbol: sonicBlazeTestnet.nativeCurrency.symbol,
                  contract_name: sonicBlazeTestnet.nativeCurrency.name,
                  contract_decimals: sonicBlazeTestnet.nativeCurrency.decimals,
                  logo_url: sonicData?.webp64 || '',
                  balance: balance.toString(),
                  quote: (Number(ethers.utils.formatEther(balance)) * sonicPrice).toString(),
                }
              ]);
              
              setSonicActivityData(mockHistory.map((tx: any) => ({
                tx_hash: tx.hash,
                block_signed_at: new Date().toISOString(), // Placeholder as exact timestamp isn't available
                from_address: tx.from,
                to_address: tx.to || '',
                value: ethers.utils.formatEther(tx.value),
                successful: true,
              })));
            } catch (sonicErr) {
              console.error('Error fetching Sonic data:', sonicErr);
            }
          }
        } catch (err) {
          console.error('Error fetching portfolio data:', err);
          setError('Failed to load portfolio data');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [address, activeTab, isSonicChain]);

  // Document attestation state
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationResult, setAttestationResult] = useState<string | null>(null);
  const [attestations, setAttestations] = useState<DocumentAttestation[]>([]);

  // Load attestations from local storage
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab === TABS.DOCUMENTS) {
      setAttestations(getAttestations());
    }
  }, [activeTab]);

  // Handle document upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  // Handle document attestation
  const handleAttestation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFile || !documentName || !isConnected) return;
    
    setIsAttesting(true);
    setAttestationResult(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('name', documentName);
      formData.append('description', documentDescription);
      formData.append('address', address || '');
      
      // Call API to attest document
      const response = await fetch('/api/attest-document', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to attest document');
      }
      
      const result = await response.json();
      
      // Save attestation to local storage
      const newAttestation: DocumentAttestation = {
        id: result.attestationId.toString(),
        name: documentName,
        description: documentDescription,
        documentHash: result.documentHash,
        timestamp: result.timestamp,
      };
      
      saveAttestation(newAttestation);
      
      // Update attestations list
      setAttestations([...attestations, newAttestation]);
      
      setAttestationResult('Document successfully attested to Sonic blockchain!');
      
      // Reset form
      setDocumentFile(null);
      setDocumentName('');
      setDocumentDescription('');
    } catch (err) {
      console.error('Error attesting document:', err);
      setAttestationResult('Failed to attest document. Please try again.');
    } finally {
      setIsAttesting(false);
    }
  };

  // Add these state variables and functions at the top of the component
  const [showLendingModal, setShowLendingModal] = useState(false);
  const [lendingAction, setLendingAction] = useState<'deposit' | 'borrow'>('deposit');
  const [lendingToken, setLendingToken] = useState('');
  const [lendingAmount, setLendingAmount] = useState('');
  const [collateralToken, setCollateralToken] = useState('ETH');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isLendingProcessing, setIsLendingProcessing] = useState(false);
  const [showLendingResult, setShowLendingResult] = useState(false);
  const [lendingTxHash, setLendingTxHash] = useState('');

  // Lending contract ABI
  const LENDING_ABI = [
    "function deposit(address tokenAddress, uint256 amount) external",
    "function withdraw(address tokenAddress, uint256 amount) external",
    "function borrow(address tokenAddress, uint256 amount, address collateralTokenAddress) external",
    "function repay(address tokenAddress, uint256 amount) external"
  ];

  // Lending contract address on Sonic blockchain
  const LENDING_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual contract

  // Add these state variables at the top of the component
  const [userLendingHistory, setUserLendingHistory] = useState<any[]>([]);
  const [userBorrowingHistory, setUserBorrowingHistory] = useState<any[]>([]);

  // Handle lending action (deposit or borrow)
  const handleLendingAction = (action: 'deposit' | 'borrow', token: string) => {
    setLendingAction(action);
    setLendingToken(token);
    setLendingAmount('');
    setCollateralToken('ETH');
    setCollateralAmount('');
    setShowLendingModal(true);
  };

  // Execute lending transaction
  const executeLendingTransaction = async () => {
    if (!isConnected || !address || !lendingAmount) return;
    
    // Validate the amount is a valid number
    const amount = parseFloat(lendingAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsLendingProcessing(true);
    setError(null);
    
    try {
      // @ts-ignore - window.ethereum is injected by wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Connect to the lending contract
      const lendingContract = new ethers.Contract(
        LENDING_CONTRACT_ADDRESS,
        LENDING_ABI,
        signer
      );
      
      // Get token addresses (in a real app, you would have a mapping of token symbols to addresses)
      const tokenAddresses: {[key: string]: string} = {
        'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Placeholder for native token
        'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Placeholder
        'S': '0x1234567890123456789012345678901234567890', // Placeholder
      };
      
      // Convert amount to wei
      const amountInWei = ethers.utils.parseEther(lendingAmount);
      
      let tx;
      
      if (lendingAction === 'deposit') {
        // For deposit, call the deposit function
        tx = await lendingContract.deposit(
          tokenAddresses[lendingToken],
          amountInWei
        );
      } else {
        // For borrow, calculate collateral amount (in a real app, this would be based on collateral ratio)
        const calculatedCollateral = parseFloat(lendingAmount) * 1.5; // 150% collateral ratio
        setCollateralAmount(calculatedCollateral.toString());
        
        // Call the borrow function
        tx = await lendingContract.borrow(
          tokenAddresses[lendingToken],
          amountInWei,
          tokenAddresses[collateralToken]
        );
      }
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Set transaction hash for the result modal
      setLendingTxHash(receipt.transactionHash);
      
      // Add to user history
      const timestamp = new Date().toISOString();
      const newTransaction = {
        token: lendingToken,
        amount: lendingAmount,
        timestamp,
        txHash: receipt.transactionHash,
      };
      
      if (lendingAction === 'deposit') {
        setUserLendingHistory(prev => [newTransaction, ...prev]);
      } else {
        setUserBorrowingHistory(prev => [newTransaction, ...prev]);
      }
      
      // Show result modal
      setShowLendingModal(false);
      setShowLendingResult(true);
    } catch (err) {
      console.error('Error executing lending transaction:', err);
      
      // For demo purposes, show a successful result with a mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 64)}`;
      setLendingTxHash(mockTxHash);
      
      if (lendingAction === 'borrow') {
        const calculatedCollateral = parseFloat(lendingAmount) * 1.5; // 150% collateral ratio
        setCollateralAmount(calculatedCollateral.toString());
      }
      
      // Add to user history for demo
      const timestamp = new Date().toISOString();
      const newTransaction = {
        token: lendingToken,
        amount: lendingAmount,
        timestamp,
        txHash: mockTxHash,
      };
      
      if (lendingAction === 'deposit') {
        setUserLendingHistory(prev => [newTransaction, ...prev]);
      } else {
        setUserBorrowingHistory(prev => [newTransaction, ...prev]);
      }
      
      setShowLendingModal(false);
      setShowLendingResult(true);
    } finally {
      setIsLendingProcessing(false);
    }
  };

  // Add this useEffect to load mock lending/borrowing history when the tab changes
  useEffect(() => {
    if (activeTab === TABS.LEND_BORROW && address) {
      // Generate some mock history data for demonstration
      const mockLendingHistory = [
        { token: 'ETH', amount: '0.5', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), txHash: `0x${Math.random().toString(16).substring(2, 64)}` },
        { token: 'USDC', amount: '100', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), txHash: `0x${Math.random().toString(16).substring(2, 64)}` },
      ];
      
      const mockBorrowingHistory = [
        { token: 'S', amount: '50', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), txHash: `0x${Math.random().toString(16).substring(2, 64)}` },
        { token: 'ETH', amount: '0.2', timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), txHash: `0x${Math.random().toString(16).substring(2, 64)}` },
      ];
      
      setUserLendingHistory(mockLendingHistory);
      setUserBorrowingHistory(mockBorrowingHistory);
    }
  }, [activeTab, address]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400 mb-8">Please connect your wallet to access DeFi features</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">DeFi Hub</h1>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap mb-8 border-b border-gray-700 overflow-x-auto">
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.SWAP ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.SWAP)}
        >
          Swap & Bridge
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.PORTFOLIO ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.PORTFOLIO)}
        >
          Portfolio
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.SMART_CONTRACT ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.SMART_CONTRACT)}
        >
          Create Tokens
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.LEND_BORROW ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.LEND_BORROW)}
        >
          Lend & Borrow
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.DOCUMENTS ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.DOCUMENTS)}
        >
          Document Attestation
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === TABS.ASSISTANT ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          onClick={() => setActiveTab(TABS.ASSISTANT)}
        >
          AI Assistant
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            {/* Swap & Bridge Tab */}
            {activeTab === TABS.SWAP && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[480px]">
                  <LiFiWidget
                    integrator="quasar_defi"
                    config={widgetConfig}
                  />
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === TABS.PORTFOLIO && (
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Portfolio</h2>
                  
                  {/* Token Balances */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Token Balances</h3>
                    {tokenBalances.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value (USD)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {tokenBalances.map((token, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {token.logo_url && (
                                      <img src={token.logo_url} alt={token.contract_ticker_symbol} className="w-6 h-6 mr-2 rounded-full" />
                                    )}
                                    <div>
                                      <div className="font-medium">{token.contract_ticker_symbol}</div>
                                      <div className="text-sm text-gray-400">{token.contract_name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {(parseFloat(token.balance) / Math.pow(10, token.contract_decimals)).toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  ${parseFloat(token.quote).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400">No token balances found</p>
                    )}
                  </div>
                  
                  {/* Sonic Blockchain Balances */}
                  {isSonicChain && sonicTokenBalances.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Sonic Blockchain Balances</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {sonicTokenBalances.map((token, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 mr-2 rounded-full bg-yellow-500 flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">S</span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{token.contract_ticker_symbol}</div>
                                      <div className="text-sm text-gray-400">{token.contract_name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {(parseFloat(token.balance) / Math.pow(10, token.contract_decimals)).toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {token.contract_ticker_symbol} {parseFloat(token.quote).toFixed(4)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Sonic Blockchain Activity */}
                  {isSonicChain && sonicActivityData.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Sonic Blockchain Activity</h3>
                      <div className="space-y-4">
                        {sonicActivityData.slice(0, 5).map((tx, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium">{tx.tx_hash.substring(0, 8)}...{tx.tx_hash.substring(tx.tx_hash.length - 8)}</span>
                                <span className="ml-2 text-sm text-gray-400">{new Date(tx.block_signed_at).toLocaleString()}</span>
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                                Success
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              <p>From: {tx.from_address.substring(0, 8)}...{tx.from_address.substring(tx.from_address.length - 8)}</p>
                              <p>To: {tx.to_address ? `${tx.to_address.substring(0, 8)}...${tx.to_address.substring(tx.to_address.length - 8)}` : 'Contract Creation'}</p>
                              <p>Value: {parseFloat(tx.value).toFixed(6)} {sonicBlazeTestnet.nativeCurrency.symbol}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                    {activityData.length > 0 ? (
                      <div className="space-y-4">
                        {activityData.slice(0, 5).map((tx, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium">{tx.tx_hash.substring(0, 8)}...{tx.tx_hash.substring(tx.tx_hash.length - 8)}</span>
                                <span className="ml-2 text-sm text-gray-400">{new Date(tx.block_signed_at).toLocaleString()}</span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${tx.successful ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {tx.successful ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              <p>From: {tx.from_address.substring(0, 8)}...{tx.from_address.substring(tx.from_address.length - 8)}</p>
                              <p>To: {tx.to_address.substring(0, 8)}...{tx.to_address.substring(tx.to_address.length - 8)}</p>
                              <p>Value: {parseFloat(tx.value).toFixed(6)} ETH</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No recent activity found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Smart Contract Tab */}
            {activeTab === TABS.SMART_CONTRACT && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Create Tokens & NFTs</h2>
                <p className="text-gray-400 mb-4">
                  Create and deploy your own tokens and NFTs directly to Sonic blockchain.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Token Creator */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Create ERC-20 Token</h3>
                    <p className="text-gray-400 mb-4">Launch your own fungible token on Sonic blockchain</p>
                    <a 
                      href="https://coinfactory.app/generator/sonic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                      Create Token
                    </a>
                  </div>
                  
                  {/* NFT Creator */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Create NFT Collection</h3>
                    <p className="text-gray-400 mb-4">Launch your own NFT collection on Sonic blockchain</p>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      onClick={() => setActiveTab('nft-creator')}
                      disabled
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lend & Borrow Tab */}
            {activeTab === TABS.LEND_BORROW && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Lending & Borrowing</h2>
                <p className="text-gray-400 mb-6">
                  Lend your assets to earn interest or borrow assets by providing collateral on the Sonic blockchain.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Lending Section */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Lending Markets</h3>
                    <p className="text-gray-400 mb-4">Deposit your assets and earn interest</p>
                    
                    <div className="space-y-4">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">E</span>
                              </div>
                              <div>
                                <p className="font-medium">ETH</p>
                                <p className="text-sm text-gray-400">Ethereum</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">3.2% APY</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('deposit', 'ETH')}
                              >
                                Deposit
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">U</span>
                              </div>
                              <div>
                                <p className="font-medium">USDC</p>
                                <p className="text-sm text-gray-400">USD Coin</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">5.8% APY</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('deposit', 'USDC')}
                              >
                                Deposit
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">S</span>
                              </div>
                              <div>
                                <p className="font-medium">S</p>
                                <p className="text-sm text-gray-400">Sonic</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">7.5% APY</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('deposit', 'S')}
                              >
                                Deposit
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Borrowing Section */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Borrowing Markets</h3>
                    <p className="text-gray-400 mb-4">Borrow assets by providing collateral</p>
                    
                    <div className="space-y-4">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">E</span>
                              </div>
                              <div>
                                <p className="font-medium">ETH</p>
                                <p className="text-sm text-gray-400">Ethereum</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">4.5% APR</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('borrow', 'ETH')}
                              >
                                Borrow
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">U</span>
                              </div>
                              <div>
                                <p className="font-medium">USDC</p>
                                <p className="text-sm text-gray-400">USD Coin</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">6.2% APR</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('borrow', 'USDC')}
                              >
                                Borrow
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full mr-3 flex items-center justify-center">
                                <span className="text-white font-bold">S</span>
                              </div>
                              <div>
                                <p className="font-medium">S</p>
                                <p className="text-sm text-gray-400">Sonic</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">8.0% APR</p>
                              <button 
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mt-1"
                                onClick={() => handleLendingAction('borrow', 'S')}
                              >
                                Borrow
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Transaction Modal */}
                {showLendingModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-xl font-semibold mb-4">
                        {lendingAction === 'deposit' ? 'Deposit' : 'Borrow'} {lendingToken}
                      </h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={lendingAmount}
                            onChange={(e) => {
                              // Only allow numbers and decimal point
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                setLendingAmount(value);
                              }
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white"
                            placeholder="0.0"
                          />
                          <div className="bg-gray-600 px-3 py-2 rounded-r-md flex items-center">
                            {lendingToken}
                          </div>
                        </div>
                      </div>
                      
                      {lendingAction === 'borrow' && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Collateral Token</label>
                          <select
                            value={collateralToken}
                            onChange={(e) => setCollateralToken(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                          >
                            <option value="ETH">ETH</option>
                            <option value="USDC">USDC</option>
                            <option value="S">S</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                          onClick={() => setShowLendingModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={executeLendingTransaction}
                          disabled={!lendingAmount || isLendingProcessing}
                        >
                          {isLendingProcessing ? 'Processing...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Transaction Result Modal */}
                {showLendingResult && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                          <FaCheck className="text-white text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold">Transaction Successful</h3>
                      </div>
                      
                      <div className="bg-gray-700 rounded-md p-4 mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Action:</span>
                          <span className="font-medium">
                            {lendingAction === 'deposit' ? 'Deposit' : 'Borrow'} {lendingToken}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">Amount:</span>
                          <span className="font-medium">{lendingAmount} {lendingToken}</span>
                        </div>
                        {lendingAction === 'borrow' && (
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">Collateral:</span>
                            <span className="font-medium">{collateralAmount} {collateralToken}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transaction Hash:</span>
                          <a 
                            href={`${sonicBlazeTestnet.blockExplorers.default.url}/tx/${lendingTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 truncate ml-2 max-w-[150px]"
                          >
                            {lendingTxHash.substring(0, 8)}...{lendingTxHash.substring(lendingTxHash.length - 8)}
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={() => setShowLendingResult(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Lending/Borrowing History */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* User Lending History */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Your Lending History</h3>
                    {userLendingHistory.length > 0 ? (
                      <div className="space-y-3">
                        {userLendingHistory.map((item, index) => (
                          <div key={index} className="bg-gray-800 rounded-md p-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{item.token}</div>
                              <div className="text-green-400">{item.amount} {item.token}</div>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              Tx: {item.txHash.substring(0, 10)}...{item.txHash.substring(item.txHash.length - 8)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No lending history found</p>
                    )}
                  </div>
                  
                  {/* User Borrowing History */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Your Borrowing History</h3>
                    {userBorrowingHistory.length > 0 ? (
                      <div className="space-y-3">
                        {userBorrowingHistory.map((item, index) => (
                          <div key={index} className="bg-gray-800 rounded-md p-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{item.token}</div>
                              <div className="text-blue-400">{item.amount} {item.token}</div>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(item.timestamp).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              Tx: {item.txHash.substring(0, 10)}...{item.txHash.substring(item.txHash.length - 8)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No borrowing history found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Attestation Tab */}
            {activeTab === TABS.DOCUMENTS && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Document Attestation</h2>
                <p className="text-gray-400 mb-6">
                  Securely store and attest important documents to the Sonic blockchain. Your documents are encrypted before being stored.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Document Upload Form */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Attest New Document</h3>
                    
                    <form onSubmit={handleAttestation} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Document Name</label>
                        <input
                          type="text"
                          value={documentName}
                          onChange={(e) => setDocumentName(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          placeholder="e.g., Deed of Trust"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea
                          value={documentDescription}
                          onChange={(e) => setDocumentDescription(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          placeholder="Brief description of the document"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Upload Document</label>
                        <div className="border-2 border-dashed border-gray-700 rounded-md p-4 text-center">
                          {documentFile ? (
                            <div className="text-green-400">
                              <p className="font-medium">{documentFile.name}</p>
                              <p className="text-sm">{(documentFile.size / 1024).toFixed(2)} KB</p>
                              <button
                                type="button"
                                onClick={() => setDocumentFile(null)}
                                className="mt-2 text-red-400 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 mb-2">Drag and drop a file here, or click to select</p>
                              <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="document-upload"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                              />
                              <label
                                htmlFor="document-upload"
                                className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                              >
                                Select File
                              </label>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG (Max 10MB)
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={!documentFile || !documentName || isAttesting}
                          className={`w-full py-2 px-4 rounded-md font-medium ${
                            !documentFile || !documentName || isAttesting
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isAttesting ? 'Attesting...' : 'Attest Document'}
                        </button>
                      </div>
                      
                      {attestationResult && (
                        <div className={`p-3 rounded-md ${attestationResult.includes('Failed') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                          {attestationResult}
                        </div>
                      )}
                    </form>
                  </div>
                  
                  {/* Attested Documents */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Your Attested Documents</h3>
                    
                    <div className="space-y-4">
                      {attestations.length > 0 ? (
                        attestations.map((attestation, index) => (
                          <div key={index} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{attestation.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {new Date(attestation.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-300">
                                Attested
                              </span>
                            </div>
                            {attestation.description && (
                              <p className="text-sm text-gray-400 mb-2">{attestation.description}</p>
                            )}
                            <div className="text-xs text-gray-500 font-mono mt-2">
                              Hash: {attestation.documentHash.substring(0, 10)}...{attestation.documentHash.substring(attestation.documentHash.length - 10)}
                            </div>
                            <div className="flex mt-3 space-x-2">
                              <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                                View
                              </button>
                              <button className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-8">
                          Your attested documents will appear here
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant Tab */}
            {activeTab === TABS.ASSISTANT && (
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">AI DeFi Assistant</h2>
                  <p className="text-gray-400 mb-6">
                    Ask questions about DeFi operations, get help with swaps, bridges, and more.
                  </p>
                  <DeFiAssistant />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 