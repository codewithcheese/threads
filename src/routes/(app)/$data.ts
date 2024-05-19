import { useDb } from "$database";
import { noteTable } from "$database/schema";
import { nanoid } from "nanoid";
import { invalidate } from "$app/navigation";

export async function submitNote(content: string) {
  await useDb()
    .insert(noteTable)
    .values({ id: nanoid(10), content });
  await invalidate("view:notes");
}
