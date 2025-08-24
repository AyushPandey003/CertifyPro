import { pgTable, text, timestamp, integer, uuid, json } from "drizzle-orm/pg-core";

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

export const Projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "certificate" | "event-pass"
  status: text("status").notNull().default("draft"), // "draft" | "in-progress" | "completed"
  recipients: integer("recipients").default(0),
  userId: text("user_id").notNull().references(() => Users.id),
  editorData: text("editor_data"), // JSON string of editor state
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New tables for certificate generation and email automation
export const Certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => Projects.id),
  recipientId: uuid("recipient_id").notNull().references(() => Recipients.id),
  hash: text("hash").notNull().unique(),
  qrCodeData: text("qr_code_data").notNull(),
  certificateUrl: text("certificate_url"),
  status: text("status").notNull().default("pending"), // "pending" | "generated" | "sent" | "failed"
  generatedAt: timestamp("generated_at"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Recipients = pgTable("recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => Projects.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  registrationNumber: text("registration_number"),
  teamId: text("team_id"),
  customFields: json("custom_fields"), // JSON object for additional fields
  status: text("status").notNull().default("pending"), // "pending" | "processed" | "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const EmailBatches = pgTable("email_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => Projects.id),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "processing" | "completed" | "failed"
  progress: integer("progress").default(0),
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const EmailLogs = pgTable("email_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id").notNull().references(() => EmailBatches.id),
  recipientId: uuid("recipient_id").notNull().references(() => Recipients.id),
  email: text("email").notNull(),
  status: text("status").notNull(), // "sent" | "failed" | "bounced"
  messageId: text("message_id"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  error: text("error"),
});

// OAuth token storage (encrypted refresh tokens)
export const OAuthTokens = pgTable("oauth_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => Users.id),
  provider: text("provider").notNull(), // e.g. 'gmail'
  // encrypted refresh token (nullable for cases where only short-lived access token is available)
  refreshTokenEnc: text("refresh_token_enc"),
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  scopes: text("scopes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
