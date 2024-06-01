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
import { unique } from "drizzle-orm/pg-core";

/**
 * Tables
 */

export const noteTable = sqliteTable("notes", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  labels: text("labels", { mode: "json" })
    .$type<string[]>()
    .default([])
    .notNull(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const noteLabelsTable = sqliteTable(
  "noteLabels",
  {
    noteId: text("noteId")
      .notNull()
      .references(() => noteTable.id),
    label: text("label").notNull(),
    labelSlug: text("labelSlug").notNull().unique(),
    createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.label] }),
  }),
);

/**
 *  For reversing a label slug to a label name
 */
export const labelTable = sqliteTable("labels", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Models
 */

export const modelTable = sqliteTable(
  "models",
  {
    id: text("id").notNull().primaryKey(),
    keyId: text("keyId")
      .notNull()
      .references(() => keyTable.id),
    name: text("name").notNull(),
    visible: int("visible").notNull(),
    createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    keyIdIndex: index("keyIdIndex").on(table.keyId),
  }),
);

export const keyTable = sqliteTable("keys", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  serviceId: text("serviceId").notNull(),
  baseURL: text("baseURL").notNull(),
  apiKey: text("apiKey").notNull(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
});
/**
 * Chatbot
 */

export type ChatbotMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const chatbotTable = sqliteTable("chatbots", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  defaultModelId: text("defaultModelId").references(() => modelTable.id),
  messages: text("messages", { mode: "json" })
    .notNull()
    .$type<ChatbotMessage[]>()
    .default([]),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatTable = sqliteTable("chats", {
  id: text("id").primaryKey(),
  pageSlug: text("pageSlug").notNull(),
  createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatMessageTable = sqliteTable(
  "chatMessages",
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

export type Note = InferSelectModel<typeof noteTable>;
export type Chatbot = InferSelectModel<typeof chatbotTable>;
export type Chat = InferSelectModel<typeof chatTable>;
export type ChatMessage = InferSelectModel<typeof chatMessageTable>;

/**
 * Relationships
 */

export const noteRelations = relations(noteTable, ({ many }) => ({
  noteLabels: many(noteLabelsTable),
}));

export const noteLabelsRelations = relations(noteLabelsTable, ({ one }) => ({
  note: one(noteTable, {
    fields: [noteLabelsTable.noteId],
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
