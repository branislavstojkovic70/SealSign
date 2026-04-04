# SealSign — Complete Project Specification

## Project Overview

**Name:** SealSign
**Tagline:** Cryptographic Guardian of Public Trust
**One-liner:** A decentralized platform where institutions issue tamper-proof documents on Hedera, verified autonomously by Chainlink CRE, with payments via WalletConnect — making document fraud cryptographically impossible.

**Hackathon:** ETHGlobal Cannes 2026
**Team:** 2 full-stack developers (Person A = blockchain-focused, Person B = frontend-focused)
**Time:** 12 hours
**Demo:** Video recording only (local dev environment)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React 18 + Vite, port 5174)       │
│  ┌────────────┐  ┌──────────────────┐  ┌─────────────── │
│  │  Issuer    │  │  Verifier        │  │  ENS Resolution │
│  │  Dashboard │  │  Portal          │  │  Display        │
│  └───────┬────┘  └────────┬─────────┘  └────────┬─────  │
│          │               │                      │        │
│  ┌───────┴───────────────┴──────────────────────┴─────┐  │
│  │         Reown AppKit (Wallet Connection)           │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │ HTTP (fetch to localhost:3001)
┌───────────────────────────▼─────────────────────────────┐
│              BACKEND (Express 4, port 3001)              │
│  POST /api/issue   POST /api/verify   GET /api/hedera/.. │
│  [holds HEDERA_PRIVATE_KEY + Chainlink CRE SDK]          │
└───────────┬─────────────────────┬────────────────────────┘
            │                     │
        ┌───▼──────────┐ ┌────────▼────────┐ ┌────────────────┐
        │ Hedera HCS   │ │ Chainlink       │ │ WalletConnect  │
        │ (Topic msgs) │ │ CRE             │ │ Pay            │
        │ Store hashes │ │ Verify logic    │ │ 1 HBAR fee     │
        └──────┬───────┘ └────────┬────────┘ └────────────────┘
               │                  │
               ▼                  │
        ┌──────────────┐          │
        │ Hedera Mirror├──────────┘
        │ Node API     │ (CRE reads hashes from here)
        └──────────────┘

┌──────────────┐
│ ENS (Sepolia)│  Institution readable names — resolved in browser via ethers
│ e.g. mit.eth │  (university-belgrade.eth)
└──────────────┘
```

---

## Project File Structure

```
sealsign/
├── .env                          # All vars — VITE_ prefix for browser, plain for server
├── vite.config.ts                # Vite config with React plugin + proxy to :3001
├── index.html                    # Vite entry point
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json            # For vite.config.ts
├── public/
│   └── fonts/
├── scripts/
│   ├── createTopic.ts            # One-time: creates Hedera HCS Topic
│   ├── issueTestDoc.ts           # One-time: issue a test document hash
│   └── registerENS.ts            # One-time: register ENS name on Sepolia
├── server/                       # Express backend — runs on port 3001
│   ├── index.ts                  # Express app entry point
│   ├── routes/
│   │   ├── issue.ts              # POST /api/issue → Hedera HCS submit
│   │   ├── verify.ts             # POST /api/verify → Chainlink CRE
│   │   └── hedera.ts             # GET /api/hedera/messages → Mirror Node
│   └── lib/
│       ├── hash.ts               # Server SHA-256 (node:crypto)
│       ├── hedera.ts             # Hedera HCS functions (submit, query)
│       └── cre.ts                # Chainlink CRE workflow integration
├── src/                          # React SPA — runs on port 5174
│   ├── main.tsx                  # ReactDOM.createRoot entry
│   ├── App.tsx                   # React Router: /, /issue, /verify
│   ├── index.css                 # Tailwind directives
│   ├── pages/
│   │   ├── HomePage.tsx          # Landing page
│   │   ├── IssuePage.tsx         # Issuer dashboard
│   │   └── VerifyPage.tsx        # Verifier portal
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Nav with wallet connect button
│   │   │   └── Footer.tsx
│   │   ├── issue/
│   │   │   ├── IssueForm.tsx     # Form: doc name, issuer, file upload
│   │   │   └── IssueResult.tsx   # Success screen with Hedera tx link
│   │   ├── verify/
│   │   │   ├── DropZone.tsx      # Drag & drop PDF zone
│   │   │   ├── PayGate.tsx       # WalletConnect Pay before verification
│   │   │   └── VerifyResult.tsx  # GREEN shield or RED alert
│   │   ├── ens/
│   │   │   └── ENSBadge.tsx      # Resolves & displays ENS name for issuer
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── StatusBadge.tsx
│   │       └── LoadingSpinner.tsx
│   ├── config/
│   │   ├── appkit.ts             # Reown AppKit configuration
│   │   └── chains.ts             # Chain definitions (Hedera testnet, Sepolia)
│   ├── lib/
│   │   ├── hash.ts               # Browser SHA-256 (crypto.subtle) — hex string
│   │   ├── ens.ts                # ENS resolution on Sepolia (browser-side ethers)
│   │   └── walletconnect-pay.ts  # Payment request logic
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── cre/
│   ├── workflow.ts               # Chainlink CRE verification workflow
│   └── config.json               # CRE workflow configuration
└── README.md
```

---

## Environment Variables (.env)

Variables prefixed `VITE_` are exposed to the browser bundle. Never prefix Hedera secrets with `VITE_`.

```env
# Hedera Testnet - Issuer Account (server only — never VITE_)
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=302e...
HEDERA_TOPIC_ID=0.0.XXXXX          # Created by scripts/createTopic.ts

