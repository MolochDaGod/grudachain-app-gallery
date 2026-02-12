import { useApps } from "@/hooks/use-apps";
import { AppCard } from "@/components/AppCard";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: apps, isLoading, error } = useApps();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!apps) return [];
    const cats = new Set(apps.map(app => app.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [apps]);

  // Filter apps
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
      {/* Decorative background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 flex-grow">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4"
          >
            <Sparkles size={14} />
            <span>Discover Apps</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6 text-glow"
          >
            Puter <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">App Gallery</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            Explore a curated collection of games, tools, and utilities built for the Puter cloud platform.
          </motion.p>

          {/* Search Bar */}
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
            />
          </motion.div>
        </div>

        {/* Categories Filter */}
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
              >
                {cat}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredApps.length > 0 ? (
              filteredApps.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <p className="text-lg">No apps found matching your search.</p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearch(""); setSelectedCategory(null); }}
                  className="text-primary mt-2"
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
