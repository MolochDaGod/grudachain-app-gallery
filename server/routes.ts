import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import fs from "fs";
import path from "path";

let healthCache: { data: Record<number, { status: number; ok: boolean }>; timestamp: number } | null = null;
const HEALTH_CACHE_TTL = 3 * 60 * 1000;

const screenshotCache = new Map<number, { buffer: Buffer; contentType: string; timestamp: number }>();
const SCREENSHOT_CACHE_TTL = 60 * 60 * 1000;
const MAX_SCREENSHOT_CACHE = 60;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get(api.apps.list.path, async (req, res) => {
    const apps = await storage.getApps();
    res.json(apps);
  });

  app.get("/api/apps/:id/screenshot", async (req, res) => {
    const appId = parseInt(req.params.id);
    if (isNaN(appId)) {
      res.status(400).json({ error: "Invalid app ID" });
      return;
    }

    const cached = screenshotCache.get(appId);
    if (cached && Date.now() - cached.timestamp < SCREENSHOT_CACHE_TTL) {
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-Cache", "HIT");
      res.send(cached.buffer);
      return;
    }

    const allApps = await storage.getApps();
    const targetApp = allApps.find(a => a.id === appId);
    if (!targetApp) {
      res.status(404).json({ error: "App not found" });
      return;
    }

    try {
      const thumbUrl = `https://image.thum.io/get/width/640/crop/360/wait/5/noscrollbar/${targetApp.url}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
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
      const buffer = Buffer.from(await response.arrayBuffer());

      if (screenshotCache.size >= MAX_SCREENSHOT_CACHE) {
        const entries = Array.from(screenshotCache.entries());
        const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        if (oldest) screenshotCache.delete(oldest[0]);
      }
      screenshotCache.set(appId, { buffer, contentType, timestamp: Date.now() });

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-Cache", "MISS");
      res.send(buffer);
    } catch {
      res.status(502).json({ error: "Failed to fetch screenshot" });
    }
  });

  app.get("/api/apps/health", async (req, res) => {
    const forceRefresh = req.query.refresh === "true";

    if (!forceRefresh && healthCache && Date.now() - healthCache.timestamp < HEALTH_CACHE_TTL) {
      res.setHeader("X-Cache", "HIT");
      res.json(healthCache.data);
      return;
    }

    const allApps = await storage.getApps();
    const results: Record<number, { status: number; ok: boolean }> = {};

    const checks = allApps.map(async (a) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(a.url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
          headers: { "User-Agent": "GRUDACHAIN-HealthCheck/1.0" },
        });
        clearTimeout(timeout);
        results[a.id] = { status: resp.status, ok: resp.ok };
      } catch {
        results[a.id] = { status: 0, ok: false };
      }
    });

    await Promise.allSettled(checks);
    healthCache = { data: results, timestamp: Date.now() };
    res.setHeader("X-Cache", "MISS");
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

  let startIndex = 0;
  if (lines[0].startsWith("make me an html")) {
    startIndex = 1;
  }

  let i = startIndex;
  while (i < lines.length) {
    const name = lines[i];
    i++;
    if (i >= lines.length) break;

    let category: string | null = null;
    let url: string = "";
    let stats: string = "";

    if (lines[i].startsWith("https://")) {
      url = lines[i];
      i++;
    } else {
      category = lines[i];
      i++;
      if (i < lines.length && lines[i].startsWith("https://")) {
        url = lines[i];
        i++;
      }
    }

    if (i < lines.length) {
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
