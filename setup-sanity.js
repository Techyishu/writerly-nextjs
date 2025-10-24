#!/usr/bin/env node

/**
 * Sanity Setup Helper Script
 * This script helps you set up Sanity for your Writerly Blog
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Sanity Setup Helper for Writerly Blog\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  const envTemplate = `# Sanity Configuration
# Get these values from your Sanity project dashboard
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-api-token-here
`;
  
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://sanity.io and create a new project');
console.log('2. Get your Project ID from the dashboard');
console.log('3. Create an API token with Editor permissions');
console.log('4. Update the values in .env.local');
console.log('5. Run: npm run dev');
console.log('\n🎉 Your blog will be powered by Sanity CMS!');
