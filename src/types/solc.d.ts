declare module 'solc' {
  interface ImportContent {
    contents?: string;
    error?: string;
  }

  interface CompilerOutput {
    errors?: Array<{
      severity: string;
      formattedMessage: string;
    }>;
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

  // Simple compile function
  function compile(input: string): string;
  
  // Compile with import resolver
  function compile(
    input: string, 
    options: { 
      import: (path: string) => ImportContent 
    }
  ): string;
  
  export default compile;
} 