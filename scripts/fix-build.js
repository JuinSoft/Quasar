const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove problematic dependencies
const dependenciesToRemove = [
  '@covalenthq/goldrush-kit',
];

// Add required dependencies
const dependenciesToAdd = {
  'crypto-js': '^4.2.0',
  'pino-pretty': '^10.3.1',
  'solc': '^0.8.20',
};

// Remove dependencies
dependenciesToRemove.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    console.log(`Removed dependency: ${dep}`);
  }
});

// Add dependencies
Object.entries(dependenciesToAdd).forEach(([dep, version]) => {
  if (!packageJson.dependencies[dep]) {
    packageJson.dependencies[dep] = version;
    console.log(`Added dependency: ${dep}@${version}`);
  }
});

// Add devDependencies
if (!packageJson.devDependencies['@types/crypto-js']) {
  packageJson.devDependencies['@types/crypto-js'] = '^4.2.2';
  console.log('Added devDependency: @types/crypto-js@^4.2.2');
}

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
}

// Create .env.local if it doesn't exist
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# OpenAI API Key - Get one at https://platform.openai.com/api-keys
NEXT_PUBLIC_OPENAI_API_KEY=

# WalletConnect Project ID - Get one at https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# LiveCoinWatch API Key - Get one at https://livecoinwatch.com/profile
NEXT_PUBLIC_LIVECOINWATCH_API_KEY=

# Covalent API Key - Get one at https://www.covalenthq.com/platform/
NEXT_PUBLIC_COVALENT_API_KEY=
`;
  fs.writeFileSync(envPath, envContent);
  console.log('Created .env.local file');
}

console.log('Build fixes applied successfully'); 