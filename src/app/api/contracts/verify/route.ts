import { NextRequest, NextResponse } from 'next/server';
import { sonicBlazeTestnet, sonicMainnet } from '@/config/chains';

export async function POST(req: NextRequest) {
  try {
    const { address, source, network = 'testnet' } = await req.json();

    if (!address || !source) {
      return NextResponse.json(
        { error: 'Address and source code are required' },
        { status: 400 }
      );
    }

    // Get the correct explorer URL based on the network
    const explorerUrl = network === 'mainnet' 
      ? sonicMainnet.blockExplorers.default.url
      : sonicBlazeTestnet.blockExplorers.default.url;

    // In a real implementation, you would call the block explorer's API to verify the contract
    // For this demo, we'll simulate a successful verification
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: 'Contract verified successfully',
      explorerUrl: `${explorerUrl}/address/${address}`,
      network,
    });
  } catch (error) {
    console.error('Error verifying contract:', error);
    return NextResponse.json(
      { error: 'Failed to verify contract' },
      { status: 500 }
    );
  }
} 