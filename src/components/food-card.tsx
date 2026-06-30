import { Link } from "@tanstack/react-router";
import { Heart, Star, Plus, Clock } from "lucide-react";
import type { Food } from "@/lib/food-data";
import { cartStore, useFavorites } from "@/lib/cart-store";
import { formatLkr } from "@/lib/food-data";
import { useI18n } from "@/lib/i18n";


export function FoodCard({ food, index = 0 }: { food: Food; index?: number }) {
  const favs = useFavorites();
  const { t } = useI18n();
  const isFav = favs.has(food.id);
  const displayName = food.nameKey ? t(food.nameKey) : food.name;
  return (
    <div
      className="press group animate-fade-up overflow-hidden rounded-3xl bg-card shadow-soft transition-shadow hover:shadow-card"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link to="/food/$id" params={{ id: food.id }} className="block">
        <div className="relative aspect-[5/4] overflow-hidden">
          <img
            src={food.image}
            alt={displayName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              cartStore.toggleFav(food.id);
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/90 backdrop-blur press"
            aria-label="Favorite"
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isFav ? "fill-destructive text-destructive scale-110" : "text-foreground"
              }`}
            />
          </button>
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {food.rating}
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {food.restaurant}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-tight text-foreground">
              {displayName}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => cartStore.add(food.id)}
            className="press grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-foreground text-background shadow-soft transition-transform hover:scale-105"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-primary">{formatLkr(food.price)}</p>
          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Clock className="h-3 w-3" /> {food.time}
          </span>
        </div>
        <div>
          {food.deliveryFee === 0 ? (
            <span className="inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Free Delivery
            </span>
          ) : (
            <span className="inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {formatLkr(food.deliveryFee)} delivery
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
