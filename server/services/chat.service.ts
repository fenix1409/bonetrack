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
      const response = await llmClient.generateText({
         model: 'gpt-4.1-mini',
         instructions: buildInstructions(healthContext),
         prompt,
         temperature: 0.05,
         maxTokens: 140,
      });

      conversationRepository.setLastResponseId(conversationId, response.id);

      return {
         id: response.id,
         message: response.text,
      };
   },
};
