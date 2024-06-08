import { useDb } from "$database";
import { desc, eq } from "drizzle-orm";
import { chatTable } from "$database/schema";
import { error } from "@sveltejs/kit";

export async function load({ params, depends }) {
  const chat = await useDb().query.chatTable.findFirst({
    with: {
      messages: true,
    },
    where: eq(chatTable.id, params.id),
    orderBy: desc(chatTable.createdAt),
  });
  if (!chat) {
    return error(404, "Chat not found");
  }
  depends(`view:chat`);
  return {
    chat,
  };
}
