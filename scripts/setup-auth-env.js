#!/usr/bin/env node

/**
 * This script sets up the necessary environment variables for NextAuth
 * across different deployment environments (development, preview, production).
 * 
 * Usage: node scripts/setup-auth-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands and handle errors
function runCommand(command, errorMessage) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(`${colors.red}${errorMessage}${colors.reset}`);
    console.error(`Command: ${command}`);
    console.error(`Error: ${error.message}`);
    return null;
  }
}

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Vercel CLI is not installed or not in PATH.${colors.reset}`);
    console.error('Please install it with: npm i -g vercel');
    return false;
  }
}

// Set up environment variables for different environments
async function setupEnvironmentVariables() {
  console.log(`${colors.cyan}Setting up NextAuth environment variables...${colors.reset}`);

  if (!checkVercelCLI()) {
    return;
  }

  // 1. Set up NEXTAUTH_URL for preview deployments
  console.log(`\n${colors.yellow}Setting up NEXTAUTH_URL for preview deployments...${colors.reset}`);
  console.log('This will use ${VERCEL_URL} to dynamically set the URL for each preview deployment.');
  
  runCommand(
    'vercel env rm NEXTAUTH_URL preview -y || true',
    'Failed to remove existing NEXTAUTH_URL from preview environment'
  );
  
  runCommand(
    'vercel env add NEXTAUTH_URL preview',
    'Failed to add NEXTAUTH_URL to preview environment'
  );
  console.log(`${colors.green}When prompted, enter: \${VERCEL_URL}${colors.reset}`);
  
  // 2. Ensure NEXTAUTH_URL is set correctly for production
  console.log(`\n${colors.yellow}Checking NEXTAUTH_URL for production...${colors.reset}`);
  const prodUrl = runCommand(
    'vercel env pull --environment=production && grep NEXTAUTH_URL .env.local | cut -d= -f2',
    'Failed to check production NEXTAUTH_URL'
  );
  
  if (prodUrl) {
    console.log(`Current production NEXTAUTH_URL: ${prodUrl}`);
    console.log(`${colors.green}Production NEXTAUTH_URL is set.${colors.reset}`);
  } else {
    console.log(`${colors.red}Production NEXTAUTH_URL is not set.${colors.reset}`);
    console.log('Please set it with:');
    console.log('vercel env add NEXTAUTH_URL production');
    console.log(`${colors.green}When prompted, enter your production URL (e.g., https://pixel-alpha-flax.vercel.app/)${colors.reset}`);
  }
  
  // 3. Update local .env file for development
  console.log(`\n${colors.yellow}Updating local .env file for development...${colors.reset}`);
  try {
    let envContent = '';
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if NEXTAUTH_URL is already set
      if (envContent.includes('NEXTAUTH_URL=')) {
        // Replace existing NEXTAUTH_URL
        envContent = envContent.replace(
          /NEXTAUTH_URL=.*/,
          'NEXTAUTH_URL=http://localhost:3000'
        );
      } else {
        // Add NEXTAUTH_URL if it doesn't exist
        envContent += '\nNEXTAUTH_URL=http://localhost:3000\n';
      }
    } else {
      // Create new .env file with NEXTAUTH_URL
      envContent = 'NEXTAUTH_URL=http://localhost:3000\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`${colors.green}Updated local .env file with NEXTAUTH_URL=http://localhost:3000${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to update local .env file:${colors.reset}`, error.message);
  }
  
  // 4. Provide instructions for GitHub OAuth setup
  console.log(`\n${colors.magenta}GitHub OAuth Setup Instructions:${colors.reset}`);
  console.log('1. Go to GitHub → Settings → Developer Settings → OAuth Apps');
  console.log('2. Find your OAuth app or create a new one');
  console.log('3. Add these callback URLs:');
  console.log('   - http://localhost:3000/api/auth/callback/github (for development)');
  console.log('   - https://pixel-alpha-flax.vercel.app/api/auth/callback/github (for production)');
  console.log('   - https://*.vercel.app/api/auth/callback/github (for preview deployments)');
  console.log('\n4. Make sure your GitHub OAuth credentials are set in all environments:');
  console.log('   vercel env add GITHUB_ID development');
  console.log('   vercel env add GITHUB_SECRET development');
  console.log('   vercel env add GITHUB_ID preview');
  console.log('   vercel env add GITHUB_SECRET preview');
  console.log('   vercel env add GITHUB_ID production');
  console.log('   vercel env add GITHUB_SECRET production');
  
  console.log(`\n${colors.green}Setup complete!${colors.reset}`);
  console.log(`${colors.cyan}Remember to redeploy your application after making these changes:${colors.reset}`);
  console.log('vercel --prod');
}

// Run the setup
setupEnvironmentVariables().catch(console.error);