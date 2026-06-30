import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Wifi, Trash2, CreditCard } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/profile/payments")({
  head: () => ({ meta: [{ title: "Payment Methods — QuickBite" }] }),
  component: PaymentsPage,
});

type Brand = "Visa" | "Mastercard" | "Card";
type Card = { id: string; brand: Brand; last4: string; holder: string; exp: string };

const GRADIENTS = [
  "linear-gradient(135deg, #1f2937 0%, #0f172a 60%, #111827 100%)",
  "linear-gradient(135deg, #3b1d60 0%, #1e1b4b 55%, #0f172a 100%)",
  "linear-gradient(135deg, #7c2d12 0%, #431407 55%, #111827 100%)",
  "linear-gradient(135deg, #064e3b 0%, #0f172a 55%, #111827 100%)",
  "linear-gradient(135deg, #1e3a8a 0%, #0f172a 55%, #111827 100%)",
];

function detectBrand(num: string): Brand {
  const first = num.replace(/\s/g, "")[0];
  if (first === "4") return "Visa";
  if (first === "5") return "Mastercard";
  return "Card";
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function PaymentsPage() {
  const { t } = useI18n();
  const [cards, setCards] = useState<Card[]>([
    { id: "1", brand: "Visa", last4: "4242", holder: "QUICKBITE USER", exp: "12/29" },
  ]);
  const [open, setOpen] = useState(false);
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const brand = detectBrand(number);
  const reset = () => { setHolder(""); setNumber(""); setExp(""); setCvv(""); };

  const onSave = () => {
    const digits = number.replace(/\s/g, "");
    if (!holder.trim() || digits.length < 13 || !/^\d{2}\/\d{2}$/.test(exp) || cvv.length < 3) {
      toast.error(t("accountPages.cardValidationToast"));
      return;
    }
    setCards((p) => [
      ...p,
      { id: Date.now().toString(), brand, last4: digits.slice(-4), holder: holder.trim().toUpperCase(), exp },
    ]);
    toast.success(t("accountPages.cardAddedToast"));
    reset();
    setOpen(false);
  };

  const onDelete = (id: string) => {
    setCards((p) => p.filter((c) => c.id !== id));
    toast(t("accountPages.cardRemovedToast"));
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster position="top-center" />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/profile" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("accountPages.paymentTitle")}</h1>
        <div className="h-11 w-11" />
      </header>

      <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
        {cards.length
          ? cards.map((c) => `${c.brand} •• ${c.last4}`).join(", ")
          : t("accountPages.paymentSubtitle")}
      </p>

      <div className="space-y-4 px-5 pt-5">
        {cards.map((c, i) => (
          <div key={c.id} className="relative animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div
              className="relative overflow-hidden rounded-3xl p-6 text-white shadow-card"
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />

              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  QuickBite Card
                </span>
                <span className="font-display text-xl italic font-black text-white">
                  {c.brand.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div
                  className="grid h-10 w-12 place-items-center rounded-md shadow-inner"
                  style={{ background: "linear-gradient(135deg, #f5d27a 0%, #c79b3a 50%, #f5d27a 100%)" }}
                >
                  <div className="h-5 w-7 rounded-sm border border-amber-700/40" />
                </div>
                <Wifi className="h-5 w-5 rotate-90 text-white/80" />
              </div>

              <p className="mt-5 font-mono text-lg font-bold tracking-[0.25em] text-white">
                {c.brand} •••• {c.last4}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Card Holder</p>
                  <p className="text-sm font-bold">{c.holder}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Exp</p>
                  <p className="text-sm font-bold">{c.exp}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDelete(c.id)}
              aria-label="Remove card"
              className="press absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-black/40 text-white backdrop-blur transition hover:bg-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="press mx-5 mt-5 flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm font-bold text-primary"
      >
        <Plus className="h-4 w-4" /> {t("accountPages.addCard")}
      </button>

      <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none bg-neutral-900 p-0 text-white">
          <SheetHeader className="px-5 pt-5 text-left">
            <SheetTitle className="font-display text-xl font-black text-white">
              {t("accountPages.newCardTitle")}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-5 pb-6 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("accountPages.cardholderLabel")}
              </label>
              <input
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder={t("accountPages.cardholderPlaceholder")}
                className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("accountPages.cardNumberLabel")}
              </label>
              <div className="relative">
                <input
                  value={number}
                  onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                  placeholder={t("accountPages.cardNumberPlaceholder")}
                  inputMode="numeric"
                  className="w-full rounded-2xl bg-neutral-800 px-4 py-3 pr-24 font-mono text-sm tracking-wider text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg bg-neutral-700/70 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  <CreditCard className="h-3 w-3" /> {brand}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                  {t("accountPages.cardExpiryLabel")}
                </label>
                <input
                  value={exp}
                  onChange={(e) => setExp(formatExpiry(e.target.value))}
                  placeholder={t("accountPages.cardExpiryPlaceholder")}
                  inputMode="numeric"
                  className="w-full rounded-2xl bg-neutral-800 px-4 py-3 font-mono text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                  {t("accountPages.cardCvvLabel")}
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={t("accountPages.cardCvvPlaceholder")}
                  inputMode="numeric"
                  className="w-full rounded-2xl bg-neutral-800 px-4 py-3 font-mono text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={onSave}
              className="press mt-2 w-full rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-soft"
            >
              {t("accountPages.saveCard")}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}
