import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Home, Briefcase, Plus, MapPin, Trash2 } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/profile/addresses")({
  head: () => ({ meta: [{ title: "Addresses — QuickBite" }] }),
  component: AddressesPage,
});

type Category = "home" | "work" | "other";
type Address = { id: string; label: string; address: string; category: Category };

const ICONS = { home: Home, work: Briefcase, other: MapPin } as const;

function AddressesPage() {
  const { t } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([
    { id: "1", label: "Home", address: "No. 45, Galle Road, Colombo", category: "home" },
    { id: "2", label: "Office", address: "NSBM Green University, Pitipana, Homagama", category: "work" },
  ]);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [addr, setAddr] = useState("");
  const [cat, setCat] = useState<Category>("home");

  const reset = () => { setLabel(""); setAddr(""); setCat("home"); };

  const onSave = () => {
    if (!label.trim() || !addr.trim()) {
      toast.error(t("accountPages.addressValidationToast"));
      return;
    }
    setAddresses((p) => [...p, { id: Date.now().toString(), label: label.trim(), address: addr.trim(), category: cat }]);
    toast.success(t("accountPages.addressAddedToast"));
    reset();
    setOpen(false);
  };

  const onDelete = (id: string) => {
    setAddresses((p) => p.filter((a) => a.id !== id));
    toast(t("accountPages.addressRemovedToast"));
  };

  const cats: { key: Category; emoji: string; label: string }[] = [
    { key: "home", emoji: "🏠", label: t("accountPages.catHome") },
    { key: "work", emoji: "💼", label: t("accountPages.catWork") },
    { key: "other", emoji: "📍", label: t("accountPages.catOther") },
  ];

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <Toaster position="top-center" />
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/profile" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{t("accountPages.addressTitle")}</h1>
        <div className="h-11 w-11" />
      </header>

      <p className="px-5 pt-2 text-xs font-medium text-muted-foreground">
        {addresses.map((a) => a.label).join(", ") || t("accountPages.addressSubtitle")}
      </p>

      <ul className="space-y-3 px-5 pt-4">
        {addresses.map((a, i) => {
          const Icon = ICONS[a.category];
          return (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-3xl bg-surface p-4 shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-black">{a.label}</h3>
                <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  <span className="truncate">{a.address}</span>
                </p>
              </div>
              <button
                onClick={() => onDelete(a.id)}
                aria-label="Delete address"
                className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive transition hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setOpen(true)}
        className="press mx-5 mt-4 flex items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm font-bold text-primary"
      >
        <Plus className="h-4 w-4" /> {t("accountPages.addAddress")}
      </button>

      <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none bg-neutral-900 p-0 text-white">
          <SheetHeader className="px-5 pt-5 text-left">
            <SheetTitle className="font-display text-xl font-black text-white">
              {t("accountPages.newAddressTitle")}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 px-5 pb-6 pt-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("accountPages.addressLabelLabel")}
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t("accountPages.addressLabelPlaceholder")}
                className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("accountPages.addressFullLabel")}
              </label>
              <textarea
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder={t("accountPages.addressFullPlaceholder")}
                rows={2}
                className="w-full resize-none rounded-2xl bg-neutral-800 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-neutral-400">
                {t("accountPages.addressCategory")}
              </label>
              <div className="flex gap-2">
                {cats.map((c) => {
                  const active = cat === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setCat(c.key)}
                      className={`press flex-1 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-700 bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      <span className="mr-1">{c.emoji}</span> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={onSave}
              className="press mt-2 w-full rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-soft"
            >
              {t("accountPages.saveAddress")}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}
