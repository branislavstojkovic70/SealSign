import { Router, Request, Response, NextFunction } from 'express';
import { getAddress, isAddress } from 'ethers';
import { submitDocumentHash } from '../lib/hedera';
import { verifyIssuancePayment } from '../lib/payment';

const router = Router();

interface IssueRequestBody {
  hash: string;
  documentName: string;
  issuerAddress: string;
  recipientAddress: string;
  issuerEns?: string;
  recipientEns?: string;
  paymentTxHash?: string;
}

/**
 * POST /api/issue
 * Stores a document hash on Hedera HCS.
 * The raw PDF never reaches this endpoint — only the SHA-256 hex hash.
 */
router.post('/', async (req: Request<{}, {}, IssueRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { hash, documentName, issuerAddress, recipientAddress, issuerEns, recipientEns, paymentTxHash } = req.body;

    if (!hash || !documentName || !issuerAddress || !recipientAddress) {
      res.status(400).json({
        error: 'hash, documentName, issuerAddress, and recipientAddress are required',
      });
      return;
    }

    if (!/^[0-9a-f]{64}$/i.test(hash)) {
      res.status(400).json({ error: 'hash must be a 64-character SHA-256 hex string' });
      return;
    }

    if (documentName.trim().length > 255) {
      res.status(400).json({ error: 'documentName must be 255 characters or fewer' });
      return;
    }

    if (!isAddress(issuerAddress) || !isAddress(recipientAddress)) {
      res.status(400).json({ error: 'issuerAddress and recipientAddress must be valid EVM addresses' });
      return;
    }

    // ENS name validation: valid DNS label characters, max 253 chars total, each label ≤ 63 chars
    const ENS_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    for (const [field, value] of [['issuerEns', issuerEns], ['recipientEns', recipientEns]] as const) {
      if (value !== undefined && value !== '') {
        if (value.length > 253) {
          res.status(400).json({ error: `${field} exceeds maximum length of 253 characters` });
          return;
        }
        if (!ENS_RE.test(value)) {
          res.status(400).json({ error: `${field} is not a valid ENS name` });
          return;
        }
      }
    }

    await verifyIssuancePayment(paymentTxHash, issuerAddress);

    const topicId = process.env.HEDERA_TOPIC_ID ?? '';

    const result = await submitDocumentHash({
      documentHash: hash,
      documentName: documentName.trim(),
      issuerAddress: getAddress(issuerAddress),
      recipientAddress: getAddress(recipientAddress),
      issuerEns: typeof issuerEns === 'string' && issuerEns.trim() !== '' ? issuerEns.trim() : undefined,
      recipientEns:
        typeof recipientEns === 'string' && recipientEns.trim() !== '' ? recipientEns.trim() : undefined,
    });

    res.json({
      success: true,
      transactionId: result.transactionId,
      sequenceNumber: result.sequenceNumber,
      timestamp: result.timestamp,
      topicId,
      explorerUrl: process.env.HEDERA_EXPLORER_BASE_URL
        ? `${process.env.HEDERA_EXPLORER_BASE_URL}/transaction/${result.transactionId}`
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
