import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/profile/help/")({
  head: () => ({ meta: [{ title: "Help Center — QuickBite" }] }),
  component: HelpPage,
});

type Category = "All" | "Orders" | "Payments" | "Refunds";

const FAQS: { q: string; a: string; cat: Exclude<Category, "All"> }[] = [
  {
    q: "How do I track my live order?",
    a: "Open the Orders tab and tap your active order, then 'Track on Map' to see your rider's live location and ETA.",
    cat: "Orders",
  },
  {
    q: "Can I cancel my order after placing it?",
    a: "You can cancel for free within 2 minutes of placing the order. After that, contact 24/7 support and we'll do our best to help.",
    cat: "Orders",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Visa, Mastercard, Amex, mobile wallets, and cash on delivery in selected areas.",
    cat: "Payments",
  },
  {
    q: "How are delivery fees calculated?",
    a: "Delivery fees depend on distance from the restaurant and current demand. The exact fee is shown before you confirm checkout.",
    cat: "Payments",
  },
  {
    q: "Can I schedule an order for later?",
    a: "Yes — at checkout tap the delivery time chip and pick a slot up to 24 hours in advance.",
    cat: "Orders",
  },
  {
    q: "How do I request a refund?",
    a: "Open the order in your Orders tab, tap 'Help with this order', and select 'Request a refund'. Most refunds are processed within 3-5 business days.",
    cat: "Refunds",
  },
  {
    q: "When will my refund appear?",
    a: "Refunds typically appear on your original payment method within 3-5 business days, depending on your bank.",
    cat: "Refunds",
  },
];

const CATEGORIES: Category[] = ["All", "Orders", "Payments", "Refunds"];

function HelpPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("All");
  const CAT_LABELS: Record<Category, string> = {
    All: t("all"),
    Orders: t("ordersFlat"),
    Payments: t("payments"),
    Refunds: t("refunds"),
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchCat = cat === "All" || f.cat === cat;
      const matchQ = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, cat]);

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
        <h1 className="font-display text-xl font-black">{t("helpTitle")}</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="px-5 pt-5">
        <Link
          to="/profile/help/chat"
          onClick={() => toast.success("Connecting you to a support agent…")}
          className="press flex w-full items-center justify-center gap-3 rounded-3xl bg-primary px-5 py-5 font-bold text-primary-foreground shadow-card"
        >
          <MessageCircle className="h-5 w-5" />
          {t("chatSupport")}
        </Link>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchHelp")}
            className="w-full rounded-2xl bg-surface py-3.5 pl-11 pr-4 text-sm shadow-soft outline-none ring-0 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="-mx-5 mt-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-5">
            {CATEGORIES.map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`press shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-surface text-foreground/80"
                  }`}
                >
                  {CAT_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("faqHeading")}
          </h3>
          <div className="mt-2 overflow-hidden rounded-3xl bg-surface px-4 shadow-soft">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("noTopics")}
              </p>
            ) : (
              <Accordion type="single" collapsible>
                {filtered.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`item-${i}`}
                    className={i === filtered.length - 1 ? "border-b-0" : ""}
                  >
                    <AccordionTrigger className="text-sm font-bold">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}
