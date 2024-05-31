import { registerModel, useDb } from "$database";
import { labelTable, noteLabelsTable, noteTable } from "$database/schema";
import { asc, eq } from "drizzle-orm";

export async function load({ params, depends }) {
  console.log("loading page", params.slug);
  if (params.slug === "recent") {
    const notes = await useDb().query.noteTable.findMany({
      orderBy: asc(noteTable.createdAt),
    });
    depends(`view:notes`);
    registerModel(noteTable, notes, depends);
    return {
      pageName: "Recent",
      notes,
      breadcrumbs: [{ title: "Recent", url: "/thread/recent" }],
    };
  }

  const notes = await useDb()
    .select({
      id: noteTable.id,
      content: noteTable.content,
      labels: noteTable.labels,
      createdAt: noteTable.createdAt,
      updatedAt: noteTable.updatedAt,
    })
    .from(noteTable)
    .innerJoin(noteLabelsTable, eq(noteTable.id, noteLabelsTable.noteId))
    .where(eq(noteLabelsTable.labelSlug, params.slug))
    .execute();
  depends(`view:notes`);
  registerModel(noteTable, notes, depends);

  const label = await useDb().query.labelTable.findFirst({
    where: eq(labelTable.slug, params.slug),
  });

  return {
    notes,
    labelName: label ? label.name : params.slug,
    breadcrumbs: [{ title: label, url: `/thread/${params.slug}` }],
  };
}
