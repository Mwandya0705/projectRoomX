#!/usr/bin/env node

/**
 * Quick script to update Clerk keys in .env.local
 * Usage: node fix-clerk-keys.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env.local');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔑 Clerk Keys Setup\n');
  console.log('Get your keys from: https://dashboard.clerk.com/apps -> API Keys\n');
  
  const publishableKey = await question('Enter NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ');
  const secretKey = await question('Enter CLERK_SECRET_KEY: ');
  const webhookSecret = await question('Enter CLERK_WEBHOOK_SECRET (optional, press Enter to skip): ');

  if (!publishableKey || !secretKey) {
    console.error('❌ Both publishable key and secret key are required!');
    rl.close();
    process.exit(1);
  }

  // Validate key formats
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    console.error('❌ Invalid publishable key format. Should start with pk_test_ or pk_live_');
    rl.close();
    process.exit(1);
  }

  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    console.error('❌ Invalid secret key format. Should start with sk_test_ or sk_live_');
    rl.close();
    process.exit(1);
  }

  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update keys
  envContent = envContent.replace(
    /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/,
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}`
  );

  envContent = envContent.replace(
    /CLERK_SECRET_KEY=.*/,
    `CLERK_SECRET_KEY=${secretKey}`
  );

  if (webhookSecret) {
    envContent = envContent.replace(
      /CLERK_WEBHOOK_SECRET=.*/,
      `CLERK_WEBHOOK_SECRET=${webhookSecret}`
    );
  }

  // Write back
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Keys updated successfully!');
  console.log('🔄 Please restart your dev server: npm run dev\n');
  
  rl.close();
}

main().catch(console.error);


