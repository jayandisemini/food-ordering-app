import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bike, Check, MapPin, Navigation, Phone, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { formatLkr } from "@/lib/food-data";

export const Route = createFileRoute("/driver")({
  head: () => ({ meta: [{ title: "Driver Portal — QuickBite Courier" }] }),
  component: DriverPortalPage,
});

type Order = Tables<"orders">;

function DriverPortalPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [riderStatus, setRiderStatus] = useState<"online" | "offline">("online");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadActiveOrders();

    const channel = supabase
      .channel("driver-portal-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadActiveOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    const updates: Partial<Order> = {
      status,
      courier_name: "Kasun Perera",
      courier_phone: "+94740489343",
      courier_vehicle: "Honda Click (WP BI-8291)",
    };

    if (status === "picked_up") {
      updates.driver_lat = 6.9271;
      updates.driver_lng = 79.8612;
    } else if (status === "delivered") {
      updates.driver_lat = 6.9344;
      updates.driver_lng = 79.8428;
    }

    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order marked as ${status.replace("_", " ")}`);
      await loadActiveOrders();
    }
    setUpdatingId(null);
  };

  const updateLocation = async (orderId: string) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Updating GPS position...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { error } = await supabase.from("orders").update({
          driver_lat: latitude,
          driver_lng: longitude,
        }).eq("id", orderId);

        if (error) toast.error(error.message);
        else toast.success("Live GPS coordinates sent to customer!");
      },
      () => {
        toast.error("Could not fetch current GPS location.");
      }
    );
  };

  const activeDeliveries = orders.filter(
    (o) => o.status === "confirmed" || o.status === "cooking" || o.status === "picked_up"
  );
  const completedDeliveries = orders.filter((o) => o.status === "delivered");

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background relative">
      <Toaster />

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-border/60 bg-surface">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-background shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-lg font-black">Courier Portal</h1>
          <p className="text-xs text-muted-foreground font-medium">Kasun Perera (Honda Click)</p>
        </div>
        <button
          onClick={() => setRiderStatus(riderStatus === "online" ? "offline" : "online")}
          className={`press px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            riderStatus === "online" ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-muted text-muted-foreground"
          }`}
        >
          {riderStatus === "online" ? "● Online" : "Offline"}
        </button>
      </header>

      {/* Overview Cards */}
      <div className="p-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-surface p-4 border border-border shadow-soft">
          <p className="text-xs text-muted-foreground font-medium">Active Tasks</p>
          <p className="text-2xl font-black text-primary mt-1">{activeDeliveries.length}</p>
        </div>
        <div className="rounded-3xl bg-surface p-4 border border-border shadow-soft">
          <p className="text-xs text-muted-foreground font-medium">Completed Today</p>
          <p className="text-2xl font-black text-[#22c55e] mt-1">{completedDeliveries.length}</p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="px-5 flex-1 space-y-4 pb-10">
        <h2 className="font-display text-base font-black">Assigned Deliveries</h2>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-muted-foreground">Loading deliveries...</div>
        ) : activeDeliveries.length === 0 ? (
          <div className="rounded-3xl bg-surface p-8 text-center border border-border">
            <Bike className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="font-bold text-sm">No active delivery assignments</p>
            <p className="text-xs text-muted-foreground mt-1">New delivery orders will appear here automatically.</p>
          </div>
        ) : (
          activeDeliveries.map((order) => (
            <div key={order.id} className="rounded-3xl bg-surface p-5 border border-border shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <span className="rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-bold">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    Total: {formatLkr(Number(order.total ?? 0))} ({order.payment_method})
                  </p>
                </div>
                <span className="capitalize font-bold text-xs bg-accent/30 text-accent-foreground px-2.5 py-1 rounded-full">
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2 text-sm font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">Delivery Address</p>
                    <p className="font-bold text-xs">{order.address || "Kollupitiya, Colombo 03"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-bold">Customer Contact</p>
                    <a href={`tel:${order.phone || "+94740489343"}`} className="font-mono text-xs font-bold underline text-primary">
                      {order.phone || "0740489343"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                {order.status !== "picked_up" ? (
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "picked_up")}
                    className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3 font-bold text-xs shadow-glow"
                  >
                    <Truck className="h-4 w-4" /> Pick Up Order from Restaurant
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => updateLocation(order.id)}
                      className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background py-3 font-bold text-xs"
                    >
                      <Navigation className="h-4 w-4 text-primary" /> Send Current GPS Location to Customer
                    </button>
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, "delivered")}
                      className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c55e] text-white py-3 font-bold text-xs shadow-soft"
                    >
                      <Check className="h-4 w-4" /> Mark Order as Delivered
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
