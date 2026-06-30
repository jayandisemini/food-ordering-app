import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, Minus, Plus, Star, Clock, Flame } from "lucide-react";
import { findFood, formatLkr } from "@/lib/food-data";
import { cartStore, useFavorites } from "@/lib/cart-store";

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
  const favs = useFavorites();
  const navigate = useNavigate();
  if (!food) return null;
  const isFav = favs.has(food.id);

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
        <h1 className="mt-3 font-display text-3xl font-black leading-tight">{food.name}</h1>
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
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{food.description}</p>

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
            <p key={qty} className="font-display text-2xl font-black text-primary animate-fade-up">
              {formatLkr(food.price * qty)}
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
          Add to cart · {formatLkr(food.price * qty)}
        </button>
      </div>
    </div>
  );
}
