import { registerModel, useDb } from "$database";
import { noteTable } from "$database/schema";
import { desc } from "drizzle-orm";

export async function load({ depends }) {
  const notes = await useDb().query.noteTable.findMany({
    with: {
      notePages: {
        with: {
          page: true,
        },
      },
    },
    orderBy: desc(noteTable.createdAt),
  });
  depends(`view:notes`);
  registerModel(noteTable, notes, depends);
  return { notes };
}
