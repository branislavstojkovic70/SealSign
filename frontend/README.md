# SealSign — Frontend

React 19 + TypeScript + Vite SPA. Runs on port 5174.

See the root [README.md](../README.md) for full setup instructions, environment variables, and architecture.

## Commands

```bash
npm run dev       # Vite dev server (http://localhost:5174)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_REOWN_PROJECT_ID` | Yes | WalletConnect / Reown project ID |
| `VITE_API_URL` | Yes | Backend URL (default: `http://localhost:3001`) |
| `VITE_SEPOLIA_RPC_URL` | Yes | Sepolia JSON-RPC for ENS resolution |
| `VITE_ISSUE_PAYMENT_RECIPIENT` | No | Sepolia address to receive issue fee |
| `VITE_ISSUE_PAYMENT_AMOUNT_ETH` | No | Fee amount in ETH (default: `0.001`) |
| `VITE_PAYMENT_CHAIN_ID` | No | Chain ID (default: `11155111` = Sepolia) |

All `VITE_*` variables are bundled into the client. Never put private keys here.
