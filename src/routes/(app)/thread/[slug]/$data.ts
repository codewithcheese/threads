import { invalidateModel, useDb } from "$database";
import { notePagesTable, noteTable, pageTable } from "$database/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { slugify } from "$lib/slugify";

export async function submitNote(content: string) {
  const regex = /\[\[[^\]]+]]/g;
  const links = content.match(regex);
  const linkNames: Set<string> = links
    ? new Set(links.map((link) => link.substring(2, link.length - 2)))
    : new Set();

  // insert pages that don't exist
  await useDb().transaction(async (tx) => {
    let pages: { insertedId: string; slug: string }[] = [];
    if (linkNames.size > 0) {
      pages = await useDb()
        .insert(pageTable)
        .values(
          Array.from(linkNames).map((name) => ({
            id: nanoid(10),
            name: name,
            slug: slugify(name),
          })),
        )
        .onConflictDoNothing()
        .returning({ insertedId: pageTable.id, slug: pageTable.slug });
    }

    const noteId = nanoid(10);
    await tx.insert(noteTable).values({ id: noteId, content }).returning();

    // insert notePages relations
    if (pages.length > 0) {
      await tx.insert(notePagesTable).values(
        pages.map((page) => ({
          noteId,
          pageId: page.insertedId,
          pageSlug: page.slug,
        })),
      );
    }
  });
}

export async function deleteNote(id: string) {
  await useDb().delete(noteTable).where(eq(noteTable.id, id));
  await invalidateModel(noteTable, { id });
}

export async function updateNote(id: string, content: string) {
  await useDb()
    .update(noteTable)
    .set({ content, updatedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(noteTable.id, id));
  await invalidateModel(noteTable, { id });
}
