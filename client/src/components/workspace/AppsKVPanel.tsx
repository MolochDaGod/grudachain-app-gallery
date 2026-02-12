import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  RefreshCw, Plus, Trash2, Loader2, AppWindow, Database,
  ExternalLink, Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PuterApp {
  name: string;
  uid?: string;
  url?: string;
  index_url?: string;
  title?: string;
}

interface KVEntry {
  key: string;
  value: string;
}

export function AppsKVPanel() {
  return (
    <Tabs defaultValue="apps" className="flex flex-col h-full">
      <TabsList className="mx-3 mt-3 shrink-0">
        <TabsTrigger value="apps" data-testid="tab-apps-manager">
          <AppWindow className="w-4 h-4 mr-1" /> Apps
        </TabsTrigger>
        <TabsTrigger value="kv" data-testid="tab-kv-storage">
          <Database className="w-4 h-4 mr-1" /> KV Storage
        </TabsTrigger>
      </TabsList>
      <TabsContent value="apps" className="flex-1 min-h-0 overflow-hidden">
        <AppManager />
      </TabsContent>
      <TabsContent value="kv" className="flex-1 min-h-0 overflow-hidden">
        <KVManager />
      </TabsContent>
    </Tabs>
  );
}

function AppManager() {
  const [apps, setApps] = useState<PuterApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const loadApps = async () => {
    const puter = window.puter;
    if (!puter) return;
    setLoading(true);
    try {
      const list = await puter.apps.list();
      setApps(list || []);
      setStatusMsg(`Loaded ${(list || []).length} apps`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
    setLoading(false);
  };

  const createApp = async () => {
    const puter = window.puter;
    if (!puter || !newName.trim()) return;
    setLoading(true);
    try {
      const url = newUrl.trim() || "https://example.com";
      await puter.apps.create(newName.trim(), url);
      setStatusMsg(`Created app: ${newName}`);
      setNewName("");
      setNewUrl("");
      loadApps();
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
    setLoading(false);
  };

  const deleteApp = async (name: string) => {
    const puter = window.puter;
    if (!puter) return;
    try {
      await puter.apps.delete(name);
      setStatusMsg(`Deleted: ${name}`);
      loadApps();
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={loadApps} disabled={loading} data-testid="button-load-apps">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          Load Apps
        </Button>
        <span className="text-xs text-muted-foreground">{statusMsg}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input
          className="h-8 text-sm w-40"
          placeholder="App name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          data-testid="input-app-name"
        />
        <Input
          className="h-8 text-sm flex-1 min-w-32"
          placeholder="URL (optional)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          data-testid="input-app-url"
        />
        <Button size="sm" onClick={createApp} disabled={!newName.trim() || loading} data-testid="button-create-app">
          <Plus className="w-4 h-4 mr-1" /> Create
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {apps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <AppWindow className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p>Click "Load Apps" to view your Puter apps</p>
          </div>
        ) : (
          apps.map((app) => (
            <Card key={app.uid || app.name} className="p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{app.name}</span>
                {app.title && app.title !== app.name && (
                  <Badge variant="outline" className="text-xs border-border/50">{app.title}</Badge>
                )}
                <div className="ml-auto flex items-center gap-1">
                  {(app.url || app.index_url) && (
                    <a
                      href={app.url || app.index_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteApp(app.name)}
                    className="text-destructive"
                    data-testid={`button-delete-app-${app.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {(app.url || app.index_url) && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{app.url || app.index_url}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function KVManager() {
  const [entries, setEntries] = useState<KVEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const loadKeys = async () => {
    const puter = window.puter;
    if (!puter) return;
    setLoading(true);
    try {
      const result = await puter.kv.list();
      const keys: string[] = result?.keys || [];
      const loaded: KVEntry[] = [];
      for (const key of keys) {
        try {
          const val = await puter.kv.get(key);
          loaded.push({ key, value: typeof val === "string" ? val : JSON.stringify(val) });
        } catch {
          loaded.push({ key, value: "(error reading)" });
        }
      }
      setEntries(loaded);
      setStatusMsg(`Loaded ${loaded.length} keys`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
    setLoading(false);
  };

  const setKV = async () => {
    const puter = window.puter;
    if (!puter || !newKey.trim()) return;
    try {
      await puter.kv.set(newKey.trim(), newValue);
      setStatusMsg(`Set: ${newKey}`);
      setNewKey("");
      setNewValue("");
      loadKeys();
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  const deleteKey = async (key: string) => {
    const puter = window.puter;
    if (!puter) return;
    try {
      await puter.kv.del(key);
      setStatusMsg(`Deleted: ${key}`);
      loadKeys();
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  const updateEntry = async (key: string, value: string) => {
    const puter = window.puter;
    if (!puter) return;
    try {
      await puter.kv.set(key, value);
      setStatusMsg(`Updated: ${key}`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={loadKeys} disabled={loading} data-testid="button-load-kv">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          Load Keys
        </Button>
        <span className="text-xs text-muted-foreground">{statusMsg}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Input
          className="h-8 text-sm w-32"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          data-testid="input-kv-key"
        />
        <Input
          className="h-8 text-sm flex-1 min-w-32"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          data-testid="input-kv-value"
        />
        <Button size="sm" onClick={setKV} disabled={!newKey.trim()} data-testid="button-set-kv">
          <Save className="w-4 h-4 mr-1" /> Set
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Database className="w-8 h-8 mx-auto opacity-30 mb-2" />
            <p>Click "Load Keys" to view your KV storage</p>
          </div>
        ) : (
          entries.map((entry) => (
            <Card key={entry.key} className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-mono">{entry.key}</Badge>
                  </div>
                  <textarea
                    className="w-full bg-black/30 text-sm font-mono text-green-300/80 p-2 rounded border border-border/30 resize-none"
                    rows={2}
                    defaultValue={entry.value}
                    onBlur={(e) => {
                      if (e.target.value !== entry.value) {
                        updateEntry(entry.key, e.target.value);
                      }
                    }}
                    data-testid={`textarea-kv-${entry.key}`}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteKey(entry.key)}
                  className="text-destructive shrink-0"
                  data-testid={`button-delete-kv-${entry.key}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
