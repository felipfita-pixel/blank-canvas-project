// Hash a conversation_id to an opaque token suitable for the
// publicly readable broker_presence.is_typing_conversation column.
// Anonymous visitors must not be able to enumerate active conversation IDs,
// but the visitor (who already knows their own conversationId) can hash it
// locally and compare against the public typing token.
export const hashConversationId = async (conversationId: string): Promise<string> => {
  if (!conversationId) return "";
  const data = new TextEncoder().encode(`broker-typing:${conversationId}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
