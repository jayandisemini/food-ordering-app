import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Smartphone, MessageSquare, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/profile/privacy/2fa")({
  head: () => ({ meta: [{ title: "Two-Factor Authentication — QuickBite" }] }),
  component: TwoFAPage,
});

function TwoFAPage() {
  const [method, setMethod] = useState<"app" | "sms">("app");
  const navigate = useNavigate();

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link
          to="/profile/privacy"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">Two-Factor Auth</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="flex-1 px-5 pt-6">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/15 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-black">
          Secure your account with 2FA
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Add a second step at sign-in to protect your QuickBite account from
          unauthorized access.
        </p>

        <div className="mt-6 space-y-3">
          <OptionRow
            icon={<Smartphone className="h-5 w-5" />}
            title="Authenticator App"
            sub="Use Google Authenticator, Authy, or 1Password"
            recommended
            selected={method === "app"}
            onClick={() => setMethod("app")}
          />
          <OptionRow
            icon={<MessageSquare className="h-5 w-5" />}
            title="SMS Verification"
            sub="Receive a 6-digit code via text message"
            selected={method === "sms"}
            onClick={() => setMethod("sms")}
          />
        </div>
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={() => {
            toast.success(
              method === "app"
                ? "Authenticator app 2FA enabled"
                : "SMS 2FA enabled",
            );
            setTimeout(() => navigate({ to: "/profile/privacy" }), 600);
          }}
          className="press h-14 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-soft"
        >
          Enable 2FA
        </button>
      </div>
    </div>
  );
}

function OptionRow({
  icon,
  title,
  sub,
  selected,
  recommended,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`press flex w-full items-center gap-3 rounded-3xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/10"
          : "border-transparent bg-surface"
      }`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold">{title}</p>
          {recommended && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Recommended
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all ${
          selected ? "border-primary" : "border-muted-foreground/40"
        }`}
      >
        {selected && <span className="h-3 w-3 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
