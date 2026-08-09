import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MessageCircle, Check } from "lucide-react";
import { DeliveryMap } from "@/components/delivery-map";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Tracking your order — QuickBite" }] }),
  component: TrackPage,
});

const steps = [
  { label: "Order confirmed", time: "Just now" },
  { label: "Kitchen is cooking", time: "2 min" },
  { label: "Rider picked up", time: "12 min" },
  { label: "Delivered to door", time: "22 min" },
];

function TrackPage() {
  const [active, setActive] = useState(1);
  const [courier, setCourier] = useState({
    name: "Kasun Perera",
    phone: "+94771234567",
    vehicle: "Honda Click (WP BI-8291)",
  });
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

  useEffect(() => {
    // 1. Fetch latest active order & assigned courier details from Supabase
    async function loadLatestOrder() {
      const { data } = await supabase
        .from("orders")
        .select("id, status, courier_name, courier_phone, courier_vehicle, driver_lat, driver_lng")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        if (data.courier_name) {
          setCourier({
            name: data.courier_name || "Kasun Perera",
            phone: data.courier_phone || "+94771234567",
            vehicle: data.courier_vehicle || "Honda Click",
          });
        }
        if (data.driver_lat && data.driver_lng) {
          setDriverCoords({ lat: data.driver_lat, lng: data.driver_lng });
        }
      }
    }

    loadLatestOrder();

    // 2. Listen for live Supabase realtime order & driver updates
    const channel = supabase
      .channel("live-order-tracker")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        if (payload.new) {
          const p = payload.new;
          const statusMap: Record<string, number> = {
            confirmed: 0,
            cooking: 1,
            picked_up: 2,
            delivered: 3,
          };
          if (p.status && statusMap[p.status] !== undefined) {
            setActive(statusMap[p.status]);
          }
          if (p.driver_lat && p.driver_lng) {
            setDriverCoords({ lat: p.driver_lat, lng: p.driver_lng });
          }
          if (p.courier_name) {
            setCourier({
              name: p.courier_name,
              phone: p.courier_phone || "+94771234567",
              vehicle: p.courier_vehicle || "Honda Click",
            });
          }
        }
      })
      .subscribe();

    const t = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 5000);
    return () => {
      clearInterval(t);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="phone-frame flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-6">
        <Link to="/cart" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-black">Live tracking</h1>
        <div className="h-11 w-11" />
      </header>

      {/* Live Google / Street Map */}
      <div className="mx-5 mt-4">
        <DeliveryMap progress={(active + 1) / steps.length} driverCoords={driverCoords} />
      </div>

      {/* Rider */}
      <div className="mx-5 mt-4 flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-soft animate-fade-up">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-xl">👨‍🍳</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">Your courier</p>
          <p className="truncate font-bold">
            {courier.name} · {courier.vehicle}
          </p>
        </div>
        <a
          href={`sms:${courier.phone}?body=Hi%20${encodeURIComponent(courier.name)},%20regarding%20my%20food%20order`}
          title="Message Courier"
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-foreground text-background"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href={`tel:${courier.phone}`}
          title="Call Courier"
          className="press grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"
        >
          <Phone className="h-4 w-4" />
        </a>
      </div>

      {/* Timeline */}
      <div className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-soft">
        <h3 className="font-display text-base font-black">Order timeline</h3>
        <ol className="relative mt-4 space-y-5 pl-3">
          <span className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-border" />
          {steps.map((s, i) => {
            const done = i <= active;
            return (
              <li key={s.label} className="relative flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span
                  className={`relative z-10 grid h-7 w-7 place-items-center rounded-full transition-all ${
                    done ? "bg-primary text-primary-foreground shadow-glow" : "bg-surface-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{s.time}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex-1" />
      <Link
        to="/home"
        className="press mx-5 mb-10 mt-4 rounded-2xl border border-border bg-surface py-4 text-center text-sm font-bold"
      >
        Continue browsing
      </Link>
      <div className="h-6" />

    </div>
  );
}
