'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { contractTemplates } from '@/services/contracts/templates';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { sonicBlazeTestnet } from '@/config/chains';

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

  // Reset parameters when contract type changes
  useEffect(() => {
    if (selectedType) {
      const defaultParams: Record<string, string> = {};
      contractTemplates[selectedType]?.parameters.forEach(param => {
        defaultParams[param.name] = '';
      });
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
      if (customDescription || !contractTemplates[selectedType]) {
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
        let source = contractTemplates[selectedType].template;
        
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

  // Deploy contract
  const deployContract = async () => {
    if (!isConnected || !contractSource) {
      setError('Please connect your wallet and generate a contract first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would compile and deploy the contract here
      // For this demo, we'll simulate deployment
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful deployment
      setDeploymentResult({
        success: true,
        contractAddress: `0x${Math.random().toString(36).substring(2, 12)}`,
        transactionHash: `0x${Math.random().toString(36).substring(2, 42)}`,
      });
      
      setStep(ContractStep.RESULT);
    } catch (err) {
      console.error('Error deploying contract:', err);
      setError('Failed to deploy contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify contract
  const verifyContract = async () => {
    if (!deploymentResult?.contractAddress) {
      setError('No contract to verify');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would verify the contract here
      // For this demo, we'll simulate verification
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update deployment result
      setDeploymentResult({
        ...deploymentResult,
        verified: true,
      });
    } catch (err) {
      console.error('Error verifying contract:', err);
      setError('Failed to verify contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setStep(ContractStep.SELECT_TYPE);
    setSelectedType('');
    setParameters({});
    setContractSource('');
    setDeploymentResult(null);
    setCustomDescription('');
    setError(null);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-gray-400 mb-8">Please connect your wallet to create and deploy smart contracts</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Smart Contract Creator</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Object.values(ContractStep).map((s, index) => (
            <div 
              key={s} 
              className={`flex flex-col items-center ${index > Object.values(ContractStep).indexOf(step) ? 'opacity-50' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index < Object.values(ContractStep).indexOf(step) 
                  ? 'bg-green-500 text-white' 
                  : index === Object.values(ContractStep).indexOf(step)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm capitalize">{s.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-gray-700 w-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${(Object.values(ContractStep).indexOf(step) / (Object.values(ContractStep).length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {/* Step 1: Select Contract Type */}
          {step === ContractStep.SELECT_TYPE && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Select Contract Type</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    <h3 className="text-lg font-medium mb-2">{template.name}</h3>
                    <p className="text-gray-400 text-sm">{template.description}</p>
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
                  <h3 className="text-lg font-medium mb-2">Custom Contract</h3>
                  <p className="text-gray-400 text-sm">Create a custom smart contract with AI assistance</p>
                </div>
              </div>
              
              {selectedType === 'custom' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Describe Your Contract</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="Describe the functionality you want in your smart contract..."
                    rows={5}
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(ContractStep.CONFIGURE)}
                  disabled={!selectedType}
                  className={`px-4 py-2 rounded-md font-medium ${
                    !selectedType
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Configure Contract */}
          {step === ContractStep.CONFIGURE && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configure Contract</h2>
              
              {selectedType === 'custom' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Describe Your Contract</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    placeholder="Describe the functionality you want in your smart contract..."
                    rows={5}
                  />
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {contractTemplates[selectedType]?.parameters.map(param => (
                    <div key={param.name}>
                      <label className="block text-sm font-medium mb-2">{param.label}</label>
                      <input
                        type={param.type}
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        placeholder={param.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(ContractStep.SELECT_TYPE)}
                  className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Back
                </button>
                <button
                  onClick={generateContractSource}
                  className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate Contract
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Review Contract */}
          {step === ContractStep.REVIEW && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Review Contract</h2>
              
              {isAIGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-400">AI is generating your smart contract...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="bg-gray-800 rounded-md p-4 overflow-auto max-h-[500px]">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">{contractSource}</pre>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(ContractStep.CONFIGURE)}
                      className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Back
                    </button>
                    <div className="space-x-4">
                      <button
                        onClick={() => {
                          setCustomDescription(contractSource);
                          setSelectedType('custom');
                          setStep(ContractStep.CONFIGURE);
                        }}
                        className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setStep(ContractStep.DEPLOY)}
                        className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Step 4: Deploy Contract */}
          {step === ContractStep.DEPLOY && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Deploy Contract</h2>
              
              <div className="mb-6">
                <div className="bg-gray-800 rounded-md p-4 mb-4">
                  <h3 className="text-md font-medium mb-2">Deployment Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Network:</span> Sonic Blockchain (Chain ID: {sonicBlazeTestnet.id})</p>
                    <p><span className="text-gray-400">Deployer:</span> {address}</p>
                    <p><span className="text-gray-400">Estimated Gas:</span> ~3,000,000 gas units</p>
                    <p><span className="text-gray-400">Estimated Cost:</span> ~0.003 S</p>
                  </div>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4 text-yellow-300 text-sm">
                  <p className="font-medium">Important:</p>
                  <p>Make sure you have enough S tokens in your wallet to cover the deployment cost.</p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(ContractStep.REVIEW)}
                  className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Back
                </button>
                <button
                  onClick={deployContract}
                  className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Deploy Contract
                </button>
              </div>
            </div>
          )}
          
          {/* Step 5: Deployment Result */}
          {step === ContractStep.RESULT && deploymentResult && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Deployment Result</h2>
              
              <div className="mb-6">
                {deploymentResult.success ? (
                  <div className="bg-green-900/30 border border-green-700 rounded-md p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-medium text-green-400">Contract Deployed Successfully!</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Contract Address:</span> {deploymentResult.contractAddress}</p>
                      <p><span className="text-gray-400">Transaction Hash:</span> {deploymentResult.transactionHash}</p>
                      <p><span className="text-gray-400">Network:</span> Sonic Blockchain (Chain ID: {sonicBlazeTestnet.id})</p>
                      <p><span className="text-gray-400">Status:</span> {deploymentResult.verified ? 'Verified ✓' : 'Not Verified'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-medium text-red-400">Deployment Failed</h3>
                    </div>
                    <p className="text-sm">{deploymentResult.error || 'An unknown error occurred during deployment.'}</p>
                  </div>
                )}
                
                {deploymentResult.success && !deploymentResult.verified && (
                  <div className="mb-4">
                    <button
                      onClick={verifyContract}
                      className="w-full px-4 py-2 rounded-md font-medium bg-green-600 hover:bg-green-700 text-white"
                    >
                      Verify Contract
                    </button>
                  </div>
                )}
                
                <div className="bg-gray-800 rounded-md p-4">
                  <h3 className="text-md font-medium mb-2">Next Steps</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>Interact with your contract using the Sonic blockchain explorer</li>
                    <li>Add your token to wallets like MetaMask or Trust Wallet</li>
                    <li>Create a liquidity pool for your token</li>
                    <li>Share your contract address with your community</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => window.open(`${sonicBlazeTestnet.blockExplorers.default.url}/address/${deploymentResult.contractAddress}`, '_blank')}
                  className="px-4 py-2 rounded-md font-medium bg-gray-700 hover:bg-gray-600 text-white"
                >
                  View on Explorer
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Another Contract
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 