import { Router, Request, Response } from 'express';
import { fetchTopicMessages } from '../lib/hedera';

const router = Router();

/**
 * GET /api/hedera/messages
 * Debug route — returns all notarized document records from the HCS topic.
 */
router.get('/', async (_req: Request, res: Response) => {
  const messages = await fetchTopicMessages();
  res.json({ count: messages.length, messages });
});

export default router;
