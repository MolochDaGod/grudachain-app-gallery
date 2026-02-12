import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-border/40 mt-20 py-10 bg-black/20"
    >
      <div className="container mx-auto px-4 text-center space-y-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">GRUDACHAIN</span> App Gallery
        </p>
        <p className="text-xs text-muted-foreground/60">
          <a
            href="https://developer.puter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline"
            data-testid="link-powered-by-puter"
          >
            Powered by Puter
          </a>
        </p>
      </div>
    </motion.footer>
  );
}
