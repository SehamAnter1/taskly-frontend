# How to Get Your LiveKit Server URL

## Option 1: LiveKit Cloud (Recommended for Testing)

### Step 1: Sign Up
1. Go to [livekit.io](https://livekit.io)
2. Click "Sign Up" or "Get Started"
3. Create a free account (free tier available)

### Step 2: Create a Project
1. Once logged in, go to the Dashboard
2. Click "Create Project" or "New Project"
3. Give it a name (e.g., "My Test Project")
4. Select a region closest to you

### Step 3: Get Your Server URL
1. After creating the project, you'll see your project dashboard
2. Look for **"Server URL"** or **"WebSocket URL"** section
3. It will look like: `wss://your-project-name.livekit.cloud`
4. Copy this URL - this is your server URL!

### Step 4: Get Your API Credentials
1. In the same dashboard, find **"API Keys"** section
2. You'll see:
   - **API Key**: Something like `devkey` or `APxxxxxxxx`
   - **API Secret**: A long string (keep this secret!)
3. Copy both - you'll need them to generate tokens

### Example:
```
Server URL: wss://my-project.livekit.cloud
API Key: devkey
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Option 2: Self-Hosted LiveKit Server

If you're running your own LiveKit server:

1. **For Local Development:**
   - Server URL: `ws://localhost:7880` (non-secure WebSocket)
   - Use this only for local testing

2. **For Production (Self-Hosted):**
   - Server URL: `wss://your-domain.com` (secure WebSocket)
   - Must use `wss://` (secure) for HTTPS sites
   - Get your API key and secret from your server configuration

## How to Verify Your Server URL is Correct

### Check 1: URL Format
✅ **Correct formats:**
- `wss://your-project.livekit.cloud` (LiveKit Cloud)
- `wss://your-domain.com` (Self-hosted with SSL)
- `ws://localhost:7880` (Local development only)

❌ **Incorrect formats:**
- `http://your-project.livekit.cloud` (should be `wss://`)
- `https://your-project.livekit.cloud` (should be `wss://`)
- `your-project.livekit.cloud` (missing protocol)

### Check 2: Test Connection
1. Open your browser's Developer Console (F12)
2. Go to the Network tab
3. Try to connect to your meeting room
4. Look for WebSocket connections
5. The WebSocket URL should match your server URL

### Check 3: Common Issues

**Issue: "Connection Failed" or "401 Unauthorized"**
- ❌ Wrong server URL
- ❌ Token generated for different server
- ✅ Make sure token and server URL match

**Issue: "WebSocket connection failed"**
- ❌ Server URL uses `http://` instead of `wss://`
- ❌ Server URL is incorrect
- ❌ Network/firewall blocking connection
- ✅ Use `wss://` for secure connections

**Issue: "Invalid server URL"**
- ❌ Missing protocol (`wss://` or `ws://`)
- ❌ Extra characters or spaces
- ✅ Should be exactly: `wss://your-project.livekit.cloud`

## Using the Token Generator

1. Open `/token-generator.html` in your browser
2. Enter:
   - **Server URL**: `wss://your-project.livekit.cloud`
   - **API Key**: From LiveKit dashboard
   - **API Secret**: From LiveKit dashboard
3. Click "Generate Token"
4. The generated URL will include the server URL automatically

## Quick Reference

### LiveKit Cloud:
```
Server URL: wss://your-project-name.livekit.cloud
Format: wss://[project-name].livekit.cloud
```

### Self-Hosted:
```
Local: ws://localhost:7880
Production: wss://your-domain.com
```

### Important Notes:
- Always use `wss://` (secure) for production
- Use `ws://` only for local development
- Server URL must match the server where you generated the token
- Don't include `/rtc` or any path - just the base URL

## Still Having Issues?

1. **Double-check your LiveKit dashboard:**
   - Make sure you copied the URL correctly
   - Check for any typos

2. **Verify your token:**
   - Token must be generated for the same server URL
   - Token must not be expired

3. **Check browser console:**
   - Look for WebSocket connection errors
   - Check the Network tab for failed connections

4. **Test with a simple connection:**
   - Use the token generator
   - Try connecting with the generated URL
   - Check if WebSocket connects successfully

