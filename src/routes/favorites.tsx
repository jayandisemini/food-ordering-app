import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowLeft, Plus, Star, Clock, Heart, Eye, EyeOff, Search, X, Check } from "lucide-react";
import { foods, formatLkr, type Food } from "@/lib/food-data";
import { useFavorites, cartStore } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";
import { FoodCard } from "@/components/food-card";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Saved — QuickBite" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const favs = useFavorites();
  const [activeTab, setActiveTab] = useState<"dishes" | "restaurants">("dishes");
  const [hasSavedItems, setHasSavedItems] = useState(true);
  const [query, setQuery] = useState("");
  const [customizing, setCustomizing] = useState<Food | null>(null);
  const [portion, setPortion] = useState<"Regular" | "Large">("Regular");
  const [crust, setCrust] = useState<"Classic" | "Thin" | "Cheesy">("Classic");

  /* ---- mock data for demo filled state ---- */
  const mockFavItems = foods.slice(0, 4);
  const mockRestaurantNames = Array.from(new Set(mockFavItems.map((f) => f.restaurant)));
  const mockRestaurants = mockRestaurantNames.map((name) => {
    const items = mockFavItems.filter((f) => f.restaurant === name);
    const top = items.sort((a, b) => b.rating - a.rating)[0];
    return { name, rating: top.rating, time: top.time, image: top.image, id: top.id };
  });

  const rawFavItems = hasSavedItems ? mockFavItems : foods.filter((f) => favs.has(f.id));
  const rawRestaurants = hasSavedItems
    ? mockRestaurants
    : Array.from(new Set(rawFavItems.map((f) => f.restaurant))).map((name) => {
        const items = rawFavItems.filter((f) => f.restaurant === name);
        const top = items.sort((a, b) => b.rating - a.rating)[0];
        return { name, rating: top.rating, time: top.time, image: top.image, id: top.id };
      });

  const q = query.trim().toLowerCase();
  const favItems = useMemo(
    () =>
      q
        ? rawFavItems.filter(
            (f) => f.name.toLowerCase().includes(q) || f.restaurant.toLowerCase().includes(q),
          )
        : rawFavItems,
    [rawFavItems, q],
  );
  const restaurants = useMemo(
    () => (q ? rawRestaurants.filter((r) => r.name.toLowerCase().includes(q)) : rawRestaurants),
    [rawRestaurants, q],
  );

  const hasAnySaved = rawFavItems.length > 0 || rawRestaurants.length > 0;
  const isEmpty =
    activeTab === "dishes"
      ? rawFavItems.length === 0
      : rawRestaurants.length === 0;

  const recs = foods.slice(0, 3);
  const allRestaurantNames = Array.from(new Set(foods.map((f) => f.restaurant)));
  const recRestaurants = allRestaurantNames.slice(0, 3).map((name) => {
    const items = foods.filter((f) => f.restaurant === name);
    const top = items.sort((a, b) => b.rating - a.rating)[0];
    return { name, rating: top.rating, time: top.time, image: top.image, id: top.id };
  });

  const handleClearAll = () => {
    if (hasSavedItems) {
      setHasSavedItems(false);
    } else {
      favs.forEach((id) => cartStore.toggleFav(id));
    }
    setQuery("");
  };

  const openCustomize = (food: Food) => {
    setPortion("Regular");
    setCrust("Classic");
    setCustomizing(food);
  };

  const confirmCustomize = () => {
    if (customizing) {
      cartStore.add(customizing.id);
      setCustomizing(null);
    }
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-3 px-5 pt-6 animate-fade-up">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("saved.title")}</h1>
        <div className="flex items-center gap-2">
          {hasAnySaved && (
            <button
              type="button"
              onClick={handleClearAll}
              className="press text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {t("saved.clearAll")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setHasSavedItems((s) => !s)}
            className="press grid h-9 w-9 place-items-center rounded-xl bg-surface shadow-soft"
            aria-label={hasSavedItems ? t("saved.hideItems") : t("saved.showItems")}
          >
            {hasSavedItems ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Segmented tabs */}
      <div className="mt-4 px-5 animate-fade-up">
        <div className="flex rounded-2xl bg-surface p-1 shadow-soft">
          <button
            onClick={() => setActiveTab("dishes")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "dishes"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("saved.dishes")}
          </button>
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "restaurants"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("saved.restaurants")}
          </button>
        </div>
      </div>

      {/* Mini search bar */}
      {!isEmpty && (
        <div className="mt-3 px-5 animate-fade-up">
          <div className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("saved.searchPlaceholder")}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="press grid h-5 w-5 place-items-center rounded-full bg-muted-foreground/20"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-5 pt-4 flex-1">
        {isEmpty ? (
          <div className="mt-16 flex flex-col items-center text-center animate-fade-up">
            <div className="text-6xl">{activeTab === "dishes" ? "💛" : "🏪"}</div>
            <h2 className="mt-4 font-display text-2xl font-black">
              {activeTab === "dishes" ? t("saved.noDishes") : t("saved.noRestaurants")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "dishes"
                ? t("saved.dishesSub")
                : t("saved.restaurantsSub")}
            </p>
            <Link
              to="/home"
              className="press mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              {t("saved.exploreMenu")}
            </Link>
          </div>
        ) : activeTab === "dishes" ? (
          favItems.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              No saved dishes match “{query}”.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favItems.map((f, i) => (
                <div key={f.id} onClick={(e) => e.stopPropagation()}>
                  <FoodCardCustom food={f} index={i} onAdd={() => openCustomize(f)} />
                </div>
              ))}
            </div>
          )
        ) : restaurants.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No saved restaurants match “{query}”.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {restaurants.map((r, i) => (
              <Link
                key={r.name}
                to="/food/$id"
                params={{ id: r.id }}
                className="press flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">{r.name}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {r.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {r.time}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const ids = foods.filter((f) => f.restaurant === r.name).map((f) => f.id);
                    ids.forEach((id) => {
                      if (favs.has(id)) cartStore.toggleFav(id);
                    });
                  }}
                  className="press grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface"
                  aria-label="Unfavorite restaurant"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-4 px-5 pb-2 animate-fade-up">
        <h2 className="font-display text-lg font-black">
          {activeTab === "dishes" ? t("saved.popularDishes") : t("saved.popularRestaurants")}
        </h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory touch-pan-x pb-2">
          {activeTab === "dishes"
            ? recs.map((f, i) => (
                <div
                  key={f.id}
                  className="press w-40 shrink-0 snap-start animate-fade-up overflow-hidden rounded-2xl bg-card shadow-soft"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Link to="/food/$id" params={{ id: f.id }} className="block">
                    <div className="relative h-28 overflow-hidden">
                      <img src={f.image} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          cartStore.toggleFav(f.id);
                        }}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface/90 backdrop-blur"
                        aria-label="Favorite"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 transition-all ${
                            favs.has(f.id) ? "fill-destructive text-destructive scale-110" : "text-foreground"
                          }`}
                        />
                      </button>
                    </div>
                  </Link>
                  <div className="p-2.5">
                    <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {f.restaurant}
                    </p>
                    <h3 className="mt-0.5 line-clamp-1 text-xs font-bold text-foreground">{f.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-primary">{formatLkr(f.price)}</p>
                      <button
                        type="button"
                        onClick={() => cartStore.add(f.id)}
                        className="press grid h-7 w-7 place-items-center rounded-xl bg-foreground text-background shadow-soft"
                        aria-label="Add to cart"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            : recRestaurants.map((r, i) => (
                <Link
                  key={r.name}
                  to="/food/$id"
                  params={{ id: r.id }}
                  className="press w-40 shrink-0 snap-start animate-fade-up overflow-hidden rounded-2xl bg-card shadow-soft"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="relative h-28 overflow-hidden">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-foreground">{r.name}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {r.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {r.time}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>

      <div className="h-4" />
      <BottomNav />

      {/* Customize slide-up sheet */}
      {customizing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in"
          onClick={() => setCustomizing(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-card animate-slide-in-right"
            style={{ animation: "fade-in 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            <div className="flex items-center gap-3">
              <img src={customizing.image} alt={customizing.name} className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-foreground">{customizing.name}</h3>
                <p className="text-xs text-muted-foreground">{customizing.restaurant}</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizing(null)}
                className="press grid h-8 w-8 place-items-center rounded-full bg-surface"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Portion size</p>
              <div className="flex gap-2">
                {(["Regular", "Large"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPortion(p)}
                    className={`press flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      portion === p
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-surface text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Style / Crust</p>
              <div className="flex gap-2">
                {(["Classic", "Thin", "Cheesy"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrust(c)}
                    className={`press flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                      crust === c
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-surface text-foreground"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={confirmCustomize}
              className="press mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
            >
              <Check className="h-4 w-4" /> Add to cart · {formatLkr(customizing.price)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FoodCardCustom({
  food,
  index,
  onAdd,
}: {
  food: Food;
  index: number;
  onAdd: () => void;
}) {
  const favs = useFavorites();
  const isFav = favs.has(food.id);
  return (
    <div
      className="press group animate-fade-up overflow-hidden rounded-3xl bg-card shadow-soft"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link to="/food/$id" params={{ id: food.id }} className="block">
        <div className="relative aspect-[5/4] overflow-hidden">
          <img
            src={food.image}
            alt={food.name}
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
                isFav ? "fill-primary text-primary scale-110" : "text-foreground"
              }`}
            />
          </button>
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur">
            <Star className="h-3 w-3 fill-primary text-primary" /> {food.rating}
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
              {food.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
            className="press grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-foreground text-background shadow-soft"
            aria-label="Customize and add to cart"
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
      </div>
    </div>
  );
}
