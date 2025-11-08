# Vercel Deployment Guide for LiveKit Meeting Room

## Overview
This guide explains how to deploy your LiveKit meeting room frontend to Vercel and configure it to work without a backend server.

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required for Local Token Generation:
- `VITE_LIVEKIT_API_KEY` - Your LiveKit API key
- `VITE_LIVEKIT_API_SECRET` - Your LiveKit API secret
- `VITE_LIVEKIT_SERVER_URL` - Your LiveKit server URL (e.g., `wss://your-project.livekit.cloud`)

### How to Set Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its value
4. Make sure to set them for **Production**, **Preview**, and **Development** environments
5. Redeploy your application after adding variables

## Usage Methods

### Method 1: Pass Token via URL (Recommended for Testing)

If you have a token generated elsewhere, pass it directly in the URL:

```
https://your-app.vercel.app/?token=your_livekit_token_here&user=Seham
```

**Optional URL Parameters:**
- `token` - LiveKit access token (if not provided, will try to generate locally)
- `user` - User name/identity (default: "Seham")
- `room` - Room name (default: "test-room")

**Example:**
```
https://your-app.vercel.app/?token=eyJhbGc...&user=John&room=meeting-123
```

### Method 2: Local Token Generation

If you set `VITE_LIVEKIT_API_KEY` and `VITE_LIVEKIT_API_SECRET` environment variables, the app will generate tokens locally.

**Example URL:**
```
https://your-app.vercel.app/?user=Seham&room=meeting-room
```

The app will automatically generate a token using the API key and secret.

## LiveKit Server URL Configuration

Set `VITE_LIVEKIT_SERVER_URL` in Vercel environment variables:
- For LiveKit Cloud: `wss://your-project.livekit.cloud`
- For self-hosted: `wss://your-domain.com`
- For local testing: `ws://localhost:7880` (not recommended for Vercel deployment)

**Default:** If not set, it defaults to `wss://your-project.livekit.cloud` (you should change this)

## Getting LiveKit Credentials

### LiveKit Cloud (Easiest):
1. Sign up at [livekit.io](https://livekit.io)
2. Create a project
3. Get your API key, secret, and server URL from the dashboard

### Self-Hosted:
1. Deploy LiveKit server on your infrastructure
2. Get the WebSocket URL (usually `wss://your-domain.com`)
3. Use your server's API key and secret

## Deployment Steps

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. **Configure Environment Variables:**
   - Add `VITE_LIVEKIT_API_KEY`
   - Add `VITE_LIVEKIT_API_SECRET`
   - Add `VITE_LIVEKIT_SERVER_URL`

4. **Deploy:**
   - Vercel will automatically build and deploy
   - The build command is: `npm run build`
   - Output directory: `dist`

5. **Test:**
   - Visit your deployed URL
   - Try with token in URL: `?token=your_token`
   - Or test with local generation if env vars are set

## Security Notes

⚠️ **Important Security Considerations:**

1. **Client-Side Token Generation**: Generating tokens client-side exposes your API secret. This is **NOT recommended for production**. Use this only for testing.

2. **Production Setup**: For production, always generate tokens on your backend server and pass them to the frontend.

3. **API Secret**: Never commit your API secret to version control. Always use environment variables.

4. **HTTPS/WSS**: Always use `wss://` (secure WebSocket) for production, never `ws://` over the internet.

## Troubleshooting

### "Failed to get meeting token" Error
- Check if `VITE_LIVEKIT_API_KEY` and `VITE_LIVEKIT_API_SECRET` are set correctly
- Or provide a token via URL parameter: `?token=your_token`

### "Connection Failed" Error
- Verify `VITE_LIVEKIT_SERVER_URL` is correct
- Make sure you're using `wss://` (secure) for production
- Check that your LiveKit server is running and accessible

### Token Generation Fails
- Ensure API key and secret are correct
- Check that environment variables are set for the correct environment (Production/Preview)
- Redeploy after adding environment variables

## Example URLs

### With Pre-generated Token:
```
https://your-app.vercel.app/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&user=John&room=meeting-123
```

### With Local Token Generation:
```
https://your-app.vercel.app/?user=Alice&room=team-meeting
```


