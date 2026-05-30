import { Card, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase.from("leads").select("status, stage, estimated_value_cop, estimated_value_usd");
  const won = leads?.filter((lead) => lead.status === "won").length ?? 0;
  const lost = leads?.filter((lead) => lead.status === "lost").length ?? 0;
  const total = leads?.length ?? 0;
  const wonCop = leads?.filter((lead) => lead.status === "won").reduce((sum, lead) => sum + Number(lead.estimated_value_cop ?? 0), 0) ?? 0;
  const wonUsd = leads?.filter((lead) => lead.status === "won").reduce((sum, lead) => sum + Number(lead.estimated_value_usd ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Reportes</h2>
        <p className="mt-1 text-slate-500">Indicadores comerciales básicos.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardTitle>Total oportunidades</CardTitle><div className="mt-3 text-3xl font-bold">{total}</div></Card>
        <Card><CardTitle>Ganadas</CardTitle><div className="mt-3 text-3xl font-bold">{won}</div></Card>
        <Card><CardTitle>Perdidas</CardTitle><div className="mt-3 text-3xl font-bold">{lost}</div></Card>
        <Card><CardTitle>Conversión</CardTitle><div className="mt-3 text-3xl font-bold">{total ? Math.round((won / total) * 100) : 0}%</div></Card>
        <Card className="md:col-span-2"><CardTitle>Valor ganado COP</CardTitle><div className="mt-3 text-3xl font-bold">{currency(wonCop, "COP")}</div></Card>
        <Card className="md:col-span-2"><CardTitle>Valor ganado USD</CardTitle><div className="mt-3 text-3xl font-bold">{currency(wonUsd, "USD")}</div></Card>
      </div>
    </div>
  );
}
