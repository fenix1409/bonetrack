import fs from 'fs/promises';
import path from 'path';

type ChatbotPromptInput = {
  boneTrackInfo: string;
  steps: number;
  foodScore: number;
  bmi: number;
  stzi: number;
};

const REQUIRED_PLACEHOLDERS = [
  '{{boneTrackInfo}}',
  '{{steps}}',
  '{{foodScore}}',
  '{{bmi}}',
  '{{stzi}}',
] as const;

let templateCache: string | null = null;

async function getTemplate(): Promise<string> {
  if (templateCache) return templateCache;
  templateCache = await fs.readFile(
    path.join(__dirname, 'chatbot.txt'),
    'utf-8'
  );
  return templateCache;
}

export async function buildChatbotPrompt(data: ChatbotPromptInput): Promise<string> {
  const template = await getTemplate();

  for (const placeholder of REQUIRED_PLACEHOLDERS) {
    if (!template.includes(placeholder)) {
      throw new Error(
        `[ChatbotBuilder] Missing placeholder in template: ${placeholder}`
      );
    }
  }

  if (!data.boneTrackInfo?.trim()) {
    throw new Error('[ChatbotBuilder] boneTrackInfo is empty');
  }

  if (!Number.isFinite(data.steps) || data.steps < 0) {
    throw new Error(`[ChatbotBuilder] Invalid steps value: ${data.steps}`);
  }

  if (!Number.isFinite(data.bmi) || data.bmi <= 0) {
    throw new Error(`[ChatbotBuilder] Invalid bmi value: ${data.bmi}`);
  }

  if (!Number.isFinite(data.stzi) || data.stzi < 0) {
    throw new Error(`[ChatbotBuilder] Invalid stzi value: ${data.stzi}`);
  }

  // Replace placeholders
  return template
    .replace('{{boneTrackInfo}}', data.boneTrackInfo)
    .replace('{{steps}}', String(data.steps))
    .replace('{{foodScore}}', String(data.foodScore))
    .replace('{{bmi}}', String(data.bmi))
    .replace('{{stzi}}', String(data.stzi));
}