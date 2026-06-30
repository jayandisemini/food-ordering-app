import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Wallet, CreditCard, Banknote, Check, Loader2 } from "lucide-react";
import { useCart, cartStore } from "@/lib/cart-store";
import { findFood, formatLkr } from "@/lib/food-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Search = { address?: string; phone?: string; notes?: string; when?: string };

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Payment — QuickBite" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    address: s.address as string | undefined,
    phone: s.phone as string | undefined,
    notes: s.notes as string | undefined,
    when: s.when as string | undefined,
  }),
  component: PaymentPage,
});

const methods = [
  { id: "card", label: "Credit / Debit card", sub: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "wallet", label: "Digital wallet", sub: "Apple Pay · Google Pay", icon: Wallet },
  { id: "cod", label: "Cash on delivery", sub: "Pay your courier", icon: Banknote },
];

function PaymentPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/payment" }) as Search;
  const cart = useCart();
  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const items = cart.map((c) => ({ ...c, food: findFood(c.id)! })).filter((c) => c.food);
  const subtotal = items.reduce((s, i) => s + i.food.price * i.qty, 0);
  const delivery = items.length ? 800 : 0;
  const total = subtotal + delivery;

  const pay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("orders").insert({
        user_id: user.id,
        items: items.map((i) => ({ id: i.id, name: i.food.name, qty: i.qty, price: i.food.price })),
        subtotal,
        delivery_fee: delivery,
        total,
        address: search.address ?? "",
        phone: search.phone ?? null,
        instructions: search.notes ?? null,
        payment_method: method,
        status: "placed",
      });
    }

    setDone(true);
    setPaying(false);
    setTimeout(() => {
      cartStore.clear();
      navigate({ to: "/track" });
    }, 1400);
  };

  if (done) {
    return (
      <div className="phone-frame grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div className="animate-scale-in">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow animate-pulse-glow">
            <Check className="h-12 w-12" strokeWidth={3} />
          </div>
          <h1 className="mt-6 font-display text-3xl font-black">Payment successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">Taking you to live tracking…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-frame min-h-dvh bg-background pb-32">
      <Toaster />
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          onClick={() => navigate({ to: "/checkout" })}
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-xl font-black">Payment</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="px-5 pt-4">
        <p className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose method</p>
        <div className="mt-3 space-y-3">
          {methods.map((m, i) => {
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`press flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-left transition-all animate-fade-up ${
                  active ? "border-primary bg-accent shadow-soft" : "border-border bg-surface"
                }`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    active ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground"
                  }`}
                >
                  <m.icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="font-bold">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                    active ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {method === "card" && (
          <div className="mt-4 space-y-3 rounded-3xl bg-foreground p-5 text-background shadow-card animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-wider text-background/60">Card number</p>
            <p className="font-display text-2xl font-black tracking-widest">4242 4242 4242 4242</p>
            <div className="flex justify-between text-xs text-background/70">
              <span>Exp 12/27</span>
              <span>CVV •••</span>
            </div>
          </div>
        )}

        <div className="mt-5 rounded-3xl bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Order total</span>
            <span className="font-display text-2xl font-black text-primary">{formatLkr(total)}</span>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] px-5 pb-5 pt-3">
        <button
          onClick={pay}
          disabled={paying || !items.length}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {paying ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ${formatLkr(total)}`}
        </button>
      </div>
    </div>
  );
}
