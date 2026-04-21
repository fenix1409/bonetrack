import { Ollama } from 'ollama';
import OpenAI from 'openai';
import summarizePrompt from '../llm/prompts/summarize-reviews.txt';

const ollamaClient = new Ollama();

let openAIClient: OpenAI | null = null;

const getOpenAIClient = () => {
   if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured.');
   }

   openAIClient ??= new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
   });

   return openAIClient;
};

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   instructions?: string;
   temperature?: number;
   maxTokens?: number;
   timeoutMs?: number;
};

type GenerateTextResult = {
   id: string;
   text: string;
};

export const llmClient = {
   async generateText({
      model = 'gpt-4.1',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 300,
      timeoutMs = 12_000,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
         const response = await getOpenAIClient().responses.create(
            {
               model,
               input: prompt,
               instructions,
               temperature,
               max_output_tokens: maxTokens,
               store: false,
            },
            {
               signal: controller.signal,
               timeout: timeoutMs,
            }
         );

         return {
            id: response.id,
            text: response.output_text,
         };
      } finally {
         clearTimeout(timeout);
      }
   },

   async summarizeReviews(reviews: string) {
      const response = await ollamaClient.chat({
         model: 'tinyllama',
         messages: [
            {
               role: 'system',
               content: summarizePrompt,
            },
            {
               role: 'user',
               content: reviews,
            },
         ],
      });

      return response.message.content;
   },
};
