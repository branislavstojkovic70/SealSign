/**
 * SealSign — Chainlink CRE Verification Workflow
 *
 * Compiled to WASM and runs inside Chainlink CRE (Confidential Compute).
 * Each CRE node independently fetches the Hedera Mirror Node and compares
 * the uploaded hash against HCS records. consensusIdenticalAggregation
 * ensures all nodes agree before the result is returned — cryptographic
 * proof with no single point of failure.
 *
 * Compile:  bun x cre-compile server/cre/main.ts server/cre/workflow.wasm
 * Simulate: cre workflow simulate server/cre --target staging-settings \
 *             --http-payload '{"hash":"<sha256-hex>"}'
 * Deploy:   cre workflow deploy server/cre --target production-settings
 *           (requires CRE Early Access + funded Sepolia wallet)
 */

import {
  cre,
  type Runtime,
  type NodeRuntime,
  HTTPCapability,
  HTTPClient,
  consensusIdenticalAggregation,
  decodeJson,
  ok,
  json,
  Runner,
  type HTTPPayload,
} from "@chainlink/cre-sdk";

// ---------------------------------------------------------------------------
// Config — loaded from config.staging.json / config.production.json at runtime
// ---------------------------------------------------------------------------

interface Config {
  mirrorNodeUrl: string;
  topicId: string;
}

// ---------------------------------------------------------------------------
// Types matching the JSON payload stored in HCS topic messages
// ---------------------------------------------------------------------------

interface DocumentRecord {
  hash: string;
  issuer: string;
  type: string;
  recipient: string;
  issuedAt: string;
}

interface MirrorNodeMessage {
  sequence_number: number;
  consensus_timestamp: string;
  message: string; // base64-encoded UTF-8 JSON DocumentRecord
}

interface MirrorNodeResponse {
  messages: MirrorNodeMessage[];
}

// CRE CreSerializable constraint: no null fields allowed — use "" / 0 as sentinels.
interface VerificationResult {
  verified: boolean;
  issuer: string;
  documentType: string;
  recipient: string;
  issuedAt: string;
  hederaSequence: number;
  confidence: "high" | "low";
}

// ---------------------------------------------------------------------------
// Trigger payload — sent by Express POST /api/verify
// ---------------------------------------------------------------------------

interface TriggerPayload {
  hash: string; // SHA-256 hex, 64 chars
}

// ---------------------------------------------------------------------------
// Pure-JS base64 decoder — atob() is NOT available in QuickJS/WASM runtime
// ---------------------------------------------------------------------------

function base64Decode(b64: string): string {
  const table =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  const clean = b64.replace(/=+$/, "");
  for (let i = 0; i < clean.length; i += 4) {
    const a = table.indexOf(clean[i]);
    const b = table.indexOf(clean[i + 1]);
    const c = table.indexOf(clean[i + 2] ?? "A");
    const d = table.indexOf(clean[i + 3] ?? "A");
    result += String.fromCharCode((a << 2) | (b >> 4));
    if (i + 2 < clean.length) result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (i + 3 < clean.length) result += String.fromCharCode(((c & 3) << 6) | d);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Capabilities (instantiated once, reused across invocations)
// ---------------------------------------------------------------------------

const httpTrigger = new HTTPCapability();
const httpClient = new HTTPClient();

// ---------------------------------------------------------------------------
// Handler — invoked by CRE on every HTTP trigger
// ---------------------------------------------------------------------------

function verifyDocument(
  runtime: Runtime<Config>,
  payload: HTTPPayload
): VerificationResult {
  // Decode the JSON body from the HTTP trigger input bytes
  const { hash } = decodeJson(payload.input) as TriggerPayload;

  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) {
    throw new Error("Invalid hash: must be a 64-character SHA-256 hex string");
  }

  runtime.log(`[SealSign] Verifying hash: ${hash.slice(0, 16)}...`);

  // -------------------------------------------------------------------------
  // runInNodeMode — each CRE node fetches Mirror Node independently.
  // consensusIdenticalAggregation requires all nodes to return the same
  // result, providing the Privacy bounty confidential compute guarantee.
  // -------------------------------------------------------------------------
  // Return a JSON string from node mode — CRE consensus handles strings
  // natively as primitives. Parse back to VerificationResult after consensus.
  const aggregated = runtime.runInNodeMode(
    (nodeRuntime: NodeRuntime<Config>): string => {
      const { mirrorNodeUrl, topicId } = nodeRuntime.config;

      const url =
        `${mirrorNodeUrl}/api/v1/topics/${topicId}` +
        `/messages?limit=100&order=asc`;

      const response = httpClient
        .sendRequest(nodeRuntime, { url, method: "GET" })
        .result();

      if (!ok(response)) {
        throw new Error(
          `Hedera Mirror Node returned HTTP ${response.statusCode}`
        );
      }

      const data = json(response) as MirrorNodeResponse;

      for (const msg of data.messages) {
        // Mirror Node base64-encodes the raw HCS message bytes.
        // atob() is available in the CRE QuickJS WASM runtime.
        const decoded = base64Decode(msg.message);
        let record: DocumentRecord;

        try {
          record = JSON.parse(decoded) as DocumentRecord;
        } catch {
          nodeRuntime.log(
            `[SealSign] Skipping malformed message seq=${msg.sequence_number}`
          );
          continue;
        }

        if (record.hash.toLowerCase() === hash.toLowerCase()) {
          nodeRuntime.log(
            `[SealSign] Match found at sequence ${msg.sequence_number} ` +
              `issuer=${record.issuer}`
          );
          return JSON.stringify({
            verified: true,
            issuer: record.issuer,
            documentType: record.type,
            recipient: record.recipient,
            issuedAt: record.issuedAt,
            hederaSequence: msg.sequence_number,
            confidence: "high",
          } satisfies VerificationResult);
        }
      }

      nodeRuntime.log(
        `[SealSign] No match found for hash ${hash.slice(0, 16)}...`
      );
      return JSON.stringify({
        verified: false,
        issuer: "",
        documentType: "",
        recipient: "",
        issuedAt: "",
        hederaSequence: 0,
        confidence: "high",
      } satisfies VerificationResult);
    },
    consensusIdenticalAggregation<string>()
  )();

  const result = JSON.parse(aggregated.result()) as VerificationResult;
  runtime.log(`[SealSign] Consensus reached: verified=${result.verified}`);
  return result;
}

// ---------------------------------------------------------------------------
// Workflow init — returns the list of trigger-handler pairs
// ---------------------------------------------------------------------------

function initWorkflow() {
  return [
    cre.handler(
      httpTrigger.trigger({
        // For deployment, restrict to the Express backend's EVM key:
        //   authorizedKeys: [{ address: "0x..." }]
        // Omitted here for simulation / demo.
      }),
      verifyDocument
    ),
  ];
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configParser: (raw: Uint8Array) =>
      JSON.parse(new TextDecoder().decode(raw)) as Config,
  });
  await runner.run(initWorkflow);
}

await main();
