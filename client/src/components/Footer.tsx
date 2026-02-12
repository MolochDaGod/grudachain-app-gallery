import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-border/40 mt-20 py-10 bg-black/20"
    >
      <div className="container mx-auto px-4 text-center">
        <p className="text-muted-foreground text-sm">
          Built for <span className="text-foreground font-semibold">Puter</span> ecosystem.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">
          Discover the future of cloud computing apps.
        </p>
      </div>
    </motion.footer>
  );
}
