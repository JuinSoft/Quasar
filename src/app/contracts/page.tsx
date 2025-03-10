'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contractTemplates } from '@/services/contracts/templates';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { sonicBlazeTestnet } from '@/config/chains';
import { FaCode, FaRocket, FaCheck, FaExclamationTriangle, FaRobot, FaFileContract } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
  const editorRef = useRef<HTMLTextAreaElement>(null);

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

  // Compile contract to check for errors
  const compileContract = async () => {
    setIsLoading(true);
    setCompilationResult(null);
    
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

      const data = await response.json();
      
      if (response.ok) {
        setCompilationResult({
          success: true,
          message: 'Contract compiled successfully!'
        });
      } else {
        setCompilationResult({
          success: false,
          message: data.details || data.error || 'Compilation failed. Please check your code.'
        });
      }
    } catch (err) {
      console.error('Error compiling contract:', err);
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
      
      // Deploy contract
      const contract = await factory.deploy();
      await contract.deployed();
      
      setDeploymentResult({
        address: contract.address,
        transactionHash: contract.deployTransaction.hash,
        blockNumber: contract.deployTransaction.blockNumber,
        contractName: data.contractName || 'Contract',
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
                    <p className="text-gray-300 mb-2">
                      You are about to deploy your contract to the <span className="font-medium text-yellow-400">Sonic Blaze Testnet</span>.
                    </p>
                    <p className="text-gray-400 text-sm">
                      Make sure your wallet is connected to the Sonic Blaze Testnet and has sufficient funds for gas fees.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-800 rounded-md p-3 text-yellow-300 text-sm mb-4">
                    <FaExclamationTriangle className="inline mr-2" />
                    This action will deploy your contract to the blockchain. Once deployed, the contract code cannot be changed.
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                    onClick={deployContract}
                  >
                    <FaRocket className="mr-2" /> Deploy Contract
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
                      <p className="text-gray-300">Your contract has been successfully deployed to the Sonic blockchain</p>
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
                      href={`${sonicBlazeTestnet.blockExplorers.default.url}/address/${deploymentResult.address}`}
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