import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { currency, formatDate } from "@/lib/utils";

export default async function Page() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("leads")
    .select("id, name, company, email, phone, status, estimated_value_cop, estimated_value_usd, created_at")
    .eq("stage", "prospect")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Prospectos</h2>
        <p className="mt-1 text-slate-500">Oportunidades calificadas con seguimiento comercial activo.</p>
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Contacto</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Valor</th>
              <th className="px-5 py-4">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link href={`/leads/${item.id}`} className="font-semibold text-slate-950 hover:text-dual-purple">{item.name}</Link>
                  <div className="text-slate-500">{item.company || "Sin empresa"}</div>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <div>{item.email || "Sin correo"}</div>
                  <div>{item.phone || "Sin teléfono"}</div>
                </td>
                <td className="px-5 py-4">{item.status}</td>
                <td className="px-5 py-4">
                  <div>{currency(Number(item.estimated_value_cop ?? 0), "COP")}</div>
                  <div className="text-slate-500">{currency(Number(item.estimated_value_usd ?? 0), "USD")}</div>
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