# Hedera Testnet - Network (server only)
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# Reown / WalletConnect (browser)
VITE_REOWN_PROJECT_ID=your_project_id_here

# ENS (browser)
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# App
VITE_API_URL=http://localhost:3001
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "@hashgraph/sdk": "^2.46.0",
    "@reown/appkit": "^1.0.0",
    "@reown/appkit-adapter-ethers": "^1.0.0",
    "ethers": "^6.11.0",
    "lucide-react": "^0.400.0",
    "express": "^4.19.0",
    "cors": "^2.8.5",
    "concurrently": "^8.2.0",
    "@chainlink/cre-sdk": "latest"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "tsx": "^4.0.0"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc && vite build",
    "lint": "eslint src server --ext .ts,.tsx"
  }
}
```

> **Note:** Verify exact package names for Reown AppKit and Chainlink CRE at the hackathon. Use whatever the hackathon mentors provide.

---

## Frontend Specifications

> Lives in `src/`. Runs on **port 5174** (Vite). No secrets — only `VITE_` env vars reach the browser.

### `src/main.tsx` — Entry Point

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

### `src/App.tsx` — Router

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/"       element={<HomePage />} />
    <Route path="/issue"  element={<IssuePage />} />
    <Route path="/verify" element={<VerifyPage />} />
  </Routes>
</BrowserRouter>
```

### `src/lib/hash.ts` — Browser SHA-256 Hashing

Raw file never leaves the browser.

```ts
async function hashFile(file: File): Promise<string>
// Uses crypto.subtle.digest('SHA-256', buffer), returns hex string
```

### `src/lib/ens.ts` — ENS Resolution (Sepolia)

```ts
async function resolveENSName(name: string): Promise<string | null>
async function lookupENSAddress(address: string): Promise<string | null>
```

Use `ethers.JsonRpcProvider` pointed at `VITE_SEPOLIA_RPC_URL`. Hardcode a fallback mapping for demo: `{ "0xABC...": "belgrade-university.eth" }`.

### `src/lib/walletconnect-pay.ts` — Payment Gate

```ts
async function requestVerificationPayment(): Promise<{ success: boolean; txHash: string }>
```

Flow: drop PDF → hash computed → "Pay to Verify" button → wallet confirmation → CRE verification triggers.

### `src/config/appkit.ts` — Reown AppKit

Initialises Reown AppKit with `VITE_REOWN_PROJECT_ID` and the chain definitions from `src/config/chains.ts`.

### Pages & Components

