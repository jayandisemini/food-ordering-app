import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in - QuickBite" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup" || params.get("register") === "1") {
      setMode("signup");
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { full_name: name, display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created");
        navigate({ to: "/home" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/home" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/home` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="phone-frame relative min-h-dvh overflow-hidden bg-foreground">
      <Toaster />
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-72 w-72 rounded-full bg-primary-glow/20 blur-3xl" />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-8 pt-14">
        <div className="animate-fade-up text-background">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-glow">
            QB
          </div>
          <h1 className="mt-5 font-display text-3xl font-black">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-2 text-sm text-background/70">
            {mode === "signin"
              ? "Sign in to keep ordering your favorites"
              : "Join QuickBite - fast, fresh, delivered."}
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-8 animate-fade-up rounded-3xl border border-background/15 bg-background/10 p-5 backdrop-blur-xl"
          style={{ animationDelay: "120ms" }}
        >
          {mode === "signup" && (
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full bg-transparent text-background placeholder:text-background/40 focus:outline-none"
              />
            </Field>
          )}

          <Field label="Email" icon={<Mail className="h-4 w-4" />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-transparent text-background placeholder:text-background/40 focus:outline-none"
            />
          </Field>

          <Field label="Password" icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Password"
              className="w-full bg-transparent text-background placeholder:text-background/40 focus:outline-none"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-background/50">
          <span className="h-px flex-1 bg-background/20" />
          or continue with
          <span className="h-px flex-1 bg-background/20" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="press flex items-center justify-center gap-3 rounded-2xl border border-background/20 bg-background py-3.5 font-semibold text-foreground disabled:opacity-60"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <p className="mt-auto pt-6 text-center text-sm text-background/70">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-bold text-primary"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>

        <Link
          to="/home"
          className="mt-3 text-center text-xs text-background/50 underline-offset-4 hover:underline"
        >
          Continue as guest
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-background/60">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-2xl border border-background/15 bg-background/5 px-4 py-3">
        {icon && <span className="text-background/60">{icon}</span>}
        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.8 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
