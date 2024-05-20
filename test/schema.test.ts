/* @vitest-environment node */

import { describe, it } from "vitest";
import { submitNote } from "../src/routes/(app)/$data";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { setDb } from "../src/database/client";

it("should create notes with pages", async () => {
  const sqlite = new Database("threads.db");
  const db = drizzle(sqlite);
  setDb(db);
  const notes = [
    `This a note with a link to [[page]]`,
    `This a note with a link to [[page]] and another link to [[page]]`,
    `This a note with a link to [[page]] and a link to [[second page]]`,
    `This a note with a link to [[page]] and a link to [[second page]] and a link to [[third page]]`,
  ];
  for (const note of notes) {
    await submitNote(note);
  }
});
