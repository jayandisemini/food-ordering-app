import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Heart, Receipt, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BottomNav() {
  const location = useLocation();
  const { t } = useI18n();

  const tabs = [
    { to: "/home", icon: Home, label: t("nav.home") },
    { to: "/search", icon: Search, label: t("nav.search") },
    { to: "/favorites", icon: Heart, label: t("nav.saved") },
    { to: "/orders", icon: Receipt, label: t("nav.orders") },
    { to: "/profile", icon: User, label: t("nav.profile") },
  ] as const;

  return (
    <nav className="sticky bottom-0 z-40 mx-auto w-full max-w-[440px] px-4 pb-4 pt-2">
      <div className="flex items-center justify-around rounded-3xl border border-border bg-surface/95 px-2 py-2 shadow-card backdrop-blur-xl">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to === "/home" && location.pathname === "/");
          return (
            <Link
              key={to}
              to={to}
              className="press relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2"
            >
              <div
                className={`relative grid h-10 w-10 place-items-center rounded-2xl transition-all ${
                  active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <span className={`text-[10px] font-medium leading-tight text-center ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