| Path | Purpose |
|------|---------|
| `src/pages/HomePage.tsx` | Landing — explains the product, links to Issue / Verify |
| `src/pages/IssuePage.tsx` | Renders `<IssueForm>` and `<IssueResult>` |
| `src/pages/VerifyPage.tsx` | Renders `<DropZone>`, `<PayGate>`, `<VerifyResult>` |
| `src/components/layout/Header.tsx` | Nav bar with wallet connect button |
| `src/components/issue/IssueForm.tsx` | Form: doc name, issuer, file upload → POST /api/issue |
| `src/components/issue/IssueResult.tsx` | Success screen with Hedera tx link |
| `src/components/verify/DropZone.tsx` | Drag & drop PDF zone — computes hash client-side |
| `src/components/verify/PayGate.tsx` | WalletConnect Pay confirmation step |
| `src/components/verify/VerifyResult.tsx` | GREEN shield (verified) or RED alert (tampered) |
| `src/components/ens/ENSBadge.tsx` | Resolves and displays ENS name for an issuer address |

---

## Backend Specifications

> Lives in `server/`. Runs on **port 3001** (Express). Holds all secrets — never imports from `src/`.

### `server/index.ts` — Express Entry Point

```ts
import express from 'express'
import cors from 'cors'
import issueRouter from './routes/issue'
import verifyRouter from './routes/verify'
import hederaRouter from './routes/hedera'

const app = express()
app.use(cors({ origin: 'http://localhost:5174' }))
app.use(express.json())
app.use('/api/issue',            issueRouter)
app.use('/api/verify',           verifyRouter)
app.use('/api/hedera/messages',  hederaRouter)
app.listen(3001)
```

### `server/lib/hash.ts` — Server SHA-256 Hashing

Must produce identical hex output to the browser version for the same bytes.

```ts
function hashBuffer(buffer: Buffer): string
// Uses crypto.createHash('sha256').update(buffer).digest('hex')
```

### `server/lib/hedera.ts` — Hedera HCS Functions

**`submitDocumentHash`** — stores a document record on HCS:
```ts
async function submitDocumentHash(params: {
  documentHash: string;
  issuerName: string;
  documentType: string;
  recipientName: string;
}): Promise<{ transactionId: string; sequenceNumber: number; timestamp: string }>
```
Message payload stored as JSON: `{ hash, issuer, type, recipient, issuedAt }`.

**`fetchTopicMessages`** — reads all records from Mirror Node:
```ts
async function fetchTopicMessages(): Promise<TopicMessage[]>
```
Mirror Node URL: `https://testnet.mirrornode.hedera.com/api/v1/topics/{TOPIC_ID}/messages`

**IMPORTANT:** Mirror Node `message` field is base64-encoded:
```ts
const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
const parsed = JSON.parse(decoded);
```

### `server/lib/cre.ts` — Chainlink CRE Integration

CRE acts as the autonomous verification judge inside a Confidential Compute environment.

```ts
async function verifyDocumentWithCRE(uploadedHash: string): Promise<{
  verified: boolean;
  issuer: string | null;
  documentType: string | null;
  issuedAt: string | null;
  confidence: string;
}>
```

**Fallback approach (if CRE SDK is not cooperating):** implement the same logic directly in `server/routes/verify.ts` and frame it as: *"Designed to run inside Chainlink CRE Confidential Compute; running server-side for the demo."*

### `cre/workflow.ts` — Chainlink CRE Workflow Definition

```
WORKFLOW: VerifyDocument
  INPUT: uploadedHash (string)

  STEP 1: HTTP GET to Hedera Mirror Node
  STEP 2: Decode base64 messages, search for hash match
  STEP 3: Return { verified, issuer, documentType, issuedAt, confidence }
```

Mark workflow as `confidential: true` for the Privacy bounty.

### `scripts/createTopic.ts` — One-Time Setup

Creates the Hedera HCS Topic used as the document registry.

