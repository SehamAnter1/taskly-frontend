/**
 * Helper script to create .env.local file
 * 
 * Usage: node setup-env.js
 */

import fs from 'fs';
import path from 'path';

const envTemplate = `# LiveKit Configuration for Local Development
# Get these from https://livekit.io

# Your LiveKit API Key
VITE_LIVEKIT_API_KEY=

# Your LiveKit API Secret
VITE_LIVEKIT_API_SECRET=

# Your LiveKit Server URL
# For LiveKit Cloud: wss://your-project.livekit.cloud
# For local: ws://localhost:7880
VITE_LIVEKIT_SERVER_URL=
`;

const envLocalPath = path.join(process.cwd(), '.env.local');

try {
  if (fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local already exists!');
    console.log('   If you want to recreate it, delete it first.');
    process.exit(1);
  }

  fs.writeFileSync(envLocalPath, envTemplate);
  console.log('✅ Created .env.local file!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Open .env.local and fill in your LiveKit credentials');
  console.log('   2. Get credentials from https://livekit.io');
  console.log('   3. Restart your dev server (npm run dev)');
  console.log('');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}

