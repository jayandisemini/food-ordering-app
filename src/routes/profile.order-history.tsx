import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Receipt, RotateCcw, Search, Star, X } from "lucide-react";
import { cartStore } from "@/lib/cart-store";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/profile/order-history")({
  head: () => ({ meta: [{ title: "Order History — QuickBite" }] }),
  component: OrderHistoryPage,
});

type Status = "delivered" | "cancelled";

const ORDERS: {
  id: string;
  restaurant: string;
  date: string;
  total: string;
  items: string;
  status: Status;
  foodIds: string[];
}[] = [
  {
    id: "QB-2841",
    restaurant: "Kottu King",
    date: "Jun 27, 2026 · 8:42 PM",
    total: "Rs 2,450",
    items: "Cheese Kottu · Chicken Devilled",
    status: "delivered",
    foodIds: ["3"],
  },
  {
    id: "QB-2790",
    restaurant: "Pizza Hut Colombo",
    date: "Jun 22, 2026 · 1:15 PM",
    total: "Rs 3,180",
    items: "Pepperoni Large · Garlic Bread",
    status: "delivered",
    foodIds: ["1"],
  },
  {
    id: "QB-2701",
    restaurant: "Burger King",
    date: "Jun 18, 2026 · 7:05 PM",
    total: "Rs 2,190",
    items: "Whopper Meal • Fries",
    status: "cancelled",
    foodIds: ["2"],
  },
];

function OrderHistoryPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [rateFor, setRateFor] = useState<{ id: string; restaurant: string } | null>(null);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ORDERS;
    return ORDERS.filter(
      (o) =>
        o.restaurant.toLowerCase().includes(q) ||
        o.items.toLowerCase().includes(q),
    );
  }, [query]);

  const reorder = (order: (typeof ORDERS)[number]) => {
    order.foodIds.forEach((id) => cartStore.add(id, 1));
    toast.success(t("accountPages.reorderToast"));
    setTimeout(() => navigate({ to: "/cart" }), 1000);
  };

  const openRate = (order: { id: string; restaurant: string }) => {
    setRateFor({ id: order.id, restaurant: order.restaurant });
    setStars(0);
    setFeedback("");
  };

  const submitRate = () => {
    setRateFor(null);
    toast.success(t("accountPages.rateThanks"));
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster position="top-center" />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/profile" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("accountPages.orderTitle")}</h1>
        <div className="h-11 w-11" />
      </header>

      <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
        {filtered.length} {t("ordersFlat").toLowerCase()}
      </p>

      {/* Search */}
      <div className="px-5 pt-3">
        <div className="flex items-center gap-2 rounded-2xl bg-foreground/90 px-4 py-3 text-background shadow-soft">
          <Search className="h-4 w-4 text-background/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("accountPages.searchOrders")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-background/50"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear" className="press">
              <X className="h-4 w-4 text-background/70" />
            </button>
          )}
        </div>
      </div>

      <ul className="space-y-3 px-5 pt-4">
        {filtered.map((o, i) => {
          const isCancelled = o.status === "cancelled";
          return (
            <li
              key={o.id}
              className="rounded-3xl bg-surface p-4 shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-display text-base font-black">{o.restaurant}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isCancelled
                          ? "bg-red-950/80 text-red-200"
                          : "bg-emerald-500/15 text-emerald-600"
                      }`}
                    >
                      {isCancelled ? t("accountPages.cancelled") : t("accountPages.delivered")}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{o.items}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{o.date}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-display text-lg font-black text-primary">{o.total}</p>
                {isCancelled ? (
                  <button
                    onClick={() => reorder(o)}
                    className="press flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> {t("accountPages.reorder")}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRate(o)}
                      className="press flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {t("accountPages.rate")}
                    </button>
                    <button
                      onClick={() => reorder(o)}
                      className="press flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> {t("accountPages.reorder")}
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="rounded-3xl bg-surface p-8 text-center text-sm text-muted-foreground">
            {t("accountPages.noResults")}
          </li>
        )}
      </ul>

      <div className="h-24" />
      <BottomNav />

      {/* Rate modal */}
      <Dialog open={!!rateFor} onOpenChange={(o) => !o && setRateFor(null)}>
        <DialogContent className="mx-auto max-w-sm rounded-3xl border-0 bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-center font-display text-xl font-black text-white">
              {t("accountPages.rateMealFrom")} {rateFor?.restaurant ?? ""}
            </DialogTitle>
            <DialogDescription className="text-center text-white/60">
              {t("accountPages.rateOrderDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                className="press"
                aria-label={`${n} star`}
              >
                <Star
                  className={`h-9 w-9 transition-transform ${
                    n <= stars
                      ? "fill-amber-400 text-amber-400 scale-110"
                      : "text-white/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t("accountPages.feedbackPlaceholder")}
            rows={3}
            className="w-full resize-none rounded-2xl bg-white/10 p-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={submitRate}
            disabled={stars === 0}
            className="press h-12 w-full rounded-2xl bg-primary font-bold text-primary-foreground shadow-card disabled:opacity-50"
          >
            {t("accountPages.submit")}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
