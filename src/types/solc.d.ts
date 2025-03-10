declare module 'solc' {
  function compile(input: string, options?: { import: (path: string) => { contents?: string; error?: string } }): string;
  export default compile;
} 