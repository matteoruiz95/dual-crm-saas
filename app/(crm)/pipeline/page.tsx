import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { createClient } from "@/lib/supabase/server";
import type { LeadListItem } from "@/types/crm";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, company, position, email, phone, stage, status, priority, estimated_value_cop, estimated_value_usd, created_at, next_action_at, responsible_user_id")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Pipeline</h2>
        <p className="mt-1 text-slate-500">Vista Kanban para mover leads entre estados comerciales.</p>
      </div>
      <PipelineBoard leads={(leads ?? []) as LeadListItem[]} />
    </div>
  );
}
