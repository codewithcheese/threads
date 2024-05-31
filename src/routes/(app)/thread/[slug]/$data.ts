import { useDb } from "$database";
import {
  chatTable,
  labelTable,
  noteLabelsTable,
  noteTable,
} from "$database/schema";
import { nanoid } from "nanoid";
import { eq, like } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { slugify } from "$lib/slugify";

export async function submitNote(noteId: string, content: string) {
  const regex = /\[\[[^\]]+]]/g;
  const labels = content.match(regex);
  const labelNames: Set<string> = labels
    ? new Set(labels.map((link) => link.substring(2, link.length - 2)))
    : new Set();

  // insert pages that don't exist
  await useDb().transaction(async (tx) => {
    // let pages: { insertedId: string; slug: string }[] = [];
    // if (linkNames.size > 0) {
    //   pages = await useDb()
    //     .insert(pageTable)
    //     .values(
    //       Array.from(linkNames).map((name) => ({
    //         id: nanoid(10),
    //         name: name,
    //         slug: slugify(name),
    //       })),
    //     )
    //     .onConflictDoNothing()
    //     .returning({ insertedId: pageTable.id, slug: pageTable.slug });
    // }

    await tx.insert(noteTable).values({ id: noteId, content }).returning();

    if (labelNames.size > 0) {
      await tx
        .insert(noteLabelsTable)
        .values(
          Array.from(labelNames).map((label) => ({
            noteId,
            label: label,
            labelSlug: slugify(label),
          })),
        )
        .onConflictDoNothing();
      await tx
        .insert(labelTable)
        .values(
          Array.from(labelNames).map((label) => ({
            id: nanoid(10),
            name: label,
            slug: slugify(label),
          })),
        )
        .onConflictDoNothing({ target: labelTable.slug });
    }
  });
}

export async function deleteNote(id: string) {
  await useDb().transaction(async (tx) => {
    await useDb().delete(noteTable).where(eq(noteTable.id, id));
    await tx.delete(noteLabelsTable).where(eq(noteLabelsTable.noteId, id));
  });
  // await invalidateModel(noteTable, { id });
}

export async function updateNote(id: string, content: string) {
  await useDb()
    .update(noteTable)
    .set({ content, updatedAt: sql`(CURRENT_TIMESTAMP)` })
    .where(eq(noteTable.id, id));
  // await invalidateModel(noteTable, { id });
}

export async function createChat(pageSlug: string) {
  const id = nanoid(10);
  await useDb().insert(chatTable).values({ id, pageSlug });
  return id;
}

export async function suggestLabels(slug: string) {
  const labels = await useDb()
    .selectDistinct({ label: noteLabelsTable.label })
    .from(noteLabelsTable)
    .where(like(noteLabelsTable.labelSlug, `${slug}%`))
    .limit(10);
  console.log("suggestLabels", labels);
  return labels.map((label) => label.label);
}

// const linkCompletion: CompletionSource = async (context) => {
//   const word = context.matchBefore(/\[\[([^\]]|](?!]))*/);
//   if (word && word.from < word.to) {
//     const docs = await useDb().query.pageTable.findMany({
//       where: like(pageTable.name, `${word.text.slice(2)}%`),
//     });
//     const mentions = docs.map((d) => ({ label: d.name, type: "page" }));
//     return {
//       from: word.from + 2,
//       options: mentions.map((mention) => ({
//         label: mention.label,
//         apply: `${mention.label}`,
//       })),
//       filter: true,
//     };
//   }
//   return null;
// };
