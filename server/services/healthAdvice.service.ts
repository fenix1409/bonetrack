import OpenAI from 'openai';
import { z } from 'zod';
import { buildHealthAdvicePrompt } from '../llm/prompts/health-advice';

const AI_TIMEOUT_MS = 11_000;

export type HealthAdviceInput = {
   steps: number;
   foodScore: number;
   bmi: number;
   stzi: number;
};

const healthAdviceSchema = z.object({
   status: z.enum(['low', 'medium', 'good']),
   summary: z.string().min(1).max(240),
   issues: z.array(z.string().min(1).max(120)).max(3),
   actions: z.array(z.string().min(1).max(120)).max(4),
});

export type HealthAdviceResponse = z.infer<typeof healthAdviceSchema>;

let openai: OpenAI | null = null;

const getOpenAIClient = () => {
   if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured.');
   }

   openai ??= new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
   });

   return openai;
};

const responseFormat = {
   type: 'json_schema' as const,
   name: 'health_advice',
   strict: true,
   schema: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'summary', 'issues', 'actions'],
      properties: {
         status: {
            type: 'string',
            enum: ['low', 'medium', 'good'],
         },
         summary: {
            type: 'string',
            maxLength: 240,
         },
         issues: {
            type: 'array',
            maxItems: 3,
            items: {
               type: 'string',
               maxLength: 120,
            },
         },
         actions: {
            type: 'array',
            maxItems: 4,
            items: {
               type: 'string',
               maxLength: 120,
            },
         },
      },
   },
};

const parseJsonSafely = (value: string): unknown => {
   try {
      return JSON.parse(value);
   } catch {
      const jsonMatch = value.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error('AI response did not match the expected schema.');
      }

      return JSON.parse(jsonMatch[0]);
   }
};

export const healthAdviceService = {
   async generate(data: HealthAdviceInput): Promise<HealthAdviceResponse> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      try {
         const response = await getOpenAIClient().responses.create(
            {
               model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
               input: buildHealthAdvicePrompt(data),
               temperature: 0.1,
               max_output_tokens: 350,
               store: false,
               text: {
                  format: responseFormat,
               },
            },
            {
               signal: controller.signal,
               timeout: AI_TIMEOUT_MS,
            }
         );

         const parsed = parseJsonSafely(response.output_text);
         const validated = healthAdviceSchema.safeParse(parsed);

         if (!validated.success) {
            throw new Error('AI response did not match the expected schema.');
         }

         return validated.data;
      } finally {
         clearTimeout(timeout);
      }
   },
};
