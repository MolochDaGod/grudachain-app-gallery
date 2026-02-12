import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  url: text("url").notNull(),
  stats: text("stats"), // Stores the "4 59 Sep 7th, 2025" line
});

export const insertAppSchema = createInsertSchema(apps).omit({ id: true });

export type App = typeof apps.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
