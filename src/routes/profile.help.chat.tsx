import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Headset, Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/profile/help/chat")({
  head: () => ({ meta: [{ title: "Support Chat — QuickBite" }] }),
  component: ChatPage,
});

type Msg = { id: string; from: "agent" | "user"; text: string; time: string };

const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SEED: Msg[] = [
  {
    id: "m1",
    from: "agent",
    text:
      "Hello Jayandi! Thanks for reaching out to QuickBite Support. How can I help you with your order today?",
    time: "10:02",
  },
  {
    id: "m2",
    from: "user",
    text: "Hi, I haven't received my refund for the cancelled Taco Bell order yet.",
    time: "10:03",
  },
  {
    id: "m3",
    from: "agent",
    text:
      "I can certainly check that for you. Please hold on for a moment while I pull up your account details…",
    time: "10:03",
  },
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, from: "user", text: t, time: now() }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          from: "agent",
          text:
            "Thank you for the message. I am looking into your request regarding your account right now and will update you instantly!",
          time: now(),
        },
      ]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="phone-frame fixed inset-0 z-50 mx-auto flex h-dvh flex-col bg-background animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center gap-3 border-b border-border/60 px-4 pt-6 pb-3">
        <Link
          to="/profile/help"
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="relative">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary">
            <Headset className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-[#22c55e] shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">QuickBite Support Agent</p>
          <p className="text-[11px] font-medium text-[#22c55e]">Online</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <p className="text-center text-[11px] font-medium text-muted-foreground">
          Today
        </p>
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-soft">
              <span className="flex gap-1">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/60 bg-background px-3 pb-6 pt-3">
        <div className="flex items-center gap-2 rounded-3xl bg-surface px-2 py-1.5 shadow-soft">
          <button className="press grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:text-foreground">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="press grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-card transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[78%]">
        <div
          className={`px-4 py-2.5 text-sm leading-snug shadow-soft ${
            isUser
              ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
              : "rounded-2xl rounded-bl-md bg-surface text-foreground"
          }`}
        >
          {msg.text}
        </div>
        <p
          className={`mt-1 text-[10px] text-muted-foreground ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {msg.time}
        </p>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
