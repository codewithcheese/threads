import { useDb } from "$database";
import { type Chatbot, chatbotTable } from "$database/schema";
import { eq } from "drizzle-orm";
import { invalidate } from "$app/navigation";
import { nanoid } from "nanoid";

export async function updateChatbot(chatbot: Chatbot) {
  await useDb()
    .update(chatbotTable)
    .set(chatbot)
    .where(eq(chatbotTable.id, chatbot.id));
  await invalidate("view:chatbots");
}

export async function insertChatbot(chatbot: Chatbot) {
  await useDb().insert(chatbotTable).values(chatbot).returning();
  await invalidate("view:chatbots");
}

export async function deleteChatbot(chatbotId: string) {
  await useDb().delete(chatbotTable).where(eq(chatbotTable.id, chatbotId));
}

export function blankChatbot(): Chatbot {
  return {
    id: nanoid(10),
    name: "",
    description: "",
    messages: [],
    defaultModelId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
