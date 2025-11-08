# Quick Start Guide - Testing LiveKit Meetings

## Option 1: Generate Token and Test Locally (Easiest)

### Step 1: Get LiveKit Credentials
1. Sign up at [livekit.io](https://livekit.io) (free tier available)
2. Create a project
3. Get your credentials from the LiveKit Dashboard:
   - **Server URL**: Found in your project dashboard (e.g., `wss://your-project.livekit.cloud`)
     - Format: `wss://[your-project-name].livekit.cloud`
     - Must use `wss://` (secure WebSocket), not `http://` or `https://`
   - **API Key**: Found in "API Keys" section (e.g., `devkey`)
   - **API Secret**: Found in "API Keys" section (long string)

**Note:** See [HOW_TO_GET_LIVEKIT_URL.md](./HOW_TO_GET_LIVEKIT_URL.md) for detailed instructions on finding your server URL.

### Step 2: Generate a Token

**On Windows (PowerShell):**
```powershell
$env:LIVEKIT_API_KEY="your_api_key"
$env:LIVEKIT_API_SECRET="your_api_secret"
node generate-token.js test-room Seham
```

**On Mac/Linux:**
```bash
LIVEKIT_API_KEY=your_api_key LIVEKIT_API_SECRET=your_api_secret node generate-token.js test-room Seham
```

### Step 3: Copy the Generated URL

The script will output a URL like:
```
http://localhost:5173/?token=eyJhbGc...&user=Seham&room=test-room
```

Copy and paste this URL into your browser to test!

## Option 2: Set Environment Variables (For Automatic Token Generation)

### For Local Development:

**Option A: Use the setup script (Easiest)**

1. Run the setup script:
```bash
npm run setup-env
```

2. Edit the created `.env.local` file and add your credentials:
```env
VITE_LIVEKIT_API_KEY=your_api_key
VITE_LIVEKIT_API_SECRET=your_api_secret
VITE_LIVEKIT_SERVER_URL=wss://your-project.livekit.cloud
```

3. Restart your dev server:
```bash
npm run dev
```

4. Visit: `http://localhost:5173/?user=Seham&room=test-room`

The token will be generated automatically!

**Option B: Manual setup**

1. Create a `.env.local` file in the project root:
```env
VITE_LIVEKIT_API_KEY=your_api_key
VITE_LIVEKIT_API_SECRET=your_api_secret
VITE_LIVEKIT_SERVER_URL=wss://your-project.livekit.cloud
```

2. Restart your dev server and visit the app.

### For Vercel Deployment:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these variables:
   - `VITE_LIVEKIT_API_KEY` = your API key
   - `VITE_LIVEKIT_API_SECRET` = your API secret
   - `VITE_LIVEKIT_SERVER_URL` = your server URL
3. Redeploy your app

## Option 3: Pass Token Directly in URL

If you already have a token (from another source), just add it to the URL:

```
http://localhost:5173/?token=your_token_here&user=Seham&room=test-room
```

## Troubleshooting

### "Failed to get meeting token" Error
- Make sure you have either:
  - A token in the URL (`?token=xxx`)
  - OR environment variables set (`VITE_LIVEKIT_API_KEY` and `VITE_LIVEKIT_API_SECRET`)

### "Connection Failed" Error
- Check that `VITE_LIVEKIT_SERVER_URL` is correct
- Make sure you're using `wss://` (secure) for production
- Verify your LiveKit server is running

### Token Generation Fails
- Verify your API key and secret are correct
- Make sure you've installed `livekit-server-sdk`: `npm install livekit-server-sdk`
- Check that the script has the correct permissions

## Testing on Vercel

Once deployed to Vercel:

1. Set environment variables in Vercel dashboard
2. Visit: `https://your-app.vercel.app/?user=Seham&room=test-room`
3. The app will generate a token automatically if env vars are set

Or pass a token directly:
```
https://your-app.vercel.app/?token=your_token&user=Seham&room=test-room
```

