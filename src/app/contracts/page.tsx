'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contractTemplates } from '@/services/contracts/templates';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { sonicBlazeTestnet, sonicMainnet } from '@/config/chains';
import { FaCode, FaRocket, FaCheck, FaExclamationTriangle, FaRobot, FaFileContract, FaNetworkWired } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Add TypeScript declaration for window property
declare global {
  interface Window {
    autoCompileTimeout?: NodeJS.Timeout;
  }
}

// Contract creation steps
enum ContractStep {
  SELECT_TYPE = 'select_type',
  CONFIGURE = 'configure',
  REVIEW = 'review',
  DEPLOY = 'deploy',
  RESULT = 'result',
}

export default function ContractsPage() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<ContractStep>(ContractStep.SELECT_TYPE);
  const [selectedType, setSelectedType] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [contractSource, setContractSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');
  const [aiAssistantResponse, setAiAssistantResponse] = useState<string>('');
  const [isAiAssistantLoading, setIsAiAssistantLoading] = useState(false);
  const [compilationResult, setCompilationResult] = useState<{success: boolean; message: string} | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Get the selected network configuration
  const networkConfig = selectedNetwork === 'testnet' ? sonicBlazeTestnet : sonicMainnet;

  // Reset parameters when contract type changes
  useEffect(() => {
    if (selectedType) {
      const defaultParams: Record<string, string> = {};
      if (selectedType !== 'custom' && contractTemplates[selectedType as keyof typeof contractTemplates]) {
        contractTemplates[selectedType as keyof typeof contractTemplates]?.parameters.forEach((param: any) => {
          defaultParams[param.name] = '';
        });
      }
      setParameters(defaultParams);
    }
  }, [selectedType]);

  // Handle parameter change
  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate contract source from template and parameters
  const generateContractSource = async () => {
    if (!selectedType && !customDescription) {
      setError('Please select a contract type or provide a custom description');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If using AI generation
      if (customDescription || !contractTemplates[selectedType as keyof typeof contractTemplates]) {
        setIsAIGenerating(true);
        const response = await fetch('/api/generate-contract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractType: selectedType,
            description: customDescription,
            parameters,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate contract');
        }

        const data = await response.json();
        setContractSource(data.contract);
        setIsAIGenerating(false);
      } else {
        // Use template-based generation
        let source = contractTemplates[selectedType as keyof typeof contractTemplates].template;
        
        // Replace parameters in template
        Object.entries(parameters).forEach(([key, value]) => {
          source = source.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        
        setContractSource(source);
      }
      
      setStep(ContractStep.REVIEW);
    } catch (err) {
      console.error('Error generating contract:', err);
      setError('Failed to generate contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compile contract
  const compileContract = async () => {
    if (!contractSource) {
      setError('Please generate or enter a contract source');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contracts/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: contractSource,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Compilation failed');
      }

      const data = await response.json();
      
      // Set compilation result
      setCompilationResult({
        success: true,
        message: 'Compilation successful! Contract is ready to deploy.'
      });
      
      // If we're editing a template in the live editor, automatically proceed to deployment
      // after a short delay to allow the user to see the success message
      setTimeout(() => {
        setStep(ContractStep.DEPLOY);
      }, 1500);
      
    } catch (err) {
      console.error('Compilation error:', err);
      setCompilationResult({
        success: false,
        message: err instanceof Error ? err.message : 'Error connecting to compilation service.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Deploy contract to blockchain
  const deployContract = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to deploy contracts');
      return;
    }

    // Check if the wallet is connected to the correct network
    try {
      // @ts-ignore - window.ethereum is injected by wallet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      
      if (currentChainId !== networkConfig.id) {
        // Prompt user to switch networks
        try {
          // @ts-ignore - window.ethereum is injected by wallet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${networkConfig.id.toString(16)}` }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              // @ts-ignore - window.ethereum is injected by wallet
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${networkConfig.id.toString(16)}`,
                    chainName: networkConfig.name,
                    nativeCurrency: networkConfig.nativeCurrency,
                    rpcUrls: networkConfig.rpcUrls.default.http,
                    blockExplorerUrls: [networkConfig.blockExplorers.default.url],
                  },
                ],
              });
            } catch (addError) {
              setError('Could not add the Sonic network to your wallet. Please add it manually.');
              return;
            }
          } else {
            setError('Failed to switch networks. Please switch to the Sonic network manually.');
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error checking chain:', err);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // @ts-ignore - window.ethereum is injected by wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Compile contract
      const response = await fetch('/api/contracts/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: contractSource,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Compilation failed');
      }

      const data = await response.json();
      
      // Validate the response data
      if (!data.abi || !data.bytecode) {
        throw new Error('Invalid compilation result: missing ABI or bytecode');
      }
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        data.abi,
        data.bytecode,
        signer
      );
      
      // Deploy contract with appropriate constructor parameters based on contract type
      let contract;
      
      try {
        // Prepare constructor arguments based on contract type
        if (selectedType === 'erc20') {
          // ERC-20 Token constructor parameters: name, symbol, initialSupply, initialOwner
          contract = await factory.deploy(
            parameters.name || 'My Token',
            parameters.symbol || 'MTK',
            parameters.initialSupply ? parseInt(parameters.initialSupply) : 1000000,
            address // Current wallet address as owner
          );
        } else if (selectedType === 'erc721') {
          // ERC-721 NFT constructor parameters: name, symbol, baseURI, maxSupply, mintPrice, initialOwner
          contract = await factory.deploy(
            parameters.name || 'My NFT Collection',
            parameters.symbol || 'MNFT',
            parameters.baseURI || 'ipfs://',
            parameters.maxSupply ? parseInt(parameters.maxSupply) : 10000,
            parameters.mintPrice ? ethers.utils.parseEther(parameters.mintPrice) : ethers.utils.parseEther('0.05'),
            address // Current wallet address as owner
          );
        } else if (selectedType === 'attestation' || selectedType === 'lending') {
          // These contracts only need the owner address
          contract = await factory.deploy(address);
        } else {
          // For custom contracts or unknown types, try deploying without parameters first
          try {
            contract = await factory.deploy();
          } catch (deployError) {
            // If that fails, try with the wallet address as a parameter
            console.error('Deployment without parameters failed, trying with owner address:', deployError);
            contract = await factory.deploy(address);
          }
        }
      } catch (deployError) {
        console.error('Deployment error:', deployError);
        throw new Error(`Failed to deploy contract: ${deployError instanceof Error ? deployError.message : 'Unknown error'}`);
      }
      
      await contract.deployed();
      
      setDeploymentResult({
        address: contract.address,
        transactionHash: contract.deployTransaction.hash,
        blockNumber: contract.deployTransaction.blockNumber,
        contractName: data.contractName || 'Contract',
        network: selectedNetwork,
      });
      
      setStep(ContractStep.RESULT);
    } catch (err) {
      console.error('Error deploying contract:', err);
      setError(`Failed to deploy contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify contract on block explorer
  const verifyContract = async () => {
    if (!deploymentResult?.address) {
      setError('No contract deployed to verify');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to verify contract
      const response = await fetch('/api/contracts/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: deploymentResult.address,
          source: contractSource,
          network: deploymentResult.network || selectedNetwork,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      // Update deployment result with verification status
      setDeploymentResult((prev: any) => ({
        ...prev,
        verified: true,
      }));
    } catch (err) {
      console.error('Error verifying contract:', err);
      setError(`Failed to verify contract: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(ContractStep.SELECT_TYPE);
    setSelectedType('');
    setParameters({});
    setContractSource('');
    setError(null);
    setDeploymentResult(null);
    setCustomDescription('');
    setCompilationResult(null);
  };

  // Ask AI assistant for help
  const askAiAssistant = async () => {
    if (!aiAssistantPrompt) {
      return;
    }

    setIsAiAssistantLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/contracts/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiAssistantPrompt,
          contractSource: contractSource || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAiAssistantResponse(data.response);
      
      // If AI suggested code changes and we're in review step
      if (data.suggestedCode && step === ContractStep.REVIEW) {
        setContractSource(data.suggestedCode);
      }
    } catch (err) {
      console.error('Error with AI assistant:', err);
      setError('Failed to get AI assistance. Please try again.');
    } finally {
      setIsAiAssistantLoading(false);
      setAiAssistantPrompt('');
    }
  };

  // Update contract source
  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContractSource(e.target.value);
    // Reset compilation result when code changes
    setCompilationResult(null);
    
    // If we're in the review step and have already compiled successfully before,
    // automatically trigger compilation after a short delay
    if (step === ContractStep.REVIEW) {
      // Clear any existing timeout
      if (window.autoCompileTimeout) {
        clearTimeout(window.autoCompileTimeout);
      }
      
      // Set a new timeout to compile after user stops typing
      window.autoCompileTimeout = setTimeout(() => {
        compileContract();
      }, 1500);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400 mb-8">Please connect your wallet to access the contract creation tools</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Smart Contract Studio</h1>
        <p className="text-gray-400 mb-8">Create, test, and deploy smart contracts on Sonic blockchain</p>
      </motion.div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                step === ContractStep.SELECT_TYPE
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
              onClick={() => step !== ContractStep.SELECT_TYPE && setStep(ContractStep.SELECT_TYPE)}
            >
              1. Select Type
            </button>
            <div className="w-4 h-0.5 bg-gray-700"></div>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                step === ContractStep.REVIEW
                  ? 'bg-blue-600 text-white'
                  : step > ContractStep.SELECT_TYPE
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => step > ContractStep.SELECT_TYPE && setStep(ContractStep.REVIEW)}
              disabled={step < ContractStep.REVIEW}
            >
              2. Review & Edit
            </button>
            <div className="w-4 h-0.5 bg-gray-700"></div>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                step === ContractStep.DEPLOY || step === ContractStep.RESULT
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => step > ContractStep.REVIEW && setStep(ContractStep.DEPLOY)}
              disabled={step < ContractStep.DEPLOY}
            >
              3. Deploy
            </button>
          </div>
          
          {step !== ContractStep.SELECT_TYPE && (
            <button
              className="px-3 py-1 rounded-md text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700"
              onClick={resetForm}
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Step 1: Select Contract Type */}
            {step === ContractStep.SELECT_TYPE && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Contract Type</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(contractTemplates).map(([key, template]) => (
                    <div
                      key={key}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedType === key
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedType(key)}
                    >
                      <div className="flex items-center mb-2">
                        <FaFileContract className="text-blue-400 mr-2" />
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </div>
                  ))}
                  
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedType === 'custom'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedType('custom')}
                  >
                    <div className="flex items-center mb-2">
                      <FaRobot className="text-purple-400 mr-2" />
                      <h3 className="font-medium">Custom Contract (AI Generated)</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Describe your contract requirements and let AI generate it for you
                    </p>
                  </div>
                </div>
                
                {selectedType && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">
                      {selectedType === 'custom' ? 'Describe Your Contract' : 'Configure Parameters'}
                    </h3>
                    
                    {selectedType === 'custom' ? (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Contract Description</label>
                        <textarea
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                          placeholder="Describe the contract you want to create in detail..."
                          rows={5}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Example: "Create a staking contract that allows users to stake ERC-20 tokens and earn rewards over time"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contractTemplates[selectedType as keyof typeof contractTemplates]?.parameters.map((param: any) => (
                          <div key={param.name}>
                            <label className="block text-sm font-medium mb-1">{param.label}</label>
                            <input
                              type={param.type === 'number' ? 'number' : 'text'}
                              value={parameters[param.name] || ''}
                              onChange={(e) => handleParameterChange(param.name, e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                              placeholder={param.placeholder}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    className={`px-4 py-2 rounded-md font-medium ${
                      !selectedType
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={generateContractSource}
                    disabled={!selectedType}
                  >
                    {isAIGenerating ? 'Generating...' : 'Generate Contract'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review and Edit Contract */}
            {step === ContractStep.REVIEW && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review & Edit Contract</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Contract Source Code</label>
                    <div className="flex space-x-2">
                      <button
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        onClick={compileContract}
                      >
                        <FaCode className="inline mr-1" /> Compile
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      ref={editorRef}
                      value={contractSource}
                      onChange={handleSourceChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white font-mono text-sm"
                      style={{ minHeight: '400px' }}
                      spellCheck="false"
                    />
                  </div>
                  
                  {compilationResult && (
                    <div className={`mt-2 p-3 rounded-md ${
                      compilationResult.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                    }`}>
                      {compilationResult.success ? (
                        <FaCheck className="inline mr-2" />
                      ) : (
                        <FaExclamationTriangle className="inline mr-2" />
                      )}
                      {compilationResult.message}
                    </div>
                  )}
                </div>
                
                {/* AI Assistant */}
                <div className="mb-6 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <FaRobot className="text-purple-400 mr-2" />
                    AI Contract Assistant
                  </h3>
                  
                  <div className="mb-4">
                    <textarea
                      value={aiAssistantPrompt}
                      onChange={(e) => setAiAssistantPrompt(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      placeholder="Ask for help with your contract..."
                      rows={2}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Examples: "Add a function to pause the contract", "Explain how this contract works", "Make this contract more gas efficient"
                    </p>
                  </div>
                  
                  <div className="flex justify-end mb-4">
                    <button
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        !aiAssistantPrompt || isAiAssistantLoading
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      onClick={askAiAssistant}
                      disabled={!aiAssistantPrompt || isAiAssistantLoading}
                    >
                      {isAiAssistantLoading ? 'Thinking...' : 'Ask AI Assistant'}
                    </button>
                  </div>
                  
                  {aiAssistantResponse && (
                    <div className="bg-gray-800 rounded-md p-3 text-sm">
                      <div className="font-medium text-purple-400 mb-1">AI Assistant:</div>
                      <div className="text-gray-300 whitespace-pre-wrap">{aiAssistantResponse}</div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    className={`px-4 py-2 rounded-md font-medium ${
                      !contractSource
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => setStep(ContractStep.DEPLOY)}
                    disabled={!contractSource}
                  >
                    Continue to Deployment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Deploy Contract */}
            {step === ContractStep.DEPLOY && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Deploy Contract</h2>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-3">Deployment Settings</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Network</label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md flex items-center ${
                          selectedNetwork === 'testnet'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedNetwork('testnet')}
                      >
                        <FaNetworkWired className="mr-2" />
                        Sonic Testnet
                      </button>
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-md flex items-center ${
                          selectedNetwork === 'mainnet'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setSelectedNetwork('mainnet')}
                      >
                        <FaNetworkWired className="mr-2" />
                        Sonic Mainnet
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">
                      You are about to deploy your contract to the{' '}
                      <span className={`font-medium ${selectedNetwork === 'testnet' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {networkConfig.name}
                      </span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Make sure your wallet is connected to the {networkConfig.name} and has sufficient funds for gas fees.
                    </p>
                    
                    {selectedNetwork === 'mainnet' && (
                      <div className="mt-2 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-300 text-sm">
                        <FaExclamationTriangle className="inline mr-2" />
                        Warning: You are deploying to Mainnet. This will use real funds.
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-md p-3 text-yellow-300 text-sm mb-4">
                    <FaExclamationTriangle className="inline mr-2" />
                    This action will deploy your contract to the blockchain. Once deployed, the contract code cannot be changed.
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    className={`px-4 py-2 rounded-md font-medium flex items-center ${
                      selectedNetwork === 'testnet'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    onClick={deployContract}
                  >
                    <FaRocket className="mr-2" /> Deploy to {networkConfig.name}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Deployment Result */}
            {step === ContractStep.RESULT && deploymentResult && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Deployment Successful!</h2>
                
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-900 rounded-full flex items-center justify-center mr-4">
                      <FaCheck className="text-green-300 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-green-300">Contract Deployed</h3>
                      <p className="text-gray-300">
                        Your contract has been successfully deployed to the{' '}
                        <span className="font-medium">
                          {deploymentResult.network === 'mainnet' ? 'Sonic Mainnet' : 'Sonic Testnet'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Contract Name:</div>
                      <div className="font-mono bg-gray-800 p-2 rounded text-green-300">
                        {deploymentResult.contractName || 'Contract'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Contract Address:</div>
                      <div className="font-mono bg-gray-800 p-2 rounded text-green-300 break-all">
                        {deploymentResult.address}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">Transaction Hash:</div>
                      <div className="font-mono bg-gray-800 p-2 rounded text-blue-300 break-all">
                        {deploymentResult.transactionHash}
                      </div>
                    </div>
                    
                    {deploymentResult.blockNumber && (
                      <div>
                        <div className="text-sm text-gray-400">Block Number:</div>
                        <div className="font-mono bg-gray-800 p-2 rounded">
                          {deploymentResult.blockNumber}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`${deploymentResult.network === 'mainnet' ? sonicMainnet.blockExplorers.default.url : sonicBlazeTestnet.blockExplorers.default.url}/address/${deploymentResult.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                    >
                      View on Explorer
                    </a>
                    
                    {!deploymentResult.verified && (
                      <button
                        onClick={verifyContract}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                      >
                        Verify Contract
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={resetForm}
                  >
                    Create Another Contract
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 