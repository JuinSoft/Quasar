import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { sonicBlazeTestnet } from '@/config/chains';

// Attestation contract ABI
const ATTESTATION_ABI = [
  "function attestDocument(string memory documentHash, string memory documentName, string memory documentURI) public returns (uint256)",
  "function getAttestation(uint256 attestationId) public view returns (address attester, string memory documentHash, string memory documentName, string memory documentURI, uint256 timestamp)"
];

// Contract address on Sonic blockchain
const ATTESTATION_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed contract

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;

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
      
      // Create a wallet with a private key (in production, this would be a secure server wallet)
      // For demo purposes, we'll use a hardcoded private key - NEVER do this in production
      const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000"; // Replace with actual private key
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Connect to the attestation contract
      const attestationContract = new ethers.Contract(
        ATTESTATION_CONTRACT_ADDRESS,
        ATTESTATION_ABI,
        wallet
      );
      
      // Call the attestDocument function
      const tx = await attestationContract.attestDocument(
        documentHash,
        name,
        mockCID
      );
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // Get the attestation ID from the transaction logs
      // In a real implementation, you would parse the event logs to get the ID
      const attestationId = Math.floor(Math.random() * 1000000); // Placeholder
      
      // Return the attestation details
      return NextResponse.json({
        success: true,
        attestationId,
        documentHash,
        encryptionKey,
        documentURI: mockCID,
        name,
        timestamp: new Date().toISOString(),
        transactionHash: receipt.transactionHash,
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