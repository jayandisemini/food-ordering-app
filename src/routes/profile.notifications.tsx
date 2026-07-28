import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Trash2, Bell, Sparkles, ShoppingBag, ShieldCheck, Filter, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/profile/notifications")({
  head: () => ({ meta: [{ title: "Notifications — QuickBite" }] }),
  component: NotificationsPage,
});

export type NotifCategory = "all" | "order" | "offer" | "system";

export type NotifItem = {
  id: string;
  type: "order" | "offer" | "system";
  emoji: string;
  title: string;
  body: string;
  time: string;
  dateGroup: "today" | "yesterday";
  unread: boolean;
  link?: string;
};

const initialDefaultNotifs: NotifItem[] = [
  {
    id: "n-order-1",
    type: "order",
    emoji: "🚴",
    title: "Order #QB-9482 Out for Delivery",
    body: "Your Pepperoni Feast Pizza is on its way! Driver is 5 minutes away.",
    time: "10m ago",
    dateGroup: "today",
    unread: true,
    link: "/track",
  },
  {
    id: "n-offer-1",
    type: "offer",
    emoji: "🎁",
    title: "50% OFF Special Voucher Unlocked",
    body: "Use promo code WELCOME50 at checkout to save 50% on your next order.",
    time: "2h ago",
    dateGroup: "today",
    unread: true,
    link: "/home",
  },
  {
    id: "n-system-1",
    type: "system",
    emoji: "💳",
    title: "Payment Confirmed - Rs 2,450",
    body: "Payment for order #QB-9480 via Visa ending in 4821 succeeded.",
    time: "4h ago",
    dateGroup: "today",
    unread: false,
    link: "/profile/payments",
  },
  {
    id: "n-offer-2",
    type: "offer",
    emoji: "🔥",
    title: "Weekend Delivery Pass Activated",
    body: "Enjoy FREE express delivery on all food orders over Rs. 2,000 this weekend.",
    time: "Yesterday",
    dateGroup: "yesterday",
    unread: false,
    link: "/search",
  },
  {
    id: "n-system-2",
    type: "system",
    emoji: "🎉",
    title: "Account Created Successfully",
    body: "Welcome to QuickBite! Explore top local restaurants and fast delivery.",
    time: "Yesterday",
    dateGroup: "yesterday",
    unread: false,
    link: "/profile",
  },
];

