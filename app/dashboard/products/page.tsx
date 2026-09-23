import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductOrdersView } from "@/components/dashboard/ProductOrdersView";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: orders }, { data: products }] = await Promise.all([
    supabase.from("product_orders").select("id, link_id, email, name, amount_cents, created_at").eq("profile_id", user.id).order("created_at", { ascending: false }),
    supabase.from("links").select("id, title").eq("profile_id", user.id).eq("block_type", "product"),
  ]);

  return <ProductOrdersView orders={orders || []} products={products || []} />;
}
