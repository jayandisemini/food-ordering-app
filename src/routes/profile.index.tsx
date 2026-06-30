import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Receipt,
  Moon,
  Sun,
  LogIn,
  Globe,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/lib/use-auth";
import { useTheme } from "@/lib/theme";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/profile/")({
  head: () => ({ meta: [{ title: "Profile — QuickBite" }] }),
  component: ProfilePage,
});


function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setOrderCount(count ?? 0));
  }, [user]);

  const signOut = async () => {
    setLogoutOpen(false);
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const pickLang = (code: Lang) => {
    setLang(code);
    setLangOpen(false);
    toast.success(`${LANGUAGES.find((l) => l.code === code)?.label}`);
  };

  const name = profile?.display_name ?? t("guest");
  const email = profile?.email ?? user?.email ?? t("notSignedIn");
  const langLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? "English";

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <Toaster />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("profileTitle")}</h1>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      <div className="mx-5 mt-4 flex items-center gap-4 rounded-3xl bg-foreground p-5 text-background shadow-card animate-fade-up">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
          {user ? (
            <span className="font-display text-2xl font-black">
              {(profile?.display_name ?? user.email ?? "G").charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="h-7 w-7" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-background/60">
            {user ? t("goldMember") : t("guest")}
          </p>
          <h2 className="font-display text-xl font-black">{name}</h2>
          <p className="truncate text-xs text-background/70">{email}</p>
        </div>
        {!user && !loading && (
          <Link
            to="/auth"
            className="press flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            <LogIn className="h-3.5 w-3.5" /> {t("signIn")}
          </Link>
        )}
      </div>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
        {[
          [String(orderCount), t("ordersFlat")],
          ["8", t("savedLabel")],
          ["340", t("points")],
        ].map(([n, l], i) => (
          <div
            key={l}
            className="rounded-2xl bg-surface p-4 text-center shadow-soft animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="font-display text-2xl font-black text-primary">{n}</p>
            <p className="text-[11px] font-medium text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pt-5">
        <Group
          title={t("account")}
          items={[
            {
              icon: Receipt,
              label: t("orderHistory"),
              sub: t("accountPages.orderSubtitle"),
              onClick: () => navigate({ to: "/profile/order-history" }),
            },
            {
              icon: MapPin,
              label: t("addresses"),
              sub: t("accountPages.addressSubtitle"),
              onClick: () => navigate({ to: "/profile/addresses" }),
            },
            {
              icon: CreditCard,
              label: t("paymentMethods"),
              sub: t("accountPages.paymentSubtitle"),
              onClick: () => navigate({ to: "/profile/payments" }),
            },
          ]}
        />
        <Group
          title={t("preferences")}
          items={[
            {
              icon: theme === "dark" ? Sun : Moon,
              label: t("darkMode"),
              sub: theme === "dark" ? t("on") : t("off"),
              right: (
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === "dark" ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </span>
              ),
              onClick: toggle,
            },
            {
              icon: Globe,
              label: t("language"),
              sub: langLabel,
              onClick: () => setLangOpen(true),
            },
            {
              icon: Bell,
              label: t("notifications"),
              sub: t("notificationsSub"),
              onClick: () => navigate({ to: "/profile/notifications" }),
            },
            {
              icon: Shield,
              label: t("privacy"),
              sub: t("privacySub"),
              onClick: () => navigate({ to: "/profile/privacy" }),
            },
            {
              icon: HelpCircle,
              label: t("helpCenter"),
              sub: t("helpSub"),
              onClick: () => navigate({ to: "/profile/help" }),
            },
            ...(user
              ? [
                  {
                    icon: LogOut,
                    label: t("logout"),
                    sub: "",
                    destructive: true,
                    onClick: () => setLogoutOpen(true),
                  } as Item,
                ]
              : []),
          ]}
        />
      </div>

      <div className="h-24" />
      <BottomNav />

      {/* Language sheet */}
      <Sheet open={langOpen} onOpenChange={setLangOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-w-[440px] rounded-t-3xl border-0 bg-background p-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />
          <SheetHeader className="px-6 pt-4 pb-2 text-left">
            <SheetTitle className="font-display text-xl font-black">{t("selectLanguage")}</SheetTitle>
            <SheetDescription>{t("selectLanguageDesc")}</SheetDescription>
          </SheetHeader>
          <ul className="px-4 pb-8 pt-2">
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <li key={l.code}>
                  <button
                    onClick={() => pickLang(l.code)}
                    className="press flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left hover:bg-surface"
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                        active ? "border-primary" : "border-border"
                      }`}
                    >
                      {active && <span className="h-3 w-3 rounded-full bg-primary" />}
                    </span>
                    <span className={`flex-1 text-sm font-bold ${active ? "text-primary" : ""}`}>
                      {l.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>

      {/* Logout confirm */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="mx-auto max-w-sm rounded-3xl border-0 bg-background shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <LogOut className="h-6 w-6" />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-display text-xl font-black">
              {t("logoutConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("logoutConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="m-0 flex-1 rounded-2xl border-0 bg-surface font-bold">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={signOut}
              className="m-0 flex-1 rounded-2xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type Item = {
  icon: any;
  label: string;
  sub: string;
  right?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
};

function Group({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="mt-4">
      <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-soft">
        {items.map((it, i) => (
          <li key={it.label}>
            <button
              onClick={it.onClick}
              className="press flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-muted"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <it.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${it.destructive ? "text-destructive" : ""}`}>{it.label}</p>
                {it.sub && <p className="truncate text-xs text-muted-foreground">{it.sub}</p>}
              </div>
              {it.right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {i < items.length - 1 && <div className="mx-4 h-px bg-border" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
