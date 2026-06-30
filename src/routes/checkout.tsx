import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Phone, MessageSquare, Zap, Calendar } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { findFood, formatLkr } from "@/lib/food-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — QuickBite" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState("221B Galle Road, Colombo 03");
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [notes, setNotes] = useState("");
  const [when, setWhen] = useState<"asap" | "schedule">("asap");

  const items = cart.map((c) => ({ ...c, food: findFood(c.id)! })).filter((c) => c.food);
  const subtotal = items.reduce((s, i) => s + i.food.price * i.qty, 0);
  const delivery = items.length ? 800 : 0;
  const total = subtotal + delivery;

  return (
    <div className="phone-frame min-h-dvh bg-background pb-32">
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/cart" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">Checkout</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="space-y-5 px-5 pt-4">
        <Section title="Delivery address" icon={<MapPin className="h-4 w-4" />}>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full resize-none bg-transparent text-sm focus:outline-none"
            placeholder="Street, city, zip"
          />
        </Section>

        <Section title="Contact number" icon={<Phone className="h-4 w-4" />}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </Section>

        <Section title="Delivery instructions" icon={<MessageSquare className="h-4 w-4" />}>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ring the bell, leave at the door…"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </Section>

        <div>
          <p className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">When</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => setWhen("asap")}
              className={`press flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
                when === "asap" ? "border-primary bg-accent" : "border-border bg-surface"
              }`}
            >
              <Zap className={`h-4 w-4 ${when === "asap" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-bold">ASAP</p>
              <p className="text-xs text-muted-foreground">25–35 min</p>
            </button>
            <button
              onClick={() => setWhen("schedule")}
              className={`press flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all ${
                when === "schedule" ? "border-primary bg-accent" : "border-border bg-surface"
              }`}
            >
              <Calendar className={`h-4 w-4 ${when === "schedule" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="font-bold">Schedule</p>
              <p className="text-xs text-muted-foreground">Pick a time</p>
            </button>
          </div>
        </div>

        <div className="space-y-2 rounded-3xl bg-surface p-5 shadow-soft">
          <Row label="Subtotal" value={formatLkr(subtotal)} />
          <Row label="Delivery" value={formatLkr(delivery)} />
          <div className="my-2 h-px bg-border" />
          <Row label="Total" value={formatLkr(total)} bold />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] px-5 pb-5 pt-3">
        <button
          onClick={() =>
            navigate({
              to: "/payment",
              search: { address, phone, notes, when } as any,
            })
          }
          disabled={!items.length || !address}
          className="press flex w-full items-center justify-between rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-glow disabled:opacity-50"
        >
          <span className="font-display font-bold">Continue to payment</span>
          <span className="rounded-xl bg-background/20 px-3 py-1 text-sm font-bold backdrop-blur">
            {formatLkr(total)}
          </span>
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-display text-base font-black" : "text-muted-foreground"}>{label}</span>
      <span className={bold ? "font-display text-lg font-black text-primary" : "font-semibold"}>{value}</span>
    </div>
  );
}
