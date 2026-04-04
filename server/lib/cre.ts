/**
 * Chainlink CRE (Compute Runtime Environment) integration — server-side fallback.
 *
 * The canonical workflow lives in server/cre/main.ts (TypeScript → WebAssembly).
 * That workflow runs inside Chainlink CRE Confidential Compute for the Privacy bounty.
 *
 * This file implements the identical verification logic in plain Node.js so the
 * demo works without a deployed CRE workflow. The logic is intentionally kept
 * in sync with cre/main.ts step-by-step:
 *   Step 1 — HTTP GET to Hedera Mirror Node
 *   Step 2 — Base64-decode messages, parse JSON, search for hash match
 *   Step 3 — Return VerificationResult with document metadata
 *
 * Simulate the real CRE workflow:
 *   cre workflow simulate server/cre --target staging \
 *     --http-payload '{"hash":"<64-char-sha256-hex>"}'
 */
import { WORKFLOW_NAME, WORKFLOW_VERSION } from '../cre/workflow';

import { fetchTopicMessages } from './hedera';

export interface VerificationResult {
  verified: boolean;
  issuer: string | null;
  documentType: string | null;
  recipient: string | null;
  issuedAt: string | null;
  hederaSequence: number | null;
  confidence: 'high' | 'low';
}

/**
 * Verifies an uploaded document hash against the Hedera HCS topic.
 *
 * Step 1 — Fetch all topic messages from Hedera Mirror Node.
 * Step 2 — Decode base64 messages and search for a hash match.
 * Step 3 — Return verification result with document metadata.
 */
export async function verifyDocumentWithCRE(uploadedHash: string): Promise<VerificationResult> {
  console.log(`[CRE:${WORKFLOW_NAME}@${WORKFLOW_VERSION}] Verifying hash: ${uploadedHash.slice(0, 16)}...`);
  const messages = await fetchTopicMessages();

  const match = messages.find((msg) => msg.document.hash === uploadedHash);

  if (!match) {
    return {
      verified: false,
      issuer: null,
      documentType: null,
      recipient: null,
      issuedAt: null,
      hederaSequence: null,
      confidence: 'high' as const,
    };
  }

  return {
    verified: true,
    issuer: match.document.issuer,
    documentType: match.document.type,
    recipient: match.document.recipient,
    issuedAt: match.document.issuedAt,
    hederaSequence: match.sequenceNumber,
    confidence: 'high' as const,
  };
}
