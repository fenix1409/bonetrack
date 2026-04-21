import type { Request, Response } from 'express';
import express from 'express';
import { chatController } from './controllers/chat.controller';
import { healthAdviceController } from './controllers/healthAdvice.controller';
import { reviewController } from './controllers/review.controller';
import { aiRateLimit } from './middleware/rateLimit';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello World!' });
});

router.post('/api/chat', aiRateLimit, chatController.sendMessage);
router.post('/chat', aiRateLimit, healthAdviceController.create);

router.get('/api/products/:id/reviews', reviewController.getReviews);
router.post(
   '/api/products/:id/reviews/summarize',
   aiRateLimit,
   reviewController.summarizeReviews
);

export default router;
