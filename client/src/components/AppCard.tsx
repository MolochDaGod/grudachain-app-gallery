import { App } from "@shared/schema";
import { parseStats } from "@/hooks/use-apps";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Download, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppCardProps {
  app: App;
  index: number;
}

export function AppCard({ app, index }: AppCardProps) {
  const stats = parseStats(app.stats);
  
  // Generate a consistent "random" gradient based on app ID
  const gradients = [
    "from-purple-600 to-blue-600",
    "from-pink-600 to-rose-600",
    "from-emerald-600 to-teal-600",
    "from-orange-600 to-amber-600",
    "from-indigo-600 to-violet-600",
    "from-cyan-600 to-blue-600",
  ];
  const gradient = gradients[app.id % gradients.length];

  return (
    <motion.a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group block h-full"
    >
      <div className="h-full flex flex-col bg-card rounded-xl border border-border/50 overflow-hidden card-hover-effect relative">
        {/* Image / Preview Area */}
        <div className={`h-40 w-full bg-gradient-to-br ${gradient} p-6 flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl" />

          <h3 className="text-3xl font-display font-bold text-white drop-shadow-md text-center group-hover:scale-110 transition-transform duration-300 z-10">
            {app.name.substring(0, 2).toUpperCase()}
          </h3>
          
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm p-1.5 rounded-full text-white">
            <ExternalLink size={16} />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-bold text-xl text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {app.name}
            </h3>
          </div>

          <div className="mb-4">
             {app.category ? (
              <Badge variant="secondary" className="bg-secondary/50 text-xs font-medium border-0">
                {app.category}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-border/50 text-muted-foreground text-xs">
                App
              </Badge>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <div className="h-px bg-border/50 w-full" />
            
            {stats ? (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5" title="Downloads/Visits">
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>{stats.downloads || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Version/Rating">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span>v{stats.version || '1.0'}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2" title="Last Updated">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{stats.date || 'Recently'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No stats available</p>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
}
