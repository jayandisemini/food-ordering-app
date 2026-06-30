import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MessageCircle, Check } from "lucide-react";
import { DeliveryMap } from "@/components/delivery-map";


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

function TrackPage() {
  const [active, setActive] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/cart" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">Live tracking</h1>
        <div className="h-11 w-11" />
      </header>

      {/* Live Google Map */}
      <div className="mx-5 mt-4">
        <DeliveryMap progress={(active + 1) / steps.length} />
      </div>


      {/* Rider */}
      <div className="mx-5 mt-4 flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft animate-fade-up">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-xl">👨‍🍳</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Your courier</p>
          <p className="truncate font-bold">Kasun Perera · Honda Click</p>
        </div>
        <button className="press grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background">
          <MessageCircle className="h-4 w-4" />
        </button>
        <button className="press grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
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

    </div>
  );
}
