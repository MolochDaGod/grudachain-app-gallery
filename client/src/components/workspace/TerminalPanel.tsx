import { useState, useRef, useEffect, useCallback } from "react";

interface TerminalLine {
  type: "input" | "output" | "error" | "info";
  text: string;
}

export function TerminalPanel() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "info", text: "GRUDACHAIN Puter Terminal v1.0" },
    { type: "info", text: 'Type "help" for available commands. Sign in to Puter first.' },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const addLine = useCallback((type: TerminalLine["type"], text: string) => {
    setLines((prev) => [...prev, { type, text }]);
  }, []);

  const resolvePath = (path: string) => {
    if (path.startsWith("/")) return path;
    const base = cwd.endsWith("/") ? cwd : cwd + "/";
    const parts = (base + path).split("/").filter(Boolean);
    const resolved: string[] = [];
    for (const p of parts) {
      if (p === "..") resolved.pop();
      else if (p !== ".") resolved.push(p);
    }
    return "/" + resolved.join("/");
  };

  const executeCommand = async (cmd: string) => {
    const puter = window.puter;
    if (!puter) {
      addLine("error", "Puter SDK not loaded. Refresh the page.");
      return;
    }

    const parts = cmd.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case "help":
          addLine("info", "File Commands: ls, cd, mkdir, touch, cat, rm, cp, mv");
          addLine("info", "App Commands: app:list, app:create <name> <url>, app:delete <name>, app:update <name> <key> <value>");
          addLine("info", "KV Commands: kv.set <key> <value>, kv.get <key>, kv.del <key>, kv.list");
          addLine("info", "AI Commands: ai <prompt>, ai:model <model> <prompt>");
          addLine("info", "Other: pwd, clear, whoami");
          break;

        case "clear":
          setLines([]);
          break;

        case "pwd":
          addLine("output", cwd);
          break;

        case "whoami": {
          if (!puter.auth.isSignedIn()) {
            addLine("error", "Not signed in.");
            break;
          }
          const user = await puter.auth.getUser();
          addLine("output", `Signed in as: ${user.username}`);
          break;
        }

        case "ls": {
          const target = args[0] ? resolvePath(args[0]) : cwd;
          const items = await puter.fs.readdir(target);
          if (!items || items.length === 0) {
            addLine("output", "(empty directory)");
          } else {
            for (const item of items) {
              const prefix = item.is_dir ? "[DIR] " : "      ";
              const size = item.size ? ` (${formatSize(item.size)})` : "";
              addLine("output", `${prefix}${item.name}${size}`);
            }
          }
          break;
        }

        case "cd": {
          if (!args[0]) {
            setCwd("/");
            addLine("output", "Changed to /");
            break;
          }
          const target = resolvePath(args[0]);
          try {
            await puter.fs.readdir(target);
            setCwd(target);
            addLine("output", `Changed to ${target}`);
          } catch {
            addLine("error", `Directory not found: ${target}`);
          }
          break;
        }

        case "mkdir": {
          if (!args[0]) { addLine("error", "Usage: mkdir <name>"); break; }
          const target = resolvePath(args[0]);
          await puter.fs.mkdir(target);
          addLine("output", `Created directory: ${target}`);
          break;
        }

        case "touch": {
          if (!args[0]) { addLine("error", "Usage: touch <filename>"); break; }
          const target = resolvePath(args[0]);
          await puter.fs.write(target, "");
          addLine("output", `Created file: ${target}`);
          break;
        }

        case "cat": {
          if (!args[0]) { addLine("error", "Usage: cat <filename>"); break; }
          const target = resolvePath(args[0]);
          const blob = await puter.fs.read(target);
          const text = await blob.text();
          addLine("output", text || "(empty file)");
          break;
        }

        case "rm": {
          if (!args[0]) { addLine("error", "Usage: rm <path>"); break; }
          const target = resolvePath(args[0]);
          await puter.fs.delete(target);
          addLine("output", `Deleted: ${target}`);
          break;
        }

        case "cp": {
          if (args.length < 2) { addLine("error", "Usage: cp <src> <dest>"); break; }
          await puter.fs.copy(resolvePath(args[0]), resolvePath(args[1]));
          addLine("output", `Copied ${args[0]} to ${args[1]}`);
          break;
        }

        case "mv": {
          if (args.length < 2) { addLine("error", "Usage: mv <src> <dest>"); break; }
          await puter.fs.move(resolvePath(args[0]), resolvePath(args[1]));
          addLine("output", `Moved ${args[0]} to ${args[1]}`);
          break;
        }

        case "app:list": {
          const apps = await puter.apps.list();
          if (!apps || apps.length === 0) {
            addLine("output", "No apps found.");
          } else {
            addLine("info", `Found ${apps.length} apps:`);
            for (const app of apps) {
              addLine("output", `  ${app.name} - ${app.url || app.index_url || "no url"}`);
            }
          }
          break;
        }

        case "app:create": {
          if (args.length < 2) { addLine("error", "Usage: app:create <name> <url>"); break; }
          const app = await puter.apps.create(args[0], args[1]);
          addLine("output", `App created: ${app.name} (uid: ${app.uid})`);
          break;
        }

        case "app:delete": {
          if (!args[0]) { addLine("error", "Usage: app:delete <name>"); break; }
          await puter.apps.delete(args[0]);
          addLine("output", `App deleted: ${args[0]}`);
          break;
        }

        case "app:update": {
          if (args.length < 3) { addLine("error", "Usage: app:update <name> <key> <value>"); break; }
          const updates: Record<string, string> = {};
          updates[args[1]] = args.slice(2).join(" ");
          await puter.apps.update(args[0], updates);
          addLine("output", `App ${args[0]} updated: ${args[1]} = ${updates[args[1]]}`);
          break;
        }

        case "kv.set": {
          if (args.length < 2) { addLine("error", "Usage: kv.set <key> <value>"); break; }
          const val = args.slice(1).join(" ");
          await puter.kv.set(args[0], val);
          addLine("output", `Set ${args[0]} = ${val}`);
          break;
        }

        case "kv.get": {
          if (!args[0]) { addLine("error", "Usage: kv.get <key>"); break; }
          const value = await puter.kv.get(args[0]);
          addLine("output", `${args[0]} = ${JSON.stringify(value)}`);
          break;
        }

        case "kv.del": {
          if (!args[0]) { addLine("error", "Usage: kv.del <key>"); break; }
          await puter.kv.del(args[0]);
          addLine("output", `Deleted key: ${args[0]}`);
          break;
        }

        case "kv.list": {
          const result = await puter.kv.list();
          if (!result || !result.keys || result.keys.length === 0) {
            addLine("output", "No keys found.");
          } else {
            addLine("info", `Keys (${result.keys.length}):`);
            for (const key of result.keys) {
              addLine("output", `  ${key}`);
            }
          }
          break;
        }

        case "ai": {
          if (args.length === 0) { addLine("error", "Usage: ai <prompt>"); break; }
          const prompt = args.join(" ");
          addLine("info", "Thinking...");
          const response = await puter.ai.chat(prompt);
          const text = typeof response === "string" ? response : response?.message?.content || JSON.stringify(response);
          addLine("output", text);
          break;
        }

        case "ai:model": {
          if (args.length < 2) { addLine("error", "Usage: ai:model <model> <prompt>"); break; }
          const model = args[0];
          const prompt = args.slice(1).join(" ");
          addLine("info", `Asking ${model}...`);
          const response = await puter.ai.chat(prompt, { model });
          const text = typeof response === "string" ? response : response?.message?.content || JSON.stringify(response);
          addLine("output", text);
          break;
        }

        default:
          addLine("error", `Unknown command: ${command}. Type "help" for available commands.`);
      }
    } catch (err: any) {
      addLine("error", `Error: ${err?.message || String(err)}`);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || running) return;
    const cmd = input.trim();
    addLine("input", `${cwd} $ ${cmd}`);
    setHistory((prev) => [...prev, cmd]);
    setHistIdx(-1);
    setInput("");
    setRunning(true);
    await executeCommand(cmd);
    setRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
        setHistIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx >= 0) {
        const newIdx = histIdx + 1;
        if (newIdx >= history.length) {
          setHistIdx(-1);
          setInput("");
        } else {
          setHistIdx(newIdx);
          setInput(history[newIdx]);
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-black/80 rounded-md border border-border/50 font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 min-h-0">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "text-cyan-400"
                : line.type === "error"
                  ? "text-red-400"
                  : line.type === "info"
                    ? "text-yellow-400"
                    : "text-green-300/90"
            }
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center border-t border-border/50 px-3 py-2 gap-2">
        <span className="text-cyan-400 shrink-0">{cwd} $</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-green-300 placeholder:text-muted-foreground/40 caret-cyan-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={running ? "Running..." : "Enter command..."}
          disabled={running}
          data-testid="input-terminal"
          autoFocus
        />
      </div>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}
