import { registerModel, useDb } from "$database";
import { chatbotTable } from "$database/schema";

export async function load({ depends }) {
  const chatbots = await useDb().query.chatbotTable.findMany();
  registerModel(chatbotTable, chatbots, depends);
  depends(`view:chatbots`);
  return { chatbots };
}
