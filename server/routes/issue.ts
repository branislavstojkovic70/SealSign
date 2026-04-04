import { Router, Request, Response } from 'express';
import { submitDocumentHash } from '../lib/hedera';

const router = Router();

interface IssueRequestBody {
  hash: string;
  issuerName: string;
  documentType: string;
  recipientName: string;
}

/**
 * POST /api/issue
 * Stores a document hash on Hedera HCS.
 * The raw PDF never reaches this endpoint — only the SHA-256 hex hash.
 */
router.post('/', async (req: Request<{}, {}, IssueRequestBody>, res: Response) => {
  const { hash, issuerName, documentType, recipientName } = req.body;

  if (!hash || !issuerName || !documentType || !recipientName) {
    res.status(400).json({ error: 'hash, issuerName, documentType, and recipientName are required' });
    return;
  }

  if (!/^[0-9a-f]{64}$/i.test(hash)) {
    res.status(400).json({ error: 'hash must be a 64-character SHA-256 hex string' });
    return;
  }

  const topicId = process.env.HEDERA_TOPIC_ID ?? '';

  const result = await submitDocumentHash({ documentHash: hash, issuerName, documentType, recipientName });

  res.json({
    success: true,
    transactionId: result.transactionId,
    sequenceNumber: result.sequenceNumber,
    timestamp: result.timestamp,
    topicId,
    explorerUrl: `https://hashscan.io/testnet/transaction/${result.transactionId}`,
  });
});

export default router;
