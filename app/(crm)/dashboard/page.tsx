import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase.from("leads").select("id, stage, status, estimated_value_cop, estimated_value_usd");
  const { data: tasks } = await supabase.from("tasks").select("id, status, due_at");

  const totalLeads = leads?.filter((lead) => lead.stage === "lead").length ?? 0;
  const totalProspects = leads?.filter((lead) => lead.stage === "prospect").length ?? 0;
  const totalClients = leads?.filter((lead) => lead.stage === "client").length ?? 0;
  const pendingTasks = tasks?.filter((task) => task.status === "pending" || task.status === "in_progress").length ?? 0;
  const lostLeads = leads?.filter((lead) => lead.status === "lost").length ?? 0;
  const pipelineCop = leads?.filter((lead) => lead.status !== "lost" && lead.status !== "won").reduce((sum, lead) => sum + Number(lead.estimated_value_cop ?? 0), 0) ?? 0;
  const pipelineUsd = leads?.filter((lead) => lead.status !== "lost" && lead.status !== "won").reduce((sum, lead) => sum + Number(lead.estimated_value_usd ?? 0), 0) ?? 0;

  const cards = [
    { label: "Leads activos", value: totalLeads },
    { label: "Prospectos activos", value: totalProspects },
    { label: "Clientes ganados", value: totalClients },
    { label: "Leads perdidos", value: lostLeads },
    { label: "Tareas pendientes", value: pendingTasks },
    { label: "Pipeline COP", value: currency(pipelineCop, "COP") },
    { label: "Pipeline USD", value: currency(pipelineUsd, "USD") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Dashboard</h2>
        <p className="mt-1 text-slate-500">Resumen comercial del CRM.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardTitle>{card.label}</CardTitle>
            <div className="mt-3 text-3xl font-bold text-slate-950">{card.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
