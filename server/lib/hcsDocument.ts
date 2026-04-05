/**
 * HCS topic JSON (canonical): hash, documentName, issuerAddress, recipientAddress,
 * optional issuerEns / recipientEns.
 *
 * Also normalizes legacy and intermediate shapes (issuer/type/recipient, signer/institution).
 */

export type NormalizedLedgerDocument = {
  hash: string;
  documentName: string;
  issuerAddress: string | null;
  recipientAddress: string | null;
  issuerEns: string | null;
  recipientEns: string | null;
  /** Legacy human-readable issuer name */
  issuerLabel: string | null;
  /** Legacy human-readable recipient name */
  recipientLabel: string | null;
  issuedAt: string;
};

export type WrittenLedgerPayload = {
  hash: string;
  documentName: string;
  issuerAddress: string;
  recipientAddress: string;
  issuedAt: string;
  issuerEns?: string;
  recipientEns?: string;
};

function parseAddr(v: unknown): string | null {
  if (typeof v !== 'string' || !/^0x[0-9a-f]{40}$/i.test(v)) return null;
  return v;
}

function str(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t !== '' ? t : null;
}

export function normalizeLedgerDocument(doc: unknown): NormalizedLedgerDocument | null {
  if (!doc || typeof doc !== 'object') return null;
  const d = doc as Record<string, unknown>;
  const hash = typeof d.hash === 'string' ? d.hash : '';
  if (!hash) return null;
  const issuedAt = typeof d.issuedAt === 'string' ? d.issuedAt : '';

  const documentName = str(d.documentName) ?? str(d.type) ?? '';

  const issuerAddress =
    parseAddr(d.issuerAddress) ?? parseAddr(d.institutionAddress);
  const recipientAddress =
    parseAddr(d.recipientAddress) ?? parseAddr(d.signerAddress);

  const issuerEns = str(d.issuerEns) ?? str(d.institutionEns);
  const recipientEns = str(d.recipientEns) ?? str(d.signerEns);

  const issuerLabel = str(d.institutionLabel) ?? str(d.issuer);
  const recipientLabel = recipientAddress ? null : str(d.recipient);

  return {
    hash,
    documentName,
    issuerAddress,
    recipientAddress,
    issuerEns,
    recipientEns,
    issuerLabel,
    recipientLabel,
    issuedAt,
  };
}

/** Single-line issuer for verify UI — always the 0x address; ENS shown separately */
export function issuerVerifyLine(d: NormalizedLedgerDocument): string | null {
  return d.issuerAddress ?? d.issuerLabel;
}

/** Single-line recipient for verify UI — always the 0x address; ENS shown separately */
export function recipientVerifyLine(d: NormalizedLedgerDocument): string | null {
  return d.recipientAddress ?? d.recipientLabel;
}
