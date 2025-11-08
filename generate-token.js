/**
 * Simple script to generate a LiveKit token for testing
 * 
 * Usage:
 * 1. Install: npm install livekit-server-sdk
 * 2. Set your API key and secret via environment variables
 * 3. Run: node generate-token.js [room] [user]
 * 
 * Example:
 *   LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx node generate-token.js test-room Seham
 */

import { AccessToken } from 'livekit-server-sdk';

// Get credentials from environment or set them here
const apiKey = process.env.LIVEKIT_API_KEY || 'YOUR_API_KEY';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'YOUR_API_SECRET';
const roomName = process.argv[2] || 'test-room';
const userName = process.argv[3] || 'Seham';

if (apiKey === 'YOUR_API_KEY' || apiSecret === 'YOUR_API_SECRET') {
  console.error('❌ Error: Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables');
  console.error('   Or edit this file and set them directly');
  console.error('');
  console.error('Usage:');
  console.error('  LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx node generate-token.js [room] [user]');
  console.error('  node generate-token.js test-room Seham');
  process.exit(1);
}

try {
  const token = new AccessToken(apiKey, apiSecret, {
    identity: userName,
    name: userName,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateMetadata: true,
  });

  const jwt = token.toJwt();
  
  console.log('✅ Token generated successfully!');
  console.log('');
  console.log('📋 Token:');
  console.log(jwt);
  console.log('');
  console.log('🔗 Test URL:');
  console.log(`http://localhost:5173/?token=${encodeURIComponent(jwt)}&user=${userName}&room=${roomName}`);
  console.log('');
  console.log('📝 Token expires in 6 hours');
} catch (error) {
  console.error('❌ Error generating token:', error.message);
  process.exit(1);
}

