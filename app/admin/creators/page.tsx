import { createClient } from "@/lib/supabase/server";
import { AdminCreatorsTable } from "@/components/admin/AdminCreatorsTable";

export default async function AdminCreatorsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_recent_profiles", { p_limit: 50 });

  return <AdminCreatorsTable creators={data || []} error={error?.message || null} />;
}
