import fs from 'fs';
import path from 'path';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../llm/prompts/chatbot.txt';
import { llmClient } from '../llm/client';

const boneTrackInfo = fs.readFileSync(
   path.join(__dirname, '..', 'llm', 'prompts', 'BoneTrack.md'),
   'utf-8'
);

type ChatResponse = {
   id: string;
   message: string;
};

type HealthContext = {
   steps: number;
   foodScore: number;
   bmi: number;
   stzi: number;
};

const buildInstructions = (context?: HealthContext) => {
   const { steps = 0, foodScore = 0, bmi = 0, stzi = 0 } = context || {};

   const instructions = template
      .replace('{{boneTrackInfo}}', boneTrackInfo)
      .replace('{{steps}}', String(steps))
      .replace('{{foodScore}}', String(foodScore))
      .replace('{{bmi}}', String(bmi))
      .replace('{{stzi}}', String(stzi));

   return instructions;
};

export const chatService = {
   async sendMessage(
      prompt: string,
      conversationId: string,
      healthContext?: HealthContext
   ): Promise<ChatResponse> {
      // Read history before appending the new turn, so the model sees the
      // conversation as it stood when the question was asked.
      const history = conversationRepository.getTurns(conversationId);

      const response = await llmClient.generateText({
         model: 'gpt-4.1-mini',
         instructions: buildInstructions(healthContext),
         prompt,
         history,
         temperature: 0.05,
         maxTokens: 140,
         timeoutMs: 25_000,
         maxAttempts: 1,
      });

      // Only recorded once the call succeeded — a failed request must not
      // leave a dangling user turn that corrupts the next reply's context.
      conversationRepository.appendTurn(conversationId, {
         role: 'user',
         content: prompt,
      });
      conversationRepository.appendTurn(conversationId, {
         role: 'assistant',
         content: response.text,
      });

      return {
         id: response.id,
         message: response.text,
      };
   },
};
