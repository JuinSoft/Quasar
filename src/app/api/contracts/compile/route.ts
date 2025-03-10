import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import solc from 'solc';

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();

    if (!source) {
      return NextResponse.json(
        { error: 'No source code provided' },
        { status: 400 }
      );
    }

    // Load compiler
    function findImports(path: string) {
      // This is a simplified import resolver
      // In a real application, you would resolve imports from node_modules or other sources
      return { error: 'File not found' };
    }

    // Prepare input for solc compiler
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers'],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    // Check for errors
    if (output.errors) {
      // Log warnings for debugging
      output.errors.forEach((error: any) => {
        if (error.severity === 'warning') {
          console.warn('Solidity warning:', error.formattedMessage);
        }
      });

      // Filter out only errors (not warnings)
      const errors = output.errors.filter((error: any) => error.severity === 'error');
      if (errors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Compilation failed',
            details: errors.map((error: any) => error.formattedMessage).join('\n')
          },
          { status: 400 }
        );
      }
    }

    // Check if compilation was successful
    if (!output.contracts || !output.contracts['contract.sol']) {
      return NextResponse.json(
        { error: 'Compilation produced no output' },
        { status: 400 }
      );
    }

    // Extract contract data - get the first contract if multiple are defined
    const contractNames = Object.keys(output.contracts['contract.sol']);
    if (contractNames.length === 0) {
      return NextResponse.json(
        { error: 'No contracts found in source' },
        { status: 400 }
      );
    }

    const contractName = contractNames[0];
    const contract = output.contracts['contract.sol'][contractName];

    // Ensure we have the required output
    if (!contract.abi || !contract.evm || !contract.evm.bytecode) {
      return NextResponse.json(
        { error: 'Compilation output is missing required fields' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      contractName,
    });
  } catch (error) {
    console.error('Error compiling contract:', error);
    return NextResponse.json(
      { error: 'Failed to compile contract: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 