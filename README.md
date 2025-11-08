# Taskly Frontend

A React + Vite application with LiveKit video meeting integration.

## Quick Start

### For Testing LiveKit Meetings:

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions on:
- Generating tokens for testing
- Setting up environment variables
- Deploying to Vercel

### Quick Token Generation:

1. Get LiveKit credentials from [livekit.io](https://livekit.io):
   - Sign up and create a project
   - Get your **Server URL** (e.g., `wss://your-project.livekit.cloud`)
   - Get your **API Key** and **API Secret** from the dashboard
2. Run the token generator:
   ```bash
   LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx node generate-token.js
   ```
3. Copy the generated URL and open it in your browser

**Need help finding your Server URL?** See [HOW_TO_GET_LIVEKIT_URL.md](./HOW_TO_GET_LIVEKIT_URL.md)

### Development

```bash
npm install
npm run dev
```

### Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for Vercel deployment instructions.

## Features

- LiveKit video meetings
- Kanban board
- GraphQL integration
- Modern UI with Tailwind CSS
