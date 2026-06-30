import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Star, Clock, MapPin, Heart } from "lucide-react";
import { foods, findFood, formatLkr } from "@/lib/food-data";
import { cartStore } from "@/lib/cart-store";

export const Route = createFileRoute("/restaurant/$id")({
  head: ({ params }) => {
    const f = findFood(params.id);
    return { meta: [{ title: f ? `${f.restaurant} — QuickBite` : "Restaurant — QuickBite" }] };
  },
  component: RestaurantDetail,
});

function RestaurantDetail() {
  const { id } = Route.useParams();
  const main = findFood(id);
  const navigate = useNavigate();
  if (!main) return <div className="phone-frame grid min-h-dvh place-items-center">Not found</div>;

  const menu = foods.filter((f) => f.restaurant === main.restaurant || f.category === main.category).slice(0, 8);

  return (
    <div className="phone-frame min-h-dvh bg-background pb-32">
      <div className="relative h-56 overflow-hidden">
        <img src={main.image} alt={main.restaurant} className="h-full w-full object-cover animate-scale-in" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-foreground/20" />
        <button
          onClick={() => navigate({ to: "/home" })}
          className="press absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-2xl bg-surface/90 shadow-soft backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button className="press absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-2xl bg-surface/90 shadow-soft backdrop-blur">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="relative -mt-12 rounded-t-[2.5rem] bg-background px-5 pt-6 animate-slide-up">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
        <h1 className="mt-4 font-display text-2xl font-black">{main.restaurant}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{main.category} · $$ · 1.2 km away</p>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-bold">
            <Star className="h-4 w-4 fill-primary text-primary" /> {main.rating}
            <span className="text-xs font-medium text-muted-foreground">(2.4k)</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" /> {main.time}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" /> Colombo
          </span>
        </div>

        <h2 className="mt-7 font-display text-lg font-black">Menu</h2>
        <ul className="mt-3 space-y-3">
          {menu.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-3 animate-fade-up rounded-3xl bg-card p-3 shadow-soft"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Link to="/food/$id" params={{ id: f.id }} className="flex flex-1 items-center gap-3">
                <img src={f.image} alt={f.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{f.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                  <p className="mt-1 font-bold text-primary">{formatLkr(f.price)}</p>
                </div>
              </Link>
              <button
                onClick={() => cartStore.add(f.id)}
                className="press grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background"
              >
                +
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
