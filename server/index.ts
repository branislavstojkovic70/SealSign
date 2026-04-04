import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import issueRouter from './routes/issue';
import verifyRouter from './routes/verify';
import hederaRouter from './routes/hedera';
import { HttpError, clientMessage } from './lib/errors';

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5174' }));
app.use(express.json({ limit: '4kb' }));

app.use('/api/issue', issueRouter);
app.use('/api/verify', rateLimit({ windowMs: 60_000, max: 10 }), verifyRouter);
app.use('/api/hedera/messages', hederaRouter);

// Global error handler — logs internally, never leaks stack traces or internal messages
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: clientMessage(err.statusCode) });
  } else {
    res.status(500).json({ error: clientMessage(500) });
  }
});

app.listen(PORT, () => {
  console.log(`SealSign backend listening on http://localhost:${PORT}`);
});
