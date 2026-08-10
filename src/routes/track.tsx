import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MessageCircle, Check, Copy, Send, X, ExternalLink, PhoneCall } from "lucide-react";
import { DeliveryMap } from "@/components/delivery-map";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Tracking your order — QuickBite" }] }),
  component: TrackPage,
});

const steps = [
  { label: "Order confirmed", time: "Just now" },
  { label: "Kitchen is cooking", time: "2 min" },
  { label: "Rider picked up", time: "12 min" },
  { label: "Delivered to door", time: "22 min" },
];

type ChatMessage = { id: string; sender: "courier" | "user"; text: string; time: string };

function TrackPage() {
  const [active, setActive] = useState(1);
  const [courier, setCourier] = useState({
    name: "Kasun Perera",
    phone: "+94740489343",
    vehicle: "Honda Click (WP BI-8291)",
  });
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  // Modals state
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "courier",
      text: "Hi! I have picked up your order and I'm heading your way. Feel free to message me if you have any delivery instructions!",
      time: "Just now",
    },
  ]);

  useEffect(() => {
    // 1. Fetch latest active order & assigned courier details from Supabase
    async function loadLatestOrder() {
      const { data } = await supabase
        .from("orders")
        .select("id, status, courier_name, courier_phone, courier_vehicle, driver_lat, driver_lng")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        if (data.courier_name) {
          setCourier({
            name: data.courier_name || "Kasun Perera",
            phone: data.courier_phone || "+94740489343",
            vehicle: data.courier_vehicle || "Honda Click",
          });
        }
        if (data.driver_lat && data.driver_lng) {
          setDriverCoords({ lat: data.driver_lat, lng: data.driver_lng });
        }
      }
    }

    loadLatestOrder();

    // 2. Listen for live Supabase realtime order & driver updates
    const channel = supabase
      .channel("live-order-tracker")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if (payload.new) {
          const p = payload.new;
          const statusMap: Record<string, number> = {
            confirmed: 0,
            cooking: 1,
            picked_up: 2,
            delivered: 3,
          };
          if (p.status && statusMap[p.status] !== undefined) {
            setActive(statusMap[p.status]);
          }
          if (p.driver_lat && p.driver_lng) {
            setDriverCoords({ lat: p.driver_lat, lng: p.driver_lng });
          }
          if (p.courier_name) {
            setCourier({
              name: p.courier_name,
              phone: p.courier_phone || "+94740489343",
              vehicle: p.courier_vehicle || "Honda Click",
            });
          }
        }
      })
      .subscribe();

    const t = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 5000);
    return () => {
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(courier.phone);
    toast.success(`Copied ${courier.phone} to clipboard!`);
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Simulate realistic courier reply
    setTimeout(() => {
      const courierReplies = [
        "Got it! I will be there in about 5-8 minutes.",
        "Understood! Thanks for the info.",
        "Sure thing! I am currently turning near your street.",
      ];
      const randomReply = courierReplies[Math.floor(Math.random() * courierReplies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "courier",
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  const cleanPhone = courier.phone.replace(/[^0-9+]/g, "");

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background relative">
      <Toaster />

      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/cart" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">Live tracking</h1>
        <div className="h-11 w-11" />
      </header>

      {/* Live Google / Street Map */}
      <div className="mx-5 mt-4">
        <DeliveryMap progress={(active + 1) / steps.length} driverCoords={driverCoords} />
      </div>

      {/* Rider */}
      <div className="mx-5 mt-4 flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft animate-fade-up">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-xl">👨‍🍳</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Your courier</p>
          <p className="truncate font-bold">
            {courier.name} · {courier.vehicle}
          </p>
        </div>
        <button
          onClick={() => setShowChatModal(true)}
          title="Message Courier"
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowCallModal(true)}
          title="Call Courier"
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"
        >
          <Phone className="h-4 w-4" />
        </button>
      </div>

      {/* Timeline */}
      <div className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-soft">
        <h3 className="font-display text-base font-black">Order timeline</h3>
        <ol className="relative mt-4 space-y-5 pl-3">
          <span className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />
          {steps.map((s, i) => {
            const done = i <= active;
            return (
              <li key={s.label} className="relative flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span
                  className={`relative z-10 grid h-7 w-7 place-items-center rounded-full transition-all ${
                    done ? "bg-primary text-primary-foreground shadow-glow" : "bg-surface-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{s.time}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex-1" />
      <Link
        to="/home"
        className="press mx-5 mb-10 mt-4 rounded-2xl border border-border bg-surface py-4 text-center text-sm font-bold"
      >
        Continue browsing
      </Link>
      <div className="h-6" />

      {/* --- CALL COURIER MODAL --- */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-card border border-border animate-fade-up">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-lg">👨‍🍳</div>
                <div>
                  <h3 className="font-bold text-base">{courier.name}</h3>
                  <p className="text-xs text-muted-foreground">{courier.vehicle}</p>
                </div>
              </div>
              <button onClick={() => setShowCallModal(false)} className="press p-2 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 rounded-2xl bg-surface-muted p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Courier Phone Number</p>
              <p className="font-mono text-xl font-bold tracking-wider mt-1 text-primary">{courier.phone}</p>
            </div>

            <div className="space-y-3">
              {/* Copy Phone Number */}
              <button
                onClick={handleCopyPhone}
                className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 font-bold text-sm"
              >
                <Copy className="h-4 w-4" /> Copy Phone Number
              </button>

              {/* Call via WhatsApp */}
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white py-3 font-bold text-sm shadow-soft"
              >
                <ExternalLink className="h-4 w-4" /> Call / Chat on WhatsApp
              </a>

              {/* Direct Cellular Phone Call (Mobile) */}
              <a
                href={`tel:${cleanPhone}`}
                className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3 font-bold text-sm shadow-glow"
              >
                <PhoneCall className="h-4 w-4" /> Direct Phone Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- IN-APP LIVE COURIER CHAT MODAL --- */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-background animate-in slide-in-from-bottom duration-300 max-w-md mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border px-4 py-4 bg-surface">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-lg">👨‍🍳</div>
              <div>
                <h3 className="font-bold text-base">{courier.name}</h3>
                <p className="text-xs text-[#22c55e] font-bold">Online · Delivery Rider</p>
              </div>
            </div>
            <button onClick={() => setShowChatModal(false)} className="press p-2 text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
          </header>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            <p className="text-center text-[11px] font-medium text-muted-foreground my-2">
              Order #QB-{Math.floor(1000 + Math.random() * 9000)} Live Courier Chat
            </p>

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-soft ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-surface border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground px-1 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendChatMessage} className="border-t border-border p-3 bg-surface flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to courier..."
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="press grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
