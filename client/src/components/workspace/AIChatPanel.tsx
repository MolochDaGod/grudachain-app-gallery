import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const AI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "deepseek-chat", label: "DeepSeek Chat" },
  { value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", label: "Llama 3.1 70B" },
];

export function AIChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const sendMessage = async () => {
    const puter = window.puter;
    if (!puter || !input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreaming("");

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await puter.ai.chat(chatMessages, {
        model,
        stream: true,
      });

      let fullText = "";
      for await (const part of response) {
        const text = part?.text || part?.message?.content || "";
        if (text) {
          fullText += text;
          setStreaming(fullText);
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullText || "(No response)" }]);
      setStreaming("");
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errMsg}` },
      ]);
      setStreaming("");
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setStreaming("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border/50 flex-wrap">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <span className="text-sm font-medium">AI Chat</span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-48 h-8 text-xs" data-testid="select-ai-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={clearChat} data-testid="button-clear-chat">
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && !streaming && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center space-y-3">
              <Bot className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Ask the AI anything</p>
              <p className="text-xs text-muted-foreground/50">
                Powered by Puter AI - supports GPT-4o, Claude, Gemini, and more
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-md p-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary/20 text-foreground"
                  : "bg-secondary/50 text-foreground"
              }`}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-accent" />
              </div>
            )}
          </div>
        ))}

        {streaming && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div
              className="max-w-[80%] rounded-md p-3 text-sm bg-secondary/50 text-foreground leading-relaxed"
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {streaming}
              <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
            data-testid="input-ai-chat"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            data-testid="button-send-ai"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
