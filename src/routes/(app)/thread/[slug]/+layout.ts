import { registerModel, useDb } from "$database";
import { labelTable, noteLabelsTable, noteTable } from "$database/schema";
import { asc, eq } from "drizzle-orm";

export async function load({ params, depends }) {
  console.log("loading page", params.slug);

  const notesQuery = useDb()
    .select({ note: noteTable })
    .from(noteTable)
    .orderBy(asc(noteTable.createdAt));

  let notes;
  let labelName;
  if (params.slug === "recent") {
    notes = await notesQuery.execute();
    labelName = "Recent";
  } else {
    notes = await notesQuery
      .innerJoin(noteLabelsTable, eq(noteTable.id, noteLabelsTable.noteId))
      .where(eq(noteLabelsTable.labelSlug, params.slug))
      .execute();

    const label = await useDb().query.labelTable.findFirst({
      where: eq(labelTable.slug, params.slug),
    });
    labelName = label ? label.name : params.slug;
  }

  depends(`view:notes`);
  registerModel(noteTable, notes, depends);

  return {
    notes,
    labelName,
    breadcrumbs: [{ title: labelName, url: `/thread/${params.slug}` }],
  };
}
