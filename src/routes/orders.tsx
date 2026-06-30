import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Receipt, Clock, CheckCircle, MapPin, ChevronRight, Map, RotateCcw, Star } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { formatLkr } from "@/lib/food-data";
import { cartStore } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Your orders — QuickBite" }] }),
  component: OrdersPage,
});

const activeOrders = [
  {
    id: "ORD-7829",
    restaurant: "Colombo Burger Co.",
    items: "Spicy Chicken Burger + Fries",
    total: 2450,
    status: "On the way",
    eta: "8 min",
    date: "Today",
    foodId: "2",
  },
];

const pastOrders = [
  {
    id: "ORD-7721",
    restaurant: "Nihon Bashi",
    items: "Salmon Nigiri Set",
    total: 3200,
    status: "Delivered",
    date: "Yesterday",
    foodId: "5",
  },
  {
    id: "ORD-7614",
    restaurant: "Kottu King",
    items: "Cheese Kottu + Egg",
    total: 950,
    status: "Delivered",
    date: "Jun 14",
    foodId: "3",
  },
  {
    id: "ORD-7533",
    restaurant: "Taco Bell Colombo",
    items: "Crunchwrap Supreme",
    total: 1800,
    status: "Cancelled",
    date: "Jun 10",
    foodId: "2",
  },
];

function OrdersPage() {
  const { t } = useI18n();
  const [ratingHover, setRatingHover] = useState<Record<string, number>>({});

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-6 animate-fade-up">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("orders.title")}</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="flex-1 px-5 pt-4">
        {/* Active orders */}
        {activeOrders.length > 0 && (
          <section className="animate-fade-up">
            <h2 className="pl-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("orders.active")}</h2>
            <div className="mt-3 space-y-3">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl bg-card shadow-soft"
                >
                  <Link
                    to="/track"
                    className="press flex items-center gap-3 p-4"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-muted-foreground">{order.restaurant}</p>
                      <h3 className="truncate font-bold">{order.items}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <MapPin className="h-3 w-3" /> {order.status}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {order.eta}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold">{formatLkr(order.total)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                  <Link
                    to="/track"
                    className="press flex items-center justify-center gap-2 border-t border-border bg-surface/50 px-4 py-3 text-xs font-bold text-primary"
                  >
                    <Map className="h-3.5 w-3.5" /> {t("orders.track")}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past orders */}
        <section className={`${activeOrders.length > 0 ? "mt-8" : ""} animate-fade-up`} style={{ animationDelay: "120ms" }}>
          <h2 className="pl-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("orders.history")}</h2>
          <div className="mt-3 space-y-3">
            {pastOrders.map((order, i) => (
              <div
                key={order.id}
                className="flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-soft animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${order.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
                  {order.status === "Delivered" ? <CheckCircle className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground">{order.restaurant}</p>
                  <h3 className="truncate font-bold">{order.items}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${order.status === "Cancelled" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground"}`}>
                      {order.status}
                    </span>
                    <span className="text-muted-foreground">{order.date}</span>
                  </div>

                  {order.status === "Delivered" && (
                    <button
                      type="button"
                      className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground press"
                      onClick={() => { /* future: open rating modal */ }}
                    >
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 transition-colors ${
                              (ratingHover[order.id] || 0) >= star
                                ? "fill-primary text-primary"
                                : "fill-transparent text-primary/40"
                            }`}

                            onMouseEnter={() =>
                              setRatingHover((prev) => ({ ...prev, [order.id]: star }))
                            }
                            onMouseLeave={() =>
                              setRatingHover((prev) => { const { [order.id]: _, ...rest } = prev; return rest; })
                            }
                          />
                        ))}
                      </div>
                      <span className="font-medium">Rate Order</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold">{formatLkr(order.total)}</span>
                  {(order.status === "Delivered" || order.status === "Cancelled") && (
                    <button
                      type="button"
                      onClick={() => cartStore.add(order.foodId)}
                      className="press flex items-center gap-1 rounded-xl bg-foreground px-3 py-1.5 text-[10px] font-bold text-background shadow-soft"
                    >
                      <RotateCcw className="h-3 w-3" /> Reorder
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}
