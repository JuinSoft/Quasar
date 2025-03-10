import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { sonicBlazeTestnet } from '@/config/chains';

// Simple attestation contract ABI (for demonstration)
const ATTESTATION_ABI = [
  "function attestDocument(string memory documentHash, string memory documentName, string memory documentURI) public returns (uint256)",
  "function getAttestation(uint256 attestationId) public view returns (address attester, string memory documentHash, string memory documentName, string memory documentURI, uint256 timestamp)"
];

// Contract address (this would be your deployed contract on Sonic blockchain)
const ATTESTATION_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual contract

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
    
    // Generate a random encryption key - using a safer approach
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const encryptionKey = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // In a real implementation, you would encrypt and upload the content to IPFS
    // For this demo, we'll simulate getting a CID back
    const mockCID = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}`;
    
    // For demo, we'll simulate the attestation
    const attestationId = Math.floor(Math.random() * 1000000);
    
    // Return the attestation details and encryption key to the client
    return NextResponse.json({
      success: true,
      attestationId,
      documentHash,
      encryptionKey,
      documentURI: mockCID,
      name,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in document attestation:', error);
    return NextResponse.json(
      { error: 'Failed to process document attestation' },
      { status: 500 }
    );
  }
} 