export default function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotifCategory>("all");
  const [notifications, setNotifications] = useState<NotifItem[]>(initialDefaultNotifs);
  const [justMarked, setJustMarked] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setNotifications(
            data.map((n) => ({
              id: n.id,
              type: (n.type as NotifItem["type"]) || "system",
              emoji: n.emoji || "🔔",
              title: n.title,
              body: n.body,
              time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dateGroup: "today",
              unread: n.unread,
              link: "/home",
            }))
          );
        }
      } catch {
        // Fallback to rich initial default notifications
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setJustMarked(true);
    toast.success("All notifications marked as read");

    if (user) {
      await supabase
        .from("notifications")
        .update({ unread: false })
        .eq("user_id", user.id)
        .eq("unread", true);
    }

    setTimeout(() => setJustMarked(false), 2500);
  };

  const toggleSingleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const deleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info("Notification removed");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("All notifications cleared");
  };

  const sendTestNotification = () => {
    const newNotif: NotifItem = {
      id: `test-${Date.now()}`,
      type: "order",
      emoji: "⚡",
      title: "New Promo Offer Unlocked!",
      body: "Claim Rs. 500 off on your next burger order.",
      time: "Just now",
      dateGroup: "today",
      unread: true,
      link: "/search",
    };
    setNotifications((prev) => [newNotif, ...prev]);
    toast.success("🔔 New notification received!");
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const todayNotifs = filteredNotifs.filter((n) => n.dateGroup === "today");
  const yesterdayNotifs = filteredNotifs.filter((n) => n.dateGroup === "yesterday");

  if (!user) {
    return (
      <div className="phone-frame flex min-h-dvh flex-col bg-background">
        <Toaster />
        <header className="relative flex items-center justify-between px-5 pt-6">
          <Link
            to="/home"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-black">{t("notificationsTitle")}</h1>
          <div className="h-11 w-11" />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/15 text-primary shadow-glow animate-bounce">
            <Bell className="h-10 w-10" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-black">Stay in the Loop</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to track real-time delivery status, exclusive discounts, and order updates.
          </p>
          <a
            href="/auth?mode=signup"
            className="press mt-6 rounded-2xl bg-primary px-7 py-3.5 font-display text-sm font-bold text-primary-foreground shadow-glow"
          >
            Register / Sign in
          </a>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster />

      {/* Header */}
      <header className="px-5 pt-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-black">{t("notificationsTitle")}</h1>
            {unreadCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className={`press flex items-center gap-1 text-xs font-bold transition-all ${
              justMarked
                ? "text-emerald-500"
                : unreadCount > 0
                ? "text-primary hover:underline"
                : "text-muted-foreground/60 opacity-60"
            }`}
          >
            {justMarked ? (
              <>
                <Check className="h-3.5 w-3.5" /> Read All
              </>
            ) : (
              t("markAllRead")
            )}
          </button>
        </div>

        {/* Filter Chips */}
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All", icon: Bell },
            { id: "order", label: "Orders", icon: ShoppingBag },
            { id: "offer", label: "Offers", icon: Sparkles },
            { id: "system", label: "Updates", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.id;
            const count = notifications.filter(
              (n) => tab.id === "all" || n.type === tab.id
            ).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as NotifCategory)}
                className={`press flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface text-muted-foreground shadow-soft hover:bg-surface-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content List */}
      <main className="flex-1 px-5 pt-4">
        {filteredNotifs.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center text-center animate-fade-up">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-surface shadow-soft text-muted-foreground">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">No Notifications</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              You're all caught up! There are no notifications in this category.
            </p>
            <button
              onClick={sendTestNotification}
              className="press mt-5 flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-xs font-bold text-primary shadow-soft hover:bg-surface-muted"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Send Test Notification
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {todayNotifs.length > 0 && (
              <NotificationGroup
                title={t("today")}
                items={todayNotifs}
                onCardClick={(link) => link && navigate({ to: link as "/home" })}
                onToggleRead={toggleSingleRead}
                onDelete={deleteNotif}
              />
            )}

            {yesterdayNotifs.length > 0 && (
              <NotificationGroup
                title={t("yesterday")}
                items={yesterdayNotifs}
                onCardClick={(link) => link && navigate({ to: link as "/home" })}
                onToggleRead={toggleSingleRead}
                onDelete={deleteNotif}
              />
            )}

            <div className="mt-6 flex justify-between items-center px-1">
              <button
                onClick={sendTestNotification}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Test Alert
              </button>

              <button
                onClick={clearAll}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear All
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}

function NotificationGroup({
  title,
  items,
  onCardClick,
  onToggleRead,
  onDelete,
}: {
  title: string;
  items: NotifItem[];
  onCardClick: (link?: string) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {items.length} updates
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((n) => {
          const typeBadge =
            n.type === "order"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : n.type === "offer"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

          return (
            <div
              key={n.id}
              onClick={() => onCardClick(n.link)}
              className={`press group relative flex items-start gap-3.5 rounded-3xl p-4 transition-all duration-300 cursor-pointer border ${
                n.unread
                  ? "bg-surface border-primary/30 shadow-card"
                  : "bg-surface/60 border-border/50 opacity-90 hover:opacity-100 shadow-soft"
              }`}
            >
              {/* Unread Glowing Pulse Dot */}
              {n.unread && (
                <span className="absolute right-3.5 top-3.5 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary))]" />
              )}

              {/* Emoji Icon Badge */}
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-muted text-2xl shadow-inner">
                {n.emoji}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${typeBadge}`}
                  >
                    {n.type}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {n.time}
                  </span>
                </div>

                <h4 className="mt-1 font-display text-sm font-bold text-foreground leading-snug">
                  {n.title}
                </h4>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {n.body}
                </p>

                {/* Quick Action Footer */}
                {n.link && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                    View details &rarr;
                  </span>
                )}
              </div>

              {/* Actions Menu (Hover/Card control) */}
              <div className="flex flex-col gap-1.5 self-center opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => onToggleRead(n.id, e)}
                  title={n.unread ? "Mark as read" : "Mark as unread"}
                  className="press grid h-7 w-7 place-items-center rounded-xl bg-surface-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Check className={`h-3.5 w-3.5 ${!n.unread ? "text-emerald-500" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={(e) => onDelete(n.id, e)}
                  title="Delete notification"
                  className="press grid h-7 w-7 place-items-center rounded-xl bg-surface-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
