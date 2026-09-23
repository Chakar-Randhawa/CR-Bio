"use client";
import { useMemo, useState } from "react";
import { Download, Package } from "lucide-react";
import { cn, formatCompactNumber } from "@/lib/utils";

interface OrderRow { id: string; link_id: string; email: string; name: string | null; amount_cents: number; created_at: string; }
interface ProductRow { id: string; title: string; }

export function ProductOrdersView({ orders, products }: { orders: OrderRow[]; products: ProductRow[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => (filter === "all" ? orders : orders.filter((o) => o.link_id === filter)), [orders, filter]);
  const productTitle = useMemo(() => { const map = new Map(products.map((p) => [p.id, p.title])); return (id: string) => map.get(id) || "Deleted product"; }, [products]);
  const totalRevenueCents = filtered.reduce((sum, o) => sum + o.amount_cents, 0);

  function exportCsv() {
    const header = ["Email", "Name", "Product", "Amount", "Date"];
    const rows = filtered.map((o) => [o.email, o.name || "", productTitle(o.link_id), (o.amount_cents / 100).toFixed(2), new Date(o.created_at).toISOString()]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `crbio-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl text-white">Products</h1><p className="mt-1 text-sm text-mist">Manage product blocks from the Links tab. Claims and orders show up here.</p></div>
        <button onClick={exportCsv} disabled={filtered.length === 0} className="btn-secondary !px-4 !py-2 text-xs disabled:opacity-40"><Download className="h-3.5 w-3.5" />Export CSV</button>
      </div>

      <div className="glass-panel p-5">
        <p className="text-xs text-mist">Total recorded (free + tracked claims)</p>
        <p className="mt-1 font-mono text-2xl text-white">${formatCompactNumber(totalRevenueCents / 100)}</p>
        <p className="mt-2 text-[11px] text-mist/60">For external checkout products (Stripe, Gumroad), actual payment totals live in that provider's dashboard — this reflects free/gated downloads tracked directly through CRbio.</p>
      </div>

      {products.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", filter === "all" ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>All products</button>
          {products.map((p) => (<button key={p.id} onClick={() => setFilter(p.id)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", filter === p.id ? "border-violet-soft bg-violet/15 text-white" : "border-white/10 text-mist hover:border-white/25")}>{p.title}</button>))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass-panel flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Package className="h-5 w-5" /></div>
          <p className="font-display text-lg text-white">No orders yet</p>
          <p className="max-w-xs text-sm text-mist">Add a product block from the Links tab to start selling.</p>
        </div>
      ) : (
        <div className="glass-panel divide-y divide-white/[0.06] overflow-hidden">
          {filtered.map((o) => (
            <div key={o.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><Package className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{o.email}</p>
                <p className="truncate text-xs text-mist">{productTitle(o.link_id)} · {new Date(o.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <span className="shrink-0 font-mono text-sm text-white">{o.amount_cents > 0 ? `$${(o.amount_cents / 100).toFixed(2)}` : "Free"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
