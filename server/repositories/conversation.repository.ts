// Implementation detail
<<<<<<< HEAD
const MAX_CONVERSATIONS = 500;
const conversations = new Map<string, string>();

const pruneOldestConversation = () => {
   if (conversations.size < MAX_CONVERSATIONS) return;

   const oldestKey = conversations.keys().next().value;
   if (oldestKey) conversations.delete(oldestKey);
};

=======
const conversations = new Map<string, string>();

>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
export const conversationRepository = {
   getLastResponseId(conversationId: string) {
      return conversations.get(conversationId);
   },

   setLastResponseId(conversationId: string, responseId: string) {
<<<<<<< HEAD
      pruneOldestConversation();
=======
>>>>>>> 58c92d520a5012ccad011b3853cae84473d19d2c
      conversations.set(conversationId, responseId);
   },
};
