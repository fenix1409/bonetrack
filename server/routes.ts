import type { Request, Response } from 'express';
import express from 'express';
import { chatController } from './controllers/chat.controller';
import { healthAdviceController } from './controllers/healthAdvice.controller';
import { reviewController } from './controllers/review.controller';
<<<<<<< HEAD
import { aiRateLimit } from './middleware/rateLimit';
=======
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello World!' });
});

<<<<<<< HEAD
router.post('/api/chat', aiRateLimit, chatController.sendMessage);
router.post('/chat', aiRateLimit, healthAdviceController.create);
=======
router.post('/api/chat', chatController.sendMessage);
router.post('/chat', healthAdviceController.create);
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c

router.get('/api/products/:id/reviews', reviewController.getReviews);
router.post(
   '/api/products/:id/reviews/summarize',
<<<<<<< HEAD
   aiRateLimit,
=======
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
   reviewController.summarizeReviews
);

export default router;
