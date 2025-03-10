import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import solc from 'solc';
import axios from 'axios';
import path from 'path';

// OpenZeppelin GitHub base URL for contracts - using v4.4.1 which matches the contract's expected version
const OPEN_ZEPPELIN_BASE_URL = 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.4.1/';

// Interface for import resolution
interface ImportContent {
  contents?: string;
  error?: string;
}

interface CompilerError {
  severity: string;
  formattedMessage: string;
}

interface CompilerOutput {
  errors?: CompilerError[];
  contracts?: {
    [fileName: string]: {
      [contractName: string]: {
        abi: any;
        evm: {
          bytecode: {
            object: string;
          };
          deployedBytecode?: any;
          methodIdentifiers?: any;
        };
      };
    };
  };
}

// Interface for resolved imports
interface ResolvedImports {
  [key: string]: ImportContent;
}

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json();

    if (!source) {
      return NextResponse.json(
        { error: 'No source code provided' },
        { status: 400 }
      );
    }

    // Create a cache for resolved imports
    const resolvedImports: ResolvedImports = {};

    // Function to fetch a contract from GitHub
    async function fetchContract(url: string): Promise<string | null> {
      try {
        console.log(`Fetching from: ${url}`);
        const response = await axios.get(url);
        
        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error(`Error fetching contract: ${error}`);
      }
      return null;
    }

    // Function to resolve an import path to its absolute path
    function resolveImportPath(importPath: string, fromPath: string): string {
      // If it's already an absolute path (starts with @), return it
      if (importPath.startsWith('@')) {
        return importPath;
      }
      
      // For relative imports, resolve them based on the importing file's path
      const importingDir = path.dirname(fromPath);
      return path.posix.normalize(`${importingDir}/${importPath}`);
    }

    // Function to resolve an import path
    async function resolveImport(importPath: string, fromPath: string | null = null): Promise<string | null> {
      // If it's already in the cache, return it
      if (resolvedImports[importPath]?.contents) {
        return resolvedImports[importPath].contents!;
      }

      // If this is a relative import, resolve it to an absolute path
      let absolutePath = importPath;
      if (fromPath && (importPath.startsWith('./') || importPath.startsWith('../'))) {
        absolutePath = resolveImportPath(importPath, fromPath);
        
        // Check if the resolved path is already in the cache
        if (resolvedImports[absolutePath]?.contents) {
          // Also store it under the original path for future lookups
          resolvedImports[importPath] = resolvedImports[absolutePath];
          return resolvedImports[absolutePath].contents!;
        }
      }

      // Handle OpenZeppelin imports
      if (absolutePath.startsWith('@openzeppelin/')) {
        // Convert @openzeppelin/contracts/path/to/file.sol to contracts/path/to/file.sol
        const githubPath = absolutePath.replace('@openzeppelin/', '');
        const url = `${OPEN_ZEPPELIN_BASE_URL}${githubPath}`;
        
        const content = await fetchContract(url);
        if (content) {
          // Store under both the original and absolute paths
          resolvedImports[importPath] = { contents: content };
          if (importPath !== absolutePath) {
            resolvedImports[absolutePath] = { contents: content };
          }
          return content;
        }
      }

      console.error(`Failed to resolve import: ${importPath} from ${fromPath || 'main contract'}`);
      return null;
    }

    // Function to find and resolve all imports recursively
    async function resolveAllImports(): Promise<boolean> {
      try {
        // Start with the main contract
        resolvedImports['contract.sol'] = { contents: source };
        
        // Keep track of which files we've processed
        const processed = new Set<string>();
        // Queue of files to process
        const queue: string[] = ['contract.sol'];
        
        while (queue.length > 0) {
          const currentFile = queue.shift()!;
          
          if (processed.has(currentFile)) {
            continue;
          }
          
          processed.add(currentFile);
          
          // Check if the file exists in our resolved imports
          if (!resolvedImports[currentFile] || !resolvedImports[currentFile].contents) {
            console.error(`Missing content for file: ${currentFile}`);
            return false;
          }
          
          const currentSource = resolvedImports[currentFile].contents!;
          
          // Find all imports in the current file
          const importRegex = /import\s+["']([^"']+)["'];/g;
          let match;
          
          while ((match = importRegex.exec(currentSource)) !== null) {
            const importPath = match[1];
            
            // Skip if already processed
            if (processed.has(importPath)) {
              continue;
            }
            
            // Resolve the import
            const content = await resolveImport(importPath, currentFile);
            
            if (content) {
              // Add to the queue for processing its imports
              queue.push(importPath);
            } else {
              // If we can't resolve an import, return false
              console.error(`Failed to resolve import: ${importPath} from ${currentFile}`);
              return false;
            }
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in resolveAllImports:', error);
        return false;
      }
    }

    // Resolve all imports
    console.log("Resolving imports...");
    const success = await resolveAllImports();
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to resolve all imports' },
        { status: 400 }
      );
    }
    
    console.log(`Resolved ${Object.keys(resolvedImports).length - 1} imports`);

    // Prepare input for solc compiler with all resolved sources
    const input = {
      language: 'Solidity',
      sources: Object.fromEntries(
        Object.entries(resolvedImports)
          .filter(([_, content]) => content && content.contents) // Filter out any entries without contents
          .map(([path, content]) => [
            path,
            { content: content.contents! }
          ])
      ),
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

    // Compile the contract with all imports resolved
    console.log("Compiling contract...");
    console.log("Sources:", Object.keys(input.sources));
    
    // @ts-ignore - solc.compile has a different signature than what's in the type definition
    const output = JSON.parse(solc.compile(JSON.stringify(input))) as CompilerOutput;

    // Check for errors
    if (output.errors) {
      // Log warnings for debugging
      output.errors.forEach((error: CompilerError) => {
        if (error.severity === 'warning') {
          console.warn('Solidity warning:', error.formattedMessage);
        }
      });

      // Filter out only errors (not warnings)
      const errors = output.errors.filter((error: CompilerError) => error.severity === 'error');
      if (errors.length > 0) {
        return NextResponse.json(
          { 
            error: 'Compilation failed',
            details: errors.map((error: CompilerError) => error.formattedMessage).join('\n')
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