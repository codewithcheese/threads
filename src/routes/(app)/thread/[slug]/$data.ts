import { useDb } from "$database";
import {
  chatTable,
  type Note,
  noteLabelsTable,
  noteTable,
} from "$database/schema";
import { nanoid } from "nanoid";
import { eq, like } from "drizzle-orm";
import { slugify } from "$lib/slugify";

export async function upsertNote(note: Note) {
  console.log("upsertNote", note);
  await useDb().transaction(async (tx) => {
    await tx
      .insert(noteTable)
      .values(note)
      .onConflictDoUpdate({
        target: [noteTable.id],
        set: note,
      });
    if (note.labels.length > 0) {
      await tx
        .insert(noteLabelsTable)
        .values(
          note.labels.map((label) => ({
            noteId: note.id,
            label: label,
            labelSlug: slugify(label),
          })),
        )
        .onConflictDoNothing({ target: noteLabelsTable.labelSlug });
    }
  });
}

export async function deleteNote(id: string) {
  await useDb().transaction(async (tx) => {
    await useDb().delete(noteTable).where(eq(noteTable.id, id));
    await tx.delete(noteLabelsTable).where(eq(noteLabelsTable.noteId, id));
  });
}

export async function createChat(pageSlug: string) {
  const id = nanoid(10);
  await useDb().insert(chatTable).values({ id, pageSlug });
  return id;
}

export async function getMatchingLabels(slug: string) {
  const labels = await useDb()
    .selectDistinct({ label: noteLabelsTable.label })
    .from(noteLabelsTable)
    .where(like(noteLabelsTable.labelSlug, `${slug}%`))
    .limit(10);
  console.log("matching labels", labels);
  return labels.map((row) => ({
    id: row.label,
    name: row.label,
  }));
}
