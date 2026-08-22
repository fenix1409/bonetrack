import type { Request, Response } from 'express';
import express from 'express';
import { chatController } from './controllers/chat.controller';
import { healthAdviceController } from './controllers/healthAdvice.controller';
import { aiRateLimit } from './middleware/rateLimit';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Салом!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Салом Жахон!' });
});

router.get('/health', (_req: Request, res: Response) => {
   res.json({ ok: true });
});

router.post('/api/chat', aiRateLimit, chatController.sendMessage);
router.post('/chat', aiRateLimit, healthAdviceController.create);

export default router;
