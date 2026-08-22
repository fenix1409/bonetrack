import type { Request, Response } from 'express';
import { z } from 'zod';
import { healthAdviceService } from '../services/healthAdvice.service';
import { LlmResponseError } from '../llm/errors';
import {
   BMI_MAX,
   BMI_MIN,
   FOOD_SCORE_MAX,
   FOOD_SCORE_MIN,
   STEPS_MAX,
   STEPS_MIN,
   STZI_MAX,
   STZI_MIN,
} from '../llm/scoreRanges';

const healthAdviceRequestSchema = z.object({
   steps: z.number().min(STEPS_MIN).max(STEPS_MAX),
   foodScore: z.number().min(FOOD_SCORE_MIN).max(FOOD_SCORE_MAX),
   bmi: z.number().min(BMI_MIN).max(BMI_MAX),
   stzi: z.number().min(STZI_MIN).max(STZI_MAX),
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
            error: 'Салмат маълумотлари новажа.',
            details: parseResult.error.flatten().fieldErrors,
         });
         return;
      }

      try {
         const advice = await healthAdviceService.generate(parseResult.data);
         res.json(advice);
      } catch (error) {
         if (error instanceof LlmResponseError) {
            console.error('Health advice error: unusable AI response:', error.rawPreview);
            res.status(502).json({ error: 'AI жавоби новажа.' });
            return;
         }

         console.error('Health advice error:', error);

         if (isTimeoutError(error)) {
            res.status(504).json({ error: 'AI сўрови вақти кончади.' });
            return;
         }

         res.status(500).json({ error: 'AI маслаҳатини яратишда муаммо.' });
      }
   },
};
