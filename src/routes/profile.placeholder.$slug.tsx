import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, Receipt, MapPin, CreditCard, Bell, Shield, HelpCircle, Construction } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/profile/placeholder/$slug")({
  head: () => ({ meta: [{ title: "Profile — QuickBite" }] }),
  beforeLoad: ({ params }) => {
    const redirects: Record<string, string> = {
      privacy: "/profile/privacy",
      notifications: "/profile/notifications",
      help: "/profile/help",
    };
    const target = redirects[params.slug];
    if (target) {
      throw redirect({ to: target });
    }
  },
  component: PlaceholderPage,
});

const META: Record<string, { title: string; sub: string; icon: any; body: string }> = {
  "order-history": {
    title: "Order history",
    sub: "All your past orders",
    icon: Receipt,
    body: "Your full order history will appear here, with filters by date, restaurant, and status.",
  },
  addresses: {
    title: "Addresses",
    sub: "Saved delivery locations",
    icon: MapPin,
    body: "Manage your home, office and other saved delivery addresses with map pins and labels.",
  },
  payments: {
    title: "Payment methods",
    sub: "Cards & wallets",
    icon: CreditCard,
    body: "Add, remove and set a default payment method for faster checkout.",
  },
  notifications: {
    title: "Notifications",
    sub: "Promos & order updates",
    icon: Bell,
    body: "Choose which alerts you'd like to receive — promotions, order updates and delivery ETAs.",
  },
  privacy: {
    title: "Privacy & security",
    sub: "Manage your data",
    icon: Shield,
    body: "Control data sharing, biometric login and active sessions on this account.",
  },
  help: {
    title: "Help center",
    sub: "24/7 support",
    icon: HelpCircle,
    body: "Browse FAQs or contact our support team — we're here around the clock.",
  },
};

function PlaceholderPage() {
  const { slug } = Route.useParams();
  const data = META[slug] ?? {
    title: "Coming soon",
    sub: "",
    icon: Construction,
    body: "This screen is under construction.",
  };
  const Icon = data.icon;

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background animate-in slide-in-from-right duration-300">
      <header className="flex items-center justify-between px-5 pt-6">
        <Link
          to="/profile"
          className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">{data.title}</h1>
        <div className="h-11 w-11" />
      </header>

      <div className="mx-5 mt-6 flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-soft">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-black">{data.title}</h2>
          <p className="text-xs text-muted-foreground">{data.sub}</p>
        </div>
      </div>

      <div className="mx-5 mt-4 rounded-3xl bg-surface p-6 shadow-soft">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Construction className="h-7 w-7" />
        </div>
        <h3 className="font-display text-lg font-black">Coming soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">{data.body}</p>
      </div>

      <div className="mt-auto px-5 pb-6">
        <Link
          to="/profile"
          className="press flex h-12 w-full items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground shadow-card"
        >
          Back to profile
        </Link>
      </div>

      <div className="h-24" />
      <BottomNav />
    </div>
  );
}
