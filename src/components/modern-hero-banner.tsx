import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Zap, Flame, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import bannerFeast from "@/assets/banner-feast.jpg";
import foodBurger from "@/assets/food-burger.jpg";
import foodPizza from "@/assets/food-pizza.jpg";
import foodKottu from "@/assets/food-kottu.jpg";

const heroBanners = [
  {
    id: "welcome50",
    badge: "Limited Offer",
    badgeIcon: Sparkles,
    badgeColor: "bg-amber-500/30 text-amber-200 border-amber-300/40",
    title: "50% OFF First Feast",
    sub: "Use code WELCOME50 at checkout",
    cta: "Claim 50% Off",
    link: "/search",
    img: foodBurger,
    gradient: "from-orange-600/95 via-amber-600/85 to-red-700/95",
    glow: "shadow-orange-500/30",
  },
  {
    id: "free-delivery",
    badge: "Weekend Special",
    badgeIcon: Zap,
    badgeColor: "bg-emerald-500/30 text-emerald-200 border-emerald-300/40",
    title: "Free Express Delivery",
    sub: "On all orders over Rs. 2,000 — Fri to Sun",
    cta: "Order Now",
    link: "/food/1",
    img: bannerFeast,
    gradient: "from-emerald-700/95 via-teal-700/85 to-cyan-900/95",
    glow: "shadow-emerald-500/30",
  },
  {
    id: "pizza-deal",
    badge: "Hot Deal",
    badgeIcon: Flame,
    badgeColor: "bg-rose-500/30 text-rose-200 border-rose-300/40",
    title: "Woodfired Pizza Special",
    sub: "Buy 1 Large Pizza & get a FREE Drink",
    cta: "Explore Pizzas",
    link: "/food/2",
    img: foodPizza,
    gradient: "from-rose-700/95 via-red-600/85 to-amber-700/95",
    glow: "shadow-rose-500/30",
  },
  {
    id: "late-night",
    badge: "Night Owl",
    badgeIcon: Moon,
    badgeColor: "bg-purple-500/30 text-purple-200 border-purple-300/40",
    title: "Late-Night Cravings",
    sub: "Hot Kottu & Biryani delivered until 2 AM",
    cta: "Order Late Night",
    link: "/food/4",
    img: foodKottu,
    gradient: "from-purple-800/95 via-indigo-700/85 to-blue-950/95",
    glow: "shadow-purple-500/30",
  },
];

export function ModernHeroBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % heroBanners.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    if (diff < -40) handlePrev();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative mt-5 px-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="group relative h-44 sm:h-48 overflow-hidden rounded-3xl border border-white/10 shadow-xl transition-all duration-500">
        {heroBanners.map((banner, idx) => {
          const isActive = idx === currentIdx;
          const BadgeIcon = banner.badgeIcon;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive
                  ? "opacity-100 scale-100 translate-x-0 z-10 pointer-events-auto"
                  : idx < currentIdx
                  ? "opacity-0 scale-95 -translate-x-8 z-0 pointer-events-none"
                  : "opacity-0 scale-95 translate-x-8 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image */}
              <img
                src={banner.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 scale-105 group-hover:scale-110"
              />

              {/* Dynamic Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

              {/* Subtle Animated Decorative Glow Circle */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl animate-pulse" />

              {/* Banner Content */}
              <div className="relative flex h-full flex-col justify-between p-5 text-white">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${banner.badgeColor}`}
                  >
                    <BadgeIcon className="h-3.5 w-3.5 animate-bounce" />
                    {banner.badge}
                  </span>

                  <span className="text-[10px] font-medium tracking-wide text-white/70 backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                    {idx + 1} / {heroBanners.length}
                  </span>
                </div>

                {/* Banner Text & Action */}
                <div className="mt-auto">
                  <h3 className="font-display text-xl sm:text-2xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-white/90 line-clamp-1 drop-shadow-sm">
                    {banner.sub}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      to={banner.link}
                      className="press inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-gray-900 shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                    >
                      {banner.cta}
                      <ArrowRight className="h-3.5 w-3.5 text-orange-600" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (Visible on Desktop / Hover) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="press absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="press absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Progress & Segmented Indicators */}
        <div className="absolute bottom-2 inset-x-5 z-20 flex items-center gap-1.5">
          {heroBanners.map((_, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm transition-all"
              >
                {isActive && (
                  <div
                    key={`bar-${currentIdx}`}
                    className="h-full bg-white shadow-glow animate-[progress_4.5s_linear_infinite]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
