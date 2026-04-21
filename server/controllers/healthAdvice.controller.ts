import type { Request, Response } from 'express';
import { z } from 'zod';
import { healthAdviceService } from '../services/healthAdvice.service';

const healthAdviceRequestSchema = z.object({
   steps: z.number().int().min(0).max(100_000),
   foodScore: z.number().min(-3).max(10),
   bmi: z.number().min(10).max(80),
   stzi: z.number().min(0).max(2),
});

const isTimeoutError = (error: unknown) => {
   if (!(error instanceof Error)) return false;

   const name = error.name.toLowerCase();
   const message = error.message.toLowerCase();

   return (
      name.includes('abort') ||
      name.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('timeout')
   );
};

export const healthAdviceController = {
   async create(req: Request, res: Response) {
      const parseResult = healthAdviceRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
         res.status(400).json({
            error: 'Invalid health data.',
            details: parseResult.error.flatten().fieldErrors,
         });
         return;
      }

      try {
         const advice = await healthAdviceService.generate(parseResult.data);
         res.json(advice);
      } catch (error) {
         console.error('Health advice error:', error);

         if (isTimeoutError(error)) {
            res.status(504).json({ error: 'AI request timed out.' });
            return;
         }

         if (
            error instanceof Error &&
            error.message === 'AI response did not match the expected schema.'
         ) {
            res.status(502).json({ error: 'Invalid AI response.' });
            return;
         }

         res.status(500).json({ error: 'Failed to generate health advice.' });
      }
   },
};
