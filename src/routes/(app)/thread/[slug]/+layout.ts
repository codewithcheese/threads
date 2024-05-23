import { registerModel, useDb } from "$database";
import { notePagesTable, noteTable, pageTable } from "$database/schema";
import { asc, eq } from "drizzle-orm";
import { error } from "@sveltejs/kit";

export async function load({ params, depends }) {
  console.log("loading page", params.slug);
  if (params.slug === "recent") {
    const notes = await useDb().query.noteTable.findMany({
      with: {
        notePages: {
          with: {
            page: true,
          },
        },
      },
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
  return {
    notes,
    page,
    pageName: page.name,
    breadcrumbs: [{ title: page.name, url: `/thread/${params.slug}` }],
  };
}
