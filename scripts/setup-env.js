#!/usr/bin/env node
/**
 * Environment Setup Script
 * Creates .env file with required environment variables
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🚀 Surprise App - Environment Setup\n');
  
  if (existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide the following information:\n');

  // Database Configuration
  console.log('DATABASE CONFIGURATION:');
  const databaseUrl = await question('Database URL (PostgreSQL connection string): ');
  
  // API Configuration
  console.log('\nAPI CONFIGURATION:');
  const apiUrl = await question('API URL (default: http://localhost:3000/api): ') || 'http://localhost:3000/api';
  
  // Authentication
  console.log('\nAUTHENTICATION:');
  const sessionSecret = await question('Session Secret (leave empty for random): ') || 
    Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
  
  // External Services (Optional)
  console.log('\nEXTERNAL SERVICES (Optional - press Enter to skip):');
  const stripeKey = await question('Stripe Publishable Key: ');
  const stripeSecret = await question('Stripe Secret Key: ');
  const resendKey = await question('Resend API Key: ');
  const sentryDsn = await question('Sentry DSN: ');

  // Cloudflare (Optional)
  console.log('\nCLOUDFLARE (Optional):');
  const cfAccountId = await question('Cloudflare Account ID: ');
  const cfApiToken = await question('Cloudflare API Token: ');
  
  // Create .env content
  const envContent = `# Database
DATABASE_URL="${databaseUrl}"

# API
API_URL="${apiUrl}"
NODE_ENV="development"

# Authentication
SESSION_SECRET="${sessionSecret}"

# Stripe (Payment Processing)
${stripeKey ? `STRIPE_PUBLISHABLE_KEY="${stripeKey}"` : '# STRIPE_PUBLISHABLE_KEY=""'}
${stripeSecret ? `STRIPE_SECRET_KEY="${stripeSecret}"` : '# STRIPE_SECRET_KEY=""'}

# Resend (Email)
${resendKey ? `RESEND_API_KEY="${resendKey}"` : '# RESEND_API_KEY=""'}

# Sentry (Error Tracking)
${sentryDsn ? `SENTRY_DSN="${sentryDsn}"` : '# SENTRY_DSN=""'}

# Cloudflare
${cfAccountId ? `CLOUDFLARE_ACCOUNT_ID="${cfAccountId}"` : '# CLOUDFLARE_ACCOUNT_ID=""'}
${cfApiToken ? `CLOUDFLARE_API_TOKEN="${cfApiToken}"` : '# CLOUDFLARE_API_TOKEN=""'}

# App Configuration
VITE_APP_NAME="Surprise Parking"
VITE_APP_URL="http://localhost:3000"
`;

  // Write .env file
  writeFileSync('.env', envContent);
  
  // Create .env.example
  const exampleContent = envContent.replace(/="[^"]*"/g, '=""');
  writeFileSync('.env.example', exampleContent);
  
  console.log('\n✅ Environment files created successfully!');
  console.log('   - .env (with your values)');
  console.log('   - .env.example (template for team)');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the .env file');
  console.log('   2. Run: npm run db:migrate');
  console.log('   3. Run: npm run db:seed');
  console.log('   4. Run: npm run dev\n');
  
  rl.close();
}

setup().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
