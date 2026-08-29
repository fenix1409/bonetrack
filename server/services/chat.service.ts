import fs from 'fs';
import path from 'path';
import { conversationRepository } from '../repositories/conversation.repository';
import template from '../llm/prompts/chatbot.txt';
import { llmClient } from '../llm/client';
import type { HealthContext } from '../llm/healthContext';

const boneTrackInfo = fs.readFileSync(
   path.join(__dirname, '..', 'llm', 'prompts', 'BoneTrack.md'),
   'utf-8'
);

type ChatResponse = {
   id: string;
   message: string;
};

/** Placeholder value when the client has no complete profile to send. */
const NO_DATA = 'маълумот йўқ';

const buildInstructions = (context?: HealthContext) => {
   /*
    * Absent context fills the template with "no data", not with zeroes. The
    * previous `= 0` defaults meant a user who had not filled in a profile was
    * described to the model as BMI 0 / STZI 0 — a bottom-of-scale reading it
    * would then give real weight and bone-density advice about. The client now
    * omits `healthContext` rather than sending fabricated values, and this is
    * the other half of that: the model is told the data is missing.
    */
   const format = (value: number | undefined) =>
      typeof value === 'number' ? String(value) : NO_DATA;

   const instructions = template
      .replace('{{boneTrackInfo}}', boneTrackInfo)
      .replace('{{steps}}', format(context?.steps))
      .replace('{{foodScore}}', format(context?.foodScore))
      .replace('{{bmi}}', format(context?.bmi))
      .replace('{{stzi}}', format(context?.stzi));

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
