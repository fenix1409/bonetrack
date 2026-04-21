import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';

// Implementation detail
const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required.')
      .max(500, 'Prompt is too long (max 500 characters).'),
   conversationId: z.string().uuid(),
   healthContext: z.object({
      steps: z.number().int().min(0).max(100_000),
      foodScore: z.number().min(-3).max(10),
      bmi: z.number().min(0).max(80),
      stzi: z.number().min(0).max(2),
   }),
});

// Public interface
export const chatController = {
   async sendMessage(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);
      if (!parseResult.success) {
         res.status(400).json(parseResult.error.format());
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
         console.error('Chat error:', error);
         if (error instanceof Error && error.name === 'AbortError') {
            res.status(504).json({ error: 'AI request timed out.' });
            return;
         }

         res.status(500).json({ error: 'Failed to generate a response.' });
      }
   },
};
