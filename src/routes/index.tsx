import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickBite — Fast. Fresh. Delivered." },
      { name: "description", content: "Order food from the best restaurants in your city. Fast, fresh, delivered." },
      { property: "og:title", content: "QuickBite — Fast. Fresh. Delivered." },
      { property: "og:description", content: "Order food from the best restaurants in your city." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  const icons = ["🍕", "🍔", "🍰", "🥗", "🍣", "🌮", "🍜", "🥤"];
  return (
    <div className="phone-frame relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-foreground text-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {icons.map((ic, i) => (
          <span
            key={i}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              left: `${(i * 53) % 90 + 5}%`,
              top: `${(i * 71) % 80 + 8}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          >
            {ic}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center animate-scale-in">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-primary text-5xl shadow-glow animate-pulse-glow">
          🍔
        </div>
        <h1 className="mt-6 font-display text-5xl font-black tracking-tight">
          Quick<span className="text-primary">Bite</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-background/70 animate-fade-in" style={{ animationDelay: "400ms" }}>
          Fast. Fresh. Delivered.
        </p>

        <div className="mt-10 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>

      <Link
        to="/onboarding"
        className="absolute bottom-10 z-10 text-xs font-medium text-background/60 underline-offset-4 hover:underline animate-fade-in"
        style={{ animationDelay: "1.2s" }}
      >
        Skip intro →
      </Link>
    </div>
  );
}
