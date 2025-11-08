# Troubleshooting Guide

## 401 Unauthorized Error

If you're getting a `401 Unauthorized` error when connecting to LiveKit, it usually means:

### Common Causes:

1. **Invalid Token**
   - Token was generated with wrong API key/secret
   - Token has expired
   - Token signature is invalid

2. **Token/Server Mismatch**
   - Token was generated for a different LiveKit server
   - Server URL doesn't match the token

3. **Incorrect API Credentials**
   - API key doesn't match the LiveKit project
   - API secret is incorrect

### Solutions:

#### Solution 1: Use Node.js Token Generator (Recommended)

The browser-based token generator may have issues. Use the Node.js script instead:

1. **Set environment variables:**
   ```powershell
   # Windows PowerShell
   $env:LIVEKIT_API_KEY="your_api_key"
   $env:LIVEKIT_API_SECRET="your_api_secret"
   ```

2. **Generate token:**
   ```bash
   node generate-token.js test-room Seham
   ```

3. **Copy the generated URL** and use it

#### Solution 2: Verify Your Credentials

1. **Check your LiveKit Dashboard:**
   - Go to [livekit.io](https://livekit.io)
   - Open your project
   - Go to "API Keys" section
   - Verify your API Key and Secret are correct

2. **Verify Server URL:**
   - Make sure server URL matches: `wss://alsallah-oqk6c7l8.livekit.cloud`
   - No trailing slash
   - No paths like `/rtc`

3. **Regenerate Token:**
   - Delete old token
   - Generate a new one with correct credentials
   - Make sure token and server URL match

#### Solution 3: Check Token Expiration

Tokens expire after 6 hours. If your token is old:
1. Generate a new token
2. Use the new token immediately

#### Solution 4: Test Token Validity

You can decode your JWT token to check:
1. Go to [jwt.io](https://jwt.io)
2. Paste your token
3. Check the payload:
   - `iss` should match your API key
   - `exp` should be in the future
   - `video.room` should match your room name

### Debugging Steps:

1. **Check Browser Console:**
   - Look for the exact error message
   - Check the WebSocket connection URL
   - Verify the token is in the URL

2. **Verify Server URL:**
   - Make sure it's exactly: `wss://alsallah-oqk6c7l8.livekit.cloud`
   - No extra characters or spaces

3. **Test with Fresh Token:**
   - Generate a brand new token
   - Use it immediately
   - Don't reuse old tokens

4. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Look for WebSocket connections
   - Check the status code (should be 101, not 401)

### Quick Fix:

1. **Use the Node.js script** (most reliable):
   ```bash
   node generate-token.js
   ```

2. **Or verify credentials in token generator:**
   - Double-check API Key matches your dashboard
   - Double-check API Secret matches your dashboard
   - Make sure Server URL is exactly: `wss://alsallah-oqk6c7l8.livekit.cloud`

3. **Generate new token and test immediately**

## Other Common Errors

### WebSocket Connection Failed
- Check server URL format
- Verify network connectivity
- Check firewall settings

### Token Expired
- Generate a new token
- Tokens expire after 6 hours

### Room Not Found
- Check room name matches
- Verify you have permission to join the room

## Still Having Issues?

1. **Double-check all credentials** in LiveKit dashboard
2. **Use Node.js token generator** instead of browser
3. **Generate a fresh token** and use it immediately
4. **Check token expiration** - generate new one if old
5. **Verify server URL** matches exactly

