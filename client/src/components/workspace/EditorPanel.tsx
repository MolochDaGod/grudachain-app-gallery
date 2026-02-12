import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen, File, ArrowUp, Save, RefreshCw, Upload, Plus,
  Trash2, Loader2, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface FileItem {
  name: string;
  is_dir: boolean;
  size?: number;
  path?: string;
}

export function EditorPanel() {
  const [cwd, setCwd] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDir = useCallback(async (path: string) => {
    const puter = window.puter;
    if (!puter) return;
    setLoading(true);
    try {
      const items = await puter.fs.readdir(path);
      const sorted = (items || []).sort((a: FileItem, b: FileItem) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.localeCompare(b.name);
      });
      setFiles(sorted);
      setCwd(path);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
    setLoading(false);
  }, []);

  const openFileForEdit = async (filePath: string) => {
    const puter = window.puter;
    if (!puter) return;
    setLoading(true);
    try {
      const blob = await puter.fs.read(filePath);
      const text = await blob.text();
      setContent(text);
      setOpenFile(filePath);
      setDirty(false);
      setStatusMsg(`Opened: ${filePath}`);
    } catch (err: any) {
      setStatusMsg(`Error reading file: ${err?.message || String(err)}`);
    }
    setLoading(false);
  };

  const saveFile = async () => {
    const puter = window.puter;
    if (!puter || !openFile) return;
    setSaving(true);
    try {
      await puter.fs.write(openFile, content);
      setDirty(false);
      setStatusMsg(`Saved: ${openFile}`);
    } catch (err: any) {
      setStatusMsg(`Error saving: ${err?.message || String(err)}`);
    }
    setSaving(false);
  };

  const handleFileClick = (item: FileItem) => {
    const fullPath = cwd === "/" ? `/${item.name}` : `${cwd}/${item.name}`;
    if (item.is_dir) {
      loadDir(fullPath);
    } else {
      openFileForEdit(fullPath);
    }
  };

  const goUp = () => {
    const parent = cwd.split("/").slice(0, -1).join("/") || "/";
    loadDir(parent);
  };

  const createFile = async () => {
    const puter = window.puter;
    if (!puter || !newFileName.trim()) return;
    const path = cwd === "/" ? `/${newFileName}` : `${cwd}/${newFileName}`;
    try {
      if (newFileName.endsWith("/")) {
        await puter.fs.mkdir(path.replace(/\/$/, ""));
        setStatusMsg(`Created directory: ${path}`);
      } else {
        await puter.fs.write(path, "");
        setStatusMsg(`Created file: ${path}`);
      }
      setNewFileName("");
      setShowNewFile(false);
      loadDir(cwd);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  const deleteItem = async (item: FileItem) => {
    const puter = window.puter;
    if (!puter) return;
    const fullPath = cwd === "/" ? `/${item.name}` : `${cwd}/${item.name}`;
    try {
      await puter.fs.delete(fullPath);
      setStatusMsg(`Deleted: ${fullPath}`);
      if (openFile === fullPath) {
        setOpenFile(null);
        setContent("");
      }
      loadDir(cwd);
    } catch (err: any) {
      setStatusMsg(`Error: ${err?.message || String(err)}`);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const puter = window.puter;
    if (!puter || !e.target.files?.length) return;
    setLoading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const path = cwd === "/" ? `/${file.name}` : `${cwd}/${file.name}`;
        const reader = new FileReader();
        const text = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsText(file);
        });
        await puter.fs.write(path, text);
        setStatusMsg(`Uploaded: ${file.name}`);
      }
      loadDir(cwd);
    } catch (err: any) {
      setStatusMsg(`Error uploading: ${err?.message || String(err)}`);
    }
    setLoading(false);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col lg:flex-row h-full gap-0 min-h-0">
        <div className="w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col min-h-0 max-h-64 lg:max-h-none">
          <div className="flex items-center gap-1 p-2 border-b border-border/50 flex-wrap">
            <Button size="icon" variant="ghost" onClick={goUp} title="Go up" data-testid="button-go-up">
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => loadDir(cwd)} title="Refresh" data-testid="button-refresh-files">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setShowNewFile(!showNewFile)} title="New file" data-testid="button-new-file">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} title="Upload" data-testid="button-upload">
              <Upload className="w-4 h-4" />
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleUpload} />
          </div>

          <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-1 truncate">
            <FolderOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{cwd}</span>
          </div>

          {showNewFile && (
            <div className="flex items-center gap-1 px-2 py-1">
              <Input
                className="h-7 text-xs"
                placeholder="name (append / for dir)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFile()}
                data-testid="input-new-file-name"
              />
              <Button size="sm" variant="ghost" onClick={createFile} className="h-7 px-2 text-xs">
                OK
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0">
            {loading && files.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <p>Click refresh to load files</p>
                <p className="mt-1 text-muted-foreground/50">Sign in to Puter first</p>
              </div>
            ) : (
              files.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2 py-1.5 hover-elevate cursor-pointer group"
                  onClick={() => handleFileClick(item)}
                >
                  {item.is_dir ? (
                    <FolderOpen className="w-4 h-4 text-yellow-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                  <span className="text-xs truncate flex-1">{item.name}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteItem(item); }}
                    style={{ visibility: "visible" }}
                    data-testid={`button-delete-${item.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {openFile ? (
            <>
              <div className="flex items-center gap-2 p-2 border-b border-border/50 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono border-border/50 truncate max-w-xs">
                  {openFile}
                </Badge>
                {dirty && <Badge variant="secondary" className="text-xs">Modified</Badge>}
                <div className="ml-auto">
                  <Button
                    size="sm"
                    onClick={saveFile}
                    disabled={!dirty || saving}
                    data-testid="button-save-file"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </div>
              </div>
              <textarea
                className="flex-1 w-full bg-black/60 text-green-300/90 font-mono text-sm p-3 resize-none outline-none leading-relaxed min-h-0"
                value={content}
                onChange={(e) => { setContent(e.target.value); setDirty(true); }}
                spellCheck={false}
                data-testid="textarea-editor"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <File className="w-10 h-10 mx-auto opacity-30" />
                <p>Select a file to edit</p>
                <p className="text-xs text-muted-foreground/50">Browse your Puter cloud storage on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border/50 truncate flex items-center gap-1">
          <ChevronRight className="w-3 h-3 shrink-0" />
          {statusMsg}
        </div>
      )}
    </div>
  );
}
