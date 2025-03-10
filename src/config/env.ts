export const env = {
  // OpenAI API Key
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  
  // WalletConnect Project ID
  WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  
  // Covalent API Key
  COVALENT_API_KEY: process.env.NEXT_PUBLIC_COVALENT_API_KEY || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // App Info
  APP_NAME: 'Quasar',
  APP_DESCRIPTION: 'AI-powered crypto market analysis on Sonic Blockchain',
}; 