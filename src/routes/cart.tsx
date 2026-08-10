import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Tag,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Users,
  ShoppingBag,
  Sparkles,
  Utensils,
  Clock,
  MapPin,
  Flame,
  Check,
  Percent
} from "lucide-react";
import { toast } from "sonner";
import { cartStore, useCart } from "@/lib/cart-store";
import { foods, findFood, formatLkr } from "@/lib/food-data";
import { useAuth } from "@/lib/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { useI18n } from "@/lib/i18n";
import { GroupCartModal } from "@/components/group-cart-modal";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — QuickBite" }] }),
  component: CartPage,
});

export default function CartPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();

  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [orderNotes, setOrderNotes] = useState("");
  const [groupOpen, setGroupOpen] = useState(false);

  const items = cart.map((c) => ({ ...c, food: findFood(c.id)! })).filter((c) => c.food);
  const subtotal = items.reduce((s, i) => s + i.food.price * i.qty, 0);
  const freeDeliveryThreshold = 2000;
  const freeDeliveryDiff = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const delivery = items.length ? (subtotal >= freeDeliveryThreshold ? 0 : 150) : 0;
  const discount = promoApplied ? Math.round(subtotal * 0.5) : 0;
  const total = subtotal - discount + delivery;

  const applyPromoCode = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError(t("promo.error"));
      return;
    }
    if (code === "WELCOME50" || code === "BINGE50") {
      setPromoApplied(true);
      setPromoOpen(false);
      setPromoInput("");
      setPromoError("");
      toast.success("🎉 Promo code WELCOME50 applied! 50% discount active.");
    } else {
      setPromoError(t("promo.error"));
    }
  };

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setSuccess(true);
    }, 1400);
  };

  const addSampleMeal = () => {
    cartStore.add("1");
    cartStore.add("2");
    toast.success("Added popular items to cart!");
  };

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <GroupCartModal isOpen={groupOpen} onClose={() => setGroupOpen(false)} />

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 animate-fade-up">
        <Link
          to="/home"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="font-display text-xl font-black">{t("cartPages.title")}</h1>
          <span className="text-[11px] font-medium text-muted-foreground">
            {items.length === 0 ? "Empty" : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </span>
        </div>

        <button
          onClick={() => setGroupOpen(true)}
          className="press flex h-11 items-center gap-1.5 rounded-2xl bg-primary/10 px-3.5 text-xs font-bold text-primary shadow-soft hover:bg-primary/20"
        >
          <Users className="h-4 w-4" />
          Group
        </button>
      </header>

      {/* Main Cart Content */}
      <div className="flex-1 px-5 pt-4 pb-44">
        {items.length === 0 ? (
          /* Modern Empty Cart State */
          <div className="mt-8 flex flex-col items-center text-center animate-fade-up">
            <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-primary/10 text-primary shadow-glow">
              <div className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md animate-bounce">
                <Sparkles className="h-4 w-4" />
              </div>
              <ShoppingBag className="h-12 w-12 text-primary" />
            </div>

            <h2 className="mt-6 font-display text-2xl font-black text-foreground">
              {t("cartPages.empty")}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your cart is feeling lonely! Add your favorite dishes from top restaurants near you.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Link
                to="/home"
                className="press flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-6 font-display text-sm font-bold text-primary-foreground shadow-glow"
              >
                <Sparkles className="h-4 w-4" />
                {t("cartPages.discover")}
              </Link>
              <button
                type="button"
                onClick={addSampleMeal}
                className="press flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 py-3.5 px-4 text-xs font-bold text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" /> Demo Items
              </button>
            </div>

            {/* Popular Quick-Add Recommendations */}
            <div className="mt-10 w-full text-left">
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  🔥 Popular Quick Add
                </span>
                <span className="text-[11px] font-semibold text-primary">1-Tap Add</span>
              </div>

              <div className="space-y-2.5">
                {foods.slice(0, 3).map((food) => (
                  <div
                    key={`empty-suggest-${food.id}`}
                    className="press flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-soft border border-border/50 hover:bg-surface-muted"
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-display text-sm font-bold text-foreground">
                        {food.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{food.restaurant}</p>
                      <p className="mt-0.5 text-xs font-extrabold text-primary">
                        {formatLkr(food.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        cartStore.add(food.id);
                        toast.success(`Added ${food.name} to cart!`);
                      }}
                      className="press flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-glow"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Cart Items Section */
          <>
            {/* Delivery Address & Time Estimate Banner */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface p-3.5 shadow-soft border border-border/60 animate-fade-up">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Deliver To
                  </p>
                  <p className="text-xs font-bold text-foreground">Colombo 03, Sri Lanka</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" /> 20-30 min
              </div>
            </div>

            {/* Free Delivery Progress Indicator */}
            <div className="mb-4 rounded-2xl bg-surface p-3.5 shadow-soft border border-border/60 animate-fade-up">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                  {freeDeliveryDiff === 0
                    ? "🎉 You unlocked FREE Delivery!"
                    : `Add ${formatLkr(freeDeliveryDiff)} more for FREE delivery`}
                </span>
                <span className="text-primary font-black">{freeDeliveryProgress}%</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 animate-fade-up rounded-3xl bg-card p-3.5 shadow-soft border border-border/40"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={item.food.image}
                    alt={item.food.name}
                    className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-muted-foreground">
                      {item.food.restaurant}
                    </p>
                    <h3 className="truncate font-display text-sm font-bold text-foreground">
                      {item.food.name}
                    </h3>
                    <p className="mt-1 font-display text-sm font-black text-primary">
                      {formatLkr(item.food.price * item.qty)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2.5">
                    <button
                      onClick={() => cartStore.remove(item.id)}
                      className="press grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1 border border-border/50">
                      <button
                        onClick={() => cartStore.setQty(item.id, item.qty - 1)}
                        className="press grid h-7 w-7 place-items-center rounded-lg bg-background text-foreground shadow-sm"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span
                        key={item.qty}
                        className="w-6 text-center text-xs font-black animate-scale-in"
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => cartStore.setQty(item.id, item.qty + 1)}
                        className="press grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Quick Cutlery & Notes Toggle */}
            <div className="mt-4 rounded-3xl bg-surface p-4 shadow-soft space-y-3 border border-border/50 animate-fade-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Include Cutlery & Napkins</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeCutlery(!includeCutlery)}
                  className={`press relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeCutlery ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeCutlery ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add cooking notes (e.g. Extra spicy, no onions)..."
                className="w-full rounded-2xl bg-surface-muted px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none border border-border/40 focus:border-primary"
              />
            </div>

            {/* Promo Code Trigger */}
            <button
              onClick={() => {
                setPromoError("");
                setPromoOpen(true);
              }}
              className={`press mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-3.5 text-sm font-semibold transition-all ${
                promoApplied
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-primary/40 bg-surface hover:bg-surface-muted text-foreground shadow-soft"
              }`}
            >
              <Tag className={`h-4 w-4 ${promoApplied ? "text-emerald-500" : "text-primary"}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold">
                  {promoApplied ? "WELCOME50 Promo Applied!" : t("cartPages.promoCode")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {promoApplied ? "50% discount applied to items" : "Tap to enter discount code or voucher"}
                </span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>

            {/* Order Summary Box */}
            <div className="mt-4 rounded-3xl bg-surface p-5 shadow-soft border border-border/50 animate-fade-up">
              <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {t("cartPages.summary")}
              </p>

              <div className="space-y-2.5">
                <Row label={t("cartPages.subtotal")} value={formatLkr(subtotal)} />

                {promoApplied && (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-500 animate-fade-up">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" /> {t("promo.discountLabel")} (50%)
                    </span>
                    <span>-{formatLkr(discount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{t("cartPages.delivery")}</span>
                  {delivery === 0 ? (
                    <span className="font-bold text-emerald-500 uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-foreground">{formatLkr(delivery)}</span>
                  )}
                </div>

                <div className="my-2 h-px bg-border" />
                <Row label={t("cartPages.total")} value={formatLkr(total)} bold />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Checkout Button */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-[440px] px-5">
          <button
            onClick={() => {
              if (!user) {
                navigate({ to: "/auth" });
                return;
              }
              placeOrder();
            }}
            disabled={placing}
            className="press flex w-full items-center justify-between rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-glow disabled:opacity-80 active:scale-[0.98] transition-all"
          >
            {placing ? (
              <div className="flex w-full items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-display text-base font-bold">{t("cartPages.placing")}</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-extrabold opacity-80">
                    Total Amount
                  </span>
                  <span className="font-display text-lg font-black">{formatLkr(total)}</span>
                </div>

                <div className="flex items-center gap-2 font-display text-base font-bold">
                  {t("cartPages.checkout")} &rarr;
                </div>
              </>
            )}
          </button>
        </div>
      )}

      <BottomNav />

      {/* Promo Code Drawer */}
      {promoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-up"
          onClick={() => setPromoOpen(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-t-3xl bg-surface p-6 pb-10 text-foreground shadow-2xl animate-scale-in border-t border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-black">{t("promo.modalTitle")}</h3>
                <p className="text-xs text-muted-foreground">Enter promo code or select available vouchers</p>
              </div>
              <button
                onClick={() => setPromoOpen(false)}
                className="press grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-muted-foreground">{t("promo.availableOffers")}</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: "WELCOME50", label: "WELCOME50 (50% OFF)" },
                  { code: "QUICKBITE10", label: "QUICKBITE10 (10% OFF)" },
                  { code: "FREEDELIVERY", label: "FREEDELIVERY (Free Delivery)" },
                  { code: "FOODIEGO50", label: "FOODIEGO50 (50% OFF)" },
                ].map((offer) => (
                  <button
                    key={offer.code}
                    type="button"
                    onClick={() => applyPromoCode(offer.code)}
                    className="press flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20"
                  >
                    <Sparkles className="h-3 w-3" /> {offer.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-surface-muted px-4 py-3 border border-border focus-within:border-primary">
              <Tag className="h-4 w-4 text-primary" />
              <input
                autoFocus
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  if (promoError) setPromoError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPromoCode();
                }}
                placeholder={t("promo.placeholder")}
                className="flex-1 bg-transparent text-sm font-semibold uppercase tracking-wider outline-none placeholder:normal-case placeholder:font-normal text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {promoError && (
              <p className="mt-3 text-xs font-semibold text-destructive animate-fade-up">{promoError}</p>
            )}

            <button
              onClick={() => applyPromoCode()}
              className="press mt-5 w-full rounded-2xl bg-primary py-4 font-display text-base font-bold text-primary-foreground shadow-glow"
            >
              {t("promo.apply")}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-8 backdrop-blur-xl animate-fade-up">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-emerald-500/15 animate-scale-in">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500 shadow-glow text-white">
              <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="mt-8 text-center font-display text-2xl font-black">
            {t("cartPages.successTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("cartPages.successSub")}
          </p>

          <button
            onClick={() => {
              cartStore.clear();
              setSuccess(false);
              navigate({ to: "/track" });
            }}
            className="press mt-8 w-full max-w-xs rounded-2xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground shadow-glow"
          >
            {t("cartPages.trackOrder")}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className={bold ? "font-display text-sm sm:text-base font-black text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={bold ? "font-display text-base sm:text-lg font-black text-primary" : "font-semibold text-foreground"}>
        {value}
      </span>
    </div>
  );
}
