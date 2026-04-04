import { createHash } from 'node:crypto';

/**
 * SHA-256 hash of a buffer.
 * Produces identical hex output to the browser's crypto.subtle version for the same bytes.
 */
export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
