/**
 * Script to copy cryptocurrency icons from node_modules to public directory
 */
const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, '../node_modules/cryptocurrency-icons/svg/color');
const destDir = path.join(__dirname, '../public/images/crypto');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// List of common cryptocurrency symbols to copy
const commonCryptos = [
  'btc', 'eth', 'sol', 'bnb', 'xrp', 'ada', 'avax', 'doge', 'dot', 
  'matic', 'trx', 'ltc', 'link', 'uni', 'xlm', 'atom', 'xmr', 
  'usdt', 'usdc', 'dai', 'shib', 'generic'
];

// Copy each icon
let copiedCount = 0;
let errorCount = 0;

commonCryptos.forEach(symbol => {
  const sourcePath = path.join(sourceDir, `${symbol}.svg`);
  const destPath = path.join(destDir, `${symbol}.svg`);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied: ${symbol}.svg`);
      copiedCount++;
    } else {
      console.warn(`Warning: Icon not found for ${symbol}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`Error copying ${symbol}.svg:`, error.message);
    errorCount++;
  }
});

console.log(`\nCopied ${copiedCount} icons with ${errorCount} errors.`);
console.log(`Icons are now available in ${destDir}`); 