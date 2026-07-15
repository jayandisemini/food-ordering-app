import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, Tag, ChevronRight, Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { cartStore, useCart } from "@/lib/cart-store";
import { findFood, formatLkr } from "@/lib/food-data";
import { useAuth } from "@/lib/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — QuickBite" }] }),
  component: CartPage,
});

function CartPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const items = cart.map((c) => ({ ...c, food: findFood(c.id)! })).filter((c) => c.food);
  const subtotal = items.reduce((s, i) => s + i.food.price * i.qty, 0);
  const delivery = items.length ? 150 : 0;
  const discount = promoApplied ? Math.round(subtotal * 0.5) : 0;
  const total = subtotal - discount + delivery;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError(t("promo.error"));
      return;
    }
    if (code === "BINGE50") {
      setPromoApplied(true);
      setPromoOpen(false);
      setPromoInput("");
      setPromoError("");
      toast.success(t("promo.success"));
    } else {
      setPromoError(t("promo.error"));
    }
  };

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-6 animate-fade-up">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("cartPages.title")}</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="flex-1 px-5 pt-4 pb-40">
        {items.length === 0 ? (
          <div className="mt-24 flex flex-col items-center text-center animate-fade-up">
            <div className="text-6xl">🛒</div>
            <h2 className="mt-4 font-display text-2xl font-black">{t("cartPages.empty")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("cartPages.subempty")}</p>
            <Link
              to="/home"
              className="press mt-6 rounded-2xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-card"
            >
              {t("cartPages.discover")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 animate-fade-up rounded-3xl bg-card p-3 shadow-soft"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <img src={item.food.image} alt={item.food.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-muted-foreground">{item.food.restaurant}</p>
                    <h3 className="truncate font-bold">{item.food.name}</h3>
                    <p className="mt-1 font-bold text-primary">{formatLkr(item.food.price * item.qty)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => cartStore.remove(item.id)}
                      className="press grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
                      <button
                        onClick={() => cartStore.setQty(item.id, item.qty - 1)}
                        className="press grid h-7 w-7 place-items-center rounded-lg bg-background"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span key={item.qty} className="w-5 text-center text-sm font-bold animate-scale-in">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => cartStore.setQty(item.id, item.qty + 1)}
                        className="press grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setPromoError(""); setPromoOpen(true); }}
              className="press mt-5 flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-3.5 text-sm font-semibold"
            >
              <Tag className="h-4 w-4 text-primary" />
              <span>{promoApplied ? "BINGE50 applied" : t("cartPages.promoCode")}</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>

            <div className="mt-5 rounded-3xl bg-surface p-5 shadow-soft">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("cartPages.summary")}
              </p>
              <div className="space-y-2">
                <Row label={t("cartPages.subtotal")} value={formatLkr(subtotal)} />
                {promoApplied && (
                  <div className="flex items-center justify-between text-sm animate-fade-up">
                    <span className="font-semibold text-green-500">{t("promo.discountLabel")}</span>
                    <span className="font-bold text-green-500">-{formatLkr(discount)}</span>
                  </div>
                )}
                <Row label={t("cartPages.delivery")} value={formatLkr(delivery)} />
                <div className="my-2 h-px bg-border" />
                <Row label={t("cartPages.total")} value={formatLkr(total)} bold />
              </div>
            </div>
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-[440px] px-5">
          <button
            onClick={() => {
              if (!user) {
                navigate({ to: "/auth" });
                return;
              }
              placeOrder();
            }}
            disabled={placing}
            className="press flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-glow disabled:opacity-80"
          >
            {placing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-display font-bold">{t("cartPages.placing")}</span>
              </>
            ) : (
              <>
                <span className="font-display text-base font-bold">{t("cartPages.checkout")}</span>
                <span className="rounded-xl bg-background/20 px-3 py-1 text-sm font-bold backdrop-blur">
                  {formatLkr(total)}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      <BottomNav />

      {promoOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setPromoOpen(false)}>
          <div
            className="w-full max-w-[440px] rounded-t-3xl bg-neutral-900 p-6 pb-10 text-white shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-black">{t("promo.modalTitle")}</h3>
              <button
                onClick={() => setPromoOpen(false)}
                className="press grid h-9 w-9 place-items-center rounded-full bg-white/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 focus-within:ring-primary">
              <Tag className="h-4 w-4 text-primary" />
              <input
                autoFocus
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value); if (promoError) setPromoError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                placeholder={t("promo.placeholder")}
                className="flex-1 bg-transparent text-sm font-semibold uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-white/40"
              />
            </div>
            {promoError && (
              <p className="mt-3 text-xs font-semibold text-red-400 animate-fade-up">{promoError}</p>
            )}
            <button
              onClick={applyPromo}
              className="press mt-5 w-full rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground shadow-glow"
            >
              {t("promo.apply")}
            </button>
          </div>
        </div>
      )}



      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-8 backdrop-blur-xl animate-fade-up">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-green-500/15 animate-scale-in">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-green-500 shadow-glow">
              <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="mt-8 text-center font-display text-2xl font-black">
            {t("cartPages.successTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("cartPages.successSub")}
          </p>
          <button
            onClick={() => {
              cartStore.clear();
              setSuccess(false);
              navigate({ to: "/track" });
            }}
            className="press mt-8 w-full max-w-xs rounded-2xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground shadow-glow"
          >
            {t("cartPages.trackOrder")}
          </button>
        </div>
      )}
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
