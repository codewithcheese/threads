import { registerModel, runMigrations, useDb } from "$database";
import { notePagesTable, noteTable, pageTable } from "$database/schema";
import { desc, eq } from "drizzle-orm";
import { error } from "@sveltejs/kit";

export async function load({ params, depends }) {
  console.log("loading page", params.slug);
  const page = await useDb().query.pageTable.findFirst({
    where: eq(pageTable.slug, params.slug),
  });
  if (!page) {
    return error(404, "Page not found");
  }
  const notes = await useDb()
    .select({
      id: noteTable.id,
      content: noteTable.content,
      createdAt: noteTable.createdAt,
      updatedAt: noteTable.updatedAt,
    })
    .from(noteTable)
    .innerJoin(notePagesTable, eq(noteTable.id, notePagesTable.noteId))
    .where(eq(notePagesTable.pageSlug, params.slug))
    .execute();
  depends(`view:notes`);
  registerModel(noteTable, notes, depends);
  return { notes, page };
}
