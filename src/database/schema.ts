import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm/sql";
import { type InferSelectModel, relations } from "drizzle-orm";
import { type Message } from "ai";
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

export type ChatbotMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const chatbotTable = sqliteTable("chatbot", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  messages: text("messages", { mode: "json" })
    .notNull()
    .$type<ChatbotMessage[]>()
    .default([]),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatTable = sqliteTable("chat", {
  id: text("id").primaryKey(),
  pageSlug: text("pageSlug").notNull(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatMessageTable = sqliteTable(
  "chatMessage",
  {
    id: text("id").notNull(),
    chatId: text("chatId")
      .notNull()
      .references(() => chatTable.id),
    sender: text("sender"),
    recipients: text("recipients", { mode: "json" })
      .$type<string[]>()
      .default([]),
    role: text("role").notNull(),
    content: text("content"),
    data: text("data", { mode: "json" }),
    createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id, t.chatId] }),
  }),
);

/**
 * Types
 */

export type Page = InferSelectModel<typeof pageTable>;
export type Note = InferSelectModel<typeof noteTable>;
export type Chatbot = InferSelectModel<typeof chatbotTable>;
export type Chat = InferSelectModel<typeof chatTable>;
export type ChatMessage = InferSelectModel<typeof chatMessageTable>;

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

export const chatRelations = relations(chatTable, ({ many }) => ({
  chatMessages: many(chatMessageTable),
}));

export const chatMessageRelations = relations(chatMessageTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [chatMessageTable.chatId],
    references: [chatTable.id],
  }),
}));
