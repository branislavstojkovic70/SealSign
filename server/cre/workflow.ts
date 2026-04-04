/**
 * Chainlink CRE Workflow Definition — VerifyDocument
 *
 * Runs inside Chainlink CRE Confidential Compute (Privacy bounty).
 * The hash never leaves the enclave; only the verification result is returned.
 *
 * This file is the canonical workflow definition. The server-side equivalent
 * lives in lib/cre.ts and is used for the local demo.
 */

export const workflow = {
  name: 'VerifyDocument',
  version: '1.0.0',
  confidential: true, // Required for Chainlink Privacy bounty

  input: {
    uploadedHash: 'string', // SHA-256 hex string — 64 chars
  },

  steps: [
    {
      id: 'fetch_hedera_messages',
      type: 'http_get',
      url: '${env.HEDERA_MIRROR_NODE_URL}/api/v1/topics/${env.HEDERA_TOPIC_ID}/messages?limit=100&order=asc',
      output: 'rawMessages',
    },
    {
      id: 'decode_and_search',
      type: 'compute',
      description: 'Base64-decode each message, parse JSON, search for hash match',
      // Each message.message field is base64-encoded UTF-8 JSON:
      // { hash, issuer, type, recipient, issuedAt }
      input: { messages: '${steps.fetch_hedera_messages.rawMessages.messages}', hash: '${input.uploadedHash}' },
      output: 'matchedRecord',
    },
    {
      id: 'build_result',
      type: 'transform',
      output: {
        verified: '${steps.decode_and_search.matchedRecord != null}',
        issuer: '${steps.decode_and_search.matchedRecord?.issuer ?? null}',
        documentType: '${steps.decode_and_search.matchedRecord?.type ?? null}',
        issuedAt: '${steps.decode_and_search.matchedRecord?.issuedAt ?? null}',
        confidence: 'high',
      },
    },
  ],

  output: '${steps.build_result}',
};
