import { useApps } from "@/hooks/use-apps";
import { AppCard, type HealthStatus } from "@/components/AppCard";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Terminal, LogIn, LogOut, User, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { usePuter } from "@/hooks/use-puter";
import { useQuery } from "@tanstack/react-query";
import emblemMain from "@assets/image_1767134942654_1770888806502.png";

export default function Home() {
  const { data: apps, isLoading, error } = useApps();
  const { signedIn, username, signIn, signOut } = usePuter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [forceRefresh, setForceRefresh] = useState(false);
  const healthQueryKey = forceRefresh ? ["/api/apps/health", "refresh=true"] : ["/api/apps/health"];
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery<Record<string, { status: number; ok: boolean }>>({
    queryKey: healthQueryKey,
    queryFn: async () => {
      const url = forceRefresh ? "/api/apps/health?refresh=true" : "/api/apps/health";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Health check failed");
      setForceRefresh(false);
      return res.json();
    },
    enabled: !!apps && apps.length > 0,
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    if (!apps) return [];
    const cats = new Set(apps.map(app => app.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [apps]);

  const filteredApps = useMemo(() => {
    if (!apps) return [];
    return apps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? app.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [apps, search, selectedCategory]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <p>Error loading apps. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="fixed top-4 right-4 z-50">
        {signedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {username}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="rounded-full border-white/20" data-testid="button-sign-out-home">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={signIn} className="rounded-full border-white/20" data-testid="button-sign-in-home">
            <LogIn className="w-4 h-4 mr-1" /> Puter Login
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 flex-grow">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <img
              src={emblemMain}
              alt="GRUDACHAIN Emblem"
              className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
              data-testid="img-main-emblem"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2 text-glow"
            data-testid="text-title"
          >
            GRUDACHAIN
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent font-semibold"
          >
            App Gallery
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            <Link href="/workspace">
              <Button variant="outline" size="sm" className="rounded-full border-white/20 mt-2" data-testid="button-open-workspace">
                <Terminal className="w-4 h-4 mr-1" /> Open Workspace
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 mt-2"
              onClick={() => { setForceRefresh(true); setTimeout(() => refetchHealth(), 50); }}
              disabled={healthLoading}
              data-testid="button-recheck-health"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${healthLoading ? "animate-spin" : ""}`} />
              {healthLoading ? "Checking..." : "Re-check Status"}
            </Button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Explore the full collection of GRUDACHAIN apps, games, tools, and utilities on the Puter cloud platform. Hover over the emblem on each card to change its color.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-md mx-auto mt-8"
          >
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <Input 
              type="text" 
              placeholder="Search apps..." 
              className="pl-10 h-12 rounded-full bg-secondary/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all backdrop-blur-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </motion.div>
        </div>

        {categories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
              data-testid="button-filter-all"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className="rounded-full border-white/10"
                data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </Button>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredApps.length > 0 ? (
              filteredApps.map((app, index) => (
                <AppCard
                  key={app.id}
                  app={app}
                  index={index}
                  health={healthData ? (healthData[app.id] || null) : undefined}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <p className="text-lg">No apps found matching your search.</p>
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearch(""); setSelectedCategory(null); }}
                  className="text-primary mt-2"
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
