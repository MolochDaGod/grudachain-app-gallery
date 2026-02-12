import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type App } from "@shared/schema";

export function useApps() {
  return useQuery({
    queryKey: [api.apps.list.path],
    queryFn: async () => {
      const res = await fetch(api.apps.list.path);
      if (!res.ok) throw new Error("Failed to fetch apps");
      const data = await res.json();
      return api.apps.list.responses[200].parse(data);
    },
  });
}

// Helper to parse the stats string if it follows the format "Number Number Date"
// Example: "4 59 Sep 7th, 2025"
export function parseStats(statsStr: string | null) {
  if (!statsStr) return null;

  const tabParts = statsStr.split('\t');
  if (tabParts.length >= 3) {
    return {
      version: tabParts[0].trim(),
      downloads: tabParts[1].trim(),
      date: tabParts[2].trim(),
      raw: statsStr
    };
  }

  const parts = statsStr.trim().split(/\s+/);
  if (parts.length < 3) return { raw: statsStr };

  return {
    version: parts[0],
    downloads: parts[1],
    date: parts.slice(2).join(" "),
    raw: statsStr
  };
}