1. Initialize `Client.forTestnet()` with issuer credentials from `.env`.
2. Create topic via `new TopicCreateTransaction()`, memo `"SealSign Document Registry"`.
3. Set admin key to the issuer's key.
4. Execute and log the `TopicId`.
5. Copy `TopicId` into `.env` as `HEDERA_TOPIC_ID`.

---

## API Contract

All routes are on the Express backend (`http://localhost:3001`). The Vite dev server proxies `/api/*` to it — the React app always calls relative `/api/...` paths.

### `POST /api/issue`
```json
// Request
{ "hash": "...", "issuerName": "...", "documentType": "...", "recipientName": "..." }

// Response
{ "success": true, "transactionId": "0.0.12345@...", "sequenceNumber": 1, "timestamp": "...", "topicId": "0.0.XXXXX", "explorerUrl": "https://hashscan.io/testnet/transaction/..." }
```

### `POST /api/verify`
```json
// Request
{ "hash": "sha256-hex-string" }

// Response (verified)
{ "verified": true, "issuer": "...", "ensName": "belgrade-univ.eth", "documentType": "...", "recipient": "...", "issuedAt": "...", "hederaSequence": 1 }

// Response (not found)
{ "verified": false, "message": "No matching document found on Hedera ledger" }
```

### `GET /api/hedera/messages`
Debug route — returns all notarized document records.

---

## UI Design Direction

- **Theme:** Dark, enterprise/institutional
- **Accent colors:** Emerald green `#10B981` (verified), Red `#EF4444` (tampered)
- **Font:** Monospace or geometric sans-serif
- **Background:** Subtle grid/mesh for "security" aesthetic
- **Icons:** `lucide-react` (Shield, FileCheck, Lock, AlertTriangle)

### Verify Result States

**VERIFIED:**
- Green background, shield icon
- Shows: issuer ENS name, document type, issue date, Hedera sequence number
- Footer: "Cryptographic proof verified by Chainlink CRE"

**TAMPERED / NOT FOUND:**
- Red background, alert triangle icon
- Shows: uploaded hash, "No matching record on Hedera"

---

## Bounty Targeting

| Bounty | Prize | Strategy |
|--------|-------|----------|
| Chainlink CRE | $4,000 | CRE is the verification engine |
| Chainlink Privacy | $2,000 | Hash-only + Confidential Compute |
| Hedera (No Solidity) | $3,000 | Pure HCS via SDK, no smart contracts |
| WalletConnect Pay | $4,000 | Pay-per-verification model |
| ENS | $5,000 | Institution names on Sepolia |
| **Total** | **$18,000+** | |

---

## Critical Rules

1. **NEVER upload raw PDF to blockchain or server.** Hash only.
2. **Test the "tampered document" flow first.** This is the pitch killer moment.
3. **No auth.** Wallet = identity.
4. **Testnet only.**
5. **Hardcode what you must** — mock ENS mapping, mock issuer list — just make the flow work.
6. **Record demo video 2 hours before deadline.**

---

## Demo Test Scenarios

**Scenario 1 — Happy Path:** Issue a PDF → verify same PDF → GREEN shield
**Scenario 2 — Tampered (THE MONEY SHOT):** Change one character in the PDF → verify → RED alert
**Scenario 3 — Unknown Document:** Upload unregistered PDF → RED "no record found"

---

## Pitch Narrative

> "In 2024, a train station canopy collapsed in Novi Sad, killing 16 people. Investigations revealed falsified permits and altered construction documents. The paperwork had been changed after the fact — and no one could prove what the original said.
>
> SealSign makes that impossible.
>
> When an institution issues a document — a building permit, a diploma, a medical license — we record its cryptographic fingerprint on Hedera's immutable ledger. Not the document itself. Just its mathematical identity.
>
> When anyone needs to verify that document, Chainlink's Compute Runtime acts as an autonomous judge. It compares the file you have against the permanent record. No humans in the loop. No officials to bribe. No records to 'lose.'
>
> Watch: I change a single comma in this permit... and the system catches it instantly.
>
> This is not institutional trust. This is cryptographic truth.
>
> SealSign. Because documents should be as immutable as the concrete they authorize."
