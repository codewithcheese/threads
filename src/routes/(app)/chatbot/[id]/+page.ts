import { error } from "@sveltejs/kit";
import { chatbotTable } from "$database/schema";
import { eq } from "drizzle-orm";
import { useDb } from "$database";

export async function load({ params, depends }) {
  const chatbot = await useDb().query.chatbotTable.findFirst({
    where: eq(chatbotTable.id, params.id),
  });
  if (!chatbot) {
    return error(404, "Chatbot not found");
  }
  depends(`view:chatbots`);
  return { chatbot };
}
