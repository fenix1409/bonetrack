import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';

const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required.')
      .max(500, 'Prompt is too long (max 500 characters).'),
   conversationId: z.string().uuid(),
   healthContext: z.object({
      steps: z.number().min(0).max(100_000).default(0),
      foodScore: z.number().min(-3).max(10).default(0),
      bmi: z.number().min(0).max(100).default(0),
      stzi: z.number().min(0).max(5).default(0),
   }).optional(),
});

export const chatController = {
   async sendMessage(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);
      if (!parseResult.success) {
         console.warn('Chat validation failed:', parseResult.error.format());
         res.status(400).json({
            error: 'Invalid health data.',
            details: parseResult.error.format(),
         });
         return;
      }

      try {
         const { prompt, conversationId, healthContext } = parseResult.data;
         const response = await chatService.sendMessage(
            prompt,
            conversationId,
            healthContext
         );

         res.json({ message: response.message });
      } catch (error) {
         console.error('Chat error details:', error);
         if (error instanceof Error && error.name === 'AbortError') {
            res.status(504).json({ error: 'AI request timed out.' });
            return;
         }

         res.status(500).json({ 
            error: 'Failed to generate a response.',
            details: error instanceof Error ? error.message : String(error)
         });
      }
   },
};
