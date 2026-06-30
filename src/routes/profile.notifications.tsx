import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profile/notifications")({
  head: () => ({ meta: [{ title: "Notifications — QuickBite" }] }),
  component: NotificationsPage,
});

type Notif = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const INITIAL_TODAY: Notif[] = [
  {
    id: "n1",
    emoji: "🚀",
    title: "Order Dispatched",
    body: "Your burger is on the way!",
    time: "10 mins ago",
    unread: true,
  },
  {
    id: "n2",
    emoji: "⭐",
    title: "Rate your last order",
    body: "How was Spicy Chicken Kottu from Kottu King?",
    time: "2 hrs ago",
  },
  {
    id: "n3",
    emoji: "🔥",
    title: "Trending near you",
    body: "Colombo Burger Co. just dropped a new smash burger.",
    time: "5 hrs ago",
  },
];

const INITIAL_YESTERDAY: Notif[] = [
  {
    id: "n4",
    emoji: "🎉",
    title: "Promo",
    body: "Use code BINGE50 to get 50% off your next meal.",
    time: "Yesterday",
  },
  {
    id: "n5",
    emoji: "📦",
    title: "Order Delivered",
    body: "Enjoy your meal from Pizza Palace!",
    time: "Yesterday",
  },
];

export default function NotificationsPage() {
  const { t } = useI18n();
  const [today, setToday] = useState(INITIAL_TODAY);
  const [yesterday, setYesterday] = useState(INITIAL_YESTERDAY);
  const [justMarked, setJustMarked] = useState(false);

  const hasUnread =
    today.some((n) => n.unread) || yesterday.some((n) => n.unread);

  const markAll = () => {
    if (!hasUnread) return;
    setToday((xs) => xs.map((n) => ({ ...n, unread: false })));
    setYesterday((xs) => xs.map((n) => ({ ...n, unread: false })));
    setJustMarked(true);
  };

  useEffect(() => {
    if (!justMarked) return;
    const t = setTimeout(() => setJustMarked(false), 2000);
    return () => clearTimeout(t);
  }, [justMarked]);

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <header className="relative flex items-center justify-between px-5 pt-6">
        <Link
          to="/profile"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("notificationsTitle")}</h1>
        <button
          onClick={markAll}
          disabled={!hasUnread}
          className={`press flex items-center gap-1 text-xs font-semibold transition-colors duration-300 ${
            justMarked
              ? "text-green-500"
              : hasUnread
                ? "text-primary"
                : "text-muted-foreground"
          }`}
        >
          {justMarked ? (
            <>
              <Check className="h-3.5 w-3.5" />
              {t("allRead")}
            </>
          ) : (
            t("markAllRead")
          )}
        </button>
      </header>

      <div className="px-5 pt-5">
        <Section title={t("today")} items={today} />
        <Section title={t("yesterday")} items={yesterday} />
      </div>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}

function Section({ title, items }: { title: string; items: Notif[] }) {
  return (
    <div className="mt-4">
      <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-soft">
        {items.map((n, i) => (
          <li key={n.id}>
            <div
              className={`relative flex items-start gap-3 px-4 py-3.5 transition-colors duration-500 ${
                n.unread ? "bg-primary/10" : ""
              }`}
            >
              {n.unread && (
                <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]" />
              )}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-lg">
                {n.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {n.time}
              </span>
            </div>
            {i < items.length - 1 && <div className="mx-4 h-px bg-border" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
