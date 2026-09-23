import { createClient } from "@/lib/supabase/server";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_platform_stats");

  return <AdminOverview stats={data} error={error?.message || null} />;
}
