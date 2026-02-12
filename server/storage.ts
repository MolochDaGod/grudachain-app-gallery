import { apps, type InsertApp, type App } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getApps(): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
}

export class DatabaseStorage implements IStorage {
  async getApps(): Promise<App[]> {
    return await db.select().from(apps);
  }

  async createApp(insertApp: InsertApp): Promise<App> {
    const [app] = await db.insert(apps).values(insertApp).returning();
    return app;
  }
}

export const storage = new DatabaseStorage();
