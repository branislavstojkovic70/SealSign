# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**SealSign** — Cryptographic Guardian of Public Trust.
A decentralized document verification platform built for ETHGlobal Cannes 2026. Institutions issue tamper-proof documents on Hedera HCS; Chainlink CRE verifies them inside a Confidential Compute TEE; Reown AppKit + Ledger gates wallet access. Full spec: [docs/SPEC.md](docs/SPEC.md).

## Repository Layout

Two separate npm packages under one git repo:

```
SealSign/
├── frontend/       # React 19 + Vite 8 SPA (port 5173)
└── server/         # Express 4 backend (port 3001) — holds all secrets
```

## Stack

| Layer | Actual package |
|-------|---------------|
| Frontend framework | React 19 + TypeScript + Vite 8 |
| UI library | MUI (Material UI) v7 + `@emotion/react` |
| Toast notifications | `react-hot-toast` |
| Routing | React Router DOM v7 (`createBrowserRouter`) |
| Wallet | `@reown/appkit` v1.8 + `@reown/appkit-adapter-ethers5`, Ledger Live featured via WebHID detection |
| ENS | `ethers` v5 (frontend) / `ethers` v6 (server scripts) on Sepolia |
| Backend API | Express 4 + `cors` + `dotenv` |
| Hedera | `@hashgraph/sdk` v2.46 — HCS only, no smart contracts |
| CRE | `@chainlink/cre-sdk` v1.5 — WASM workflow + server-side fallback |

## Commands

```bash
# From server/ (starts both backend + frontend concurrently)
npm run dev          # Express (3001) + Vite (5173)
npm run dev:server   # Express only
npm run dev:client   # Vite only (runs cd ../frontend && npm run dev)
npm run build        # tsc
npm run lint         # ESLint

# From frontend/ (standalone)
npm run dev          # Vite only (5173)
npm run build        # tsc -b && vite build
npm run lint         # ESLint

# One-time setup scripts (from server/, run with tsx)
npx tsx scripts/createTopic.ts        # create Hedera HCS document registry → HEDERA_TOPIC_ID
npx tsx scripts/createAuditTopic.ts   # create Hedera HCS audit topic → HEDERA_AUDIT_TOPIC_ID
npx tsx scripts/issueTestDoc.ts       # issue a test document hash
npx tsx scripts/registerENS.ts        # register ENS name on Sepolia
```

## Architecture

```
Browser (React/Vite :5173)          Express Backend (:3001)           External
────────────────────────────        ─────────────────────────────     ──────────────────────
PDF drop → SHA-256 hash             POST /api/issue              →   Hedera HCS (document registry)
  (PDF never leaves browser)
                                    POST /api/verify             →   verifyDocumentWithCRE()
                                      ↳ server fallback          →   Hedera Mirror Node
                                      ↳ CRE WASM workflow        →   Confidential Compute TEE
                                      ↳ logVerificationAttempt   →   Hedera HCS (audit log)

                                    GET /api/hedera/messages     →   Hedera Mirror Node (debug)
```

Key invariant: **raw PDF files never leave the browser and never touch the server or blockchain.** Only the SHA-256 hex hash is transmitted.

### Core Modules

**Frontend (`frontend/src/`)**

| File | Purpose |
|------|---------|
| `main.tsx` | Entry — `createRoot`, MUI `ThemeProvider`, `RouterProvider`, `Toaster` |
| `utils/reown.ts` | Reown AppKit init — `createAppKit` with `Ethers5Adapter`, Sepolia only, Ledger Live featured |
| `utils/ledger.ts` | WebHID Ledger detection, `ledgerFeaturedWalletIds`, `openLedgerLiveConnect` helper |
| `utils/hashFile.ts` | `sha256HexFromFile()` — `crypto.subtle.digest('SHA-256')`, returns hex string |
| `utils/verifyApi.ts` | `postVerify(hash)` — calls `POST /api/verify`, typed response |
| `utils/issueHelpers.ts` | `isPdfFile()`, `randomHederaStyleTxId()` |
| `pages/IssuePage.tsx` | Drop PDF → hash → fill form → `handleNotarize()` (currently client-side mock tx ID) |
| `pages/VerifyPage.tsx` | Drop PDF → hash → `postVerify()` → show `VerifyResultPanel` |
| `theme.ts` | MUI dark theme — emerald `#10B981` primary, red `#EF4444` error |

