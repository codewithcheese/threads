import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";
import { type InferSelectModel, relations } from "drizzle-orm";

/**
 * Tables
 */

export const pageTable = sqliteTable("pages", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const noteTable = sqliteTable("notes", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const notePagesTable = sqliteTable(
  "notePages",
  {
    noteId: text("noteId")
      .notNull()
      .references(() => noteTable.id),
    pageId: text("pageId")
      .notNull()
      .references(() => pageTable.id),
    pageSlug: text("pageSlug").notNull(),
    createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.pageId] }),
    pageSlugIndex: index("pageSlugIndex").on(t.pageSlug),
  }),
);

/**
 * Types
 */

export type Page = InferSelectModel<typeof pageTable>;
export type Note = InferSelectModel<typeof noteTable>;

/**
 * Relationships
 */

export const pageRelations = relations(pageTable, ({ many }) => ({
  notePages: many(notePagesTable),
}));

export const noteRelations = relations(noteTable, ({ many }) => ({
  notePages: many(notePagesTable),
}));

export const notePagesRelations = relations(notePagesTable, ({ one }) => ({
  page: one(pageTable, {
    fields: [notePagesTable.pageId],
    references: [pageTable.id],
  }),
  note: one(noteTable, {
    fields: [notePagesTable.noteId],
    references: [noteTable.id],
  }),
}));
