/**
 * CRE workflow metadata — referenced by server/lib/cre.ts for logging/tracing.
 *
 * The actual CRE workflow is in main.ts (TypeScript → WebAssembly).
 * This file only exports the workflow descriptor so the Express server
 * can log which workflow is being simulated locally.
 */

export const WORKFLOW_NAME = "verify-document";
export const WORKFLOW_VERSION = "1.0.0";

/**
 * Simulation command (requires CRE CLI: https://docs.chain.link/cre):
 *
 *   cre workflow simulate server/cre --target staging \
 *     --http-payload '{"hash":"<64-char-sha256-hex>"}'
 *
 * Build command:
 *
 *   cre workflow build server/cre
 *
 * Deploy command (requires CRE Early Access):
 *
 *   cre workflow deploy server/cre --target production
 */
