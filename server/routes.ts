import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import fs from "fs";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database
  await seedDatabase();

  app.get(api.apps.list.path, async (req, res) => {
    const apps = await storage.getApps();
    res.json(apps);
  });

  app.get("/api/apps/:id/screenshot", async (req, res) => {
    const appId = parseInt(req.params.id);
    const allApps = await storage.getApps();
    const app = allApps.find(a => a.id === appId);
    if (!app) {
      res.status(404).json({ error: "App not found" });
      return;
    }

    try {
      const thumbUrl = `https://image.thum.io/get/width/640/crop/360/${app.url}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(thumbUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "GRUDACHAIN-Gallery/1.0" },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        res.status(502).json({ error: "Screenshot service unavailable" });
        return;
      }

      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");

      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch {
      res.status(502).json({ error: "Failed to fetch screenshot" });
    }
  });

  app.get("/api/apps/health", async (req, res) => {
    const allApps = await storage.getApps();
    const results: Record<number, { status: number; ok: boolean }> = {};

    const checks = allApps.map(async (app) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(app.url, {
          method: "GET",
          signal: controller.signal,
          redirect: "follow",
          headers: { "User-Agent": "GRUDACHAIN-HealthCheck/1.0" },
        });
        clearTimeout(timeout);
        results[app.id] = { status: resp.status, ok: resp.ok };
      } catch {
        results[app.id] = { status: 0, ok: false };
      }
    });

    await Promise.allSettled(checks);
    res.json(results);
  });

  return httpServer;
}

async function seedDatabase() {
  const existingApps = await storage.getApps();
  if (existingApps.length > 0) return;

  const filePath = path.join(process.cwd(), "attached_assets", "Pasted-make-me-an-html-that-has-embed-images-that-i-can-select_1770888403674.txt");
  
  if (!fs.existsSync(filePath)) {
    console.warn("Seed file not found, skipping seeding.");
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Skip the first line if it's the prompt text
  let startIndex = 0;
  if (lines[0].startsWith("make me an html")) {
    startIndex = 1;
  }

  // Group lines into blocks
  // Blocks seem to be separated by multiple newlines in original file, but here we just have a list of non-empty lines.
  // The structure is Name -> (Category?) -> URL -> Stats.
  // URL always starts with https://puter.com
  // Stats line starts with a number usually.
  
  // Let's iterate and consume lines.
  let i = startIndex;
  while (i < lines.length) {
    const name = lines[i];
    i++;
    if (i >= lines.length) break;

    let category: string | null = null;
    let url: string = "";
    let stats: string = "";

    // Check if next line is URL
    if (lines[i].startsWith("https://")) {
      url = lines[i];
      i++;
    } else {
      // Must be category
      category = lines[i];
      i++;
      if (i < lines.length && lines[i].startsWith("https://")) {
        url = lines[i];
        i++;
      }
    }

    if (i < lines.length) {
      // The next line is likely stats
      // "4 59 Sep 7th, 2025"
      // or "1 36 Jan 7th, 2026"
      // It might be missing if file ends abruptly, but let's assume it exists or check format.
      // Stats line usually starts with a digit.
      if (/^\d/.test(lines[i])) {
         stats = lines[i];
         i++;
      }
    }

    if (name && url) {
      await storage.createApp({
        name,
        category,
        url,
        stats
      });
    }
  }
}
