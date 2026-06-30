import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Bell, Search, Star, Clock, Flame, ShoppingBag } from "lucide-react";
import { categories, foods } from "@/lib/food-data";
import { FoodCard } from "@/components/food-card";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import bannerImg from "@/assets/banner-feast.jpg";


export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "QuickBite — Discover" }] }),
  component: Home,
});

const banners = [
  { title: "50% OFF first order", sub: "Use code WELCOME50 at checkout", img: bannerImg, tone: "from-primary to-primary-glow" },
  { title: "Free delivery weekend", sub: "On orders over Rs 2,000 — Fri to Sun", img: bannerImg, tone: "from-foreground to-foreground/70" },
  { title: "Late-night cravings?", sub: "Open kitchens until 2 AM", img: bannerImg, tone: "from-primary-glow to-primary" },

];

function Home() {
  const [cat, setCat] = useState("all");
  const [bannerIdx, setBannerIdx] = useState(0);
  const { profile } = useAuth();
  const { t } = useI18n();
  const firstName = (profile?.display_name ?? "there").split(" ")[0];

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = cat === "all" ? foods : foods.filter((f) => f.category === cat);
  const trending = foods.slice(0, 4);

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background pb-2">
      {/* Header */}
      <header className="px-5 pt-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Deliver to
            </p>
            <p className="mt-0.5 text-sm font-bold">Colombo 03, Sri Lanka</p>
          </div>
          <HeaderActions firstName={firstName} avatarUrl={profile?.avatar_url} />

        </div>

        <h1 className="mt-5 font-display text-3xl font-black leading-tight">
          Hi {firstName} 👋<br />
          What's making you <span className="text-primary">hungry</span>?
        </h1>

        <Link
          to="/search"
          className="press mt-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-soft"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("home.searchPlaceholder")}</span>
        </Link>
      </header>

      {/* Promo banner */}
      <div className="mt-5 px-5">
        <div className="relative h-32 overflow-hidden rounded-3xl shadow-card">
          {banners.map((b, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ${
                idx === bannerIdx ? "opacity-100 translate-x-0" : idx < bannerIdx ? "-translate-x-full opacity-0" : "translate-x-full opacity-0"
              }`}
            >
              <img src={b.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${b.tone} opacity-95`} />
              <div className="absolute inset-0 bg-foreground/35" />
              <div className="relative flex h-full flex-col justify-center p-5 text-white drop-shadow-md">
                <span className="w-fit rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  Limited
                </span>
                <h3 className="mt-2 font-display text-xl font-black leading-tight text-white">{b.title}</h3>
                <p className="mt-1 text-xs text-white/90">{b.sub}</p>

              </div>
            </div>
          ))}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {banners.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${idx === bannerIdx ? "w-5 bg-background" : "w-1 bg-background/50"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between px-5">
          <h2 className="font-display text-xl font-black">{t("home.categories")}</h2>
          <button className="text-xs font-semibold text-muted-foreground">See all</button>
        </div>
        <div className="no-scrollbar mt-3 flex snap-x snap-proximity gap-2.5 overflow-x-auto scroll-smooth pb-2 pl-5 pr-2 touch-pan-x">
          {categories.map((c, i) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`press shrink-0 snap-start animate-fade-up rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface text-foreground shadow-soft hover:bg-surface-muted"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="mr-1.5">{c.emoji}</span>
                {c.name}
              </button>
            );
          })}
          <div className="w-3 shrink-0" />
        </div>
      </div>

      {/* Popular */}
      <div className="mt-7 px-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-black">
            <Flame className="mr-1 inline h-5 w-5 text-primary" />
            {t("home.popular")}
          </h2>
          <button className="text-xs font-semibold text-muted-foreground">See all</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {filtered.slice(0, 6).map((f, i) => (
            <FoodCard key={f.id} food={f} index={i} />
          ))}
        </div>
      </div>

      {/* Trending restaurants */}
      <div className="mt-8 px-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-black">{t("home.trendingRestaurants")}</h2>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          {trending.map((f, i) => (
            <Link
              key={f.id}
              to="/food/$id"
              params={{ id: f.id }}
              className="press w-64 shrink-0 animate-fade-up overflow-hidden rounded-3xl bg-card shadow-soft"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative h-32 overflow-hidden">
                <img src={f.image} alt={f.restaurant} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/70 to-transparent" />
                <span className="absolute bottom-2 left-3 text-sm font-bold text-background">
                  {f.restaurant}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {f.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {f.time}
                </span>
                <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                  Free delivery
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}

function HeaderActions({ firstName, avatarUrl }: { firstName: string; avatarUrl: string | null | undefined }) {
  const cart = useCart();
  const count = cart.reduce((a, b) => a + b.qty, 0);
  const initial = firstName.charAt(0).toUpperCase() || "U";
  return (
    <div className="flex items-center gap-2.5">
      <Link
        to="/cart"
        className="press relative grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        aria-label="Cart"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-scale-in">
            {count}
          </span>
        )}
      </Link>
      <button className="press relative grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
      </button>
      <Link to="/profile" aria-label="Profile" className="press">
        <Avatar className="h-11 w-11 ring-2 ring-primary/60 shadow-soft">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
}

