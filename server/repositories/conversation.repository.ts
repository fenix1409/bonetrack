export type ChatTurn = {
   role: 'user' | 'assistant';
   content: string;
};

/** Conversations tracked at once, evicted oldest-first. */
const MAX_CONVERSATIONS = 500;
/** Turns kept per conversation (user + assistant messages combined). */
const MAX_TURNS = 10;
/** Idle time after which a conversation is dropped. */
const CONVERSATION_TTL_MS = 2 * 60 * 60 * 1000;

type Conversation = {
   turns: ChatTurn[];
   updatedAt: number;
};

const conversations = new Map<string, Conversation>();

const isExpired = (conversation: Conversation, now: number) =>
   now - conversation.updatedAt > CONVERSATION_TTL_MS;

/**
 * Drops expired entries, then evicts the least-recently-updated conversation
 * if the map is still at capacity.
 */
const evictIfNeeded = () => {
   const now = Date.now();

   for (const [id, conversation] of conversations) {
      if (isExpired(conversation, now)) conversations.delete(id);
   }

   if (conversations.size < MAX_CONVERSATIONS) return;

   let oldestId: string | null = null;
   let oldestAt = Infinity;
   for (const [id, conversation] of conversations) {
      if (conversation.updatedAt < oldestAt) {
         oldestAt = conversation.updatedAt;
         oldestId = id;
      }
   }

   if (oldestId) conversations.delete(oldestId);
};

export const conversationRepository = {
   /** Prior turns, oldest first. Empty for an unknown or expired conversation. */
   getTurns(conversationId: string): ChatTurn[] {
      const conversation = conversations.get(conversationId);
      if (!conversation) return [];

      if (isExpired(conversation, Date.now())) {
         conversations.delete(conversationId);
         return [];
      }

      return conversation.turns;
   },

   /** Appends a turn, keeping only the most recent MAX_TURNS. */
   appendTurn(conversationId: string, turn: ChatTurn): void {
      const existing = conversations.get(conversationId);

      if (!existing) evictIfNeeded();

      const turns = [...(existing?.turns ?? []), turn].slice(-MAX_TURNS);
      conversations.set(conversationId, { turns, updatedAt: Date.now() });
   },

   /** Test/ops helper. */
   clear(): void {
      conversations.clear();
   },
};
