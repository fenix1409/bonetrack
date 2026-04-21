// Implementation detail
const MAX_CONVERSATIONS = 500;
const conversations = new Map<string, string>();

const pruneOldestConversation = () => {
   if (conversations.size < MAX_CONVERSATIONS) return;

   const oldestKey = conversations.keys().next().value;
   if (oldestKey) conversations.delete(oldestKey);
};

export const conversationRepository = {
   getLastResponseId(conversationId: string) {
      return conversations.get(conversationId);
   },

   setLastResponseId(conversationId: string, responseId: string) {
      pruneOldestConversation();
      conversations.set(conversationId, responseId);
   },
};
