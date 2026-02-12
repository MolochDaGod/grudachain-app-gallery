import { App } from "@shared/schema";
import { parseStats } from "@/hooks/use-apps";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Download, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import emblemBlueGold from "@assets/image_1767134942654_1770888806502.png";

const EMBLEM_COLORS: { name: string; filter: string }[] = [
  { name: "Gold", filter: "none" },
  { name: "Silver", filter: "saturate(0) brightness(1.3)" },
  { name: "Purple", filter: "hue-rotate(270deg) saturate(1.5)" },
  { name: "Bronze", filter: "hue-rotate(15deg) saturate(0.8) brightness(0.9)" },
];

const COLOR_DOTS: { name: string; bg: string }[] = [
  { name: "Gold", bg: "#D4A843" },
  { name: "Silver", bg: "#C0C0C0" },
  { name: "Purple", bg: "#9B59B6" },
  { name: "Bronze", bg: "#CD7F32" },
];

const gradients = [
  "from-purple-600 to-blue-600",
  "from-pink-600 to-rose-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-amber-600",
  "from-indigo-600 to-violet-600",
  "from-cyan-600 to-blue-600",
];

interface AppCardProps {
  app: App;
  index: number;
}

export function AppCard({ app, index }: AppCardProps) {
  const stats = parseStats(app.stats);
  const [emblemColorIdx, setEmblemColorIdx] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const gradient = gradients[app.id % gradients.length];
  const screenshotUrl = `https://image.thum.io/get/width/640/crop/360/${encodeURIComponent(app.url)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group block h-full"
    >
      <div className="h-full flex flex-col bg-card rounded-md border border-border/50 overflow-hidden card-hover-effect relative">
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative"
          data-testid={`link-app-${app.id}`}
        >
          <div className="h-44 w-full relative overflow-hidden bg-black">
            {!imgFailed ? (
              <img
                src={screenshotUrl}
                alt={`${app.name} homepage preview`}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-4xl font-bold text-white drop-shadow-md">
                  {app.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300" />
            <div className="absolute bottom-2 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 text-white text-xs">
              <ExternalLink size={12} />
              <span>Open App</span>
            </div>
          </div>
        </a>

        <div
          className="absolute top-2 right-2 z-20"
          onMouseEnter={() => setShowColorPicker(true)}
          onMouseLeave={() => setShowColorPicker(false)}
        >
          <img
            src={emblemBlueGold}
            alt="GRUDACHAIN Emblem"
            className="w-10 h-10 rounded-full cursor-pointer drop-shadow-lg"
            style={{ filter: EMBLEM_COLORS[emblemColorIdx].filter }}
            data-testid={`emblem-${app.id}`}
          />
          <div
            className="absolute top-full right-0 mt-1 flex gap-1 p-1.5 rounded-md bg-card/95 backdrop-blur-md border border-border/60 shadow-lg"
            style={{ visibility: showColorPicker ? "visible" : "hidden" }}
          >
            {COLOR_DOTS.map((c, idx) => (
              <button
                key={c.name}
                title={c.name}
                className="w-5 h-5 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: c.bg,
                  borderColor: emblemColorIdx === idx ? "#fff" : "transparent",
                  transform: emblemColorIdx === idx ? "scale(1.15)" : "scale(1)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEmblemColorIdx(idx);
                }}
                data-testid={`color-${c.name.toLowerCase()}-${app.id}`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-1 mb-2 flex-wrap">
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors"
              data-testid={`text-app-name-${app.id}`}
            >
              {app.name}
            </a>
          </div>

          <div className="mb-3">
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

          <div className="mt-auto space-y-2">
            <div className="h-px bg-border/50 w-full" />
            {stats ? (
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5" title="Downloads/Visits">
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>{stats.downloads || "-"}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Version/Rating">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span>v{stats.version || "1.0"}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2" title="Last Updated">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{stats.date || "Recently"}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No stats available</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
