import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { useEffect } from "react";
import { ArrowLeft, Users, ShoppingBag, Utensils } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — QuickBite" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== "admin@foodiego.com") {
        navigate({ to: "/auth" });
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.email !== "admin@foodiego.com") return null;

  return (
    <div className="min-h-dvh bg-background p-6">
      <header className="flex items-center gap-4 mb-8">
        <Link to="/home" className="press grid h-11 w-11 place-items-center rounded-2xl bg-surface shadow-soft">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-black">Admin Dashboard</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Orders" icon={<ShoppingBag />} count={152} color="bg-blue-500" />
        <DashboardCard title="Users" icon={<Users />} count={1204} color="bg-green-500" />
        <DashboardCard title="Products" icon={<Utensils />} count={45} color="bg-orange-500" />
      </div>

      <div className="mt-8 rounded-3xl bg-surface p-6 shadow-soft">
        <h2 className="font-display text-xl font-bold mb-4">Recent Orders</h2>
        <p className="text-muted-foreground text-sm">
          Connect to Supabase 'orders' table to show live data here.
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ title, icon, count, color }: any) {
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-soft flex items-center gap-4">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl text-white ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-display text-2xl font-black">{count}</p>
      </div>
    </div>
  );
}
