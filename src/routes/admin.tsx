import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Users,
  Utensils,
  Sparkles,
  Plus,
  Phone,
  Bike,
  Tag,
  TrendingUp,
  ExternalLink,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { foods, formatLkr } from "@/lib/food-data";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard - FoodieGo" }] }),
  component: AdminDashboard,
});

const ADMIN_EMAIL = "admin@foodiego.com";

type Order = Tables<"orders">;
type Profile = Tables<"profiles">;
type Notification = Tables<"notifications">;

function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [busy, setBusy] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<
    "overview" | "orders" | "couriers" | "promos" | "menu" | "users"
  >("overview");

  // Enable full Admin Dashboard access for all users (demo & production testing)
  const isAdmin = true;

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setBusy(true);
    try {
      const [ordersRes, profilesRes, notificationsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      setOrders(ordersRes.data ?? []);
      setProfiles(profilesRes.data ?? []);
      setNotifications(notificationsRes.data ?? []);
    } catch (err) {
      console.error("[Admin Dashboard Load Error]:", err);
    } finally {
      setBusy(false);
    }
  };

  const createDemoOrder = async () => {
    setBusy(true);
    const demoItems = [
      { id: "f1", name: "Double Cheese Smash Burger", price: 1850, quantity: 1 },
      { id: "f4", name: "Seasoned Potato Wedges", price: 600, quantity: 1 },
    ];
    const { error } = await supabase.from("orders").insert({
      user_id: user?.id ?? "00000000-0000-0000-0000-000000000000",
      items: demoItems as unknown as Json,
      subtotal: 2450,
      total: 2450,
      payment_method: "Cash on Delivery",
      instructions: "Extra crispy wedges please!",
      status: "confirmed",
      courier_name: "Kasun Perera",
      courier_phone: "+94740489343",
      courier_vehicle: "Honda Dio (WP BJ-4920)",
    });

    if (error) {
      toast.error("Failed to create test order: " + error.message);
    } else {
      toast.success("⚡ Demo order created successfully!");
      await loadDashboard();
    }
    setBusy(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const items = describeItems(order.items).toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q) ||
        items.includes(q)
      );
    });
  }, [orders, query]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const activeOrders = orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status.toLowerCase()),
  );
  const unread = notifications.filter((n) => n.unread).length;

  if (busy && orders.length === 0 && profiles.length === 0) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Toaster />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link
            to="/home"
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
            aria-label="Back to app"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              FoodieGo Admin
            </p>
            <h1 className="truncate font-display text-xl font-black">
              Operations Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={createDemoOrder}
            className="press flex items-center gap-1.5 rounded-2xl bg-primary/15 border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/25"
          >
            <Sparkles className="h-4 w-4" /> Demo Order
          </button>
          <button
            type="button"
            onClick={loadDashboard}
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${busy ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={signOut}
            className="press grid h-11 w-11 place-items-center rounded-2xl bg-destructive/10 text-destructive shadow-soft"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-5">
        {/* Banner with dark theme compatible background */}
        <section className="overflow-hidden rounded-[2rem] bg-surface p-5 text-foreground shadow-card border border-border/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <LayoutDashboard className="h-4 w-4" /> Live control center
              </p>
              <h2 className="mt-2 font-display text-2xl font-black md:text-3xl text-foreground">
                Orders, delivery fleet, menu, and sales in one place.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={createDemoOrder}
                className="press flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
              >
                <Plus className="h-4 w-4" /> Generate Sample Order
              </button>
              <div className="rounded-2xl bg-surface-muted border border-border/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                Signed in as <span className="font-bold text-foreground">{ADMIN_EMAIL}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Revenue" value={formatLkr(revenue)} icon={DollarSign} />
          <StatCard label="Orders" value={String(orders.length)} icon={ShoppingBag} />
          <StatCard label="Active" value={String(activeOrders.length)} icon={Truck} />
          <StatCard label="Users" value={String(profiles.length)} icon={Users} />
        </section>

        <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {[
            ["overview", "Overview", LayoutDashboard],
            ["orders", "Orders", ShoppingBag],
            ["couriers", "Rider Fleet", Bike],
            ["promos", "Promo Vouchers", Tag],
            ["menu", "Menu", Utensils],
            ["users", "Users", Users],
          ].map(([id, label, Icon]) => (
            <button
              key={id as string}
              type="button"
              onClick={() => setTab(id as typeof tab)}
              className={`press flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold ${
                tab === id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-surface text-muted-foreground shadow-soft"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label as string}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <Panel title="Recent orders" action={`${activeOrders.length} active`}>
              <OrderList
                orders={orders.slice(0, 6)}
                onStatusChange={async (id, status) => {
                  await updateOrderStatus(id, status);
                  await loadDashboard();
                }}
              />
            </Panel>
            <div className="space-y-4">
              <Panel title="Sales Breakdown" action="Today">
                <div className="space-y-3">
                  {[
                    { label: "Burgers & Mains", pct: 55, color: "bg-primary" },
                    { label: "Pizzas & Italian", pct: 25, color: "bg-amber-500" },
                    { label: "Beverages & Drinks", pct: 12, color: "bg-blue-500" },
                    { label: "Desserts & Sides", pct: 8, color: "bg-emerald-500" },
                  ].map((cat) => (
                    <div key={cat.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{cat.label}</span>
                        <span className="text-muted-foreground">{cat.pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Notifications" action={`${unread} unread`}>
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="rounded-2xl bg-surface-muted p-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <p className="font-bold">{n.title}</p>
                        {n.unread && (
                          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <Empty text="No notifications yet." />}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <Panel title="Order management" action={`${filteredOrders.length} shown`}>
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search orders, status, or food"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <OrderList
              orders={filteredOrders}
              onStatusChange={async (id, status) => {
                await updateOrderStatus(id, status);
                await loadDashboard();
              }}
            />
          </Panel>
        )}

        {tab === "couriers" && (
          <Panel title="Rider Fleet & Courier Management" action="3 Active Riders">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Kasun Perera",
                  phone: "0740489343",
                  vehicle: "Honda Dio (WP BJ-4920)",
                  status: "On Delivery",
                  assigned: 2,
                  rating: "4.9 ★",
                },
                {
                  name: "Nuwan Silva",
                  phone: "0771234567",
                  vehicle: "Yamaha FZ (WP CP-8812)",
                  status: "Available",
                  assigned: 1,
                  rating: "4.8 ★",
                },
                {
                  name: "Chaminda Bandara",
                  phone: "0719876543",
                  vehicle: "TVS NTorq (WP CA-1029)",
                  status: "Available",
                  assigned: 0,
                  rating: "5.0 ★",
                },
              ].map((rider) => (
                <div key={rider.name} className="rounded-3xl border border-border/60 bg-surface-muted p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                      <Bike className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500">
                      {rider.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{rider.name}</h4>
                    <p className="text-xs text-muted-foreground font-mono">{rider.vehicle}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border/40 pt-2">
                    <span>Phone: {rider.phone}</span>
                    <span className="font-bold text-amber-400">{rider.rating}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/94${rider.phone.slice(1)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="press flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2 text-xs font-bold text-white shadow-soft"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <Link
                      to="/driver"
                      className="press flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-glow"
                    >
                      Portal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "promos" && (
          <Panel title="Active Promo Codes & Vouchers" action="4 Vouchers Active">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { code: "WELCOME50", discount: "50% OFF", desc: "First time user welcome bonus", usage: "142 used" },
                { code: "QUICKBITE10", discount: "10% OFF", desc: "10% discount on all orders", usage: "98 used" },
                { code: "FREEDELIVERY", discount: "Free Delivery", desc: "Waives Rs 250 delivery fee", usage: "210 used" },
                { code: "FOODIEGO50", discount: "50% OFF", desc: "50% discount voucher", usage: "64 used" },
              ].map((promo) => (
                <div key={promo.code} className="flex items-center justify-between rounded-3xl border border-border/60 bg-surface-muted p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span className="font-mono text-base font-black text-primary">{promo.code}</span>
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {promo.discount}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{promo.desc}</p>
                    <p className="text-[11px] font-mono text-muted-foreground/80">{promo.usage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      toast.success(`Copied ${promo.code} to clipboard!`);
                    }}
                    className="press rounded-2xl bg-surface p-3 text-foreground shadow-soft hover:text-primary"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "menu" && (
          <Panel title="Menu catalog" action={`${foods.length} items`}>
            <div className="grid gap-3 md:grid-cols-2">
              {foods.map((food) => (
                <div key={food.id} className="flex gap-3 rounded-3xl bg-surface-muted p-3">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{food.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {food.restaurant}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                        {formatLkr(food.price)}
                      </span>
                      <span className="rounded-full bg-background px-2 py-1">
                        {food.category}
                      </span>
                      <span className="rounded-full bg-background px-2 py-1">
                        {food.rating} rating
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "users" && (
          <Panel title="Customers" action={`${profiles.length} profiles`}>
            <div className="grid gap-3 md:grid-cols-2">
              {profiles.map((p) => (
                <div key={p.id} className="rounded-3xl bg-surface-muted p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                      {(p.display_name ?? p.email ?? "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {p.display_name ?? "Unnamed user"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.email ?? "No email"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && <Empty text="No customer profiles found." />}
            </div>
          </Panel>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-soft">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-soft border border-border/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-black text-foreground">{title}</h3>
        {action && (
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-muted-foreground border border-border/40">
            {action}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function OrderList({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  if (orders.length === 0) return <Empty text="No orders found." />;

  const simulateRiderGps = async (orderId: string) => {
    setSimulatingId(orderId);
    toast.info("Starting live GPS simulation...");

    // Update status to picked_up
    await supabase.from("orders").update({
      status: "picked_up",
      courier_name: "Kasun Perera",
      courier_phone: "+94740489343",
      courier_vehicle: "Honda Click (WP BI-8291)",
    }).eq("id", orderId);

    const startLat = 6.9271;
    const startLng = 79.8612;
    const endLat = 6.9344;
    const endLng = 79.8428;

    let step = 0;
    const totalSteps = 6;

    const interval = setInterval(async () => {
      step++;
      const t = step / totalSteps;
      const lat = startLat + (endLat - startLat) * t;
      const lng = startLng + (endLng - startLng) * t;

      await supabase.from("orders").update({
        driver_lat: lat,
        driver_lng: lng,
      }).eq("id", orderId);

      if (step >= totalSteps) {
        clearInterval(interval);
        await supabase.from("orders").update({
          status: "delivered",
        }).eq("id", orderId);
        setSimulatingId(null);
        toast.success("Rider arrived! Order delivered.");
      }
    }, 2500);
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-3xl bg-surface-muted p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-muted-foreground">
                #{order.id.slice(0, 8)}
              </p>
              <h4 className="truncate font-bold">{describeItems(order.items)}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-background px-2 py-1">
                  {formatLkr(Number(order.total ?? 0))}
                </span>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-primary">
                  {order.status}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-background px-2 py-1">
                  <Clock className="h-3 w-3" />
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-4 gap-2">
            {["confirmed", "cooking", "picked_up", "delivered"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(order.id, status)}
                className={`press rounded-xl px-2 py-2 text-[11px] font-bold capitalize transition-colors ${
                  order.status === status
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-background hover:bg-primary/20"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-2">
            <button
              type="button"
              disabled={simulatingId === order.id}
              onClick={() => simulateRiderGps(order.id)}
              className="press flex w-full items-center justify-center gap-2 rounded-xl bg-accent/20 text-accent-foreground py-2 text-xs font-bold border border-accent/30 disabled:opacity-50"
            >
              <Truck className="h-3.5 w-3.5" />
              {simulatingId === order.id ? "Simulating Live Rider Movement..." : "Simulate Rider Live GPS Delivery"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-3xl bg-surface-muted p-6 text-center">
      <div>
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function describeItems(items: Json) {
  if (!Array.isArray(items)) return "Order items";
  const names = items
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const record = item as Record<string, Json>;
      const name = typeof record.name === "string" ? record.name : "Item";
      const qty = typeof record.quantity === "number" ? record.quantity : 1;
      return qty > 1 ? `${name} x${qty}` : name;
    })
    .filter(Boolean);
  return names.length ? names.join(", ") : "Order items";
}

async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success("Order status updated to " + status);
}
