import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Fingerprint,
  BarChart3,
  Smartphone,
  Trash2,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profile/privacy/")({
  head: () => ({ meta: [{ title: "Privacy & Security — QuickBite" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();
  const [biometric, setBiometric] = useState(true);
  const [ads, setAds] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLogoutOthers, setConfirmLogoutOthers] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [otherSessions, setOtherSessions] = useState(2);

  const onBiometric = (v: boolean) => {
    setBiometric(v);
    toast.success(v ? "Biometric login enabled" : "Biometric login disabled");
  };
  const onAds = (v: boolean) => {
    setAds(v);
    toast.success("Preferences updated");
  };

  const handleLogoutOthers = () => {
    setConfirmLogoutOthers(false);
    setLoggingOut(true);
    setTimeout(() => {
      setLoggingOut(false);
      setOtherSessions(0);
      toast.success("Successfully logged out of all other devices");
    }, 1000);
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link
          to="/profile"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("privacyTitle")}</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="px-5 pt-5">
        {/* Security */}
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("security")}
        </h3>
        <div className="mt-2 overflow-hidden rounded-3xl bg-surface shadow-soft">
          <ToggleRow
            icon={<Fingerprint className="h-5 w-5" />}
            label={t("biometricLogin")}
            sub={t("biometricSub")}
            value={biometric}
            onChange={onBiometric}
          />
          <div className="mx-4 h-px bg-border" />
          <ToggleRow
            icon={<BarChart3 className="h-5 w-5" />}
            label={t("personalizedAds")}
            sub={t("personalizedAdsSub")}
            value={ads}
            onChange={onAds}
          />
          <div className="mx-4 h-px bg-border" />
          <Link
            to="/profile/privacy/2fa"
            className="press flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{t("twoFactor")}</p>
              <p className="text-xs text-muted-foreground">{t("twoFactorSub")}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Active Sessions */}
        <h3 className="mt-6 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("activeSessions")}
        </h3>
        <div className="mt-2 overflow-hidden rounded-3xl bg-surface p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent">
              <Smartphone className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">iPhone 15 Pro · Colombo</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_2px_rgba(34,197,94,0.7)]" />
                <p className="text-xs font-medium text-[#22c55e]">
                  {t("onlineCurrent")}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setConfirmLogoutOthers(true)}
            disabled={loggingOut || otherSessions === 0}
            className="press mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 py-2.5 text-sm font-bold text-primary disabled:opacity-60"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loggingOut")}
              </>
            ) : otherSessions === 0 ? (
              t("noOtherSessions")
            ) : (
              `${t("logoutOthers")} (${otherSessions})`
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <h3 className="mt-6 px-1 text-xs font-bold uppercase tracking-wider text-destructive">
          {t("dangerZone")}
        </h3>
        <div className="mt-2 rounded-3xl border-2 border-destructive/40 bg-destructive/5 p-4">
          <button
            onClick={() => setConfirmDelete(true)}
            className="press flex w-full items-center gap-3 text-left"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-destructive">{t("deleteAccount")}</p>
              <p className="text-xs text-destructive/80">
                {t("deleteAccountSub")}
              </p>
            </div>
            <Trash2 className="h-5 w-5 text-destructive" />
          </button>
        </div>
      </div>

      <div className="h-28" />
      <BottomNav />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your QuickBite account, orders, and saved
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toast.success("Account deletion requested")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmLogoutOthers} onOpenChange={setConfirmLogoutOthers}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll stay signed in on this device, but all other devices will
              be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutOthers}>
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
