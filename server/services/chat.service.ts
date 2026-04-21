import { conversationRepository } from '../repositories/conversation.repository';
import template from '../llm/prompts/chatbot.txt';
import { llmClient } from '../llm/client';

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

const buildInstructions = ({ steps, foodScore, bmi, stzi }: HealthContext) =>
   template
      .replace('{{steps}}', String(steps))
      .replace('{{foodScore}}', String(foodScore))
      .replace('{{bmi}}', String(bmi))
      .replace('{{stzi}}', String(stzi));

// Public interface
export const chatService = {
   async sendMessage(
      prompt: string,
      conversationId: string,
      healthContext: HealthContext
   ): Promise<ChatResponse> {
      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions: buildInstructions(healthContext),
         prompt,
         temperature: 0.1, // Kechikishni kamaytirish va aniqlikni oshirish uchun
         maxTokens: 220, // Qisqaroq javob tezroq keladi
         previousResponseId:
            conversationRepository.getLastResponseId(conversationId),
      });

      conversationRepository.setLastResponseId(conversationId, response.id);

      return {
         id: response.id,
         message: response.text,
      };
   },
};
