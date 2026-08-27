import { relations } from "drizzle-orm";
import { bigint, boolean, index, integer, json, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", ["system", "admin"]);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUserId: uuid("admin_user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("admin_sessions_admin_user_id_idx").on(table.adminUserId),
  index("admin_sessions_expires_at_idx").on(table.expiresAt),
]);

export const books = pgTable("books", {
  id: bigint("id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  title: text("title").notNull(),
  wordCount: integer("word_count").notNull(),
  coverUrl: text("cover_url").notNull(),
  bookId: text("bookid").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("books_bookid_idx").on(table.bookId),
]);

export const words = pgTable("words", {
  id: bigint("id", { mode: "number" }).generatedByDefaultAsIdentity().primaryKey(),
  wordRand: integer("wordRand"),
  headWord: text("headWord"),
  content: json("content"),
  bookId: text("bookid").references(() => books.bookId, { onUpdate: "cascade", onDelete: "cascade" }),
}, (table) => [
  index("words_bookid_idx").on(table.bookId),
]);

export const booksRelations = relations(books, ({ many }) => ({
  words: many(words),
}));

export const wordsRelations = relations(words, ({ one }) => ({
  book: one(books, {
    fields: [words.bookId],
    references: [books.bookId],
  }),
}));

export type AdminRole = (typeof adminRoleEnum.enumValues)[number];
export type AdminUser = typeof adminUsers.$inferSelect;
export type Book = typeof books.$inferSelect;
