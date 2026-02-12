import { usePuter } from "@/hooks/use-puter";
import { TerminalPanel } from "@/components/workspace/TerminalPanel";
import { EditorPanel } from "@/components/workspace/EditorPanel";
import { AIChatPanel } from "@/components/workspace/AIChatPanel";
import { AppsKVPanel } from "@/components/workspace/AppsKVPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Terminal, Code, Bot, AppWindow, LogIn, LogOut,
  ArrowLeft, Loader2, User
} from "lucide-react";
import emblem from "@assets/image_1767134942654_1770888806502.png";

export default function Workspace() {
  const { ready, signedIn, username, signIn, signOut } = usePuter();

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border/50 shrink-0 flex-wrap">
        <Link href="/" data-testid="link-back-home">
          <Button size="sm" variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-1" /> Gallery
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <img src={emblem} alt="GRUDACHAIN" className="w-6 h-6" />
          <span className="font-bold text-sm tracking-wide">GRUDACHAIN</span>
          <span className="text-xs text-muted-foreground">Workspace</span>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {!ready ? (
            <Badge variant="outline" className="text-xs border-border/50">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Loading SDK...
            </Badge>
          ) : signedIn ? (
            <>
              <Badge variant="secondary" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {username || "Connected"}
              </Badge>
              <Button size="sm" variant="outline" onClick={signOut} data-testid="button-sign-out">
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={signIn} data-testid="button-sign-in">
              <LogIn className="w-4 h-4 mr-1" /> Sign in to Puter
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="terminal" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-3 shrink-0">
          <TabsTrigger value="terminal" data-testid="tab-terminal">
            <Terminal className="w-4 h-4 mr-1" /> Terminal
          </TabsTrigger>
          <TabsTrigger value="editor" data-testid="tab-editor">
            <Code className="w-4 h-4 mr-1" /> IDE
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Bot className="w-4 h-4 mr-1" /> AI Chat
          </TabsTrigger>
          <TabsTrigger value="apps" data-testid="tab-apps-kv">
            <AppWindow className="w-4 h-4 mr-1" /> Apps & KV
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4 min-h-0 overflow-hidden">
          <TabsContent value="terminal" className="h-full m-0">
            <TerminalPanel />
          </TabsContent>
          <TabsContent value="editor" className="h-full m-0">
            <div className="h-full border border-border/50 rounded-md overflow-hidden">
              <EditorPanel />
            </div>
          </TabsContent>
          <TabsContent value="ai" className="h-full m-0">
            <div className="h-full border border-border/50 rounded-md overflow-hidden">
              <AIChatPanel />
            </div>
          </TabsContent>
          <TabsContent value="apps" className="h-full m-0">
            <div className="h-full border border-border/50 rounded-md overflow-hidden">
              <AppsKVPanel />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