**Server (`server/`)**

| File | Purpose |
|------|---------|
| `index.ts` | Express entry — CORS (`FRONTEND_URL` env or `localhost:5173`), JSON, global error handler |
| `routes/issue.ts` | `POST /api/issue` — validates hash + fields, calls `submitDocumentHash()` |
| `routes/verify.ts` | `POST /api/verify` — validates hash, calls `verifyDocumentWithCRE()`, fire-and-forget audit log |
| `routes/hedera.ts` | `GET /api/hedera/messages` — debug, returns all topic messages |
| `lib/hedera.ts` | `submitDocumentHash()`, `fetchTopicMessages()`, `logVerificationAttempt()`, `parsePrivateKey()` |
| `lib/cre.ts` | `verifyDocumentWithCRE()` — server-side fallback, mirrors `cre/main.ts` logic step-by-step |
| `lib/hash.ts` | Server SHA-256 via `node:crypto` |
| `cre/main.ts` | Chainlink CRE WASM workflow — `ConfidentialHTTPClient`, pure-JS base64 decode (no `atob` in QuickJS) |
| `cre/workflow.ts` | Workflow metadata (`WORKFLOW_NAME`, `WORKFLOW_VERSION`), CRE CLI commands |

## Hedera HCS — Two Topics

| Topic | Env Var | Message payload |
|-------|---------|----------------|
| Document Registry | `HEDERA_TOPIC_ID` | `{ hash, issuer, type, recipient, issuedAt }` |
| Verification Audit Log | `HEDERA_AUDIT_TOPIC_ID` | `{ hash, verified, issuer, documentType, timestamp }` |

**IMPORTANT:** Mirror Node `message` field is base64-encoded. Decode before JSON parsing:
```ts
const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
const record = JSON.parse(decoded) as DocumentRecord;
```
The CRE WASM runtime has no `atob()` — `cre/main.ts` has a pure-JS base64 decoder for this reason.

## Private Key Parsing

`parsePrivateKey()` in `server/lib/hedera.ts` auto-detects format:
- DER hex `302e`/`302a` prefix → `PrivateKey.fromStringED25519`
- DER hex `3030` prefix → `PrivateKey.fromStringECDSA`
- Raw 32-byte hex → ECDSA first, ED25519 fallback

## Environment Variables

`server/.env` (see `server/.env.example`):
```env
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=302e...
HEDERA_TOPIC_ID=0.0.XXXXX
HEDERA_AUDIT_TOPIC_ID=0.0.XXXXX     # optional — audit logging skipped silently if unset
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
FRONTEND_URL=http://localhost:5173  # CORS origin
SEPOLIA_RPC_URL=...                 # used by registerENS.ts only
```

`frontend/.env`:
```env
VITE_REOWN_PROJECT_ID=...
VITE_API_URL=http://localhost:3001
```

Never use `VITE_` prefix for Hedera secrets.

## Design Tokens

- Verified / primary accent: `#10B981` (emerald green)
- Tampered / error: `#EF4444` (red)
- Dark theme via MUI v7
- Icons: `@mui/icons-material`

## Routes

| Path | Component | Status |
|------|-----------|--------|
| `/` | `HomePage` | Done — hero + action cards |
| `/issue` | `IssuePage` | Done — PDF drop, hash, form; `handleNotarize` uses mock tx ID (not yet wired to `/api/issue`) |
| `/verify` | `VerifyPage` | Done — PDF drop, hash, calls real `POST /api/verify` |
| `/archive` | `PlaceholderPage` | Placeholder |
