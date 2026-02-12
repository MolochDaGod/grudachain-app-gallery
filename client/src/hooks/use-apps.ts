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
  
  const parts = statsStr.trim().split(/\s+/);
  if (parts.length < 3) return { raw: statsStr };

  // Heuristic based on the data: 
  // 1st number seems to be version or rating? 
  // 2nd number seems to be visits/downloads?
  // Rest is date.
  
  const metric1 = parts[0];
  const metric2 = parts[1];
  const date = parts.slice(2).join(" ");

  return {
    version: metric1,
    downloads: metric2,
    date: date,
    raw: statsStr
  };
}
