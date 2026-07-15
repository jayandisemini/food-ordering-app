import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

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

export default function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [justMarked, setJustMarked] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setNotifications(data.map(n => ({
          id: n.id,
          emoji: n.emoji,
          title: n.title,
          body: n.body,
          time: new Date(n.created_at).toLocaleTimeString(),
          unread: n.unread
        })));
      }
    };
    
    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!justMarked) return;
    const t = setTimeout(() => setJustMarked(false), 2000);
    return () => clearTimeout(t);
  }, [justMarked]);

  if (!user) {
    return (
      <div className="phone-frame flex min-h-dvh flex-col bg-background">
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
          <BellIcon />
          <h2 className="mt-5 font-display text-2xl font-black">Register to get notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to receive order updates and offers.
          </p>
          <a
            href="/auth?mode=signup"
            className="press mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            Register
          </a>
        </div>
        <BottomNav />
      </div>
    );
  }

  const today = notifications;
  const yesterday: Notif[] = []; // Real-time groups can be done via date math later

  const hasUnread = notifications.some((n) => n.unread);

  const markAll = async () => {
    if (!hasUnread || !user) return;
    
    await supabase
      .from("notifications")
      .update({ unread: false })
      .eq("user_id", user.id)
      .eq("unread", true);
      
    setNotifications((xs) => xs.map((n) => ({ ...n, unread: false })));
    setJustMarked(true);
  };

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

function BellIcon() {
  return (
    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/15 text-primary">
      <span className="text-3xl">!</span>
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
