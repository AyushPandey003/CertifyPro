import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const UserMessages = pgTable("user_messages", {
  user_id: text("user_id").primaryKey().notNull(),
  createTs: timestamp("create_ts").defaultNow().notNull(),
  message: text("message").notNull(),
});

export const Users = pgTable("users", {
  // Auth0 user id (sub)
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});