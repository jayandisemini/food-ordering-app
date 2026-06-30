import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search as SearchIcon,
  X,
  Mic,
  Clock,
  Star,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { foods, formatLkr } from "@/lib/food-data";
import { cartStore } from "@/lib/cart-store";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — QuickBite" }] }),
  component: SearchPage,
});

const filterChips = [
  { key: "topRated", emoji: "⭐" },
  { key: "fastDelivery", emoji: "🚀" },
  { key: "budgetFriendly", emoji: "💰" },
] as const;
type FilterKey = (typeof filterChips)[number]["key"];

const initialRecents = ["Chicken Biryani", "Submarine", "Cheese Kottu"];

const priceRanges = ["Budget", "Mid-range", "Premium"];
const dietary = ["Halal", "Vegetarian"];

function SearchPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [recents, setRecents] = useState<string[]>(initialRecents);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [diet, setDiet] = useState<string[]>([]);
  const [tab, setTab] = useState<"dishes" | "restaurants">("dishes");

  // Trending visual items (6, 2x3 grid)
  const trending = useMemo(() => foods.slice(0, 6), []);
  // Past orders (3)
  const pastOrders = useMemo(() => [foods[2], foods[1], foods[3]].filter(Boolean), []);
  const popularRestaurants = useMemo(() => foods.slice(0, 5), []);

  const results = q
    ? foods.filter((f) =>
        (f.name + f.restaurant + f.category).toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  const restaurantResults = useMemo(() => {
    const seen = new Set<string>();
    return results.filter((f) => {
      if (seen.has(f.restaurant)) return false;
      seen.add(f.restaurant);
      return true;
    });
  }, [results]);

  const toggleFilter = (key: FilterKey) =>
    setActiveFilter((p) => (p === key ? null : key));
  const toggleDiet = (label: string) =>
    setDiet((p) => (p.includes(label) ? p.filter((l) => l !== label) : [...p, label]));
  const removeRecent = (item: string) =>
    setRecents((p) => p.filter((r) => r !== item));

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background pb-24">
      <header className="flex items-center gap-3 px-5 pt-6 animate-fade-up">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-soft">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q ? (
            <button onClick={() => setQ("")} className="press" aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="press grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"
                aria-label="Voice search"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="press grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
                aria-label="Advanced filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Filter chips */}
      <div className="mt-4 no-scrollbar flex gap-2 overflow-x-auto scroll-smooth pb-1 pl-5 pr-2 touch-pan-x">
        {filterChips.map((c, i) => {
          const active = activeFilter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => toggleFilter(c.key)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`press shrink-0 animate-fade-up rounded-full px-4 py-2 text-xs font-bold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-surface text-foreground shadow-soft"
              }`}
            >
              <span className="mr-1">{c.emoji}</span>
              {t(`searchFilters.${c.key}`)}
            </button>
          );
        })}
        <div className="w-3 shrink-0" />
      </div>

      {!q && activeFilter && (
        <section className="mt-5 px-5 animate-fade-up">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("searchFilters.resultsTitle")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(() => {
              const parseTime = (s: string) => parseInt(s, 10) || 999;
              let list = [...foods];
              if (activeFilter === "topRated") list.sort((a, b) => b.rating - a.rating);
              else if (activeFilter === "fastDelivery") list.sort((a, b) => parseTime(a.time) - parseTime(b.time));
              else if (activeFilter === "budgetFriendly") list = list.filter((f) => f.price < 1000).sort((a, b) => a.price - b.price);
              return list.map((f, i) => (
                <div
                  key={f.id}
                  className="flex animate-fade-up flex-col gap-2 rounded-2xl bg-card p-2.5 shadow-soft"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Link to="/food/$id" params={{ id: f.id }}>
                    <img src={f.image} alt={f.name} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                  </Link>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[12px] font-bold text-foreground">{f.name}</p>
                      <p className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Star className="h-3 w-3 fill-primary text-primary" /> {f.rating}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{f.time}</span>
                      </p>
                      <p className="mt-1 text-[11px] font-bold text-primary">{formatLkr(f.price)}</p>
                    </div>
                    <button
                      onClick={() => cartStore.add(f.id)}
                      className="press grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-foreground text-background"
                      aria-label={`Add ${f.name}`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>
      )}

      {!q && !activeFilter && (
        <>
          {/* Recent searches */}
          {recents.length > 0 && (
            <section className="mt-6 px-5 animate-fade-up">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("search.recent")}
              </h3>
              <ul className="mt-3 space-y-2">
                {recents.map((item, i) => (
                  <li
                    key={item}
                    className="press flex animate-fade-up items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-soft"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => setQ(item)}
                      className="flex-1 text-left text-sm font-medium text-foreground"
                    >
                      {item}
                    </button>
                    <button
                      onClick={() => removeRecent(item)}
                      className="press grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-surface-muted"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Order again */}
          <section className="mt-7 animate-fade-up">
            <div className="flex items-baseline justify-between px-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("search.orderAgain")}
              </h3>
              <Link to="/orders" className="text-[11px] font-semibold text-primary">
                See all
              </Link>
            </div>
            <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto scroll-smooth pl-5 pr-2 pb-2 touch-pan-x">
              {pastOrders.map((f, i) => (
                <div
                  key={f.id}
                  className="flex w-20 shrink-0 flex-col items-center gap-1.5 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="relative">
                    <Link to="/food/$id" params={{ id: f.id }}>
                      <img
                        src={f.image}
                        alt={f.name}
                        loading="lazy"
                        className="h-20 w-20 rounded-full object-cover shadow-soft ring-2 ring-surface"
                      />
                    </Link>
                    <button
                      onClick={() => cartStore.add(f.id)}
                      className="press absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"
                      aria-label={`Add ${f.name}`}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                  </div>
                  <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-foreground">
                    {f.name}
                  </span>
                </div>
              ))}
              <div className="w-3 shrink-0" />
            </div>
          </section>

          {/* Visual Trending Grid */}
          <section className="mt-7 px-5 animate-fade-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("search.trending")}
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {trending.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => setQ(f.name)}
                  className="press flex animate-fade-up flex-col items-center gap-2 rounded-2xl bg-surface p-3 shadow-soft"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={f.image}
                    alt={f.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30"
                  />
                  <span className="line-clamp-1 text-[11px] font-bold text-foreground">
                    {f.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Popular restaurants */}
          <section className="mt-7 px-5 animate-fade-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("search.popularRestaurants")}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {popularRestaurants.map((f, i) => (
                <li key={f.id}>
                  <Link
                    to="/food/$id"
                    params={{ id: f.id }}
                    className="press flex animate-fade-up items-center gap-3 rounded-2xl bg-card p-2.5 shadow-soft"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <img
                      src={f.image}
                      alt={f.restaurant}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {f.restaurant}
                      </p>
                      <p className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Star className="h-3 w-3 fill-primary text-primary" /> {f.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {f.time}
                        </span>
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Open
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {q && (
        <div className="mt-5 px-5 animate-fade-up">
          {/* Segmented tabs */}
          <div className="flex rounded-2xl bg-surface p-1 shadow-soft">
            {(["dishes", "restaurants"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold capitalize transition-all ${
                  tab === t
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground"
                }`}
              >
                {t} {tab === t ? `(${t === "dishes" ? results.length : restaurantResults.length})` : ""}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Results for "{q}"
          </p>

          {tab === "dishes" ? (
            <ul className="mt-3 space-y-2.5">
              {results.map((f, i) => (
                <li
                  key={f.id}
                  className="flex animate-fade-up items-center gap-3 rounded-2xl bg-card p-2.5 shadow-soft"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Link to="/food/$id" params={{ id: f.id }} className="shrink-0">
                    <img
                      src={f.image}
                      alt={f.name}
                      loading="lazy"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  </Link>
                  <Link to="/food/$id" params={{ id: f.id }} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{f.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{f.restaurant}</p>
                    <p className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-bold text-primary">{formatLkr(f.price)}</span>
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-primary text-primary" /> {f.rating}
                      </span>
                    </p>
                  </Link>
                  <button
                    onClick={() => cartStore.add(f.id)}
                    className="press grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-foreground text-background shadow-soft"
                    aria-label={`Add ${f.name}`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {restaurantResults.map((f, i) => (
                <li key={f.id}>
                  <Link
                    to="/food/$id"
                    params={{ id: f.id }}
                    className="press flex animate-fade-up items-center gap-3 rounded-2xl bg-card p-2.5 shadow-soft"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <img
                      src={f.image}
                      alt={f.restaurant}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{f.restaurant}</p>
                      <p className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Star className="h-3 w-3 fill-primary text-primary" /> {f.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {f.time}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 && (
            <div className="mt-16 text-center text-sm text-muted-foreground animate-fade-up">
              Nothing matched. Try a different keyword.
            </div>
          )}
        </div>
      )}

      {/* Advanced filters bottom sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/40 bg-background"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl font-black">Filters</SheetTitle>
            <SheetDescription>Refine your discovery</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Price Range
            </h4>
            <div className="mt-3 flex gap-2">
              {priceRanges.map((p) => {
                const active = priceFilter === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriceFilter(active ? null : p)}
                    className={`press flex-1 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-surface text-foreground shadow-soft"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dietary
            </h4>
            <div className="mt-3 flex gap-2">
              {dietary.map((d) => {
                const active = diet.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDiet(d)}
                    className={`press rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-surface text-foreground shadow-soft"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex gap-3 pb-4">
            <button
              onClick={() => {
                setPriceFilter(null);
                setDiet([]);
              }}
              className="press flex-1 rounded-2xl bg-surface px-4 py-3 text-sm font-bold shadow-soft"
            >
              Reset
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="press flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Apply
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />
      <BottomNav />
    </div>
  );
}
