import { Router, Request, Response, NextFunction } from 'express';
import { verifyDocumentWithCRE } from '../lib/cre';
import { logVerificationAttempt } from '../lib/hedera';

const router = Router();

interface VerifyRequestBody {
  hash: string;
}

/**
 * POST /api/verify
 * Verifies a document hash against the Hedera HCS record via Chainlink CRE logic.
 * Designed to run inside Chainlink CRE Confidential Compute; running server-side for the demo.
 */
router.post('/', async (req: Request<{}, {}, VerifyRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { hash } = req.body;

    if (!hash) {
      res.status(400).json({ error: 'hash is required' });
      return;
    }

    if (!/^[0-9a-f]{64}$/i.test(hash)) {
      res.status(400).json({ error: 'hash must be a 64-character SHA-256 hex string' });
      return;
    }

    const result = await verifyDocumentWithCRE(hash);

    void logVerificationAttempt({
      hash,
      verified: result.verified,
      timestamp: new Date().toISOString(),
    });

    if (!result.verified) {
      res.json({
        verified: false,
        message: 'No matching document found on Hedera ledger',
      });
      return;
    }

    res.json({
      verified: true,
      issuer: result.issuer,
      issuerAddress: result.issuerAddress,
      recipient: result.recipient,
      recipientAddress: result.recipientAddress,
      documentType: result.documentType,
      issuedAt: result.issuedAt,
      hederaSequence: result.hederaSequence,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
