import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Minus, Plus, Star, Clock, Flame } from "lucide-react";
import { findFood, formatLkr } from "@/lib/food-data";
import { cartStore, useFavorites } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/food/$id")({
  head: ({ params }) => {
    const f = findFood(params.id);
    return {
      meta: [
        { title: f ? `${f.name} — QuickBite` : "QuickBite" },
        { name: "description", content: f?.description ?? "" },
        ...(f ? [{ property: "og:image", content: f.image }] : []),
      ],
    };
  },
  component: FoodDetail,
  notFoundComponent: () => <div className="phone-frame grid min-h-dvh place-items-center">Dish not found</div>,
});

function FoodDetail() {
  const { id } = Route.useParams();
  const food = findFood(id);
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState(1);
  const [size, setSize] = useState<"small" | "medium" | "large">("small");
  const [toppings, setToppings] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState("");
  const favs = useFavorites();
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!food) return null;
  const isFav = favs.has(food.id);
  const displayName = food.nameKey ? t(food.nameKey) : food.name;
  const displayDesc = food.descKey ? t(food.descKey) : food.description;

  const toppingList = [
    { id: "cheese", label: "Extra Cheese 🧀", price: 200 },
    { id: "sauce", label: "Special Garlic Sauce 🧄", price: 150 },
    { id: "egg", label: "Fried Egg 🍳", price: 120 },
  ];

  const sizeExtraPrice = size === "medium" ? 250 : size === "large" ? 500 : 0;
  const toppingsPrice = toppings.reduce((acc, tId) => {
    const item = toppingList.find((i) => i.id === tId);
    return acc + (item ? item.price : 0);
  }, 0);

  const unitPrice = food.price + sizeExtraPrice + toppingsPrice;
  const totalPrice = unitPrice * qty;

  return (
    <div className="phone-frame relative min-h-dvh bg-background pb-32">
      {/* Hero */}
      <div className="relative h-[58vh] overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className="h-full w-full object-cover animate-scale-in"
          style={{ animationDuration: "1.2s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-transparent to-background" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface/90 shadow-soft backdrop-blur"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => cartStore.toggleFav(food.id)}
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface/90 shadow-soft backdrop-blur"
          >
            <Heart className={`h-5 w-5 transition-all ${isFav ? "fill-destructive text-destructive scale-110" : ""}`} />
          </button>
        </div>
      </div>

      {/* Sheet */}
      <div className="relative -mt-10 rounded-t-[2.5rem] bg-background px-6 pt-7 animate-slide-up">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
        <div className="mt-4 flex flex-wrap gap-1.5">
          {food.tags.map((t) => (
            <span key={t} className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight">{displayName}</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{food.restaurant}</p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-bold">
            <Star className="h-4 w-4 fill-primary text-primary" /> {food.rating}
            <span className="text-xs font-medium text-muted-foreground">(2.4k)</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" /> {food.time}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className="h-4 w-4" /> 580 kcal
          </span>
        </div>

        <h3 className="mt-7 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{displayDesc}</p>

        {/* Portion Size Selection */}
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Portion Size</h3>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[
            { id: "small", label: "Small (Regular)", extra: 0 },
            { id: "medium", label: "Medium (+Rs 250)", extra: 250 },
            { id: "large", label: "Large (+Rs 500)", extra: 500 },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSize(s.id as "small" | "medium" | "large")}
              className={`rounded-2xl p-3 text-xs font-bold border transition-all text-center ${
                size === s.id
                  ? "border-primary bg-primary/10 text-foreground shadow-soft"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Spice Level Stepper */}
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Spice Level</h3>
        <div className="mt-2.5 flex gap-2">
          {["🌶️ Mild", "🌶️🌶️ Medium", "🔥 Extra Spicy"].map((s, idx) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpice(idx)}
              className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                spice === idx ? "bg-primary text-primary-foreground shadow-glow" : "bg-surface text-muted-foreground hover:bg-surface-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Extra Toppings */}
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customize Extra Toppings</h3>
        <div className="mt-2.5 space-y-2">
          {toppingList.map((t) => {
            const isSelected = toppings.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setToppings((prev) => (prev.includes(t.id) ? prev.filter((i) => i !== t.id) : [...prev, t.id]))
                }
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition-all ${
                  isSelected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-surface text-muted-foreground"
                }`}
              >
                <span>{t.label}</span>
                <span>+{formatLkr(t.price)}</span>
              </button>
            );
          })}
        </div>

        {/* Special Instructions */}
        <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Special Cooking Notes</h3>
        <input
          type="text"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          placeholder="e.g. Less oil, no onions, extra crispy..."
          className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <h3 className="mt-7 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</h3>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-1.5 shadow-soft">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="press grid h-10 w-10 place-items-center rounded-xl bg-background"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span key={qty} className="w-6 text-center font-display text-lg font-black animate-scale-in">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="press grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total</p>
            <p key={totalPrice} className="font-display text-2xl font-black text-primary animate-fade-up">
              {formatLkr(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] px-5 pb-5 pt-3">
        <button
          onClick={() => {
            cartStore.add(food.id, qty);
            navigate({ to: "/cart" });
          }}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground shadow-glow animate-pulse-glow"
        >
          Add to cart · {formatLkr(totalPrice)}
        </button>
      </div>
    </div>
  );
}
