# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SealSign** — Cryptographic Guardian of Public Trust.
A decentralized document verification platform built for ETHGlobal Cannes 2026. Institutions issue tamper-proof documents on Hedera HCS; Chainlink CRE verifies them autonomously; WalletConnect Pay gates access. Full spec: [docs/SPEC.md](docs/SPEC.md).

## Stack

- **React 18 + TypeScript + Vite** — frontend SPA (port 5173)
- **Express 4** — backend API server (port 3001), holds private keys
- **Hedera HCS** (`@hashgraph/sdk`) — immutable document hash registry, no smart contracts
- **Chainlink CRE** — autonomous verification workflow in Confidential Compute
- **Reown AppKit** (`@reown/appkit`) — wallet connection
- **ENS on Sepolia** (`ethers` v6) — human-readable issuer identity
- **Tailwind CSS** — styling
- **React Router DOM v6** — client-side routing

## Commands

```bash
npm run dev          # start both Vite + Express (concurrently)
npm run dev:client   # Vite only (localhost:5173)
npm run dev:server   # Express only (localhost:3001)
npm run build        # Vite production build
npm run lint         # ESLint

# One-time setup scripts (run with tsx)
npx tsx scripts/createTopic.ts    # create Hedera HCS topic → copy ID to .env
npx tsx scripts/issueTestDoc.ts   # issue a test document hash
npx tsx scripts/registerENS.ts    # register ENS name on Sepolia
```

## Architecture

```
Browser (Vite/React)       Express Backend            External
──────────────────────     ──────────────────────     ────────────────────
PDF drop → SHA-256 hash →  POST /api/issue       →   Hedera HCS (submit)
(hash never leaves browser) POST /api/verify      →   Chainlink CRE
                            GET  /api/hedera/messages → Hedera Mirror Node
```

Key invariant: **raw PDF files never leave the browser and never touch the server or blockchain.** Only the SHA-256 hex hash is transmitted.

The Express server exists solely to keep `HEDERA_PRIVATE_KEY` and the Chainlink CRE SDK off the client bundle.

### Core lib modules

| File | Purpose |
|------|---------|
| `src/lib/hash.ts` | SHA-256 hashing in the browser (`crypto.subtle`), returns hex string. |
| `server/lib/hedera.ts` | `submitDocumentHash()` and `fetchTopicMessages()` via Mirror Node. Mirror Node messages are base64-encoded — decode before parsing JSON. |
| `server/lib/cre.ts` | Chainlink CRE workflow call. If CRE SDK is unavailable, fall back to identical logic in `server/routes/verify.ts` and note it's designed for CRE Confidential Compute. |
| `src/lib/ens.ts` | ENS resolve/lookup on Sepolia via `ethers.JsonRpcProvider`. Hardcode fallback mapping for demo. |
| `src/lib/walletconnect-pay.ts` | WalletConnect Pay — 1 HBAR fee before verification result is shown. |

### Data flow — Issue
1. `IssueForm` → file → `hashFile()` (client) → `POST /api/issue`
2. Express calls `submitDocumentHash()` → HCS TopicMessageSubmitTransaction
3. Return Hedera tx ID + HashScan explorer URL → `IssueResult`

### Data flow — Verify
1. `DropZone` → file → `hashFile()` (client)
2. `PayGate` — WalletConnect Pay confirmation
3. `POST /api/verify` → Express → `verifyDocumentWithCRE()` → Mirror Node lookup
4. `VerifyResult` — GREEN (verified) or RED (tampered/not found)

## Environment Variables

See `.env`. Use `VITE_` prefix for any variable the browser needs.
- `HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`, `HEDERA_TOPIC_ID` — server only, never `VITE_`
- `VITE_REOWN_PROJECT_ID`
- `VITE_SEPOLIA_RPC_URL`
- `VITE_API_URL=http://localhost:3001`

## Design Tokens

- Verified: `#10B981` (emerald green)
- Tampered/error: `#EF4444` (red)
- Dark theme, `lucide-react` icons (Shield, FileCheck, AlertTriangle)
