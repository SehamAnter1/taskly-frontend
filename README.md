# Taskly Frontend

A React + Vite application with LiveKit video meeting integration.

## Quick Start

### For Testing LiveKit Meetings:

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions on:
- Generating tokens for testing
- Setting up environment variables
- Deploying to Vercel

### Quick Token Generation:

1. Get LiveKit credentials from [livekit.io](https://livekit.io)
2. Run the token generator:
   ```bash
   LIVEKIT_API_KEY=xxx LIVEKIT_API_SECRET=xxx node generate-token.js
   ```
3. Copy the generated URL and open it in your browser

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
