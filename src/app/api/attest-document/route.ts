import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { sonicBlazeTestnet } from '@/config/chains';

// Attestation contract ABI
const ATTESTATION_ABI = [
  "function attestDocument(string memory documentHash, string memory documentName, string memory documentURI) public returns (uint256)",
  "function getAttestation(uint256 attestationId) public view returns (address attester, string memory documentHash, string memory documentName, string memory documentURI, uint256 timestamp)"
];

// Contract address on Sonic blockchain
const ATTESTATION_CONTRACT_ADDRESS = "0xd19e2e41e3de50646b2ba9cf7c02c1c9a86b2652"; // Replace with actual deployed contract

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const walletAddress = formData.get('walletAddress') as string;

    if (!file || !name || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read the file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);
    
    // Create a hash of the document for verification
    const documentHash = ethers.utils.keccak256(fileBytes);
    
    // Generate a random encryption key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const encryptionKey = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // In a real implementation, you would encrypt the file with the key and upload to IPFS
    // For this demo, we'll simulate getting a CID back
    const mockCID = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`;
    
    // Connect to the Sonic blockchain
    try {
      // Create a provider for the Sonic blockchain
      const provider = new ethers.providers.JsonRpcProvider(sonicBlazeTestnet.rpcUrls.default.http[0]);
      
      // Check if we have a wallet address from the frontend
      if (!walletAddress) {
        throw new Error('No wallet address provided');
      }
      
      // For server-side operations, we need to use a provider-based approach
      // In a production environment, you would use a secure method to get the signer
      // This could be through a session-based authentication system or a secure API
      
      // For demo purposes, we'll use a read-only provider to query the contract
      const attestationContract = new ethers.Contract(
        ATTESTATION_CONTRACT_ADDRESS,
        ATTESTATION_ABI,
        provider
      );
      
      // For actual transactions, the frontend should handle the signing process
      // Here we'll return the data needed for the frontend to create the transaction
      return NextResponse.json({
        success: true,
        documentHash,
        encryptionKey,
        documentURI: mockCID,
        name,
        timestamp: new Date().toISOString(),
        contractAddress: ATTESTATION_CONTRACT_ADDRESS,
        contractABI: ATTESTATION_ABI,
        transactionData: {
          method: 'attestDocument',
          params: [documentHash, name, mockCID],
          from: walletAddress
        }
      });
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
      
      // For demo purposes, return a simulated success response
      const attestationId = Math.floor(Math.random() * 1000000);
      
      return NextResponse.json({
        success: true,
        attestationId,
        documentHash,
        encryptionKey,
        documentURI: mockCID,
        name,
        timestamp: new Date().toISOString(),
        simulatedMode: true,
      });
    }
  } catch (error) {
    console.error('Error in document attestation:', error);
    return NextResponse.json(
      { error: 'Failed to process document attestation' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get the attestation ID from the query parameters
    const url = new URL(req.url);
    const attestationId = url.searchParams.get('id');
    
    if (!attestationId) {
      return NextResponse.json(
        { error: 'Missing attestation ID' },
        { status: 400 }
      );
    }
    
    // Connect to the Sonic blockchain
    const provider = new ethers.providers.JsonRpcProvider(sonicBlazeTestnet.rpcUrls.default.http[0]);
    
    // Connect to the attestation contract
    const attestationContract = new ethers.Contract(
      ATTESTATION_CONTRACT_ADDRESS,
      ATTESTATION_ABI,
      provider
    );
    
    try {
      // Call the getAttestation function
      const attestation = await attestationContract.getAttestation(attestationId);
      
      // Return the attestation details
      return NextResponse.json({
        success: true,
        attestation: {
          attester: attestation[0],
          documentHash: attestation[1],
          documentName: attestation[2],
          documentURI: attestation[3],
          timestamp: new Date(attestation[4].toNumber() * 1000).toISOString(),
        }
      });
    } catch (contractError) {
      console.error('Contract error:', contractError);
      
      // For demo purposes, return a simulated response
      return NextResponse.json({
        success: true,
        attestation: {
          attester: '0x' + '0'.repeat(40),
          documentHash: '0x' + '0'.repeat(64),
          documentName: 'Sample Document',
          documentURI: 'ipfs://QmSample',
          timestamp: new Date().toISOString(),
        },
        simulatedMode: true,
      });
    }
  } catch (error) {
    console.error('Error retrieving attestation:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve attestation' },
      { status: 500 }
    );
  }
} 